import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [AuthModule, PrismaModule, MailModule, ConfigModule.forRoot({
    isGlobal: true,
  }), AdminModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
