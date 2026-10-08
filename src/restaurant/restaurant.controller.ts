import { Controller, Get, Post, Body, Param, Put, Delete, UseInterceptors, UploadedFile, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { RestaurantService } from './restaurant.service';
import type { CreateMenuItemDto, UpdateMenuItemDto, UpdateRestaurantDto } from './dto/create-restaurant.dto';

@Controller('restaurants')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  // 1. JWENN TOU RESTORAN YO (GET /restaurants)
  @Get()
  async findAll() {
    return this.restaurantService.findAll();
  }

  // Atik popilè pou paj dakèy la (klase dapre kantite lavant).
  @Get('popular-foods')
  async findPopularFoods(@Query('limit') limit?: string) {
    const parsedLimit = Number.parseInt(limit ?? '12', 10);
    return this.restaurantService.findPopularFoods(parsedLimit);
  }

  // 2. JWENN YON RESTORAN PA ID L (GET /restaurants/:id)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.restaurantService.findOne(id);
  }

  // 3. JWENN RESTORAN PA OWNER ID (GET /restaurants/owner/:ownerId)
  @Get('owner/:ownerId')
  async findByOwnerId(@Param('ownerId') ownerId: string) {
    return this.restaurantService.findByOwnerId(ownerId);
  }

  // 4. METE A JOU YON RESTORAN (PUT /restaurants/:id)
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateDto: UpdateRestaurantDto, @Request() req: any) {
    return this.restaurantService.update(id, updateDto, req.user);
  }

  // 5. SIYE YON RESTORAN (DELETE /restaurants/:id)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.restaurantService.remove(id, req.user);
  }

  // ==========================================
  // WOUT POU MENU ITEMS
  // ==========================================

  // 6. KREYE YON ATIK NAN MENU A (POST /restaurants/:restaurantId/menu) - Avèk sipò pou imaj file
  @Post(':restaurantId/menu')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => file.mimetype.startsWith('image/') ? callback(null, true) : callback(new BadRequestException('Fòk fichye meni an se yon imaj.'), false),
  }))
  async createMenuItem(
    @Param('restaurantId') restaurantId: string,
    @Body() createMenuItemDto: CreateMenuItemDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Request() req: any,
  ) {
    return this.restaurantService.createMenuItem(restaurantId, createMenuItemDto, req.user, file);
  }

  // 7. JWENN TOUT ATIK NAN MENU YON RESTORAN (GET /restaurants/:restaurantId/menu)
  @Get(':restaurantId/menu')
  async findAllMenuItems(@Param('restaurantId') restaurantId: string) {
    return this.restaurantService.findAllMenuItems(restaurantId);
  }

  // 8. JWENN YON SÈL ATIK NAN MENU A PA ID L (GET /restaurants/menu/item/:id)
  @Get('menu/item/:id')
  async findOneMenuItem(@Param('id') id: string) {
    return this.restaurantService.findOneMenuItem(id);
  }

  // 9. METE A JOU YON ATIK NAN MENU A (PUT /restaurants/menu/item/:id) - Avèk sipò pou imaj file
  @Put('menu/item/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => file.mimetype.startsWith('image/') ? callback(null, true) : callback(new BadRequestException('Fòk fichye meni an se yon imaj.'), false),
  }))
  async updateMenuItem(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Request() req: any,
  ) {
    return this.restaurantService.updateMenuItem(id, updateMenuItemDto, req.user, file);
  }

  // 10. EFASE YON ATIK NAN MENU A (DELETE /restaurants/menu/item/:id)
  @Delete('menu/item/:id')
  @UseGuards(JwtAuthGuard)
  async removeMenuItem(@Param('id') id: string, @Request() req: any) {
    return this.restaurantService.removeMenuItem(id, req.user);
  }
}
