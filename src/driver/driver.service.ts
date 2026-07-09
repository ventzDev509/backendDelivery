import { Injectable, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { DriverGateway } from './driver.gateway';
import { UpdateDriverDto } from './dto/update-driver-dto';

@Injectable()
export class DriverService {
    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => DriverGateway))
        private gateway: DriverGateway,
    ) { }

   async create(data: CreateDriverDto ,userId) {
    return await this.prisma.driver.create({
        data: {
            name: data.name,
            phone: data.phone,        
            email: data.email,         
            userId: userId,
            vehicleType: data.vehicleType,
            vehiclePlate: data.vehiclePlate,
            isVerified: true,         
        },
        include: { user: true }         
    });
}

    async findAll() {
        return await this.prisma.driver.findMany({
            include: { user: true }
        });
    }

    async update(id: string, data: UpdateDriverDto) {
        const updated = await this.prisma.driver.update({
            where: { id },
            data: {
                ...data,
            },
            include: {
                user: true
            }
        });

        // Emèt evènman an pou kliyan yo konnen gen mizajou
        this.gateway.server.emit('driverUpdated', updated);

        return updated;
    }

    // NOUVO: Fonksyon statistik pou livrezon
    async getDriverStats(driverId: string) {
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

        return {
            driverId: driver.id,
            name: driver.name,
            totalCompletedDeliveries: driver._count.orders,
            status: driver.status,
        };
    }

    async updateLocation(driverId: string, lat: number, lng: number) {
        const driver = await this.prisma.driver.update({
            where: { id: driverId },
            data: { currentLat: lat, currentLng: lng, lastActive: new Date() }
        });

        this.gateway.server.emit('driverMoved', { driverId, lat, lng });
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
        return await this.prisma.driver.delete({ where: { id } });
    }
}