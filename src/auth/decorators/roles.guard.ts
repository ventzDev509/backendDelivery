import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator'; // ENPÒTAN: Itilize menm kle a

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
  const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
    context.getHandler(),
    context.getClass(),
  ]);

  if (!requiredRoles) return true;

  const { user } = context.switchToHttp().getRequest();

  if (!user || !user.role) {
    console.log("RolesGuard: User pa jwenn oswa li pa gen wòl!");
    return false;
  }

  // Debug konparezon an
  const hasRole = requiredRoles.some((role) => {
    return user.role === role;
  });

  return hasRole;
}
}