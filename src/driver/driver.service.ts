import { Injectable, NotFoundException, BadRequestException, ForbiddenException, UnauthorizedException, forwardRef, Inject } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { DriverGateway } from './driver.gateway';
import { UpdateDriverDto } from './dto/update-driver-dto';
import { DriverLoginDto } from './dto/driver-login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class DriverService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        @Inject(forwardRef(() => DriverGateway))
        private gateway: DriverGateway,
    ) { }

    async login(credentials: DriverLoginDto) {
        const email = credentials.email.trim().toLowerCase();
        const normalizePhone = (phone: string) => phone.replace(/\D/g, '').replace(/^509/, '');
        const normalizedPhone = normalizePhone(credentials.phone);
        const driver = await this.prisma.driver.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } },
            select: {
                id: true, name: true, email: true, phone: true, isVerified: true,
                user: { select: { id: true, email: true, role: true, isEmailConfirmed: true } },
            },
        });
        if (!driver || normalizePhone(driver.phone) !== normalizedPhone) {
            throw new UnauthorizedException('Imèl oswa nimewo telefòn chofè a pa kòrèk.');
        }
        if (!driver.isVerified) throw new ForbiddenException('Administratè a poko verifye kont chofè sa a.');
        const user = driver.user;
        // Wòl DRIVER sa a aplike nan sesyon chofè a sèlman; li pa chanje wòl ki nan User.
        const token = await this.jwtService.signAsync({ sub: user.id, email: user.email, role: Role.DRIVER, driverId: driver.id });
        return {
            success: true,  
            token,
            user: { id: user.id, email: user.email, role: Role.DRIVER, isEmailConfirmed: user.isEmailConfirmed, profile: null },
            driver: { id: driver.id, name: driver.name, email: driver.email, phone: driver.phone, isVerified: driver.isVerified },
        };
    }

   async create(data: CreateDriverDto) {
    const user = await this.prisma.user.findUnique({ where: { email: data.email }, select: { id: true } });
    if (!user) throw new NotFoundException('Fòk chofè a kreye kont li anvan administratè a anrejistre l.');
    return this.prisma.driver.create({
        data: { name: data.name, phone: data.phone, email: data.email, userId: user.id, vehicleType: data.vehicleType, vehiclePlate: data.vehiclePlate, isVerified: false, status: 'OFFLINE' },
        select: { id: true, name: true, phone: true, email: true, status: true, vehicleType: true, vehiclePlate: true, isVerified: true, userId: true, currentLat: true, currentLng: true },
    });
}

    async findAll() {
        return await this.prisma.driver.findMany({
        select: { id: true, name: true, phone: true, email: true, status: true, vehicleType: true, vehiclePlate: true, isVerified: true, userId: true, currentLat: true, currentLng: true, lastActive: true, createdAt: true }
        });
    }

    async update(id: string, data: UpdateDriverDto, actor?: { id: string; role: Role }) {
        const existing = await this.prisma.driver.findUnique({ where: { id }, select: { id: true, userId: true } });
        if (!existing) throw new NotFoundException('Chofè sa a pa jwenn.');
        if (actor?.role === Role.DRIVER) {
            if (existing.userId !== actor.id) throw new ForbiddenException();
            if (data.status && !['AVAILABLE', 'OFFLINE'].includes(data.status)) throw new BadRequestException('Se sèlman administratè a ki ka chanje estati livrezon sa a.');
            data = { status: data.status };
        } else if (actor?.role !== Role.ADMIN) throw new ForbiddenException();
        const updated = await this.prisma.driver.update({
            where: { id },
            data: {
                ...data,
            },
            select: { id: true, name: true, phone: true, email: true, status: true, vehicleType: true, vehiclePlate: true, isVerified: true, userId: true, currentLat: true, currentLng: true, lastActive: true, createdAt: true }
        });

        // Emèt evènman an pou kliyan yo konnen gen mizajou
        this.gateway.server.emit('driverUpdated', updated);

        return updated;
    }

    // NOUVO: Fonksyon statistik pou livrezon
    async getDriverStats(driverId: string, actor?: { id: string; role: Role }) {
        const driver = await this.prisma.driver.findUnique({
            where: { id: driverId },
            include: {
                _count: {
                    select: {
                        orders: { where: { status: 'COMPLETED' } }
                    }
                }
            }
        });

        if (!driver) throw new NotFoundException('Chofè a pa jwenn');
        if (actor?.role !== Role.ADMIN && driver.userId !== actor?.id) throw new ForbiddenException();

        return {
            driverId: driver.id,
            name: driver.name,
            totalCompletedDeliveries: driver._count.orders,
            status: driver.status,
        };
    }

    async findAvailable() {
        return this.prisma.driver.findMany({ where: { isVerified: true, status: 'AVAILABLE' }, select: { id: true, name: true, status: true, vehicleType: true } });
    }

    async findMine(userId: string, driverId?: string) {
        const driver = await this.prisma.driver.findFirst({
            where: { userId, ...(driverId ? { id: driverId } : {}) },
            select: { id: true, name: true, phone: true, email: true, status: true, vehicleType: true, vehiclePlate: true, isVerified: true, currentLat: true, currentLng: true, lastActive: true },
        });
        if (!driver) throw new NotFoundException('Kont sa a poko gen pwofil chofè.');
        return driver;
    }

    async verify(id: string) {
        const driver = await this.prisma.driver.update({ where: { id }, data: { isVerified: true, status: 'AVAILABLE' } });
        this.gateway.server.emit('driverUpdated', driver);
        return driver;
    }

    async updateLocation(driverId: string, userId: string, lat: number, lng: number) {
        const ownedDriver = await this.prisma.driver.findFirst({ where: { id: driverId, userId }, select: { id: true } });
        if (!ownedDriver) throw new ForbiddenException('Ou pa gen dwa mete pozisyon chofè sa a ajou.');
        const driver = await this.prisma.driver.update({
            where: { id: driverId },
            data: { currentLat: lat, currentLng: lng, lastActive: new Date() }
        });

        // Notify every open delivery map immediately after persisting the GPS fix.
        this.gateway.server.emit('driverMoved', {
            driverId: driver.id,
            lat: driver.currentLat,
            lng: driver.currentLng,
            lastActive: driver.lastActive,
        });

        return driver;
    }

    async getDriverById(id: string) {
        const driver = await this.prisma.driver.findUnique({
            where: { id },
            include: { user: true, orders: true }
        });
        if (!driver) {
            throw new NotFoundException(`Chofè ki gen ID ${id} a pa egziste.`);
        }
        return driver;
    }

    async delete(id: string) {
        const driver = await this.prisma.driver.findUnique({ where: { id }, select: { id: true } });
        if (!driver) throw new NotFoundException('Chofè sa a pa jwenn.');
        return this.prisma.driver.delete({ where: { id } });
    }
}
