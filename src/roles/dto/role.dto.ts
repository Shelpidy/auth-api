import { IsNotEmpty, IsEnum } from 'class-validator';

export enum RoleName {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  AUTHENTICATED = 'authenticated',
  EDITOR = 'editor',
  ANONYMOUS = 'anonymous',
}

export class CreateRoleDto {
  @IsNotEmpty()
  @IsEnum(RoleName)
  name: RoleName;
}

export class UpdateRoleDto {
  @IsNotEmpty()
  @IsEnum(RoleName)
  name: RoleName;
}
