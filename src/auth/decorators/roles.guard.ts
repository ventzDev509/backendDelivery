import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Rale wòl nou te mete nan dekoratè @Roles() la
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si nou pa t mete okenn wòl pou wout sa a, kite l pase
    if (!requiredRoles) {
      return true;
    }

    // 2. Jwenn user a ki nan request la (JwtAuthGuard la te mete l la deja)
    const { user } = context.switchToHttp().getRequest();
    
    // 3. Verifye si user a gen wòl ki nesesè a
    return requiredRoles.some((role) => user?.role === role);
  }
}