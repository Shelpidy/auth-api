import { IsEnum } from 'class-validator';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export enum RoleName {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user'
}

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  name: string;
}
