import { IsString, IsEmail, IsPhoneNumber, IsBoolean, IsOptional, ValidateNested, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTenantDataDto {
  @ApiProperty({ example: 'University of Sierra Leone' })
  @IsString()
  long_name: string;

  @ApiProperty({ example: 'USL Limited' })
  @IsString()
  legal_name: string;

  @ApiProperty({ example: 'usl.edu.sl', required: false })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiProperty({ example: 'REG123456', required: false })
  @IsOptional()
  @IsString()
  government_registration_id?: string;

  @ApiProperty({ example: 'ALT123456', required: false })
  @IsOptional()
  @IsString()
  government_alternate_registration_id?: string;

  @ApiProperty({ example: 'Higher Education' })
  @IsString()
  education_category: string;

  @ApiProperty({ example: 'Undergraduate' })
  @IsString()
  education_lowest_grade_level: string;

  @ApiProperty({ example: 'Postgraduate' })
  @IsString()
  education_highest_grade_level: string;

  @ApiProperty({ example: 'General Education', required: false })
  @IsOptional()
  @IsString()
  education_classification?: string;

  @ApiProperty({ example: 'Affiliated Institution', required: false })
  @IsOptional()
  @IsString()
  education_affiliation?: string;

  @ApiProperty({ example: 'Association Name', required: false })
  @IsOptional()
  @IsString()
  education_association?: string;

  @ApiProperty({ example: '1900-01-01', required: false })
  @IsOptional()
  @IsString()
  date_founded?: string;

  @ApiProperty({ example: 'A leading institution in higher education.', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'https://www.usl.edu.sl', required: false })
  @IsOptional()
  @IsString()
  website?: string;
}

export class ContactEmailDto {
  @ApiProperty({ example: 'Primary' })
  @IsString()
  email_type: string;

  @ApiProperty({ example: 'Main Contact' })
  @IsString()
  email_name: string;

  @ApiProperty({ example: 'contact@institution.edu' })
  @IsEmail()
  tenant_main_email: string;
}

export class ContactPhoneDto {
  @ApiProperty({ example: 'Office' })
  @IsString()
  phone_type: string;

  @ApiProperty({ example: 'Main Line' })
  @IsString()
  phone_name: string;

  @ApiProperty({ example: '+23276123456' })
  @IsPhoneNumber()
  tenant_main_phone: string;
}

export class ContactAddressDto {
  @ApiProperty({ example: 'Main Campus' })
  @IsString()
  address_type: string;

  @ApiProperty({ example: 'Headquarters' })
  @IsString()
  address_name: string;

  @ApiProperty({ example: 'Sierra Leone' })
  @IsString()
  address_country: string;

  @ApiProperty({ example: 'Western Area', required: false })
  @IsOptional()
  @IsString()
  address_state?: string;

  @ApiProperty({ example: 'Region Name', required: false })
  @IsOptional()
  @IsString()
  address_region?: string;

  @ApiProperty({ example: 'District Name', required: false })
  @IsOptional()
  @IsString()
  address_district?: string;

  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  address_address_line1: string;

  @ApiProperty({ example: 'Suite 456', required: false })
  @IsOptional()
  @IsString()
  address_address_line2?: string;

  @ApiProperty({ example: 'Freetown' })
  @IsString()
  address_city: string;

  @ApiProperty({ example: '10101', required: false })
  @IsOptional()
  @IsString()
  address_postal_code?: string;

  @ApiProperty({ example: 8.484444, required: false })
  @IsOptional()
  @IsNumber()
  address_latitude?: number;

  @ApiProperty({ example: -13.234444, required: false })
  @IsOptional()
  @IsNumber()
  address_longitude?: number;
}

export class ContactSocialDto {
  @ApiProperty({ example: 'Facebook' })
  @IsString()
  social_type: string;

  @ApiProperty({ example: 'Institution Facebook Page' })
  @IsString()
  social_name: string;

  @ApiProperty({ example: 'https://facebook.com/institution' })
  @IsString()
  social_link: string;
}

export class CreateContactDto {
  @ApiProperty({ example: 'Primary' })
  @IsString()
  contact_type: string;

  @ApiProperty({ example: 'Main Office' })
  @IsString()
  Contact_name: string;

  @ApiProperty()
  @IsString()
  first_name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  middle_name?: string;

  @ApiProperty()
  @IsString()
  last_name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  company_name?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  is_primary_contact?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  is_billing_contact?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  is_registrar_contact?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  is_finance_contact?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  is_vc_contact?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  is_vcp_contact?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  is_dvcp_contact?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  is_ictd_contact?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsString()
  Status?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => ContactEmailDto)
  email: ContactEmailDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => ContactPhoneDto)
  phone: ContactPhoneDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => ContactAddressDto)
  address: ContactAddressDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => ContactSocialDto)
  social: ContactSocialDto;
}

export class CreateBaseTenantDto {
  @ApiProperty({ example: 'tat_xB2Ke9oMpQ4wLvYj' })
  @IsString()
  tenant_account_type_id: string;

  @ApiProperty({ example: 'university-of-sierra-leone' })
  @IsString()
  tenant_name: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  tenant_owner_name: string;

  @ApiProperty({ example: 'john.doe@institution.edu' })
  @IsEmail()
  tenant_owner_email: string;

  @ApiProperty({ example: '+23276543210' })
  @IsPhoneNumber()
  tenant_owner_phone: string;

  @ApiProperty({ example: 'tsu_aB9cD2eF4gH6iJ8k' })
  @IsString()
  tenant_subscription_id: string;

  @ApiProperty({ example: 'usr_xB2Ke9oMpQ4wLvYj' })
  @IsString()
  tenant_user_id: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  status?: boolean = false;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  welcome_email_sent?: boolean = false;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  account_is_suspended?: boolean = false;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  account_is_expired?: boolean = false;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  account_subscription_paid?: boolean = false;
}

export class CreateTenantDto extends CreateBaseTenantDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateTenantDataDto)
  tenant_data?: CreateTenantDataDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateContactDto)
  contact?: CreateContactDto;

  @ApiProperty({ example: 'institution.edu', required: false })
  @IsOptional()
  @IsString()
  domain?: string;
}

export class UpdateTenantDto extends CreateTenantDto {
  @ApiProperty({ example: 'usr_xB2Ke9oMpQ4wLvYj' })
  @IsString()
  modified_by: string;
}

export class UpdateTenantDataDto extends CreateTenantDataDto {
  @ApiProperty({ example: 'usr_xB2Ke9oMpQ4wLvYj' })
  @IsString()
  modified_by: string;
}

export class CreateEmailSettingsDto {
  @ApiProperty({ example: 'ten_xB2Ke9oMpQ4wLvYj' })
  @IsString()
  tenant_id: string;

  @ApiProperty({ example: 'smtp.gmail.com' })
  @IsString()
  email_smtp_server: string;

  @ApiProperty({ example: 'noreply@institution.edu' })
  @IsEmail()
  email_smtp_email: string;

  @ApiProperty({ example: 'smtp_user' })
  @IsString()
  email_smtp_username: string;

  @ApiProperty({ example: 'smtp_pass_123' })
  @IsString()
  email_smtp_password: string;

  @ApiProperty({ example: '465' })
  @IsString()
  email_smtp_ssl_port: string;

  @ApiProperty({ example: '587' })
  @IsString()
  email_smtp_tls_port: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  email_smtp_is_ssl: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  email_smtp_is_tls: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  email_smtp_authentication: boolean;

  @ApiProperty({ example: 'Institution Name' })
  @IsString()
  email_smtp_full_name: string;
}

export class UpdateEmailSettingsDto extends CreateEmailSettingsDto {
  @ApiProperty({ example: 'usr_xB2Ke9oMpQ4wLvYj' })
  @IsString()
  modified_by: string;
}

export class CreateSmsSettingsDto {
  @ApiProperty({ example: 'ten_xB2Ke9oMpQ4wLvYj' })
  @IsString()
  tenant_id: string;

  @ApiProperty({ example: 'https://api.sms-provider.com/send' })
  @IsString()
  sms_authorization_endpoint: string;

  @ApiProperty({ example: 'auth_key_123xyz' })
  @IsString()
  sms_authorization_key: string;

  @ApiProperty({ example: 'INSTITUTION' })
  @IsString()
  sms_authorization_sender: string;

  @ApiProperty({ example: 'api_key_456abc' })
  @IsString()
  sms_authorization_api_key: string;
}

export class UpdateSmsSettingsDto extends CreateSmsSettingsDto {
  @ApiProperty({ example: 'usr_xB2Ke9oMpQ4wLvYj' })
  @IsString()
  modified_by: string;
}

export class SendWelcomeEmailDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tenant_name: string;
}

export class CreateTenantSettingsDto {
  @ApiProperty()
  @IsString()
  tenant_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tenant_academic_year_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tenant_academic_semester_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  branding_logo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  branding_neutal_color_background?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  branding_neutal_color_sections?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  branding_neutal_color_text?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  branding_primary_color?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  branding_secondary_color?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  branding_accent_color?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  language_code?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class UpdateTenantSettingsDto extends CreateTenantSettingsDto {}
