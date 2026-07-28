import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto, UpdateMenuItemDto, UpdateRestaurantDto } from './dto/create-restaurant.dto';
import { SupabaseService } from 'src/common/supabase.service';

@Injectable()
export class RestaurantService {
  constructor(
    private prisma: PrismaService,
    private supabaseService: SupabaseService,
  ) { }

  // 2. JWENN TOU RESTORAN YO
  async findAll() {
    const r = this.prisma.restaurant.findMany({
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

    return r;
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

  // ==========================================
  // METÒD POU MENU ITEMS (MENUS)
  // ==========================================

  // 7. KREYE YON ATIK NAN MENU A POU YON RESTORAN (Avèk sipò Imaj Supabase)
  async createMenuItem(
    restaurantId: string,
    dto: CreateMenuItemDto,
    file?: Express.Multer.File
  ) {
    // 1. Asire w restoran an egziste
    await this.findOne(restaurantId);

    // 2. Tcheke si kategori a egziste
    const categoryExists = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!categoryExists) {
      throw new NotFoundException(`Kategori ak ID "${dto.categoryId}" a pa egziste nan baz done a.`);
    }

    let imageUrl = dto.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";

    // 3. Si itilizatè a voye yon fichye imaj, uploade l sou Supabase nan folder 'menu-images'
    if (file) {
      imageUrl = await this.supabaseService.uploadFile(
        file,
        'menu-images',
      );
    }

    // 4. Kreye atik la nan baz done a
    return this.prisma.menuItem.create({
      data: {
        name: dto.name,
        price: dto.price !== undefined ? Number(dto.price) : 0,
        description: dto.description,
        image: imageUrl,
        categoryId: dto.categoryId,
        isAvailable: typeof dto.isAvailable === 'string'
          ? dto.isAvailable === 'true'
          : Boolean(dto.isAvailable ?? true),
        prepTime: dto.prepTime !== undefined ? Number(dto.prepTime) : 15,
        restaurantId: restaurantId,
      }
    });
  }

  // 8. JWENN TOUT ATIK KI NAN MENU YON RESTORAN
  async findAllMenuItems(restaurantId: string) {
    // 1. Nou verifye si restoran an egziste anvan nou chèche meni l yo
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restoran ki gen ID '${restaurantId}' pa jwenn.`);
    }

    // 2. Nou retounen tout meni ki gen rapò ak restoran an
    return this.prisma.menuItem.findMany({
      where: { restaurantId },
      include: { category: true },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  // 9. JWENN YON SÈL ATIK NAN MENU A PA ID L
  async findOneMenuItem(id: string) {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id },
      include: { category: true, restaurant: true },

    });

    if (!menuItem) {
      throw new NotFoundException(`Atik ki nan meni an ki gen ID ${id} an pa jwenn.`);
    }

    return menuItem;
  }

  // 10. METE A JOU YON ATIK NAN MENU A (Avèk netwayaj ansyen imaj nan Supabase)
  async updateMenuItem(
    id: string,
    dto: UpdateMenuItemDto,
    file?: Express.Multer.File
  ) {
    const existingItem = await this.findOneMenuItem(id);

    let imageUrl = dto.image ?? existingItem.image;

    // Si gen yon nouvo fichye imaj voye
    if (file) {
      // 1. Uploade nouvo imaj la sou Supabase
      imageUrl = await this.supabaseService.uploadFile(
        file,
        'menu-images',
      );

      // 2. Si ansyen imaj la te egziste epi li pa t imaj default la, efase l nan Supabase
      if (existingItem.image && !existingItem.image.includes('unsplash.com')) {
        await this.supabaseService.deleteImageFromSupabase(existingItem.image);
      }
    }

    // Si yo ap chanje kategori a, asire w kategori nouvo a egziste
    if (dto.categoryId && dto.categoryId !== existingItem.categoryId) {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!categoryExists) {
        throw new NotFoundException(`Kategori ak ID "${dto.categoryId}" a pa egziste nan baz done a.`);
      }
    }

    return this.prisma.menuItem.update({
      where: {
        id: id
      },
      data: {
        name: dto.name,
        price: dto.price !== undefined ? Number(dto.price) : undefined,
        description: dto.description,
        image: imageUrl,
        categoryId: dto.categoryId,
        isAvailable: typeof dto.isAvailable === 'string'
          ? dto.isAvailable === 'true'
          : Boolean(dto.isAvailable),
        prepTime: dto.prepTime !== undefined ? Number(dto.prepTime) : undefined,
      }
    });
  }

  // 11. EFASE YON ATIK NAN MENU A (Epi retire imaj li nan Supabase)
  async removeMenuItem(id: string) {
    const existingItem = await this.findOneMenuItem(id);

    // 1. Efase atik la nan baz done Prisma a
    const deletedItem = await this.prisma.menuItem.delete({
      where: { id },
    });

    // 2. Si atik la te gen yon imaj ki pa soti nan Unsplash, efase l sou Supabase tou
    if (existingItem.image && !existingItem.image.includes('unsplash.com')) {
      await this.supabaseService.deleteImageFromSupabase(existingItem.image);
    }

    return deletedItem;
  }
}