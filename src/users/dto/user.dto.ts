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

export class UserDataDto {
  @IsOptional()
  @IsString()
  tenant_nano_id?: string;

  @IsOptional()
  @IsString()
  language_code?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  display_name?: string;

  @IsOptional()
  @IsString()
  nick_name?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  password_status?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsBoolean()
  portal_access?: boolean;
}

export class UserProfileDataDto {
  @IsOptional()
  @IsString()
  name_prefix?: string;

  @IsString()
  full_name: string;

  @IsString()
  first_name: string;

  @IsOptional()
  @IsString()
  middle_name?: string;

  @IsString()
  last_name: string;

  @IsOptional()
  @IsString()
  name_suffix?: string;

  @IsOptional()
  @IsString()
  primary_phone?: string;

  @IsOptional()
  @IsString()
  secondary_phone?: string;

  @IsOptional()
  @IsString()
  secondary_email?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  marital_status?: string;

  @IsOptional()
  @IsString()
  date_of_birth?: string; // Changed from Date to string

  @IsOptional()
  @IsString()
  country_of_birth?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  national_id_number?: string;

  @IsOptional()
  @IsBoolean()
  is_disabled?: boolean;

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
  @IsString()
  role_nano_id: string;
}

export class AssignTenantDto {
  @IsString()
  tenant_nano_id: string;
}

export class UsersByRoleDto {
  @IsNumber()
  page?: number = 1;

  @IsNumber()
  limit?: number = 10;
}

export class UserLocationDto {
  @IsOptional()
  @IsString()
  location_type?: string;

  @IsString()
  address_line1: string;

  @IsOptional()
  @IsString()
  address_line2?: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  postal_code?: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class CreateUserPaymentDto {
  @IsString()
  @IsNotEmpty()
  user_nano_id: string;

  @IsString()
  @IsNotEmpty()
  payment_type: string;

  @IsString()
  @IsNotEmpty()
  payment_method: string;

  @IsString()
  @IsOptional()
  payment_details?: string;
}

export class UpdateUserPaymentDto {
  @IsString()
  @IsOptional()
  payment_type?: string;

  @IsString()
  @IsOptional()
  payment_method?: string;

  @IsString()
  @IsOptional()
  payment_details?: string;
}

// export class CreateUserSettingDto {
//   @IsString()
//   @IsNotEmpty()
//   user_nano_id: string;

//   @IsString()
//   @IsNotEmpty()
//   setting_key: string;

//   @IsString()
//   @IsNotEmpty()
//   setting_value: string;
// }

// export class UpdateUserSettingDto {
//   @IsString()
//   @IsOptional()
//   setting_value: string;
// }
