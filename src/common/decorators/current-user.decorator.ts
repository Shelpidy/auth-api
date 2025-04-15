import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ICurrentUser } from '../interfaces/current-user.interface';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ICurrentUser => {
    const request = ctx.switchToHttp().getRequest();
    const ip = request.ip || request.connection.remoteAddress;
    
    // Ensure all required fields are present
    return {
      user_id: request.user?.user_id,
      email: request.user?.email,
      full_name: request.user?.full_name,
      tenant_id: request.user?.tenant_id,
      roles: request.user.roles || [],
      ip
    };
  },
);
