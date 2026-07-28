import { Controller, Get, Post, Body, Patch, Put, Param, Delete, Request, UploadedFiles, UseInterceptors, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { UpdateWorkingHoursDto } from './dto/update-working-hours.dto';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  // 1. Mete wout upload-images la ANVAN wout ki gen :userId yo
  @Put('upload-images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'profileImage', maxCount: 1 },
      { name: 'bannerImage', maxCount: 1 },
    ]),
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

  // 2. Lòt wout yo vin apre
  @Patch(':userId')
  update(@Param('userId') userId: string, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.update(userId, updateProfileDto);
  }

  @Get(':userId')
  findOne(@Param('userId') userId: string) {
    return this.profileService.findOne(userId);
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
}