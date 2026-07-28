import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Asire w chemen an bon
import { Profile, Prisma } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SupabaseService } from 'src/common/supabase.service';

@Injectable()
export class ProfileService {
    constructor(
        private prisma: PrismaService,
        private supabaseService: SupabaseService 
    ) { }

    // Fonksyon prive pou efase imaj nan Supabase si yo pa soti nan Unsplash oswa lòtExternal links
    private async removeProfileImages(imageUrl: string | null) {
        if (!imageUrl) return;
        if (!imageUrl.includes('unsplash.com')) {
            await this.supabaseService.deleteImageFromSupabase(imageUrl);
        }
    }

    // 1. KREYE YON PROFIL (Anjeneral lè itilizatè a enskri)
    async create(data: Prisma.ProfileCreateInput): Promise<Profile> {
        return this.prisma.profile.create({ data });
    }

    // 2. LI TOUT PROFIL (Oswa ak filtè) 
    async findAll(): Promise<Profile[]> {
        return this.prisma.profile.findMany({
            include: { workingHours: true },
        });
    }

    // 3. LI YON PROFIL ESPESIFIK (pa userId) avèk orè operasyon li yo
    async findOne(userId: string): Promise<Profile | null> {
        return this.prisma.profile.findUnique({
            where: { userId },
            include: { workingHours: true }, // Retounen orè yo ansanm ak pwofil la
        });
    }

    // 4. MIZAJOU FOTO PROFIL AK BANYÈ (Banner) - Avèk netwayaj ansyen imaj sou Supabase
    async updateProfileImages(
        userId: string,
        files: {
            profileImage?: Express.Multer.File[];
            bannerImage?: Express.Multer.File[];
        }
    ) {
        // 1. Tcheke si pwofil la egziste
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
        });

        if (!profile) {
            throw new NotFoundException('Pwofil sa a pa egziste.');
        }

        // 2. Verifye si omwen youn nan fichye yo voye
        const hasProfile = files?.profileImage && files.profileImage.length > 0;
        const hasBanner = files?.bannerImage && files.bannerImage.length > 0;

        if (!hasProfile && !hasBanner) {
            throw new BadRequestException('Ou dwe bay omwen yon foto pwofil oswa yon banyè.');
        }

        let profileImageUrl = profile.avatarUrl; 
        let bannerImageUrl = profile.bannerUrl;    

        // 3. Si gen foto pwofil nouvo, uploade l sou Supabase epi retire ansyen an
        if (hasProfile) {
            profileImageUrl = await this.supabaseService.uploadFile(
                files.profileImage![0],
                'profiles'
            );

            if (profile.avatarUrl && profile.avatarUrl !== profileImageUrl) {
                await this.removeProfileImages(profile.avatarUrl);
            }
        }

        // 4. Si gen banyè nouvo, uploade l sou Supabase epi retire ansyen an
        if (hasBanner) {
            bannerImageUrl = await this.supabaseService.uploadFile(
                files.bannerImage![0],
                'banners'
            );

            if (profile.bannerUrl && profile.bannerUrl !== bannerImageUrl) {
                await this.removeProfileImages(profile.bannerUrl);
            }
        }

        // 5. Mete pwofil la ajou nan baz done a epi retounen li ak tout orè li yo
        return this.prisma.profile.update({
            where: { userId },
            data: {
                avatarUrl: profileImageUrl,
                bannerUrl: bannerImageUrl,
            },
            include: { workingHours: true },
        });
    }

    // 5. MIZAJOU PROFIL (Sèvi ak userId pou idantifye kiyès ki bezwen update)
    async update(userId: string, data: UpdateProfileDto): Promise<Profile> {
        try {
            const r = await this.prisma.profile.upsert({
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
                include: { workingHours: true },
            });
            return r;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    // 6. MIZAJOU POZISYON (LAT/LNG)
    async updateLocation(userId: string, data: { lat: number; lng: number }) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
            select: { lat: true, lng: true }
        });

        // Si lat ak lng deja egziste (pa null), nou pa fè anyen
        if (profile && profile.lat !== null && profile.lng !== null) {
            console.log("Pozisyon deja fikse, nou pa pral overwrite li.");
            return;
        }
        return await this.prisma.profile.update({
            where: { userId },
            data: {
                lat: data.lat,
                lng: data.lng,
            },
            include: { workingHours: true },
        });
    }

    // 7. MIZAJOU OSWA AJOUTE ORÈ OPERASYON YO (WorkingHours - Sipòte fòma 12h)
    async updateWorkingHours(
        userId: string, 
        hoursData: Array<{ day: string; isOpen: boolean; openTime: string; closeTime: string }>
    ) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
        });

        if (!profile) {
            throw new NotFoundException('Pwofil la pa jwenn.');
        }

        // Nou efase ansyen orè yo epi nou kreye nouvo yo nan yon sèl tranzaksyon
        return await this.prisma.$transaction(async (prisma) => {
            await prisma.workingHours.deleteMany({
                where: { profileId: profile.id },
            });

            await prisma.workingHours.createMany({
                data: hoursData.map((h) => ({
                    profileId: profile.id,
                    day: h.day,
                    isOpen: h.isOpen,
                    openTime: h.openTime,   
                    closeTime: h.closeTime, 
                })),
            });

            // Retounen pwofil la nèt ansanm ak nouvo orè ki sot anrejistre yo
            return await prisma.profile.findUnique({
                where: { userId },
                include: { workingHours: true },
            });
        });
    }

    // 8. SUPRESYON PROFIL (Epi retire foto ak banyè nan Supabase)
    async remove(userId: string): Promise<Profile> {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
        });

        if (!profile) {
            throw new NotFoundException('Pwofil sa a pa jwenn.');
        }

        const deletedProfile = await this.prisma.profile.delete({
            where: { userId },
        });

        // Efase foto pwofil ak banyè nan Supabase tou
        await this.removeProfileImages(profile.avatarUrl);
        await this.removeProfileImages(profile.bannerUrl);

        return deletedProfile;
    }
}