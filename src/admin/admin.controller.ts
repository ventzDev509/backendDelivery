import { Controller, Get, Put, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../auth/decorators/roles.decorator';     
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/decorators/roles.guard';
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN') 
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 1. Jwenn lis tout demand machann ki annatant (PENDING) yo
  @Get('pending-sellers')
  @HttpCode(HttpStatus.OK)
  async getPendingSellers() {
    return this.adminService.getPendingSellers();
  }

  // 2. Apwouve yon demand machann (Pase l an RESTAURANT_OWNER epi kreye restoran l)
  @Put('sellers/:id/approve')
  @HttpCode(HttpStatus.OK)
  async approveSeller(@Param('id') id: string) {
    return this.adminService.approveSeller(id);
  }

  // 3. Refize yon demand machann avèk yon rezon
  @Put('sellers/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectSeller(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.adminService.rejectSeller(id, reason);
  }
}