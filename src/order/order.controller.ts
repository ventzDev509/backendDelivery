import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { AssignDriverDto, CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';
import { OrderService } from './order.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateOrderDto) {
    return this.orderService.create(req.user.id, dto);
  }

  @Get()
  findMine(@Request() req: any) {
    return this.orderService.findForUser(req.user);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateOrderStatusDto) {
    return this.orderService.updateStatus(id, req.user, dto);
  }

  @Patch(':id/driver')
  assignDriver(@Param('id') id: string, @Request() req: any, @Body() dto: AssignDriverDto) {
    return this.orderService.assignDriver(id, dto.driverId, req.user);
  }
}
