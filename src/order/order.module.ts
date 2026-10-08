import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({ imports: [PrismaModule, AuthModule], controllers: [OrderController], providers: [OrderService] })
export class OrderModule {}
