import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Asire w chemen an kòrèk pou ou

@Injectable()
export class CategoryService  {
  constructor(private prisma: PrismaService) {}

  // Inisyalize kategori ayisyen yo otomatikman lè sèvè a kòmanse
  
  // 1. CREATE - Kreye yon nouvo kategori
  async create(data: { id?: string; name: string }) {
    return this.prisma.category.create({
      data: {
        id: data.id,
        name: data.name,
      },
    });
  }

  // 2. READ (ALL) - Jwenn tout kategori yo
  async findAll() {
    return this.prisma.category.findMany({
      include: {
        menuItems: true,
      },
    });
  }

  // 3. READ (ONE) - Jwenn yon kategori pa ID l
  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { menuItems: true },
    });

    if (!category) {
      throw new NotFoundException(`Kategori ak ID "${id}" a pa jwenn.`);
    }

    return category;
  }

  // 4. UPDATE - Mete ajou yon kategori
  async update(id: string, data: { name?: string }) {
    await this.findOne(id);

    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  // 5. DELETE - Efase yon kategori
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.category.delete({
      where: { id },
    });
  }
}