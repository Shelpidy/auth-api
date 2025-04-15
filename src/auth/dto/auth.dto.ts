import { Type } from 'class-transformer';
import {
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
  IsDateString,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserDataDto {
  @ApiProperty({ example: 'Mr.' })
  @IsOptional()
  @IsString()
  name_prefix?: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  full_name: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  first_name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  middle_name?: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  last_name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name_suffix?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  national_id_number?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  other_government_id_numer?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  uploaded_id_photo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  secondary_phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  secondary_email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  demographic_gender?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  demographic_marital_status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  demographic_date_of_birth?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  demographic_country_of_birth?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  demographic_nationality?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  demographic_is_disabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  demographic_disability_status?: string;

  @ApiProperty({ description: 'Address name', example: 'Primary Address' })
  @IsString()
  address_name: string;

  @ApiProperty({ description: 'Address type', example: 'Home' })
  @IsString()
  address_type: string;

  @ApiProperty({ description: 'Country', example: 'Sierra Leone' })
  @IsString()
  address_country: string;

  @ApiProperty({ description: 'City', example: 'Freetown' })
  @IsString()
  address_city: string;

  @ApiProperty({ description: 'Address line 1', example: '123 Main St' })
  @IsString()
  address_address_line1: string;

  @ApiProperty({ description: 'Address line 2', required: false })
  @IsOptional()
  @IsString()
  address_address_line2?: string;

  @ApiProperty({ description: 'State/Province', required: false })
  @IsOptional()
  @IsString()
  address_state?: string;

  @ApiProperty({ description: 'Region', required: false })
  @IsOptional()
  @IsString()
  address_region?: string;

  @ApiProperty({ description: 'District', required: false })
  @IsOptional()
  @IsString()
  address_district?: string;

  @ApiProperty({ description: 'Postal code', required: false })
  @IsOptional()
  @IsString()
  address_postal_code?: string;
}

export class SignUpDto {
  @ApiProperty({ example: 'johndoe' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'teaxmarkit@gmail.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+23276123456', required: false })
  @IsOptional()
  @IsString()
  primary_phone?: string;

  @ApiProperty({ example: 'teaxmarkit' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ required: false, default: 'en' })
  @IsOptional()
  @IsString()
  language_code?: string = 'en';

  @ApiProperty({ required: false, default: 'UTC' })
  @IsOptional()
  @IsString()
  timezone?: string = 'UTC';

  @ApiProperty({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  display_name?: string;

  @ApiProperty({ example: 'johndoe' })
  @IsOptional()
  @IsString()
  nice_name?: string;

  @ApiProperty({ example: 'https://example.com/photo.jpg' })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty({ example: 'uty_student' })
  @IsOptional()
  @IsString()
  user_type_id?: string;

  @ApiProperty({ type: UserDataDto })
  @ValidateNested()
  @Type(() => UserDataDto)
  user_data: UserDataDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tenant_id?: string;
}

export class SignInDto {
  @ApiProperty({ example: 'teaxmarkit@gmail.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+23276123456', required: false })
  @IsOptional()
  @IsString()
  primary_phone?: string;

  @ApiProperty({ example: 'teaxmarkit' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ip?: string;
}

export class RequestOtpDto {
  @ApiProperty({ example: 'teaxmarkit@gmail.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+23276123456', required: false })
  @IsOptional()
  @IsString()
  primary_phone?: string;

  @ApiProperty({ example: 'sms', enum: ['sms', 'email'] })
  @IsString()
  channel: 'sms' | 'email';
}

export class NewPasswordDto {
  @ApiProperty({ example: 'teaxmarkit@gmail.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+23276123456', required: false })
  @IsOptional()
  @IsString()
  primary_phone?: string;

  @ApiProperty({ description: 'OTP code', example: '123456', minLength: 6 })
  @IsString()
  @MinLength(6)
  otp: string;

  @ApiProperty({ description: 'New password', example: 'newpassword', minLength: 6 })
  @IsString()
  @MinLength(6)
  new_password: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'teaxmarkit@gmail.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+23276123456', required: false })
  @IsOptional()
  @IsString()
  primary_phone?: string;

  @ApiProperty({ description: 'OTP code', example: '123456', minLength: 6 })
  @IsString()
  @MinLength(6)
  otp: string;
}

export class ResendOtpDto {
  @ApiProperty({ example: 'teaxmarkit@gmail.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+23276123456', required: false })
  @IsOptional()
  @IsString()
  primary_phone?: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'teaxmarkit@gmail.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+23276123456', required: false })
  @IsOptional()
  @IsString()
  primary_phone?: string;
}
