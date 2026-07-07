import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client'; // L ap rale wòl yo dirèkteman nan Prisma

export const ROLES_KEY = 'roles';
export const Roles = (...roles: (keyof typeof Role | string)[]) => SetMetadata(ROLES_KEY, roles);