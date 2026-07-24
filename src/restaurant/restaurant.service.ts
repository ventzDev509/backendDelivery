import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateRestaurantDto {
  name: string;
  description?: string;
  lat?: number;
  lng?: number;
}

export interface UpdateRestaurantDto {
  name?: string;
  description?: string;
  lat?: number;
  lng?: number;
}

@Injectable()
export class RestaurantService {
  constructor(private prisma: PrismaService) {}

  
  // 2. JWENN TOU RESTORAN YO
  async findAll() {
    const r= this.prisma.restaurant.findMany({
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
        menus: true,
      },
    });
    
    return r
  }

  // 3. JWENN YON RESTORAN PA ID
  async findOne(id: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        owner: true,
        menus: true,
        reviews: true,
      },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restoran ki gen ID ${id} an pa jwenn.`);
    }

    return restaurant;
  }

  // 4. JWENN RESTORAN PA OWNER ID
  async findByOwnerId(ownerId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { ownerId },
      include: { menus: true },
    });

    if (!restaurant) {
      throw new NotFoundException('Okenn restoran pa jwenn pou itilizatè sa a.');
    }

    return restaurant;
  }

  // 5. METE A JOU RESTORAN A
  async update(id: string, dto: UpdateRestaurantDto) {
    await this.findOne(id);

    return this.prisma.restaurant.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        
      },
    });
  }

  // 6. SIYE YON RESTORAN
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.restaurant.delete({
      where: { id },
    });
  }
}