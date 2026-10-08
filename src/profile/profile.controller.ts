import { Controller, Get, Body, Patch, Put, Param, Request, UploadedFiles, UseInterceptors, UseGuards, ForbiddenException, BadRequestException } from '@nestjs/common';
import { StoreStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { UpdateWorkingHoursDto } from './dto/update-working-hours.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/decorators/roles.guard';

class UpdateStoreStatusDto {
  @IsEnum(StoreStatus)
  status!: StoreStatus;
}

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @Put('upload-images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'profileImage', maxCount: 1 },
      { name: 'bannerImage', maxCount: 1 },
    ], {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => file.mimetype.startsWith('image/') ? callback(null, true) : callback(new BadRequestException('Fòk fichye pwofil la se yon imaj.'), false),
    }),
  )
  async updateImages(
    @Request() req,
    @UploadedFiles()
    files: {
      profileImage?: Express.Multer.File[],
      bannerImage?: Express.Multer.File[]
    },
  ) {
    const userId = req.user.id;
    return this.profileService.updateProfileImages(userId, files);
  }

  @Put('working-hours')
  @UseGuards(JwtAuthGuard)
  async updateWorkingHours(
    @Request() req,
    @Body() updateWorkingHoursDto: UpdateWorkingHoursDto 
  ) {
    const userId = req.user.id;
    return this.profileService.updateWorkingHours(userId, updateWorkingHoursDto.hours);
  }

  @Patch('store-status')
  @UseGuards(JwtAuthGuard)
  async updateStoreStatus(@Request() req: any, @Body() dto: UpdateStoreStatusDto) {
    return this.profileService.updateStoreStatus(req.user.id, dto.status);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.profileService.findAll();
  }

  @Patch(':userId')
  @UseGuards(JwtAuthGuard)
  update(@Param('userId') userId: string, @Body() updateProfileDto: UpdateProfileDto, @Request() req: any) {
    if (req.user.role !== 'ADMIN' && req.user.id !== userId) throw new ForbiddenException();
    return this.profileService.update(userId, updateProfileDto);
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('userId') userId: string, @Request() req: any) {
    if (req.user.role !== 'ADMIN' && req.user.id !== userId) throw new ForbiddenException();
    return this.profileService.findOne(userId);
  }
}
