// ============================================
// 📁 src/modules/auth/interfaces/auth.interface.ts
// ============================================

import { UserRole } from '../../users/user.entity';
import { Request } from 'express';

/**
 * Usuario autenticado que viene del JWT
 */
export interface JwtPayloadUser {
  userId: string;
  username: string;
  role: UserRole;
}

/**
 * Request de Express con usuario autenticado
 */
export interface AuthenticatedRequest extends Request {
  user: JwtPayloadUser;
}