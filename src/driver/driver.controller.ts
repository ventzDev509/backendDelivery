import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { DriverService } from './driver.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver-dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/decorators/roles.guard';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { DriverLoginDto } from './dto/driver-login.dto';

@Controller('drivers')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Post('login')
  login(@Body() dto: DriverLoginDto) { return this.driverService.login(dto); }

  @Get('available')
  findAvailable() { return this.driverService.findAvailable(); }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DRIVER')
  findMine(@Request() req: any) { return this.driverService.findMine(req.user.id, req.user.driverId); }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() { return this.driverService.findAll(); }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: CreateDriverDto) { return this.driverService.create(dto); }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'DRIVER')
  update(@Param('id') id: string, @Body() dto: UpdateDriverDto, @Request() req: any) {
    return this.driverService.update(id, dto, req.user);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'DRIVER')
  getStats(@Param('id') id: string, @Request() req: any) {
    return this.driverService.getDriverStats(id, req.user);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  approveDriver(@Param('id') id: string) { return this.driverService.verify(id); }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) { return this.driverService.delete(id); }
}
