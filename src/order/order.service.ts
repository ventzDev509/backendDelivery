import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(customerId: string, dto: CreateOrderDto) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: dto.restaurantId },
      select: { id: true, owner: { select: { profile: { select: { storeStatus: true } } } } },
    });
    if (!restaurant) throw new NotFoundException('Restoran sa a pa jwenn.');
    if (restaurant.owner.profile?.storeStatus === 'CLOSED') {
      throw new BadRequestException('Restoran sa a fèmen kounye a.');
    }

    const quantities = new Map<string, number>();
    for (const item of dto.items) quantities.set(item.menuItemId, (quantities.get(item.menuItemId) ?? 0) + item.quantity);
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: [...quantities.keys()] }, restaurantId: restaurant.id },
      select: { id: true, name: true, price: true, isAvailable: true },
    });
    if (menuItems.length !== quantities.size) throw new BadRequestException('Gen plat nan kòmand lan ki pa pou restoran sa a.');
    if (menuItems.some((item) => item.isAvailable === false)) throw new BadRequestException('Gen plat nan kòmand lan ki pa disponib.');

    const total = menuItems.reduce((sum, item) => sum + item.price * (quantities.get(item.id) ?? 0), 0);
    return this.prisma.order.create({
      data: {
        customerId,
        restaurantId: restaurant.id,
        total,
        paymentMethod: dto.paymentMethod,
        deliveryAddress: dto.deliveryAddress.trim(),
        latitude: dto.latitude,
        longitude: dto.longitude,
        items: { create: [...quantities].map(([menuItemId, quantity]) => ({ menuItemId, quantity })) },
      },
      include: this.orderRelations(),
    });
  }

  async findForUser(user: { id: string; role: Role; driverId?: string }) {
    let where: Prisma.OrderWhereInput;
    if (user.role === Role.ADMIN) where = {};
    else if (user.role === Role.RESTAURANT_OWNER) {
      const restaurant = await this.prisma.restaurant.findUnique({ where: { ownerId: user.id }, select: { id: true } });
      if (!restaurant) return [];
      where = { restaurantId: restaurant.id };
    } else if (user.role === Role.DRIVER) {
      // Driver login issues a scoped token containing the exact Driver table id.
      // Prefer it over findFirst(userId), which can select a different record if
      // an account has more than one driver profile.
      const driver = user.driverId
        ? await this.prisma.driver.findFirst({ where: { id: user.driverId, userId: user.id, isVerified: true }, select: { id: true } })
        : await this.prisma.driver.findFirst({ where: { userId: user.id, isVerified: true }, select: { id: true } });
      if (!driver) return [];
      where = { driverId: driver.id };
    } else where = { customerId: user.id };

    return this.prisma.order.findMany({ where, include: this.orderRelations(), orderBy: { createdAt: 'desc' } });
  }

  async updateStatus(orderId: string, actor: { id: string; role: Role }, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: { restaurant: true, driver: true } });
    if (!order) throw new NotFoundException('Kòmand sa a pa jwenn.');

    if (actor.role === Role.RESTAURANT_OWNER && order.restaurant.ownerId !== actor.id) throw new ForbiddenException();
    if (actor.role === Role.DRIVER && order.driver?.userId !== actor.id) throw new ForbiddenException();
    if (actor.role === Role.CUSTOMER && (order.customerId !== actor.id || order.status !== OrderStatus.PENDING || dto.status !== OrderStatus.CANCELLED)) throw new ForbiddenException();
    if (actor.role !== Role.ADMIN && actor.role !== Role.RESTAURANT_OWNER && actor.role !== Role.DRIVER && actor.role !== Role.CUSTOMER) throw new ForbiddenException();
    if (dto.status === OrderStatus.COMPLETED && actor.role !== Role.ADMIN && actor.role !== Role.DRIVER) throw new ForbiddenException('Se chofè ki pote kòmand lan oswa administratè a ki ka konfime livrezon an.');

    const transitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      PREPARING: [OrderStatus.DELIVERING, OrderStatus.CANCELLED],
      DELIVERING: [OrderStatus.COMPLETED],
      COMPLETED: [],
      CANCELLED: [],
    };
    if (!transitions[order.status].includes(dto.status as OrderStatus)) throw new BadRequestException('Chanjman estati sa a pa valab.');
    if (dto.status === OrderStatus.DELIVERING && !order.driverId) throw new BadRequestException('Bay yon chofè kòmand lan anvan ou voye l an livrezon.');

    if (dto.status === OrderStatus.COMPLETED && order.driverId) {
      return this.prisma.$transaction(async (tx) => {
        await tx.driver.update({ where: { id: order.driverId! }, data: { status: 'AVAILABLE' } });
        return tx.order.update({ where: { id: orderId }, data: { status: dto.status }, include: this.orderRelations() });
      });
    }
    return this.prisma.order.update({ where: { id: orderId }, data: { status: dto.status }, include: this.orderRelations() });
  }

  async assignDriver(orderId: string, driverId: string, actor: { id: string; role: Role }) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: { restaurant: true } });
    if (!order) throw new NotFoundException('Kòmand sa a pa jwenn.');
    if (actor.role === Role.RESTAURANT_OWNER && order.restaurant.ownerId !== actor.id) throw new ForbiddenException();
    if (actor.role !== Role.ADMIN && actor.role !== Role.RESTAURANT_OWNER) throw new ForbiddenException();
    if (order.status !== OrderStatus.PREPARING) throw new BadRequestException('Kòmand lan dwe pare anvan yo bay yon chofè.');

    const driver = await this.prisma.driver.findFirst({ where: { id: driverId, isVerified: true, status: 'AVAILABLE' } });
    if (!driver) throw new BadRequestException('Chofè a pa disponib oswa li poko verifye.');

    return this.prisma.$transaction(async (tx) => {
      await tx.driver.update({ where: { id: driver.id }, data: { status: 'ON_DELIVERY' } });
      return tx.order.update({ where: { id: orderId }, data: { driverId: driver.id, status: OrderStatus.DELIVERING }, include: this.orderRelations() });
    });
  }

  private orderRelations() {
    return {
      customer: { select: { id: true, email: true, profile: { select: { username: true, avatarUrl: true } } } },
      restaurant: { select: { id: true, name: true, ownerId: true } },
      driver: { select: { id: true, name: true, phone: true, status: true, currentLat: true, currentLng: true, lastActive: true } },
      items: { include: { menuItem: { select: { id: true, name: true, price: true, image: true } } } },
    };
  }
}
