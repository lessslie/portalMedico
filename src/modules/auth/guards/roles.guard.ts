import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthenticatedRequest } from '../interfaces/auth.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1️⃣ Obtener los roles requeridos del decorador @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 2️⃣ Obtener el request y el usuario (tipado correctamente)
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    // 3️⃣ Verificar que el usuario tenga uno de los roles requeridos
    if (!user || !user.role) {
      return false;
    }

    // 4️⃣ Comparar el rol del usuario con los roles permitidos
    return requiredRoles.some((role: UserRole) => user.role === role);
  }
}