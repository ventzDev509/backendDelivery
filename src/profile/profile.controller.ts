import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Patch(':userId')
  update(@Param('userId') userId: string, @Body() updateProfileDto: any) {
    return this.profileService.update(userId, updateProfileDto);
  }

  @Get(':userId')
  findOne(@Param('userId') userId: string) {
    return this.profileService.findOne(userId);
  }

  
}