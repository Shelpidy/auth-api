import { Type } from 'class-transformer';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  ValidateNested,
  IsBoolean,
  IsDate,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserDataDto {
  @ApiProperty({ description: 'Tenant nano id', example: 'tenant-nano-id', required: false })
  @IsOptional()
  @IsString()
  tenant_nano_id?: string;

  @ApiProperty({ description: 'Language code', example: 'en', required: false })
  @IsOptional()
  @IsString()
  language_code?: string;

  @ApiProperty({ description: 'Timezone', example: 'GMT', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ description: 'Display name', example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  display_name?: string;

  @ApiProperty({ description: 'Nick name', example: 'Johnny', required: false })
  @IsOptional()
  @IsString()
  nick_name?: string;

  @ApiProperty({ description: 'Username', example: 'johndoe', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ description: 'Email', example: 'john.doe@example.com', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: 'Password status', example: 'active', required: false })
  @IsOptional()
  @IsString()
  password_status?: string;

  @ApiProperty({ description: 'Status', example: 'active', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'Photo URL', example: 'http://example.com/photo.jpg', required: false })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty({ description: 'Portal access', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  portal_access?: boolean;
}

export class UserProfileDataDto {
  @ApiProperty({ description: 'Name prefix', example: 'Mr.', required: false })
  @IsOptional()
  @IsString()
  name_prefix?: string;

  @ApiProperty({ description: 'Full name', example: 'John Doe' })
  @IsString()
  full_name: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  @IsString()
  first_name: string;

  @ApiProperty({ description: 'Middle name', example: 'Michael', required: false })
  @IsOptional()
  @IsString()
  middle_name?: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  @IsString()
  last_name: string;

  @ApiProperty({ description: 'Name suffix', example: 'Jr.', required: false })
  @IsOptional()
  @IsString()
  name_suffix?: string;

  @ApiProperty({ description: 'Primary phone', example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  primary_phone?: string;

  @ApiProperty({ description: 'Secondary phone', example: '+0987654321', required: false })
  @IsOptional()
  @IsString()
  secondary_phone?: string;

  @ApiProperty({ description: 'Secondary email', example: 'john.secondary@example.com', required: false })
  @IsOptional()
  @IsString()
  secondary_email?: string;

  @ApiProperty({ description: 'Gender', example: 'Male', required: false })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ description: 'Marital status', example: 'Single', required: false })
  @IsOptional()
  @IsString()
  marital_status?: string;

  @ApiProperty({ description: 'Date of birth', example: '1990-01-01', required: false })
  @IsOptional()
  @IsString()
  date_of_birth?: string;

  @ApiProperty({ description: 'Country of birth', example: 'USA', required: false })
  @IsOptional()
  @IsString()
  country_of_birth?: string;

  @ApiProperty({ description: 'Nationality', example: 'American', required: false })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiProperty({ description: 'National ID number', example: '123456789', required: false })
  @IsOptional()
  @IsString()
  national_id_number?: string;

  @ApiProperty({ description: 'Is disabled', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  is_disabled?: boolean;

  @ApiProperty({ description: 'Disability status', example: 'None', required: false })
  @IsOptional()
  @IsString()
  disability_status?: string;
}

export class UserUpdateDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UserDataDto)
  user?: UserDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserProfileDataDto)
  profile?: UserProfileDataDto;
}

export class AssignRoleDto {
  @ApiProperty({ description: 'Role nano id to assign', example: 'role-nano-id' })
  @IsString()
  role_nano_id: string;
}

export class AssignTenantDto {
  @ApiProperty({ description: 'Tenant nano id to assign', example: 'tenant-nano-id' })
  @IsString()
  tenant_nano_id: string;
}

export class UsersByRoleDto {
  @ApiProperty({ description: 'Page number for pagination', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ description: 'Limit of results per page', example: 10, required: false })
  @IsOptional()
  @IsNumber()
  limit?: number = 10;
}

export class UserLocationDto {
  @ApiProperty({ description: 'Address line 1', example: '123 Main St' })
  @IsString()
  address_line1: string;

  @ApiProperty({ description: 'Address line 2', example: 'Apt 4B', required: false })
  @IsOptional()
  @IsString()
  address_line2?: string;

  @ApiProperty({ description: 'City', example: 'New York' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'State', example: 'NY', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ description: 'Province', example: 'New York', required: false })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiProperty({ description: 'Postal code', example: '10001', required: false })
  @IsOptional()
  @IsString()
  postal_code?: string;

  @ApiProperty({ description: 'Country', example: 'USA' })
  @IsString()
  country: string;

  @ApiProperty({ description: 'Latitude', example: 40.7128, required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ description: 'Longitude', example: -74.0060, required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class CreateUserPaymentDto {
  @ApiProperty({ description: 'User nano id', example: 'user-nano-id' })
  @IsString()
  @IsNotEmpty()
  user_nano_id: string;

  @ApiProperty({ description: 'Payment type', example: 'Credit Card' })
  @IsString()
  @IsNotEmpty()
  payment_type: string;

  @ApiProperty({ description: 'Payment method', example: 'Visa' })
  @IsString()
  @IsNotEmpty()
  payment_method: string;

  @ApiProperty({ description: 'Payment details', example: 'Payment details here', required: false })
  @IsString()
  @IsOptional()
  payment_details?: string;
}

export class UpdateUserPaymentDto {
  @ApiProperty({ description: 'Updated payment type', example: 'Credit Card', required: false })
  @IsString()
  @IsOptional()
  payment_type?: string;

  @ApiProperty({ description: 'Updated payment method', example: 'Visa', required: false })
  @IsString()
  @IsOptional()
  payment_method?: string;

  @ApiProperty({ description: 'Updated payment details', example: 'Updated payment details here', required: false })
  @IsString()
  @IsOptional()
  payment_details?: string;
}
