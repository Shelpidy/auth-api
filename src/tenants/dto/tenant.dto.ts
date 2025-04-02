import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TenantContactDto {
  @ApiProperty({ description: 'Tenant email', example: 'tenant@example.com', required: false })
  @IsString()
  @IsOptional()
  tenant_email?: string;

  @ApiProperty({ description: 'Registrar email', example: 'registrar@example.com', required: false })
  @IsOptional()
  @IsString()
  registrar_email?: string;

  @ApiProperty({ description: 'Finance email', example: 'finance@example.com', required: false })
  @IsOptional()
  @IsString()
  finance_email?: string;

  @ApiProperty({ description: 'Chancellor email', example: 'chancellor@example.com', required: false })
  @IsOptional()
  @IsString()
  chancellor_email?: string;

  @ApiProperty({ description: 'VCP email', example: 'vcp@example.com', required: false })
  @IsOptional()
  @IsString()
  vcp_email?: string;

  @ApiProperty({ description: 'DVCP email', example: 'dvcp@example.com', required: false })
  @IsOptional()
  @IsString()
  dvcp_email?: string;

  @ApiProperty({ description: 'ICTD email', example: 'ictd@example.com', required: false })
  @IsOptional()
  @IsString()
  ictd_email?: string;

  @ApiProperty({ description: 'Tenant phone', example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  tenant_phone?: string;

  @ApiProperty({ description: 'Registrar phone', example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  registrar_phone?: string;

  @ApiProperty({ description: 'Finance phone', example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  finance_phone?: string;

  @ApiProperty({ description: 'Chancellor phone', example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  chancellor_phone?: string;

  @ApiProperty({ description: 'ICTD phone', example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  ictd_phone?: string;

  @ApiProperty({ description: 'Website', example: 'https://example.com', required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ description: 'Facebook', example: 'https://facebook.com/example', required: false })
  @IsOptional()
  @IsString()
  facebook?: string;

  @ApiProperty({ description: 'LinkedIn', example: 'https://linkedin.com/example', required: false })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiProperty({ description: 'YouTube', example: 'https://youtube.com/example', required: false })
  @IsOptional()
  @IsString()
  youtube?: string;

  @ApiProperty({ description: 'Twitter', example: 'https://twitter.com/example', required: false })
  @IsOptional()
  @IsString()
  twitter?: string;

  @ApiProperty({ description: 'Instagram', example: 'https://instagram.com/example', required: false })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiProperty({ description: 'TikTok', example: 'https://tiktok.com/example', required: false })
  @IsOptional()
  @IsString()
  tiktok?: string;
}

export class TenantSettingsDto {
  @ApiProperty({ description: 'Logo URL', example: 'https://example.com/logo.png', required: false })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({ description: 'Neutral color background', example: '#FFFFFF', required: false })
  @IsOptional()
  @IsString()
  neutral_color_background?: string;

  @ApiProperty({ description: 'Neutral color sections', example: '#F0F0F0', required: false })
  @IsOptional()
  @IsString()
  neutral_color_sections?: string;

  @ApiProperty({ description: 'Neutral color text', example: '#000000', required: false })
  @IsOptional()
  @IsString()
  neutral_color_text?: string;

  @ApiProperty({ description: 'Primary color', example: '#FF0000', required: false })
  @IsOptional()
  @IsString()
  primary_color?: string;

  @ApiProperty({ description: 'Secondary color', example: '#00FF00', required: false })
  @IsOptional()
  @IsString()
  secondary_color?: string;

  @ApiProperty({ description: 'Accent color', example: '#0000FF', required: false })
  @IsOptional()
  @IsString()
  accent_color?: string;

  @ApiProperty({ description: 'Semantic color success', example: '#28a745', required: false })
  @IsOptional()
  @IsString()
  semantic_color_success?: string;

  @ApiProperty({ description: 'Semantic color warning', example: '#ffc107', required: false })
  @IsOptional()
  @IsString()
  semantic_color_warning?: string;

  @ApiProperty({ description: 'Semantic color error', example: '#dc3545', required: false })
  @IsOptional()
  @IsString()
  semantic_color_error?: string;

  @ApiProperty({ description: 'Semantic color info', example: '#17a2b8', required: false })
  @IsOptional()
  @IsString()
  semantic_color_info?: string;

  @ApiProperty({ description: 'Timezone', example: 'America/New_York', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ description: 'Language code', example: 'en', required: false })
  @IsOptional()
  @IsString()
  language_code?: string;

  @ApiProperty({ description: 'Currency', example: 'USD', required: false })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class CreateTenantDto {
  @ApiProperty({ description: 'Account type', example: 'Education' })
  @IsString()
  @IsNotEmpty()
  account_type: string;

  @ApiProperty({ description: 'Short name', example: 'Acme' })
  @IsString()
  @IsNotEmpty()
  short_name: string;

  @ApiProperty({ description: 'Long name', example: 'Acme Corporation' })
  @IsString()
  @IsNotEmpty()
  long_name: string;

  @ApiProperty({ description: 'Legal name', example: 'Acme Corp LLC' })
  @IsString()
  @IsNotEmpty()
  legal_name: string;

  @ApiProperty({ description: 'Government registration ID', example: '123456789', required: false })
  @IsOptional()
  @IsString()
  government_registration_id?: string;

  @ApiProperty({ description: 'Government alternate registration ID', example: '987654321', required: false })
  @IsOptional()
  @IsString()
  government_alternate_registration_id?: string;

  @ApiProperty({ description: 'Education category', example: 'Higher Education' })
  @IsString()
  @IsNotEmpty()
  education_category: string;

  @ApiProperty({ description: 'Education classification', example: 'University', required: false })
  @IsOptional()
  @IsString()
  education_classification?: string;

  @ApiProperty({ description: 'Education affiliation', example: 'Public', required: false })
  @IsOptional()
  @IsString()
  education_affiliation?: string;

  @ApiProperty({ description: 'Education association', example: 'Association of Universities', required: false })
  @IsOptional()
  @IsString()
  education_association?: string;

  @ApiProperty({ description: 'Education lowest grade level', example: 'Undergraduate' })
  @IsString()
  @IsNotEmpty()
  education_lowest_grade_level: string;

  @ApiProperty({ description: 'Education highest grade level', example: 'Postgraduate' })
  @IsString()
  @IsNotEmpty()
  education_highest_grade_level: string;

  @ApiProperty({ description: 'Date founded', example: '2000-01-01', required: false })
  @IsOptional()
  @IsString()
  date_founded?: string;

  @ApiProperty({ description: 'Description', example: 'Leading provider of innovative solutions', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Account owner name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  account_owner_name: string;

  @ApiProperty({ description: 'Account owner email', example: 'john.doe@example.com' })
  @IsString()
  @IsNotEmpty()
  account_owner_email: string;

  @ApiProperty({ description: 'Account owner phone', example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  account_owner_phone: string;

  @ApiProperty({ description: 'Subscription name', example: 'Premium' })
  @IsString()
  @IsNotEmpty()
  subscription_name: string;

  @ApiProperty({ description: 'Tenant contact details', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => TenantContactDto)
  tenant_contact?: TenantContactDto;

  @ApiProperty({ description: 'Tenant settings', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => TenantSettingsDto)
  tenant_settings?: TenantSettingsDto;
}

export class UpdateTenantDto {
  @ApiProperty({ description: 'Account type', example: 'Education', required: false })
  @IsOptional()
  @IsString()
  account_type?: string;

  @ApiProperty({ description: 'Short name', example: 'Acme', required: false })
  @IsOptional()
  @IsString()
  short_name?: string;

  @ApiProperty({ description: 'Long name', example: 'Acme Corporation', required: false })
  @IsOptional()
  @IsString()
  long_name?: string;

  @ApiProperty({ description: 'Legal name', example: 'Acme Corp LLC', required: false })
  @IsOptional()
  @IsString()
  legal_name?: string;

  @ApiProperty({ description: 'Description', example: 'Leading provider of innovative solutions', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Registration number', example: '123456789', required: false })
  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @ApiProperty({ description: 'Industry', example: 'Technology', required: false })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiProperty({ description: 'Status', example: 'Active', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'Contact details', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => TenantContactDto)
  contact?: TenantContactDto;
}

export class TenantLocationDto {
  @ApiProperty({ description: 'Name', example: 'Main Office' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Location type', example: 'Headquarters' })
  @IsString()
  @IsNotEmpty()
  location_type: string;

  @ApiProperty({ description: 'Address line 1', example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  address_line1: string;

  @ApiProperty({ description: 'Address line 2', example: 'Suite 100', required: false })
  @IsOptional()
  @IsString()
  address_line2?: string;

  @ApiProperty({ description: 'City', example: 'Metropolis' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'State', example: 'NY', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ description: 'Province', example: 'Ontario', required: false })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiProperty({ description: 'Postal code', example: '12345', required: false })
  @IsOptional()
  @IsString()
  postal_code?: string;

  @ApiProperty({ description: 'Country', example: 'USA' })
  @IsString()
  @IsNotEmpty()
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

export class CreateTenantSubscriptionDto {
  @ApiProperty({ description: 'Subscription name', example: 'Premium' })
  @IsString()
  @IsNotEmpty()
  subscription_name: string;

  @ApiProperty({ description: 'Tenant nano ID', example: 'abc123' })
  @IsString()
  @IsNotEmpty()
  tenant_nano_id: string;
}

export class UpdateTenantSubscriptionDto {
  @ApiProperty({ description: 'Subscription name', example: 'Premium', required: false })
  @IsString()
  @IsOptional()
  subscription_name?: string;
}
