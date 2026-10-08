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
import { CategoryModule } from './category/category.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, PrismaModule, MailModule, OrderModule, AdminModule, DriverModule, ProfileModule, RestaurantModule, CategoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
