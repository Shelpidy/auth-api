import { Type } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsEmail, ValidateNested, IsDateString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Base user fields matching schema
export class UserBaseDto {
  @ApiProperty({ example: 'ten_xB2Ke9oMpQ4wLvYj' })
  @IsString()
  tenant_id: string;

  @ApiProperty({ example: 'uty_student' })
  @IsString()
  user_type_id: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  display_name: string;

  @ApiProperty({ example: 'johndoe' })
  @IsString()
  nice_name: string;

  @ApiProperty({ example: 'john.doe' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'teaxmarkit@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+23276123456' })
  @IsString()
  primary_phone: string;

  @ApiProperty({ example: 'teaxmarkit' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'en', required: false })
  @IsOptional()
  @IsString()
  language_code?: string = 'en';

  @ApiProperty({ example: 'UTC', required: false })
  @IsOptional()
  @IsString()
  timezone?: string = 'UTC';

  @ApiProperty({ example: 'https://example.com/photo.jpg', required: false })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty({ example: 'pay_xB2Ke9oMpQ4wLvYj', required: false })
  @IsOptional()
  @IsString()
  user_payment_id?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_using_bank_pin?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  is_using_bank_voucher?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_paying_online?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  paid_for_application?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  paid_admission_acceptance_fees?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  can_access_portal?: boolean = true;

  @ApiProperty({ example: 'active', required: false })
  @IsOptional()
  @IsString()
  status?: string;
}

// User data fields matching schema
export class UserDataDto {
  @ApiProperty({ example: 'Mr.', required: false })
  @IsOptional()
  @IsString()
  name_prefix?: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  full_name: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  first_name: string;

  @ApiProperty({ example: 'Michael', required: false })
  @IsOptional()
  @IsString()
  middle_name?: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  last_name: string;

  @ApiProperty({ example: 'Jr.', required: false })
  @IsOptional()
  @IsString()
  name_suffix?: string;

  @ApiProperty({ example: '123456789', required: false })
  @IsOptional()
  @IsString()
  national_id_number?: string;

  @ApiProperty({ example: '987654321', required: false })
  @IsOptional()
  @IsString()
  other_government_id_numer?: string;

  @ApiProperty({ example: 'https://example.com/id_photo.jpg', required: false })
  @IsOptional()
  @IsString()
  uploaded_id_photo?: string;

  @ApiProperty({ example: '+23276123457', required: false })
  @IsOptional()
  @IsString()
  secondary_phone?: string;

  @ApiProperty({ example: 'john.secondary@example.com', required: false })
  @IsOptional()
  @IsEmail()
  secondary_email?: string;

  // Demographic fields
  @ApiProperty({ example: 'Male', required: false })
  @IsOptional()
  @IsString()
  demographic_gender?: string;

  @ApiProperty({ example: 'Single', required: false })
  @IsOptional()
  @IsString()
  demographic_marital_status?: string;

  @ApiProperty({ example: '1990-01-01', required: false })
  @IsOptional()
  @IsDateString()
  demographic_date_of_birth?: string;

  @ApiProperty({ example: 'USA', required: false })
  @IsOptional()
  @IsString()
  demographic_country_of_birth?: string;

  @ApiProperty({ example: 'American', required: false })
  @IsOptional()
  @IsString()
  demographic_nationality?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  demographic_is_disabled?: boolean;

  @ApiProperty({ example: 'None', required: false })
  @IsOptional()
  @IsString()
  demographic_disability_status?: string;

  // Address fields
  @ApiProperty({ example: 'Home', required: false })
  @IsOptional()
  @IsString()
  address_name?: string;

  @ApiProperty({ example: 'Residential', required: false })
  @IsOptional()
  @IsString()
  address_type?: string;

  @ApiProperty({ example: 'USA', required: false })
  @IsOptional()
  @IsString()
  address_country?: string;

  @ApiProperty({ example: 'New York', required: false })
  @IsOptional()
  @IsString()
  address_state?: string;

  @ApiProperty({ example: 'East Coast', required: false })
  @IsOptional()
  @IsString()
  address_region?: string;

  @ApiProperty({ example: 'Manhattan', required: false })
  @IsOptional()
  @IsString()
  address_district?: string;

  @ApiProperty({ example: '123 Main St', required: false })
  @IsOptional()
  @IsString()
  address_address_line1?: string;

  @ApiProperty({ example: 'Apt 4B', required: false })
  @IsOptional()
  @IsString()
  address_address_line2?: string;

  @ApiProperty({ example: 'New York', required: false })
  @IsOptional()
  @IsString()
  address_city?: string;

  @ApiProperty({ example: '10001', required: false })
  @IsOptional()
  @IsString()
  address_postal_code?: string;

  @ApiProperty({ example: 40.7128, required: false })
  @IsOptional()
  @IsString()
  address_latitude?: number;

  @ApiProperty({ example: -74.0060, required: false })
  @IsOptional()
  @IsString()
  address_longitude?: number;
}

export class CreateUserDto extends UserBaseDto {
  @ApiProperty({ type: () => UserDataDto })
  @ValidateNested()
  @Type(() => UserDataDto)
  user_data: UserDataDto;
}

export class UserUpdateDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UserBaseDto)
  user?: Partial<UserBaseDto>;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserDataDto)
  user_data?: Partial<UserDataDto>;
}

export class AssignRoleDto {
  @ApiProperty({ example: 'rol_xB2Ke9oMpQ4wLvYj', description: 'Role nano id to assign' })
  @IsString()
  role_nano_id: string;
}

export class AssignTenantDto {
  @ApiProperty({ example: 'ten_aB9cD2eF4gH6iJ8k', description: 'Tenant nano id to assign' })
  @IsString()
  tenant_nano_id: string;
}

export class UsersByRoleDto {
  @ApiProperty({ example: 1, description: 'Page number for pagination', required: false })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ example: 10, description: 'Limit of results per page', required: false })
  @IsOptional()
  @IsNumber()
  limit?: number = 10;
}

export class UserLocationDto {
  @ApiProperty({ 
    example: '123 Main St',
    description: 'Primary address line' 
  })
  @IsString()
  address_line1: string;

  @ApiProperty({ 
    example: 'Suite 100',
    description: 'Secondary address line',
    required: false 
  })
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

export class CreateRoleDto {
  @ApiProperty({ example: 'Administrator' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'ten_xB2Ke9oMpQ4wLvYj', required: false })
  @IsOptional()
  @IsString()
  tenant_id?: string;
}

export class CreateUserTypeDto {
  @ApiProperty({ 
    example: 'student',
    description: 'Type identifier for the user' 
  })
  @IsString()
  user_type_name: string;

  @ApiProperty({ 
    example: 'ten_123abc',
    description: 'Associated tenant ID',
    required: false 
  })
  @IsOptional()
  @IsString()
  tenant_id?: string;
}

export class UpdateUserTypeDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  user_type_name?: string;
}


export class CreateUserSettingDto {
  @ApiProperty()
  @IsString()
  module: string;

  @ApiProperty() 
  @IsString()
  permission_name: string;

  @ApiProperty()
  @IsString()
  permission_value: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean() 
  serialized?: boolean;
}

export class UpdateUserSettingDto extends CreateUserSettingDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  modified_by?: string;
}