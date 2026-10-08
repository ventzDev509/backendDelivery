import { Module } from '@nestjs/common';
import { DriverService } from './driver.service';
import { DriverController } from './driver.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DriverGateway } from './driver.gateway';
import { ProfileModule } from 'src/profile/profile.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, ProfileModule, AuthModule],
  controllers: [DriverController],
  providers: [DriverService, DriverGateway],
})
export class DriverModule {}
