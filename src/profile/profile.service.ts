import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Asire w chemen an bon
import { Profile, Prisma } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
    constructor(private prisma: PrismaService) { }

    // 1. KREYE YON PROFIL (Anjeneral lè itilizatè a enskri)
    async create(data: Prisma.ProfileCreateInput): Promise<Profile> {
        return this.prisma.profile.create({ data });
    }

    // 2. LI TOUT PROFIL (Oswa ak filtè) 
    async findAll(): Promise<Profile[]> {
        return this.prisma.profile.findMany();
    }

    // 3. LI YON PROFIL ESPESIFIK (pa userId oswa profileId)
    async findOne(userId: string): Promise<Profile | null> {
        return this.prisma.profile.findUnique({
            where: { userId },
        });
    }

    // 4. MIZAJOU PROFIL (Sèvi ak userId pou idantifye kiyès ki bezwen update)
    async update(userId: string, data: UpdateProfileDto): Promise<Profile> {
        try {
            const r= this.prisma.profile.upsert({
                where: {
                    userId: userId,
                },
                update: data,
                create: {
                    userId: userId,
                    username: (data.username as string) || 'Nouvo Itilizatè',
                    phone: (data.phone as string) || '',
                    bio: (data.bio as string) || '',
                },
            });
            return r;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async updateLocation(userId: string, data: { lat: number; lng: number }) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
            select: { lat: true, lng: true }
        });

        // Si lat ak lng deja egziste (pa null), nou pa fè anyen
        if (profile && profile.lat !== null && profile.lng !== null) {
            console.log(" Pozisyon deja fikse, nou pa pral overwrite li.");
            return;
        }
        return await this.prisma.profile.update({
            where: { userId },
            data: {
                lat: data.lat,
                lng: data.lng,
            },
        });
    }

    // 5.  PROFIL (Oswa itilizatè a delete kont li)
    async remove(userId: string): Promise<Profile> {
        return this.prisma.profile.delete({
            where: { userId },
        });
    }
} 