import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { DriverModule } from './driver/driver.module';
import { ProfileModule } from './profile/profile.module';
import { RestaurantModule } from './restaurant/restaurant.module';

@Module({
  imports: [AuthModule, PrismaModule, MailModule, ConfigModule.forRoot({
    isGlobal: true,
  }), AdminModule, DriverModule, ProfileModule, RestaurantModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
