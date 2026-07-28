import { Controller, Get, Post, Body, Param, Put, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  async update(@Param('id') id: string, @Body() updateDto: UpdateRestaurantDto) {
    return this.restaurantService.update(id, updateDto);
  }

  // 5. SIYE YON RESTORAN (DELETE /restaurants/:id)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.restaurantService.remove(id);
  }

  // ==========================================
  // WOUT POU MENU ITEMS
  // ==========================================

  // 6. KREYE YON ATIK NAN MENU A (POST /restaurants/:restaurantId/menu) - Avèk sipò pou imaj file
  @Post(':restaurantId/menu')
  @UseInterceptors(FileInterceptor('image')) // 'image' dwe non field ki voye nan fòma multipart/form-data sou frontend la
  async createMenuItem(
    @Param('restaurantId') restaurantId: string,
    @Body() createMenuItemDto: CreateMenuItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.restaurantService.createMenuItem(restaurantId, createMenuItemDto, file);
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
  @UseInterceptors(FileInterceptor('image'))
  async updateMenuItem(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.restaurantService.updateMenuItem(id, updateMenuItemDto, file);
  }

  // 10. EFASE YON ATIK NAN MENU A (DELETE /restaurants/menu/item/:id)
  @Delete('menu/item/:id')
  async removeMenuItem(@Param('id') id: string) {
    return this.restaurantService.removeMenuItem(id);
  }
}