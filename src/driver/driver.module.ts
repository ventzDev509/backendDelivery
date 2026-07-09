import { forwardRef, Module } from '@nestjs/common';
import { DriverService } from './driver.service';
import { DriverController } from './driver.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DriverGateway } from './driver.gateway';

@Module({
  imports: [PrismaModule, forwardRef(() => DriverModule)], 
  controllers: [DriverController],
  providers: [DriverService, DriverGateway],
})
export class DriverModule {}
