import { IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export enum RoleName {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  AUTHENTICATED = 'authenticated',
  EDITOR = 'editor',
  ANONYMOUS = 'anonymous',
}

export class CreateRoleDto {
  @ApiProperty({ 
    example: 'admin',
    description: 'Name of the role' 
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    example: 'ten_123abc',
    description: 'Associated tenant ID',
    required: false 
  })
  @IsOptional()
  @IsString()
  tenant_id?: string;
}

export class UpdateRoleDto {
  @IsNotEmpty()
  @IsEnum(RoleName)
  name: RoleName;
}
