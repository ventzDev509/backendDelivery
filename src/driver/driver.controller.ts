import {
    Controller, Get, Post, Patch, Delete,
    Param, Body, UseGuards,
    Request
} from '@nestjs/common';
import { DriverService } from './driver.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/decorators/roles.guard';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { UpdateDriverDto } from './dto/update-driver-dto';

@Controller('drivers')
export class DriverController {
    constructor(private readonly driverService: DriverService) { }

    
    @Get()
    findAll() {
        return this.driverService.findAll();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Post()
    create(@Body() createDriverDto: CreateDriverDto, @Request() req) {
        return this.driverService.create(createDriverDto, req.user.id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
        return this.driverService.update(id, updateDriverDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Patch(':id/approve')
    async approveDriver(@Param('id') id: string) {
        return await this.driverService.update(id, { isVerified: true } as any);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    remove(@Param('id') id: string) {
        return this.driverService.delete(id);
    }
}