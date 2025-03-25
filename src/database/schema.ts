import {
  pgTable,
  text,
  serial,
  timestamp,
  boolean,
  date,
  doublePrecision,
  jsonb,
  primaryKey,
  varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ────────────── TENANTS ──────────────
// Note: tenant_nano_id is the primary key (varchar(22)) and tenant_id is an integer identity.
export const tenants = pgTable('tenants', {
  tenant_nano_id: text('tenant_nano_id')
    // .default(nanoid())  // use your nanoid generator here
    .primaryKey(),
  tenant_id: serial('tenant_id').notNull().unique(),
  account_type: text('account_type').notNull(),
  short_name: text('short_name').notNull().unique(),
  long_name: text('long_name').notNull(),
  legal_name: text('legal_name').notNull(),
  government_registration_id: text('government_registration_id').unique(),
  government_alternate_registration_id: text(
    'government_alternate_registration_id',
  ),
  education_category: text('education_category').notNull(),
  education_classification: text('education_classification'),
  education_affiliation: text('education_affiliation'),
  education_association: text('education_association'),
  education_lowest_grade_level: text('education_lowest_grade_level').notNull(),
  education_highest_grade_level: text(
    'education_highest_grade_level',
  ).notNull(),
  date_founded: date('date_founded'),
  description: text('description'),
  account_owner_name: text('account_owner_name').notNull(),
  account_owner_email: text('account_owner_email').notNull().unique(),
  account_owner_phone: text('account_owner_phone').notNull().unique(),
  subscription_name: text('subscription_name').notNull(),
  status: text('status').notNull().default('active'),
  created_by: text('created_by').notNull(),
  created_on: timestamp('created_on').notNull().defaultNow(),
});

// ────────────── TENANT CONTACTS ──────────────
export const tenant_contacts = pgTable('tenant_contacts', {
  tenant_contact_nano_id: text('tenant_contact_nano_id')
    // .default(nanoid())
    .primaryKey(),
  tenant_contact_id: serial('tenant_contact_id').notNull(),
  tenant_nano_id: text('tenant_nano_id').references(
    () => tenants.tenant_nano_id,
    {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    },
  ),
  tenant_email: text('tenant_email').unique(),
  registrar_email: text('registrar_email'),
  finance_email: text('finance_email'),
  chancellor_email: text('chancellor_email'),
  vcp_email: text('vcp_email'),
  dvcp_email: text('dvcp_email'),
  ictd_email: text('ictd_email'),
  tenant_phone: text('tenant_phone'),
  registrar_phone: text('registrar_phone'),
  finance_phone: text('finance_phone'),
  chancellor_phone: text('chancellor_phone'),
  ictd_phone: text('ictd_phone'),
  website: text('website'),
  facebook: text('facebook'),
  linkedin: text('linkedin'),
  youtube: text('youtube'),
  twitter: text('twitter'),
  instagram: text('instagram'),
  tiktok: text('tiktok'),
  created_by: text('created_by'),
  created_on: timestamp('created_on').defaultNow(),
});

// ────────────── TENANT SETTINGS ──────────────
export const tenant_settings = pgTable('tenant_settings', {
  tenant_setting_nano_id: text('tenant_setting_nano_id')
    // .default(nanoid())
    .primaryKey(),
  tenant_setting_id: serial('tenant_setting_id').notNull(),
  tenant_nano_id: text('tenant_nano_id').references(
    () => tenants.tenant_nano_id,
    {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    },
  ),
  logo: text('logo'),
  neutral_color_background: text('neutral_color_background').default('#EFF4FB'),
  neutral_color_sections: text('neutral_color_sections').default('#E2E8F0'),
  neutral_color_text: text('neutral_color_text').default('#212B36'),
  primary_color: text('primary_color').default('#3C50E0'),
  secondary_color: text('secondary_color').default('#DC3545'),
  accent_color: text('accent_color').default('#10B981'),
  semantic_color_success: text('semantic_color_success').default('#E1F9F0'),
  semantic_color_warning: text('semantic_color_warning').default('#FEF5DE'),
  semantic_color_error: text('semantic_color_error').default('#FEEAEA'),
  semantic_color_info: text('semantic_color_info').default('#3C50E0'),
  timezone: text('timezone').default('UTC'),
  language_code: text('language_code').default('en'),
  currency: text('currency').default('USD'),
  api_id: text('api_id').unique(),
  management_api_key: text('management_api_key').unique(),
  delivery_api_key: text('delivery_api_key').unique(),
  created_by: text('created_by'),
  created_on: timestamp('created_on').defaultNow(),
});

// ────────────── TENANT LOCATIONS ──────────────
export const tenant_locations = pgTable('tenant_locations', {
  tenant_location_nano_id: text('tenant_location_nano_id')
    // .default(nanoid())
    .primaryKey(),
  tenant_location_id: serial('tenant_location_id').notNull(),
  tenant_nano_id: text('tenant_nano_id').references(
    () => tenants.tenant_nano_id,
    {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    },
  ),
  name: text('name').notNull(),
  location_type: text('location_type').notNull(),
  address_line1: text('address_line1').notNull(),
  address_line2: text('address_line2'),
  city: text('city').notNull(),
  state: text('state'),
  province: text('province'),
  postal_code: text('postal_code'),
  country: text('country').notNull(),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  created_by: text('created_by'),
  created_on: timestamp('created_on').defaultNow(),
});

// ────────────── USERS ──────────────
export const users = pgTable('users', {
  user_nano_id: text('user_nano_id')
    // .default(nanoid())
    .primaryKey(),
  user_id: serial('user_id').notNull(),
  tenant_nano_id: text('tenant_nano_id').references(
    () => tenants.tenant_nano_id,
    {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    },
  ),

  language_code: text('language_code').default('en'),
  timezone: text('timezone').default('UTC'),
  display_name: text('display_name'),
  nick_name: text('nick_name'),
  username: text('username').unique(),
  email: text('email').unique(),
  password: text('password').notNull(),
  password_status: text('password_status').default('active'),
  status: text('status').default('active'),
  photo: text('photo'),
  is_verified: boolean('is_verified').default(false),
  user_payment_nano_id: text('user_payment_nano_id'),
  paid_for_application: boolean('paid_for_application').default(false),
  paid_acceptance_fees: boolean('paid_acceptance_fees').default(false),
  portal_access: boolean('portal_access').default(true),
  deleted: boolean('deleted').default(false),
  spam: boolean('spam').default(false),
  created_by: text('created_by'),
  created_on: timestamp('created_on').defaultNow(),
});

// ────────────── USER PROFILES ──────────────
export const user_profiles = pgTable('user_profiles', {
  user_profile_id: serial('user_profile_id').notNull().primaryKey(),
  user_profile_nano_id: text('user_profile_nano_id'),
  user_nano_id: text('user_nano_id').references(() => users.user_nano_id, {
    onDelete: 'cascade',
    onUpdate: 'cascade',
  }),
  name_prefix: text('name_prefix'),
  full_name: text('full_name').notNull(),
  first_name: text('first_name').notNull(),
  middle_name: text('middle_name'),
  last_name: text('last_name').notNull(),
  name_suffix: text('name_suffix'),
  primary_phone: text('primary_phone').unique(),
  secondary_phone: text('secondary_phone').unique(),
  secondary_email: text('secondary_email'),
  gender: text('gender'),
  marital_status: text('marital_status'),
  date_of_birth: date('date_of_birth'),
  country_of_birth: text('country_of_birth'),
  nationality: text('nationality'),
  national_id_number: text('national_id_number'),
  other_government_id_numer: text('other_government_id_numer'),
  uploaded_id: text('uploaded_id'),
  is_disabled: boolean('is_disabled'),
  disability_status: text('disability_status'),
  created_by: text('created_by'),
  created_on: timestamp('created_on').defaultNow(),
});

// ────────────── USER AUTHS ──────────────
export const user_auths = pgTable('user_auths', {
  user_auth_id: serial('user_auth_id').notNull(),
  user_auth_nano_id: text('user_auth_nano_id')
    // .default(nanoid())
    .primaryKey(),
  user_nano_id: text('user_nano_id').references(() => users.user_nano_id, {
    onDelete: 'cascade',
    onUpdate: 'cascade',
  }),
  otp: text('otp'),
  otp_expiry: timestamp('otp_expiry'),
  last_login_at: timestamp('last_login_at'),
  last_login_ip: text('last_login_ip'),
  created_by: text('created_by'),
  created_on: timestamp('created_on').defaultNow(),
});

// ────────────── ROLES ──────────────
export const roles = pgTable('roles', {
  role_nano_id: text('role_nano_id').primaryKey().notNull().unique(), // Add unique constraint
  name: text('name').notNull(),
});

// ────────────── USER ROLES ──────────────
export const user_roles = pgTable('user_roles', {
  user_nano_id: text('user_nano_id')
    .notNull()
    .references(() => users.user_nano_id, { onDelete: 'cascade' }),
  role_nano_id: text('role_nano_id')
    .notNull()
    .references(() => roles.role_nano_id, { onDelete: 'cascade' }),
});

// ────────────── USER LOCATIONS ──────────────
export const user_locations = pgTable('user_locations', {
  user_location_id: serial('user_location_id').notNull().primaryKey(),
  user_location_nano_id: text('user_location_nano_id'),
  user_nano_id: text('user_nano_id').references(() => users.user_nano_id, {
    onDelete: 'cascade',
    onUpdate: 'cascade',
  }),
  location_type: text('location_type'),
  address_line1: text('address_line1').notNull(),
  address_line2: text('address_line2'),
  city: text('city').notNull(),
  state: text('state'),
  province: text('province'),
  postal_code: text('postal_code'),
  country: text('country').notNull(),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  created_by: text('created_by'),
  created_on: timestamp('created_on').defaultNow(),
});

// Add tenant_subscriptions table
export const tenant_subscriptions = pgTable('tenant_subscriptions', {
  tenant_subscription_nano_id: varchar('tenant_subscription_nano_id', {
    length: 22,
  }).primaryKey(),
  tenant_subscription_id: serial('tenant_subscription_id').notNull(),
  tenant_nano_id: varchar('tenant_nano_id', { length: 22 }).references(
    () => tenants.tenant_nano_id,
    {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    },
  ),
  subscription_name: text('subscription_name').notNull(),
  created_by: text('created_by'),
  created_on: timestamp('created_on').defaultNow(),
});

// Add user_settings table
export const user_settings = pgTable('user_settings', {
  user_setting_nano_id: varchar('user_setting_nano_id', {
    length: 22,
  }).primaryKey(),
  user_setting_id: serial('user_setting_id').notNull(),
});

// Add user_payments table
export const user_payments = pgTable('user_payments', {
  user_payment_id: serial('user_payment_id').notNull(),
  user_payment_nano_id: varchar('user_payment_nano_id', {
    length: 22,
  }).primaryKey(),
  user_nano_id: varchar('user_nano_id', { length: 22 }).references(
    () => users.user_nano_id,
  ),
  payment_type: text('payment_type'),
  payment_method: text('payment_method'),
  payment_details: text('payment_details'),
  created_by: text('created_by'),
  created_on: timestamp('created_on').defaultNow(),
});

// Add audit_logs table
export const audit_logs = pgTable('audit_logs', {
  audit_log_id: serial('audit_log_id').notNull(),
  audit_log_nano_id: varchar('audit_log_nano_id', { length: 22 }).primaryKey(),
  table_name: text('table_name').notNull(),
  record_id: text('record_id').notNull(),
  action: text('action').notNull(),
  old_data: jsonb('old_data'),
  new_data: jsonb('new_data'),
  changeby_login_ip: text('changeby_login_ip'),
  changed_by: text('changed_by'),
  changed_on: timestamp('changed_on').defaultNow(),
});

export const tenantsRelations = relations(tenants, ({ many, one }) => ({
  tenant_contacts: one(tenant_contacts),
  tenant_settings: one(tenant_settings),
  tenant_locations: many(tenant_locations),
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenant_nano_id],
    references: [tenants.tenant_nano_id],
  }),
  user_profile: one(user_profiles, {
    fields: [users.user_nano_id],
    references: [user_profiles.user_nano_id],
  }),
  user_auth: one(user_auths, {
    fields: [users.user_nano_id],
    references: [user_auths.user_nano_id],
  }),
  user_location: one(user_locations),
  user_roles: many(user_roles),
}));

export const userProfilesRelations = relations(user_profiles, ({ one }) => ({
  user: one(users, {
    fields: [user_profiles.user_nano_id],
    references: [users.user_nano_id],
  }),
}));

export const userAuthsRelations = relations(user_auths, ({ one }) => ({
  user: one(users, {
    fields: [user_auths.user_nano_id],
    references: [users.user_nano_id],
  }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  user_roles: many(user_roles),
}));

export const userRolesRelations = relations(user_roles, ({ one }) => ({
  user: one(users, {
    fields: [user_roles.user_nano_id],
    references: [users.user_nano_id],
  }),
  role: one(roles, {
    fields: [user_roles.role_nano_id],
    references: [roles.role_nano_id],
  }),
}));

export const userLocationsRelations = relations(user_locations, ({ one }) => ({
  user: one(users, {
    fields: [user_locations.user_nano_id],
    references: [users.user_nano_id],
  }),
}));

export const tenantLocationsRelations = relations(
  tenant_locations,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [tenant_locations.tenant_nano_id],
      references: [tenants.tenant_nano_id],
    }),
  }),
);

export const tenantContactsRelations = relations(
  tenant_contacts,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [tenant_contacts.tenant_nano_id],
      references: [tenants.tenant_nano_id],
    }),
  }),
);

export const tenantSettingsRelations = relations(
  tenant_settings,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [tenant_settings.tenant_nano_id],
      references: [tenants.tenant_nano_id],
    }),
  }),
);

export const tenantSubscriptionsRelations = relations(
  tenant_subscriptions,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [tenant_subscriptions.tenant_nano_id],
      references: [tenants.tenant_nano_id],
    }),
  }),
);

export const userPaymentsRelations = relations(user_payments, ({ one }) => ({
  user: one(users, {
    fields: [user_payments.user_nano_id],
    references: [users.user_nano_id],
  }),
}));
