import {
  pgTable,
  text,
  serial,
  timestamp,
  boolean,
  date,
  doublePrecision,
  jsonb,
  varchar,
  integer,
  decimal,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Set schema name to 'core'
const schemaName = 'core';

// Base tables with schema prefix
export const tenants = pgTable(`tenants`, {
  tenant_id: varchar('tenant_id', { length: 22 }).primaryKey(),
  tenant_sid: serial('tenant_sid').notNull().unique(),
  tenant_account_type_id: varchar('tenant_account_type_id', { length: 22 }).notNull(),
  tenant_name: varchar('tenant_name', { length: 34 }).notNull().unique(),
  tenant_owner_name: varchar('tenant_owner_name', { length: 80 }).notNull().unique(),
  tenant_owner_email: varchar('tenant_owner_email', { length: 254 }).notNull().unique(),
  tenant_owner_phone: varchar('tenant_owner_phone', { length: 15 }).notNull().unique(),
  tenant_subscription_id: varchar('tenant_subscription_id', { length: 22 }),
  tenant_user_id: varchar('tenant_user_id', { length: 22 }).notNull(),
  status: boolean('status').notNull().default(false),
  domain: varchar('domain',{length:254}).unique(),
  welcome_email_sent: boolean('welcome_email_sent').notNull().default(false),
  account_is_suspended: boolean('account_is_suspended').notNull().default(false),
  account_is_expired: boolean('account_is_expired').notNull().default(false),
  account_subscription_paid: boolean('account_subscription_paid').default(false),
  api_id: varchar('api_id', { length: 22 }).unique(),
  management_api_key: varchar('management_api_key', { length: 34 }).unique(),
  delivery_api_key: varchar('delivery_api_key', { length: 24 }).unique(),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
}, (table) => ({
  rls: true, // Enable RLS for this table
}));

export const tenant_account_types = pgTable(`tenant_account_types`, {
  tenant_account_type_id: varchar('tenant_account_type_id', { length: 22 }).primaryKey(),
  tenant_account_type_sid: serial('tenant_account_type_sid').notNull().unique(),
  name: varchar('name', { length: 80 }).notNull(),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const tenant_data = pgTable(`tenant_data`, {
  tenant_data_id: varchar('tenant_data_id', { length: 22 }).primaryKey(),
  tenant_data_sid: serial('tenant_data_sid').notNull().unique(),
  tenant_id: varchar('tenant_id', { length: 22 }),
  long_name: varchar('long_name', { length: 256 }).notNull(),
  legal_name: varchar('legal_name', { length: 256 }).notNull(),
  government_registration_id: varchar('government_registration_id', { length: 256 }).unique(),
  government_alternate_registration_id: varchar('government_alternate_registration_id', { length: 256 }),
  education_category: varchar('education_category', { length: 80 }).notNull(),
  education_classification: varchar('education_classification', { length: 80 }),
  education_affiliation: varchar('education_affiliation', { length: 80 }),
  education_association: varchar('education_association', { length: 80 }),
  education_lowest_grade_level: varchar('education_lowest_grade_level', { length: 40 }).notNull(),
  education_highest_grade_level: varchar('education_highest_grade_level', { length: 40 }).notNull(),
  date_founded: date('date_founded'),
  description: text('description'),
  website: text('website'),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const contacts = pgTable(`contacts`, {
  contact_id: varchar('contact_id', { length: 22 }).primaryKey(),
  contact_sid: serial('contact_sid').notNull().unique(),
  tenant_id: varchar('tenant_id', { length: 22 }),
  contact_type: varchar('contact_type', { length: 22 }),
  Contact_name: varchar('Contact_name', { length: 22 }),
  first_name: varchar('first_name', { length: 22 }),
  middle_name: varchar('middle_name', { length: 22 }),
  last_name: varchar('last_name', { length: 22 }),
  designation: varchar('designation', { length: 22 }),
  gender: varchar('gender', { length: 22 }),
  company_name: varchar('company_name', { length: 22 }),
  contact_email_id: varchar('contact_email_id', { length: 22 }).notNull(),
  contact_phone_id: varchar('contact_phone_id', { length: 22 }).notNull(),
  contact_address_id: varchar('contact_address_id', { length: 22 }).notNull(),
  contact_social_id: varchar('contact_social_id', { length: 22 }).notNull(),
  is_primary_contact: boolean('is_primary_contact').notNull().default(false),
  is_billing_contact: boolean('is_billing_contact').notNull().default(false),
  is_registrar_contact: boolean('is_registrar_contact').notNull().default(false),
  is_finance_contact: boolean('is_finance_contact').notNull().default(false),
  is_vc_contact: boolean('is_vc_contact').notNull().default(false),
  is_vcp_contact: boolean('is_vcp_contact').notNull().default(false),
  is_dvcp_contact: boolean('is_dvcp_contact').notNull().default(false),
  is_ictd_contact: boolean('is_ictd_contact').notNull().default(false),
  Status: varchar('Status', { length: 15 }),
  comment: text('comment'),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
}, (table) => ({
  rls: true,
}));

export const contacts_email = pgTable(`contacts_email`, {
  contact_email_id: varchar('contact_email_id', { length: 22 }).primaryKey(),
  contact_email_sid: serial('contact_email_sid').notNull().unique(),
  tenant_id: varchar('tenant_id', { length: 22 }),
  contact_id: varchar('contact_id', { length: 22 }),
  email_type: text('email_type').notNull(),
  email_name: text('email_name').notNull(),
  tenant_main_email: text('tenant_main_email').unique(),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const contacts_phone = pgTable(`contacts_phone`, {
  contact_phone_id: varchar('contact_phone_id', { length: 22 }).primaryKey(),
  contact_phone_sid: serial('contact_phone_sid').notNull().unique(),
  tenant_id: varchar('tenant_id', { length: 22 }),
  contact_id: varchar('contact_id', { length: 22 }),
  phone_type: text('phone_type').notNull(),
  phone_name: text('phone_name').notNull(),
  tenant_main_phone: text('tenant_main_phone'),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const contacts_address = pgTable(`contacts_address`, {
  contact_address_id: varchar('contact_address_id', { length: 22 }).primaryKey(),
  contact_address_sid: serial('contact_address_sid').notNull().unique(),
  tenant_id: varchar('tenant_id', { length: 22 }),
  contact_id: varchar('contact_id', { length: 22 }),
  address_type: varchar('address_type', { length: 40 }).notNull(),
  address_name: varchar('address_name', { length: 40 }).notNull(),
  address_country: varchar('address_country', { length: 40 }).notNull(),
  address_state: varchar('address_state', { length: 40 }),
  address_region: varchar('address_region', { length: 40 }),
  address_district: varchar('address_district', { length: 40 }),
  address_address_line1: varchar('address_address_line1', { length: 80 }).notNull(),
  address_address_line2: varchar('address_address_line2', { length: 80 }),
  address_city: varchar('address_city', { length: 40 }).notNull(),
  address_postal_code: varchar('address_postal_code', { length: 10 }),
  address_latitude: doublePrecision('address_latitude'),
  address_longitude: doublePrecision('address_longitude'),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const contacts_social = pgTable(`contacts_social`, {
  contact_social_id: varchar('contact_social_id', { length: 22 }).primaryKey(),
  contact_social_sid: serial('contact_social_sid').notNull().unique(),
  tenant_id: varchar('tenant_id', { length: 22 }),
  contact_id: varchar('contact_id', { length: 22 }),
  social_type: varchar('social_type', { length: 40 }).notNull(),
  social_name: varchar('social_name', { length: 40 }).notNull(),
  social_link: varchar('social_link', { length: 254 }),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const email_settings = pgTable(`email_settings`, {
  email_setting_id: varchar('email_setting_id', { length: 22 }),
  email_setting_sid: serial('email_setting_sid'),
  tenant_id: varchar('tenant_id', { length: 22 }),
  email_smtp_server: text('email_smtp_server'),
  email_smtp_email: text('email_smtp_email'),
  email_smtp_username: text('email_smtp_username'),
  email_smtp_password: text('email_smtp_password'),
  email_smtp_ssl_port: text('email_smtp_ssl_port'),
  email_smtp_tls_port: text('email_smtp_tls_port'),
  email_smtp_is_ssl: boolean('email_smtp_is_ssl').default(true),
  email_smtp_is_tls: boolean('email_smtp_is_tls').default(true),
  email_smtp_authentication: boolean('email_smtp_authentication').default(true),
  email_smtp_full_name: text('email_smtp_full_name'),
  is_default: boolean('is_default').default(false),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const sms_settings = pgTable(`sms_settings`, {
  sms_setting_id: varchar('sms_setting_id', { length: 22 }),
  sms_setting_sid: serial('sms_setting_sid'),
  tenant_id: varchar('tenant_id', { length: 22 }),
  sms_authorization_endpoint: text('sms_authorization_endpoint'),
  sms_authorization_key: text('sms_authorization_key'),
  sms_authorization_sender: text('sms_authorization_sender'),
  sms_authorization_api_key: text('sms_authorization_api_key'),
  is_default: boolean('is_default').default(false),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});


// Subcription tables

export const tenant_subscriptions = pgTable(`tenant_subscriptions`, {
  tenant_subscription_id: varchar('tenant_subscription_id', { length: 22 }).primaryKey(),
  tenant_subscription_sid: serial('tenant_subscription_sid'),
  tenant_id: varchar('tenant_id', { length: 22 }),
  subscription_name: varchar('subscription_name', { length: 80 }),
  subscription_entitlements: jsonb('subscription_entitlements').notNull(),
  subscription_status: boolean('subscription_status').notNull(),
  is_trial_subscription: boolean('is_trial_subscription').default(false),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

// Add Academic tables
export const tenant_academic_years = pgTable(`tenant_academic_years`, {
  tenant_academic_year_id: varchar('tenant_academic_year_id', { length: 22 }).primaryKey(),
  tenant_academic_year_sid: serial('tenant_academic_year_sid').notNull().unique(),
  tenant_academic_year_name: varchar('tenant_academic_year_name', { length: 80 }).notNull(),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const tenant_academic_semesters = pgTable(`tenant_academic_semesters`, {
  tenant_academic_semester_id: varchar('tenant_academic_semester_id', { length: 22 }).primaryKey(),
  tenant_academic_semester_sid: serial('tenant_academic_semester_sid').notNull().unique(),
  tenant_academic_year_id: varchar('tenant_academic_year_id', { length: 22 }),
  tenant_academic_semester_name: varchar('tenant_academic_semester_name', { length: 80 }).notNull(),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

// Add users and authentication tables
export const users = pgTable(`users`, {
  user_id: varchar('user_id', { length: 22 }).primaryKey(),
  user_sid: serial('user_sid'),
  tenant_id: varchar('tenant_id', { length: 22 }),
  user_type_id: varchar('user_type_id', { length: 22 }),
  language_code: varchar('language_code', { length: 35 }).default('en'),
  timezone: varchar('timezone', { length: 15 }).default('UTC'),
  display_name: varchar('display_name', { length: 80 }),
  nice_name: varchar('nice_name', { length: 80 }),
  username: varchar('username', { length: 80 }).unique(),
  email: varchar('email', { length: 254 }).unique(),
  primary_phone: varchar('primary_phone', { length: 15 }).unique(),
  password: varchar('password', { length: 80 }).notNull(),
  password_status: integer('password_status').default(0),
  status: varchar('status').default("active"),
  photo: varchar('photo', { length: 22 }),
  is_verified: boolean('is_verified').default(false),
  user_payment_id: varchar('user_payment_id', { length: 22 }),
  is_using_bank_pin: boolean('is_using_bank_pin').default(false),
  is_using_bank_voucher: boolean('is_using_bank_voucher').default(false),
  is_paying_online: boolean('is_paying_online').default(false),
  paid_for_application: boolean('paid_for_application').default(false),
  paid_admission_acceptance_fees: boolean('paid_admission_acceptance_fees').default(false),
  can_access_portal: boolean('can_access_portal').default(true),
  is_deleted: boolean('is_deleted').default(false),
  is_spam: boolean('is_spam').default(false),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
}, (table) => ({
  rls: true,
}));

export const user_data = pgTable(`user_data`, {
  user_data_id: varchar('user_data_id', { length: 22 }).primaryKey(),
  user_data_sid: serial('user_data_sid'),
  user_id: varchar('user_id', { length: 22 }),
  tenant_id: varchar('tenant_id', { length: 22 }),
  name_prefix: text('name_prefix'),
  full_name: text('full_name').notNull(),
  first_name: text('first_name').notNull(),
  secondary_email: text('secondar_email'),
  secondary_phone: text('secondary_phone'),
  middle_name: text('middle_name'),
  last_name: text('last_name').notNull(),
  name_suffix: text('name_suffix'),
  national_id_number: text('national_id_number'),
  other_government_id_numer: text('other_government_id_numer'),
  uploaded_id_photo: text('uploaded_id_photo'),
  address_address_line1: text('address_address_line1'),
  address_address_line2: text('address_address_line2'),
  address_city: text('address_city'),
  address_postal_code: text('address_postal_code'),
  address_latitude: doublePrecision('address_latitude'),
  address_longitude: doublePrecision('address_longitude'),
  created_by: varchar('created_by', { length: 80 }).default('system'),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const user_auths = pgTable(`user_auths`, {
  user_auth_id: varchar('user_auth_id', { length: 22 }).primaryKey(),
  user_auth_sid: serial('user_auth_sid'),
  user_id: varchar('user_id', { length: 22 }),
  tenant_id: varchar('tenant_id', { length: 22 }),
  otp: text('otp'),
  otp_expiry: timestamp('otp_expiry'),
  last_login_at: timestamp('last_login_at'),
  last_login_ip: text('last_login_ip'),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const roles = pgTable(`roles`, {
  role_id: varchar('role_id', { length: 22 }),
  role_sid: serial('role_sid').primaryKey(),
  tenant_id: varchar('tenant_id', { length: 22 }),
  name: text('name').unique(),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
}, (table) => ({
  rls: true,
}));

export const user_roles = pgTable(`user_roles`, {
  user_role_id: varchar('user_role_id', { length: 22 }),
  user_role_sid: serial('user_role_sid').primaryKey(),
  role_id: varchar('role_id', { length: 22 }),
  tenant_id: varchar('tenant_id', { length: 22 }),
  user_id: varchar('user_id', { length: 22 }),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const user_types = pgTable(`user_types`, {
  user_type_id: varchar('user_type_id', { length: 22 }).primaryKey(),
  user_type_sid: serial('user_type_sid').notNull().unique(),
  tenant_id: varchar('tenant_id', { length: 22 }),
  user_type_name: varchar('user_type_name', { length: 80 }).notNull(),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

// Add settings tables
export const tenant_settings = pgTable(`tenant_settings`, {
  tenant_setting_id: varchar('tenant_setting_id', { length: 22 }).primaryKey(),
  tenant_setting_sid: serial('tenant_setting_sid'),
  tenant_id: varchar('tenant_id', { length: 22 }),
  tenant_academic_year_id: varchar('tenant_academic_year_id', { length: 22 }),
  tenant_academic_semester_id: varchar('tenant_academic_semester_id', { length: 22 }),
  finance_settings: varchar('finance_settings', { length: 22 }),
  finance_bank_settings: varchar('finance_bank_settings', { length: 22 }),
  finance_bank_account_settings: varchar('finance_bank_account_settings', { length: 22 }),
  finance_payment_type_settings: varchar('finance_payment_type_settings', { length: 22 }),
  finance_payment_method_settings: varchar('finance_payment_method_settings', { length: 22 }),
  tenant_college_settings: varchar('tenant_college_settings', { length: 22 }),
  college_campus_location_settings: varchar('college_campus_location_settings', { length: 22 }),
  signature_settings: varchar('signature_settings', { length: 22 }),
  faculty_settings: varchar('faculty_settings', { length: 22 }),
  department_settings: varchar('department_settings', { length: 22 }),
  branding_logo: varchar('branding_logo', { length: 254 }),
  branding_neutal_color_background: varchar('branding_neutal_color_background', { length: 10 }).default('#EFF4FB'),
  branding_neutal_color_sections: varchar('branding_neutal_color_sections', { length: 10 }).default('#E2E8F0'),
  branding_neutal_color_text: varchar('branding_neutal_color_text', { length: 10 }).default('#212B36'),
  branding_primary_color: varchar('branding_primary_color', { length: 10 }).default('#3C50E0'),
  branding_secondary_color: varchar('branding_secondary_color', { length: 10 }).default('#DC3545'),
  branding_accent_color: varchar('branding_accent_color', { length: 10 }).default('#10B981'),
  branding_semantic_color_success: varchar('branding_semantic_color_success', { length: 10 }).default('#E1F9F0'),
  branding_semantic_color_warning: varchar('branding_semantic_color_warning', { length: 10 }).default('#FEF5DE'),
  branding_semantic_color_error: varchar('branding_semantic_color_error', { length: 10 }).default('#FEEAEA'),
  branding_semantic_color_info: varchar('branding_semantic_color_info', { length: 10 }).default('#3C50E0'),
  custom_staff_domain_name: varchar('custom_staff_domain_name', { length: 254 }),
  custom_lecturer_domain_name: varchar('custom_lecturer_domain_name', { length: 254 }),
  custom_prospective_student_domain_name: varchar('custom_prospective_student_domain_name', { length: 254 }),
  custom_current_student_domain_name: varchar('custom_current_student_domain_name', { length: 254 }),
  custom_crm_domain_name: varchar('custom_crm_domain_name', { length: 254 }),
  custom_lms_domain_name: varchar('custom_lms_domain_name', { length: 254 }),
  custom_hrmo_domain_name: varchar('custom_hrmo_domain_name', { length: 254 }),
  custom_reports_domain_name: varchar('custom_reports_domain_name', { length: 254 }),
  custom_support_center_domain_name: varchar('custom_support_center_domain_name', { length: 254 }),
  custom_asset_mgmt_domain_name: varchar('custom_asset_mgmt_domain_name', { length: 254 }),
  custom_library_domain_name: varchar('custom_library_domain_name', { length: 254 }),
  custom_finance_domain_name: varchar('custom_finance_domain_name', { length: 254 }),
  custom_website_domain_name: varchar('custom_website_domain_name', { length: 254 }),
  email_setting_id: varchar('email_setting_id', { length: 22 }),
  sms_setting_id: varchar('sms_setting_id', { length: 22 }),
  whatsapp_setting_id: varchar('whatsapp_setting_id', { length: 22 }),
  social_setting_id: varchar('social_setting_id', { length: 22 }),
  api_access_setting_id: varchar('api_access_setting_id', { length: 22 }),
  country_id: varchar('country_id', { length: 22 }),
  timezone: text('timezone').default('UTC'),
  language_code: varchar('language_code', { length: 12 }).default('en-sl'),
  currency: text('currency').default('SLE'),
});

export const settings = pgTable(`settings`, {
  setting_id: varchar('setting_id', { length: 22 }),
  setting_sid: serial('setting_sid'),
  tenant_id: varchar('tenant_id', { length: 22 }),
  tenant_setting_id: varchar('tenant_setting_id', { length: 22 }),
  use_custom_domain_name: boolean('use_custom_domain_name'),
  custom_primary_domain_name: varchar('custom_primary_domain_name', { length: 254 }),
  vat_rate: decimal('vat_rate', { precision: 18 }),
  vat_registration: varchar('vat_registration', { length: 450 }),
  footer_msg: varchar('footer_msg', { length: 250 }),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

// Add finance related tables
export const finance_settings = pgTable(`finance_settings`, {
  finance_setting_id: varchar('finance_setting_id', { length: 22 }),
  finance_setting_sid: serial('finance_setting_sid'),
  tenant_id: varchar('tenant_id', { length: 22 }),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const user_settings = pgTable(`user_settings`, {
  user_setting_id: varchar('user_setting_id', { length: 22 }).primaryKey(),
  user_setting_sid: serial('user_setting_sid'),
  user_id: varchar('user_id', { length: 22 }),
  tenant_id: varchar('tenant_id', { length: 22 }),
  module: text('module'),
  permission_name: text('permission_name'),
  permission_value: text('permission_value'),
  serialized: boolean('serialized'),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const user_payments = pgTable(`user_payments`, {
  user_payment_id: varchar('user_payment_id', { length: 22 }).primaryKey(),
  user_payment_sid: serial('user_payment_sid'),
  user_id: varchar('user_id', { length: 22 }),
  tenant_id: varchar('tenant_id', { length: 22 }),
  payment_type: text('payment_type'),
  payment_method: text('payment_method'),
  payment_details: text('payment_details'),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const tenant_colleges = pgTable(`tenant_colleges`, {
  college_id: varchar('college_id', { length: 22 }),
  college_sid: serial('college_sid'),
  tenant_id: varchar('tenant_id', { length: 22 }),
  college_name: varchar('college_name', { length: 254 }),
  short_name: varchar('short_name', { length: 80 }),
  contact_email_id: varchar('contact_email_id', { length: 22 }).notNull(),
  contact_phone_id: varchar('contact_phone_id', { length: 22 }).notNull(),
  contact_address_id: varchar('contact_address_id', { length: 22 }).notNull(),
  contact_social_id: varchar('contact_social_id', { length: 22 }).notNull(),
  website: varchar('website', { length: 200 }),
  college_logo: varchar('college_logo', { length: 254 }),
  qr_code: varchar('qr_code', { length: 254 }),
  chancellor_signature: varchar('chancellor_signature', { length: 254 }),
  registrar_signature: varchar('registrar_signature', { length: 254 }),
  college_seal: varchar('college_seal', { length: 254 }),
  card_bg: varchar('card_bg', { length: 254 }),
  student_id_format: varchar('student_id_format', { length: 50 }),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

// Add missing countries and admin regions tables
export const countries = pgTable(`countries`, {
  country_id: varchar('country_id', { length: 22 }).primaryKey(),
  country_sid: serial('country_sid').notNull().unique(),
  country_name: varchar('country_name', { length: 22 }),
  iso_alpha_2: varchar('iso_alpha_2', { length: 5 }).notNull(),
  iso_alpha_3: varchar('iso_alpha_3', { length: 5 }).notNull(),
  iso_3166_2: varchar('iso_3166_2', { length: 10 }).notNull(),
  calling_code: varchar('calling_code', { length: 10 }).notNull(),
  capital_city: varchar('capital_city', { length: 80 }).notNull(),
  language_code: varchar('language_code', { length: 12 }).notNull(),
  timezone: varchar('timezone', { length: 40 }).notNull(),
  currency_code: varchar('currency_code', { length: 5 }).notNull(),
  region: varchar('region', { length: 10 }).notNull(),
  sub_region: varchar('sub_region', { length: 40 }).notNull(),
  intermediate_region: varchar('intermediate_region', { length: 20 }).notNull(),
  region_code: varchar('region_code', { length: 5 }).notNull(),
  sub_region_code: varchar('sub_region_code', { length: 5 }).notNull(),
  intermediate_region_code: varchar('intermediate_region_code', { length: 5 }).notNull(),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const admin_regions = pgTable(`admin_regions`, {
  african_admin_region_id: varchar('african_admin_region_id', { length: 22 }).primaryKey(),
  african_admin_region_sid: serial('african_admin_region_sid').notNull().unique(),
  country_id: varchar('country_id', { length: 22 }),
  state_id: varchar('state_id', { length: 80 }).notNull(),
  region_id: varchar('region_id', { length: 80 }).notNull(),
  district_id: varchar('district_id', { length: 80 }).notNull(),
  state_name: varchar('state_name', { length: 80 }).notNull(),
  region_name: varchar('region_name', { length: 80 }).notNull(),
  district_name: varchar('district_name', { length: 80 }).notNull(),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

// Add log tables
export const audit_logs = pgTable(`audit_logs`, {
  audit_log_id: varchar('audit_log_id', { length: 22 }).primaryKey(),
  audit_log_sid: serial('audit_log_sid'),
  tenant_id: varchar('tenant_id', { length: 22 }),
  table_name: text('table_name').notNull(),
  record_id: text('record_id').notNull(),
  action: text('action').notNull(),
  old_data: jsonb('old_data'),
  new_data: jsonb('new_data'),
  change_by_login_ip: text('change_by_login_ip'),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const sms_logs = pgTable(`sms_logs`, {
  sms_log_id: varchar('sms_log_id', { length: 22 }).primaryKey(),
  sms_log_sid: serial('sms_log_sid'),
  tenant_id: varchar('tenant_id', { length: 22 }),
  sender_number: varchar('sender_number', { length: 20 }).notNull(),
  recipient_number: varchar('recipient_number', { length: 20 }).notNull(),
  send_user_id: varchar('send_user_id', { length: 22 }),
  recipent_user_id: varchar('recipent_user_id', { length: 22 }),
  sms_message_sent: jsonb('sms_message_sent'),
  change_by_login_ip: text('change_by_login_ip'),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const email_logs = pgTable(`email_logs`, {
  email_log_id: varchar('email_log_id', { length: 22 }).primaryKey(),
  email_log_sid: serial('email_log_sid'),
  tenant_id: varchar('tenant_id', { length: 22 }),
  sender_email: varchar('sender_email', { length: 254 }).notNull(),
  recipient_email: varchar('recipient_email', { length: 254 }).notNull(),
  send_user_id: varchar('send_user_id', { length: 22 }),
  recipent_user_id: varchar('recipent_user_id', { length: 22 }),
  email_message_sent: jsonb('email_message_sent'),
  change_by_login_ip: text('change_by_login_ip'),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const whatsapp_logs = pgTable(`whatsapp_logs`, {
  whatsapp_log_id: varchar('whatsapp_log_id', { length: 22 }).primaryKey(),
  whatsapp_log_sid: serial('whatsapp_log_sid'),
  tenant_id: varchar('tenant_id', { length: 22 }),
  sender_whatsapp: varchar('sender_whatsapp', { length: 254 }).notNull(),
  recipient_whatsapp: varchar('recipient_whatsapp', { length: 254 }).notNull(),
  send_user_id: varchar('send_user_id', { length: 22 }),
  recipent_user_id: varchar('recipent_user_id', { length: 22 }),
  whatsapp_message_sent: jsonb('whatsapp_message_sent'),
  change_by_login_ip: text('change_by_login_ip'),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

// Add missing reference tables
export const address_types = pgTable(`address_types`, {
  address_type_id: varchar('address_type_id', { length: 22 }).primaryKey(),
  address_type_sid: serial('address_type_sid').notNull().unique(),
  address_type_name: varchar('address_type_name', { length: 80 }).notNull(),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const phone_types = pgTable(`phone_types`, {
  phone_type_id: varchar('phone_type_id', { length: 22 }).primaryKey(),
  phone_type_sid: serial('phone_type_sid').notNull().unique(),
  phone_type_name: varchar('phone_type_name', { length: 80 }).notNull(),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const email_types = pgTable(`email_types`, {
  email_type_id: varchar('email_type_id', { length: 22 }).primaryKey(),
  email_type_sid: serial('email_type_sid').notNull().unique(),
  email_type_name: varchar('email_type_name', { length: 80 }).notNull(),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const social_types = pgTable(`social_types`, {
  social_type_id: varchar('social_type_id', { length: 22 }).primaryKey(),
  social_type_sid: serial('social_type_sid').notNull().unique(),
  social_type_name: varchar('social_type_name', { length: 80 }).notNull(),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

// Add missing educational reference tables
export const education_categories = pgTable(`education_categories`, {
  education_category_id: varchar('education_category_id', { length: 22 }).primaryKey(),
  education_category_type_sid: serial('education_category_type_sid').notNull().unique(),
  category_name: varchar('category_name', { length: 80 }).notNull(),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const classifications = pgTable(`classifications`, {
  education_classification_id: varchar('education_classification_id', { length: 22 }).primaryKey(),
  education_classification_type_sid: serial('education_classification_type_sid').notNull().unique(),
  classification_name: varchar('classification_name', { length: 80 }).notNull(),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const education_affiliations = pgTable(`education_affiliations`, {
  education_affiliation_id: varchar('education_affiliation_id', { length: 22 }).primaryKey(),
  education_affiliation_type_sid: serial('education_affiliation_type_sid').notNull().unique(),
  affiliation_name: varchar('affiliation_name', { length: 80 }).notNull(),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const education_associations = pgTable(`education_associations`, {
  education_association_id: varchar('education_association_id', { length: 22 }).primaryKey(),
  education_association_type_sid: serial('education_association_type_sid').notNull().unique(),
  association_name: varchar('association_name', { length: 80 }).notNull(),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const education_grade_levels = pgTable(`education_grade_levels`, {
  education_grade_level_id: varchar('education_grade_level_id', { length: 22 }).primaryKey(),
  education_grade_level_type_sid: serial('education_grade_level_type_sid').notNull().unique(),
  grade_level_name: varchar('grade_level_name', { length: 80 }).notNull(),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

// Add missing academic structure tables
export const college_campus_locations = pgTable(`college_campus_locations`, {
  college_campus_id: varchar('college_campus_id', { length: 22 }),
  college_campus_sid: serial('college_campus_sid'),
  college_id: varchar('college_id', { length: 22 }),
  tenant_id: varchar('tenant_id', { length: 22 }),
  campus_name: varchar('campus_name', { length: 254 }),
  program_type: varchar('program_type', { length: 80 }),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const signatures = pgTable(`signatures`, {
  signature_id: varchar('signature_id', { length: 22 }).primaryKey(),
  signature_sid: serial('signature_sid'),
  college_id: varchar('college_id', { length: 22 }),
  faculty_id: varchar('faculty_id', { length: 22 }),
  college_campus_id: varchar('college_campus_id', { length: 22 }),
  tenant_id: varchar('tenant_id', { length: 22 }),
  program_type: varchar('program_type', { length: 22 }),
  academic_year: varchar('academic_year', { length: 22 }),
  signature_type: varchar('signature_type', { length: 50 }),
  signature_file: varchar('signature_file', { length: 254 }),
  signatory_name: varchar('signatory_name', { length: 254 }),
  signatory_position: varchar('signatory_position', { length: 250 }),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

// Add missing finance tables
export const finance_banks = pgTable(`finance_banks`, {
  bank_id: varchar('bank_id', { length: 22 }).primaryKey(),
  bank_sid: serial('bank_sid'),
  tenant_id: varchar('tenant_id', { length: 22 }),
  bank_name: varchar('bank_name', { length: 22 }),
  bank_secret_code: varchar('bank_secret_code', { length: 22 }),
  status: boolean('status'),
  bank_token: varchar('bank_token', { length: 22 }),
  bank_ip_address: varchar('bank_ip_address', { length: 254 }),
  bank_email: varchar('bank_email', { length: 254 }),
  allow_extramural: boolean('allow_extramural'),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const finance_bank_accounts = pgTable(`finance_bank_accounts`, {
  bank_account_id: varchar('bank_account_id', { length: 22 }).primaryKey(),
  bank_account_sid: serial('bank_account_sid'),
  tenant_id: varchar('tenant_id', { length: 22 }),
  bank_name_id: varchar('bank_name_id', { length: 22 }),
  full_address: varchar('full_address'),
  contact_person: varchar('contact_person'),
  phone_number: varchar('phone_number'),
  email_address: varchar('email_address'),
  account_name: varchar('account_name'),
  account_number: varchar('account_number'),
  status: boolean('status'),
  college_id: varchar('college_id', { length: 22 }),
  bank_api_key: varchar('bank_api_key', { length: 22 }),
  bank_secret_code: varchar('bank_secret_code', { length: 22 }),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const finance_payments = pgTable(`finance_payments`, {
  payment_id: varchar('payment_id', { length: 22 }).primaryKey(),
  payment_sid: serial('payment_sid'),
  tenant_id: varchar('tenant_id', { length: 22 }),
  user_id: varchar('user_id', { length: 22 }),
  payment_type: varchar('payment_type', { length: 22 }),
  payment_academic_year: varchar('payment_academic_year', { length: 22 }),
  payment_method: varchar('payment_method', { length: 22 }),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const finance_payment_types = pgTable(`finance_payment_types`, {
  payment_type_id: varchar('payment_type_id', { length: 22 }).primaryKey(),
  payment_type_sid: serial('payment_type_sid'),
  tenant_id: varchar('tenant_id', { length: 22 }),
  user_id: varchar('user_id', { length: 22 }),
  payment_type_name: varchar('payment_type_name', { length: 22 }),
  payment_id: varchar('payment_id', { length: 22 }),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const finance_payment_methods = pgTable(`finance_payment_methods`, {
  payment_method_id: varchar('payment_method_id', { length: 22 }).primaryKey(),
  payment_method_sid: serial('payment_method_sid'),
  tenant_id: varchar('tenant_id', { length: 22 }),
  user_id: varchar('user_id', { length: 22 }),
  payment_method_name: varchar('payment_method_name', { length: 22 }),
  payment_id: varchar('payment_id', { length: 22 }),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const finance_bank_pins = pgTable(`finance_bank_pins`, {
  payment_bank_ping_id: varchar('payment_bank_ping_id', { length: 22 }).primaryKey(),
  payment_bank_pin_sid: serial('payment_bank_pin_sid'),
  tenant_id: varchar('tenant_id', { length: 22 }),
  payment_id: varchar('payment_id', { length: 22 }),
  payment_method_id: varchar('payment_method_id', { length: 22 }),
  user_id: varchar('user_id', { length: 22 }),
  finance_username: varchar('finance_username', { length: 80 }),
  finance_password: varchar('finance_password', { length: 80 }),
  finance_password_status: boolean('finance_password_status').default(true),
  finance_role: varchar('finance_role', { length: 80 }),
  finance_full_name: varchar('finance_full_name', { length: 80 }),
  phone_number: varchar('phone_number', { length: 50 }),
  email_address: varchar('email_address', { length: 150 }),
  pin: varchar('pin', { length: 22 }),
  receipt_number: varchar('receipt_number', { length: 80 }),
  is_blocked: boolean('is_blocked').default(false),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const finance_bank_vouchers = pgTable(`finance_bank_vouchers`, {
  payment_bank_voucher_id: varchar('payment_bank_voucher_id', { length: 22 }).primaryKey(),
  payment_bank_voucher_sid: serial('payment_bank_voucher_sid'),
  tenant_id: varchar('tenant_id', { length: 22 }),
  payment_id: varchar('payment_id', { length: 22 }),
  payment_method_id: varchar('payment_method_id', { length: 22 }),
  user_id: varchar('user_id', { length: 22 }),
  applicant_full_name: varchar('applicant_full_name', { length: 80 }),
  phone_number: varchar('phone_number', { length: 50 }),
  email_address: varchar('email_address', { length: 150 }),
  voucher_number: varchar('voucher_number', { length: 22 }),
  receipt_number: varchar('receipt_number', { length: 80 }),
  finance_role: varchar('finance_role', { length: 80 }),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const finance_bank_pin_sales = pgTable(`finance_bank_pin_sales`, {
  bank_pin_sale_id: varchar('bank_pin_sale_id', { length: 22 }).primaryKey(),
  bank_pin_sale_sid: serial('bank_pin_sale_sid'),
  pin: varchar('pin', { length: 20 }).notNull(),
  bank_id: varchar('bank_id', { length: 22 }),
  bank_account_id: varchar('bank_account_id', { length: 22 }),
  receipt_number: varchar('receipt_number', { length: 100 }),
  college_id: varchar('college_id', { length: 50 }),
  pin_cost: integer('pin_cost'),
  appliant_full_name: varchar('appliant_full_name', { length: 250 }),
  phone_number: varchar('phone_number', { length: 50 }),
  email_address: varchar('email_address', { length: 150 }),
  transaction_date: timestamp('transaction_date'),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const whatsapp_settings = pgTable(`whatsapp_settings`, {
  whatsapp_setting_id: varchar('whatsapp_setting_id', { length: 22 }),
  whatsapp_setting_sid: serial('whatsapp_setting_sid'),
  tenant_id: varchar('tenant_id', { length: 22 }),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const social_settings = pgTable(`social_settings`, {
  social_setting_id: varchar('social_setting_id', { length: 22 }),
  social_setting_sid: serial('social_setting_sid'),
  tenant_id: varchar('tenant_id', { length: 22 }),
  social_login_google: text('social_login_google'),
  social_login_facebook: text('social_login_facebook'),
  social_login_linkedin: text('social_login_linkedin'),
  social_login_microsoft: text('social_login_microsoft'),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const api_access_settings = pgTable(`api_access_settings`, {
  api_access_setting_id: varchar('api_access_setting_id', { length: 22 }),
  api_access_setting_sid: serial('api_access_setting_sid'),
  tenant_id: varchar('tenant_id', { length: 22 }),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const analytic_settings = pgTable(`analytic_settings`, {
  analytic_setting_id: varchar('analytic_setting_id', { length: 22 }),
  analytic_setting_sid: serial('analytic_setting_sid'),
  tenant_id: varchar('tenant_id', { length: 22 }),
  analytic_code: text('analytic_code'),
  analytic_other: jsonb('analytic_other'),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

// Add missing faculty and department tables
export const faculties = pgTable(`faculties`, {
  faculty_id: varchar('faculty_id', { length: 22 }).primaryKey(),
  faculty_sid: serial('faculty_sid'),
  college_id: varchar('college_id', { length: 22 }),
  tenant_id: varchar('tenant_id', { length: 22 }),
  internal_faculty_ref_id: varchar('internal_faculty_ref_id', { length: 22 }),
  faculty_name: varchar('faculty_name', { length: 254 }),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

export const departments = pgTable(`departments`, {
  department_id: varchar('department_id', { length: 22 }).primaryKey(),
  department_sid: serial('department_sid'),
  college_id: varchar('college_id', { length: 22 }),
  faculty_id: varchar('faculty_id', { length: 22 }),
  tenant_id: varchar('tenant_id', { length: 22 }),
  internal_department_ref_id: varchar('internal_department_ref_id', { length: 22 }),
  department_name: varchar('department_name', { length: 254 }),
  created_by: varchar('created_by', { length: 80 }).notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
  modified_on: timestamp('modified_on').notNull().defaultNow(),
  modified_by: varchar('modified_by', { length: 80 }).notNull(),
});

// Relations
export const tenants_relations = relations(tenants, ({ one }) => ({
  tenant_subscription: one(tenant_subscriptions, {
    fields: [tenants.tenant_subscription_id],
    references: [tenant_subscriptions.tenant_subscription_id],
  }),
  tenant_account_type: one(tenant_account_types, {
    fields: [tenants.tenant_account_type_id],
    references: [tenant_account_types.tenant_account_type_id],
  }),
  tenant_data: one(tenant_data),
  tenant_settings: one(tenant_settings),
  tenant_contacts: one(contacts),
}));

export const tenant_subscriptions_relations = relations(tenant_subscriptions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenant_subscriptions.tenant_id],
    references: [tenants.tenant_id],
  }),
}));

export const tenant_account_types_relations = relations(tenant_account_types, ({ one }) => ({
  tenant: one(tenants),
}));

export const tenant_data_relations = relations(tenant_data, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenant_data.tenant_id],
    references: [tenants.tenant_id],
  }),
}));

export const user_settings_relations = relations(user_settings, ({ one }) => ({
  user: one(users, {
    fields: [user_settings.user_id],
    references: [users.user_id],
  }),
  tenant: one(tenants, {
    fields: [user_settings.tenant_id],
    references: [tenants.tenant_id],
  }),
}));

export const user_payments_relations = relations(user_payments, ({ one }) => ({
  user: one(users, {
    fields: [user_payments.user_id],
    references: [users.user_id],
  }),
  tenant: one(tenants, {
    fields: [user_payments.tenant_id],
    references: [tenants.tenant_id],
  }),
}));

export const tenant_colleges_relations = relations(tenant_colleges, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenant_colleges.tenant_id],
    references: [tenants.tenant_id],
  }),
  contact_email: one(contacts_email, {
    fields: [tenant_colleges.contact_email_id],
    references: [contacts_email.contact_email_id],
  }),
  contact_phone: one(contacts_phone, {
    fields: [tenant_colleges.contact_phone_id],
    references: [contacts_phone.contact_phone_id],
  }),
  contact_address: one(contacts_address, {
    fields: [tenant_colleges.contact_address_id],
    references: [contacts_address.contact_address_id],
  }),
  contact_social: one(contacts_social, {
    fields: [tenant_colleges.contact_social_id],
    references: [contacts_social.contact_social_id],
  }),
}));

export const countries_relations = relations(countries, ({ many }) => ({
  admin_regions: many(admin_regions),
}));

export const admin_regions_relations = relations(admin_regions, ({ one }) => ({
  country: one(countries, {
    fields: [admin_regions.country_id],
    references: [countries.country_id],
  }),
}));

export const sms_logs_relations = relations(sms_logs, ({ one }) => ({
  sender: one(users, {
    fields: [sms_logs.send_user_id],
    references: [users.user_id],
  }),
  recipient: one(users, {
    fields: [sms_logs.recipent_user_id],
    references: [users.user_id],
  }),
  tenant: one(tenants, {
    fields: [sms_logs.tenant_id],
    references: [tenants.tenant_id],
  }),
}));

export const email_logs_relations = relations(email_logs, ({ one }) => ({
  sender: one(users, {
    fields: [email_logs.send_user_id],
    references: [users.user_id],
  }),
  recipient: one(users, {
    fields: [email_logs.recipent_user_id],
    references: [users.user_id],
  }),
}));

export const whatsapp_logs_relations = relations(whatsapp_logs, ({ one }) => ({
  sender: one(users, {
    fields: [whatsapp_logs.send_user_id],
    references: [users.user_id],
  }),
  recipient: one(users, {
    fields: [whatsapp_logs.recipent_user_id],
    references: [users.user_id],
  }),
}));

export const finance_banks_relations = relations(finance_banks, ({ one }) => ({
  tenant: one(tenants, {
    fields: [finance_banks.tenant_id],
    references: [tenants.tenant_id],
  }),
}));

export const finance_payments_relations = relations(finance_payments, ({ one }) => ({
  tenant: one(tenants, {
    fields: [finance_payments.tenant_id],
    references: [tenants.tenant_id],
  }),
  user: one(users, {
    fields: [finance_payments.user_id],
    references: [users.user_id],
  }),
}));

export const signatures_relations = relations(signatures, ({ one }) => ({
  tenant: one(tenants, {
    fields: [signatures.tenant_id],
    references: [tenants.tenant_id],
  }),
  college: one(tenant_colleges, {
    fields: [signatures.college_id],
    references: [tenant_colleges.college_id],
  }),
}));

export const faculties_relations = relations(faculties, ({ one }) => ({
  college: one(tenant_colleges, {
    fields: [faculties.college_id],
    references: [tenant_colleges.college_id],
  }),
  tenant: one(tenants, {
    fields: [faculties.tenant_id],
    references: [tenants.tenant_id],
  }),
}));

export const departments_relations = relations(departments, ({ one }) => ({
  college: one(tenant_colleges, {
    fields: [departments.college_id],
    references: [tenant_colleges.college_id],
  }),
  faculty: one(faculties, {
    fields: [departments.faculty_id],
    references: [faculties.faculty_id],
  }),
}));

export const finance_bank_pin_sales_relations = relations(finance_bank_pin_sales, ({ one }) => ({
  bank: one(finance_banks, {
    fields: [finance_bank_pin_sales.bank_id],
    references: [finance_banks.bank_id],
  }),
  bank_account: one(finance_bank_accounts, {
    fields: [finance_bank_pin_sales.bank_account_id],
    references: [finance_bank_accounts.bank_account_id],
  }),
  college: one(tenant_colleges, {
    fields: [finance_bank_pin_sales.college_id], 
    references: [tenant_colleges.college_id],
  })
}));

export const tenant_academic_semesters_relations = relations(tenant_academic_semesters, ({ one }) => ({
  academic_year: one(tenant_academic_years, {
    fields: [tenant_academic_semesters.tenant_academic_year_id],
    references: [tenant_academic_years.tenant_academic_year_id],
  }),
}));

export const user_data_relations = relations(user_data, ({ one }) => ({
  user: one(users, {
    fields: [user_data.user_id],
    references: [users.user_id],
  }),
}));

export const user_auths_relations = relations(user_auths, ({ one }) => ({
  user: one(users, {
    fields: [user_auths.user_id],
    references: [users.user_id],
  }),
  tenant: one(tenants, {
    fields: [user_auths.tenant_id], 
    references: [tenants.tenant_id],
  }),
}));

export const contacts_relations = relations(contacts, ({ one }) => ({
  tenant: one(tenants, {
    fields: [contacts.tenant_id],
    references: [tenants.tenant_id],
  }),
  email: one(contacts_email, {
    fields: [contacts.contact_email_id],
    references: [contacts_email.contact_email_id], 
  }),
  phone: one(contacts_phone, {
    fields: [contacts.contact_phone_id],
    references: [contacts_phone.contact_phone_id],
  }),
  address: one(contacts_address, {
    fields: [contacts.contact_address_id], 
    references: [contacts_address.contact_address_id],
  }),
  social: one(contacts_social, {
    fields: [contacts.contact_social_id],
    references: [contacts_social.contact_social_id],
  }),
}));

export const contacts_email_relations = relations(contacts_email, ({ one }) => ({
  contact: one(contacts, {
    fields: [contacts_email.contact_id],
    references: [contacts.contact_id],
  }),
  tenant: one(tenants, {
    fields: [contacts_email.tenant_id],
    references: [tenants.tenant_id], 
  }),
}));

export const contacts_phone_relations = relations(contacts_phone, ({ one }) => ({
  contact: one(contacts, {
    fields: [contacts_phone.contact_id],
    references: [contacts.contact_id],
  }),
  tenant: one(tenants, {
    fields: [contacts_phone.tenant_id],
    references: [tenants.tenant_id],
  }),
}));

export const contacts_address_relations = relations(contacts_address, ({ one }) => ({
  contact: one(contacts, {
    fields: [contacts_address.contact_id],
    references: [contacts.contact_id],
  }),
  tenant: one(tenants, {
    fields: [contacts_address.tenant_id],
    references: [tenants.tenant_id],
  }),
}));

export const contacts_social_relations = relations(contacts_social, ({ one }) => ({
  contact: one(contacts, {
    fields: [contacts_social.contact_id],
    references: [contacts.contact_id],
  }),
  tenant: one(tenants, {
    fields: [contacts_social.tenant_id],
    references: [tenants.tenant_id],
  }),
}));

export const settings_relations = relations(settings, ({ one }) => ({
  tenant: one(tenants, {
    fields: [settings.tenant_id],
    references: [tenants.tenant_id],
  }),
  tenant_setting: one(tenant_settings, {
    fields: [settings.tenant_setting_id],
    references: [tenant_settings.tenant_setting_id],
  }),
}));

export const tenant_settings_relations = relations(tenant_settings, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenant_settings.tenant_id],
    references: [tenants.tenant_id],
  }),
  academic_year: one(tenant_academic_years, {
    fields: [tenant_settings.tenant_academic_year_id],
    references: [tenant_academic_years.tenant_academic_year_id],
  }),
  academic_semester: one(tenant_academic_semesters, {
    fields: [tenant_settings.tenant_academic_semester_id],
    references: [tenant_academic_semesters.tenant_academic_semester_id],
  }),
  finance_settings: one(finance_settings, {
    fields: [tenant_settings.finance_settings],
    references: [finance_settings.finance_setting_id],
  }),
  bank_settings: one(finance_banks, {
    fields: [tenant_settings.finance_bank_settings],
    references: [finance_banks.bank_id],
  }),
  bank_account_settings: one(finance_bank_accounts, {
    fields: [tenant_settings.finance_bank_account_settings],
    references: [finance_bank_accounts.bank_account_id],
  }),
  payment_type_settings: one(finance_payment_types, {
    fields: [tenant_settings.finance_payment_type_settings],
    references: [finance_payment_types.payment_type_id],
  }),
  payment_method_settings: one(finance_payment_methods, {
    fields: [tenant_settings.finance_payment_method_settings],
    references: [finance_payment_methods.payment_method_id],
  }),
  college_settings: one(tenant_colleges, {
    fields: [tenant_settings.tenant_college_settings],
    references: [tenant_colleges.college_id],
  }),
  campus_location_settings: one(college_campus_locations, {
    fields: [tenant_settings.college_campus_location_settings],
    references: [college_campus_locations.college_campus_id],
  }),
  signature_settings: one(signatures, {
    fields: [tenant_settings.signature_settings],
    references: [signatures.signature_id],
  }),
  faculty_settings: one(faculties, {
    fields: [tenant_settings.faculty_settings],
    references: [faculties.faculty_id],
  }),
  department_settings: one(departments, {
    fields: [tenant_settings.department_settings],
    references: [departments.department_id],
  }),
  email_settings: one(email_settings, {
    fields: [tenant_settings.email_setting_id],
    references: [email_settings.email_setting_id],
  }),
  sms_settings: one(sms_settings, {
    fields: [tenant_settings.sms_setting_id],
    references: [sms_settings.sms_setting_id],
  }),
  whatsapp_settings: one(whatsapp_settings, {
    fields: [tenant_settings.whatsapp_setting_id],
    references: [whatsapp_settings.whatsapp_setting_id],
  }),
  social_settings: one(social_settings, {
    fields: [tenant_settings.social_setting_id],
    references: [social_settings.social_setting_id],
  }),
  api_access_settings: one(api_access_settings, {
    fields: [tenant_settings.api_access_setting_id],
    references: [api_access_settings.api_access_setting_id],
  }),
  country: one(countries, {
    fields: [tenant_settings.country_id],
    references: [countries.country_id],
  }),
}));

export const audit_logs_relations = relations(audit_logs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [audit_logs.tenant_id],
    references: [tenants.tenant_id],
  }),
}));

export const finance_bank_vouchers_relations = relations(finance_bank_vouchers, ({ one }) => ({
  tenant: one(tenants, {
    fields: [finance_bank_vouchers.tenant_id],
    references: [tenants.tenant_id],
  }),
  payment: one(finance_payments, {
    fields: [finance_bank_vouchers.payment_id],
    references: [finance_payments.payment_id],
  }),
  payment_method: one(finance_payment_methods, {
    fields: [finance_bank_vouchers.payment_method_id],
    references: [finance_payment_methods.payment_method_id],
  }),
  user: one(users, {
    fields: [finance_bank_vouchers.user_id],
    references: [users.user_id],
  }),
}));

export const finance_payment_methods_relations = relations(finance_payment_methods, ({ one }) => ({
  tenant: one(tenants, {
    fields: [finance_payment_methods.tenant_id],
    references: [tenants.tenant_id],
  }),
  payment: one(finance_payments, {
    fields: [finance_payment_methods.payment_id],
    references: [finance_payments.payment_id],
  }),
}));

export const finance_payment_types_relations = relations(finance_payment_types, ({ one }) => ({
  tenant: one(tenants, {
    fields: [finance_payment_types.tenant_id],
    references: [tenants.tenant_id],
  }),
  payment: one(finance_payments, {
    fields: [finance_payment_types.payment_id],
    references: [finance_payments.payment_id],
  }),
}));

export const email_settings_relations = relations(email_settings, ({ one }) => ({
  tenant: one(tenants, {
    fields: [email_settings.tenant_id],
    references: [tenants.tenant_id],
  }),
}));

export const sms_settings_relations = relations(sms_settings, ({ one }) => ({
  tenant: one(tenants, {
    fields: [sms_settings.tenant_id],
    references: [tenants.tenant_id],
  }),
}));

export const whatsapp_settings_relations = relations(whatsapp_settings, ({ one }) => ({
  tenant: one(tenants, {
    fields: [whatsapp_settings.tenant_id],
    references: [tenants.tenant_id],
  }),
}));

export const social_settings_relations = relations(social_settings, ({ one }) => ({
  tenant: one(tenants, {
    fields: [social_settings.tenant_id],
    references: [tenants.tenant_id],
  }),
}));

export const api_access_settings_relations = relations(api_access_settings, ({ one }) => ({
  tenant: one(tenants, {
    fields: [api_access_settings.tenant_id],
    references: [tenants.tenant_id],
  }),
}));

export const analytic_settings_relations = relations(analytic_settings, ({ one }) => ({
  tenant: one(tenants, {
    fields: [analytic_settings.tenant_id],
    references: [tenants.tenant_id],
  }),
}));

// User Relations Group
export const users_relations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenant_id],
    references: [tenants.tenant_id],
  }),
  user_type: one(user_types, {
    fields: [users.user_type_id], 
    references: [user_types.user_type_id],
  }),
  user_payment: one(user_payments, {
    fields: [users.user_payment_id],
    references: [user_payments.user_payment_id], 
  }),
  user_data: one(user_data),
  user_auth: one(user_auths),
  user_roles: many(user_roles),
  user_settings: many(user_settings),
}));

export const user_roles_relations = relations(user_roles, ({ one }) => ({
  user: one(users, {
    fields: [user_roles.user_id],
    references: [users.user_id],
  }),
  role: one(roles, {
    fields: [user_roles.role_id],
    references: [roles.role_id], 
  }),
  tenant: one(tenants, {
    fields: [user_roles.tenant_id],
    references: [tenants.tenant_id],
  }),
}));

export const roles_relations = relations(roles, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [roles.tenant_id],
    references: [tenants.tenant_id],
  }),
  user_roles: many(user_roles),
}));
