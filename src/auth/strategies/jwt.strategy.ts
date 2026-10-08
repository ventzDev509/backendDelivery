import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private Auth: AuthService, private prisma: PrismaService, config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; role?: Role; driverId?: string }) {
    const user = await this.Auth.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Itilizatè sa a pa egziste');
    }
    if (payload.role === Role.DRIVER) {
      const driver = await this.prisma.driver.findFirst({
        where: { id: payload.driverId, userId: user.id, isVerified: true },
        select: { id: true },
      });
      if (!driver) throw new UnauthorizedException('Kont chofè sa a pa verifye ankò.');
      return { ...user, role: Role.DRIVER, driverId: driver.id };
    }
    return user;
  }
}
