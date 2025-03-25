import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TenantContactDto {
  @IsString()
  @IsOptional()
  tenant_email?: string;

  @IsOptional()
  @IsString()
  registrar_email?: string;

  @IsOptional()
  @IsString()
  finance_email?: string;

  @IsOptional()
  @IsString()
  chancellor_email?: string;

  @IsOptional()
  @IsString()
  vcp_email?: string;

  @IsOptional()
  @IsString()
  dvcp_email?: string;

  @IsOptional()
  @IsString()
  ictd_email?: string;

  @IsOptional()
  @IsString()
  tenant_phone?: string;

  @IsOptional()
  @IsString()
  registrar_phone?: string;

  @IsOptional()
  @IsString()
  finance_phone?: string;

  @IsOptional()
  @IsString()
  chancellor_phone?: string;

  @IsOptional()
  @IsString()
  ictd_phone?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  facebook?: string;

  @IsOptional()
  @IsString()
  linkedin?: string;

  @IsOptional()
  @IsString()
  youtube?: string;

  @IsOptional()
  @IsString()
  twitter?: string;

  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsString()
  tiktok?: string;
}

export class TenantSettingsDto {
  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  neutral_color_background?: string;

  @IsOptional()
  @IsString()
  neutral_color_sections?: string;

  @IsOptional()
  @IsString()
  neutral_color_text?: string;

  @IsOptional()
  @IsString()
  primary_color?: string;

  @IsOptional()
  @IsString()
  secondary_color?: string;

  @IsOptional()
  @IsString()
  accent_color?: string;

  @IsOptional()
  @IsString()
  semantic_color_success?: string;

  @IsOptional()
  @IsString()
  semantic_color_warning?: string;

  @IsOptional()
  @IsString()
  semantic_color_error?: string;

  @IsOptional()
  @IsString()
  semantic_color_info?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  language_code?: string;

  @IsOptional()
  @IsString()
  currency?: string;
}

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  account_type: string;

  @IsString()
  @IsNotEmpty()
  short_name: string;

  @IsString()
  @IsNotEmpty()
  long_name: string;

  @IsString()
  @IsNotEmpty()
  legal_name: string;

  @IsOptional()
  @IsString()
  government_registration_id?: string;

  @IsOptional()
  @IsString()
  government_alternate_registration_id?: string;

  @IsString()
  @IsNotEmpty()
  education_category: string;

  @IsOptional()
  @IsString()
  education_classification?: string;

  @IsOptional()
  @IsString()
  education_affiliation?: string;

  @IsOptional()
  @IsString()
  education_association?: string;

  @IsString()
  @IsNotEmpty()
  education_lowest_grade_level: string;

  @IsString()
  @IsNotEmpty()
  education_highest_grade_level: string;

  @IsOptional()
  @IsString()
  date_founded?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  account_owner_name: string;

  @IsString()
  @IsNotEmpty()
  account_owner_email: string;

  @IsString()
  @IsNotEmpty()
  account_owner_phone: string;

  @IsString()
  @IsNotEmpty()
  subscription_name: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TenantContactDto)
  tenant_contact?: TenantContactDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TenantSettingsDto)
  tenant_settings?: TenantSettingsDto;
}

export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  account_type?: string;

  @IsOptional()
  @IsString()
  short_name?: string;

  @IsOptional()
  @IsString()
  long_name?: string;

  @IsOptional()
  @IsString()
  legal_name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TenantContactDto)
  contact?: TenantContactDto;
}

export class TenantLocationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  location_type: string;

  @IsString()
  @IsNotEmpty()
  address_line1: string;

  @IsOptional()
  @IsString()
  address_line2?: string;

  @IsString()
  @IsNotEmpty()
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
  @IsNotEmpty()
  country: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class CreateTenantSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  subscription_name: string;

  @IsString()
  @IsNotEmpty()
  tenant_nano_id: string;
}

export class UpdateTenantSubscriptionDto {
  @IsString()
  @IsOptional()
  subscription_name?: string;
}
