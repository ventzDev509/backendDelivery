import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Ajiste chemen sa a selon pwojè w la
import { SellerStatus, Role, StoreStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Jwenn tout demand machann ki annatant (PENDING) nan pwofil yo
  async getPendingSellers() {
   
    return this.prisma.profile.findMany({
      where: {
        sellerStatus: SellerStatus.PENDING,
      },
      select: {
        id: true,
        username: true,
        bio: true,
        location: true,
        lat: true,
        lng: true,
        phone: true,
        documentUrl: true,
        updatedAt: true,
        // Rale imel ak lòt enfòmasyon nan User la
        user: {
          select: {
            id: true,
            email: true,
            telephone: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'asc', // Demand ki fè plis tan ap tann yo ap parèt an premye
      },
    });
  }

  // 2. Apwouve demand lan: Pase wòl li nan RESTAURANT_OWNER epi kreye Restoran an otomatikman
  async approveSeller(profileId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      include: { user: true },
    });

    if (!profile) {
      throw new NotFoundException('Pwofil sa a pa egziste.');
    }

    if (profile.sellerStatus !== SellerStatus.PENDING) {
      throw new BadRequestException('Demand sa a deja trete.');
    }

    // Ekzekite tranzaksyon pou tout bagay fèt ansanm san pwoblèm
    return this.prisma.$transaction(async (tx) => {
      // a. Mete pwofil la ajou
      await tx.profile.update({
        where: { id: profileId },
        data: {
          sellerStatus: SellerStatus.APPROVED,
          isSeller: true,
          verified: true,
          storeStatus: StoreStatus.OPEN, // Boutik la ouvri otomatikman
        },
      });

      // b. Chanje wòl User la pou l vin RESTAURANT_OWNER
      await tx.user.update({
        where: { id: profile.userId },
        data: {
          role: Role.RESTAURANT_OWNER,
        },
      });

      // c. Kreye gous (record) Restoran an otomatikman pou mèt la ka kòmanse mete meni
      await tx.restaurant.create({
        data: {
          name: profile.username || 'Restoran san non',
          description: profile.bio || 'Byenveni nan restoran nou an.',
          ownerId: profile.userId,
        },
      });

      return { message: 'Machann nan apwouve avèk siksè e restoran li an kreye!' };
    });
  }

  // 3. Refize demand lan epi ekri rezon an (ou ka sove rezon an nan bio a oswa jis voye l pa imel)
  async rejectSeller(profileId: string, reason: string) {
    if (!reason || reason.trim() === '') {
      throw new BadRequestException('Ou dwe bay yon rezon pou refi a.');
    }

    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Pwofil sa a pa egziste.');
    }

    if (profile.sellerStatus !== SellerStatus.PENDING) {
      throw new BadRequestException('Demand sa a deja trete.');
    }

    // Mete status la an REJECTED
    await this.prisma.profile.update({
      where: { id: profileId },
      data: {
        sellerStatus: SellerStatus.REJECTED,
        isSeller: false,
        storeStatus: StoreStatus.CLOSED,
      },
    });

    // 💡 Isit la ou ka rele MailService pou voye "reason" lan bay itilizatè a pa imel.

    return { message: 'Demand lan refize epi machann nan notifye.' };
  }
}