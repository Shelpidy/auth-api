import { Type } from 'class-transformer';
import {
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
  IsDateString,
  Matches,
  ValidateNested,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({ description: 'Prefix of the user name', example: 'Mr.' })
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

  @ApiProperty({ description: 'Suffix of the user name', example: 'Jr.', required: false })
  @IsOptional()
  @IsString()
  name_suffix?: string;

  @ApiProperty({ description: 'Primary phone number', example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  primary_phone?: string;

  @ApiProperty({ description: 'Secondary phone number', example: '+0987654321', required: false })
  @IsOptional()
  @IsString()
  secondary_phone?: string;

  @ApiProperty({ description: 'Secondary email address', example: 'secondary@example.com', required: false })
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
  @IsDateString()
  date_of_birth?: string;
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

  @ApiProperty({ description: 'Province', example: 'Ontario', required: false })
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

export class SignUpDto {
  @ApiProperty({ description: 'Username for the user', example: 'teaxmarkit' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ description: 'User email address', example: 'teaxmarkit@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password', example: '123456', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'User photo URL', example: 'http://example.com/photo.jpg', required: false })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty({ description: 'Tenant nano id (optional)', example: 'abc123', required: false })
  @IsOptional()
  @IsString()
  tenant_nano_id?: string;

  @ApiProperty({ description: 'User profile details', type: UserProfileDto })
  @ValidateNested()
  @Type(() => UserProfileDto)
  user_profile: UserProfileDto;

  @ApiProperty({ description: 'User location details', type: UserLocationDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserLocationDto)
  user_location?: UserLocationDto;
}

export class SignInDto {
  @ApiProperty({ description: 'User email address', example: 'teaxmarkit@gmail.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ description: 'User password', example: '123456' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(1, { message: 'Password is required' })
  password: string;
}

export class NewPasswordDto {
  @ApiProperty({ description: 'User email address', example: 'teaxmarkit@gmail.com' })
  @IsEmail()
  email: string;

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
  @ApiProperty({ description: 'User email address', example: 'teaxmarkit@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'OTP code', example: '123456', minLength: 6 })
  @IsString()
  @MinLength(6)
  otp: string;
}

export class ResendOtpDto {
  @ApiProperty({ description: 'User email address', example: 'teaxmarkit@gmail.com' })
  @IsEmail()
  email: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ description: 'User email address', example: 'teaxmarkit@gmail.com' })
  @IsEmail()
  email: string;
}
