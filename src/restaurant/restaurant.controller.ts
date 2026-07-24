import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import  { RestaurantService, CreateRestaurantDto, UpdateRestaurantDto } from './restaurant.service';
// Si w gen yon Otantifikasyon (JWT Guard), ou ka de-komante liy sa yo:

@Controller('restaurants')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  

  // 2. JWENN TOU RESTORAN YO (GET /restaurants) -> Itil anpil pou kat la sou frontend la
  @Get()
  async findAll() {
    return this.restaurantService.findAll();
  }

  // 3. JWENN YON RESTORAN PA ID L (GET /restaurants/:id)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.restaurantService.findOne(id);
  }

  // 4. JWENN RESTORAN PA OWNER ID (GET /restaurants/owner/:ownerId)
  @Get('owner/:ownerId')
  async findByOwnerId(@Param('ownerId') ownerId: string) {
    return this.restaurantService.findByOwnerId(ownerId);
  }

  

  // 6. SIYE YON RESTORAN (DELETE /restaurants/:id)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.restaurantService.remove(id);
  }
}