import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { eq } from 'drizzle-orm';

type TokenPayload = {
  user_id: string;
  tenant_id: string;
  roles: string[];
};

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @Inject('DATABASE_CONNECTION')
    private db: NodePgDatabase<typeof schema>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decoded = this.jwtService.verify(token) as TokenPayload;
      const user = await this.db.query.users.findFirst({
        where: eq(schema.users.user_id, decoded.user_id),
        with: {
          user_roles: {
            with: {
              role: true,
            },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      const isSuperAdmin = user.user_roles.some((ur) =>
        ur?.role?.name?.includes('super-admin'),
      );

      if (!isSuperAdmin) {
        throw new ForbiddenException('Forbidden: Super sdmins only');
      }

      request.user = decoded;
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
