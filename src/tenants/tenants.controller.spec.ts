import { Test, TestingModule } from '@nestjs/testing';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

describe('TenantsController', () => {
	const mockTenantsService = {
		create: jest.fn(),
		findAll: jest.fn(),
		findOne: jest.fn(),
		update: jest.fn(),
		remove: jest.fn(),
		updateSettings: jest.fn(),
		addLocation: jest.fn(),
		getLocations: jest.fn(),
		updateLocation: jest.fn(),
		createSubscription: jest.fn(),
		getSubscriptions: jest.fn(),
		updateSubscription: jest.fn(),
	};
	let controller: TenantsController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [TenantsController],
			providers: [
				{
					provide: TenantsService,
					useValue: mockTenantsService,
				},
			],
		}).compile();

		controller = module.get<TenantsController>(TenantsController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('create', () => {
		it('should create tenant and return new tenant', async () => {
			// Use CreateTenantDto with all required properties
			const createTenantDto = {
				account_type: 'school',
				short_name: 'TenantA',
				long_name: 'Tenant A Long Name',
				legal_name: 'Tenant A Legal',
				education_category: 'General',
				education_lowest_grade_level: '1',
				education_highest_grade_level: '12',
				account_owner_name: 'Owner Name',
				account_owner_email: 'owner@example.com',
				account_owner_phone: '1234567890',
				subscription_name: 'Basic'
			};
			const expected = { message: 'Tenant created successfully' };
			mockTenantsService.create.mockResolvedValue(expected);
			const reqUser = { user_nano_id: 'creator-1' };
			const result = await controller.create(createTenantDto, reqUser);
			expect(result).toEqual(expected);
		});
	});

	describe('findAll', () => {
		it('should return paginated tenants', async () => {
			const expected = { data: [1, 2] };
			mockTenantsService.findAll.mockResolvedValue(expected);
			const result = await controller.findAll(1, 10);
			expect(result).toEqual(expected);
		});
	});

	describe('findOne', () => {
		it('should return one tenant', async () => {
			const expected = { tenant_nano_id: 'tenant-1' };
			mockTenantsService.findOne.mockResolvedValue(expected);
			const result = await controller.findOne('tenant-1');
			expect(result).toEqual(expected);
		});
	});

	describe('update', () => {
		it('should update tenant and return updated tenant', async () => {
			// Using full UpdateTenantDto values
			const dto = {
				account_type: 'school',
				short_name: 'UpdatedTenant',
				long_name: 'Updated Tenant Long Name',
				legal_name: 'Updated Tenant Legal',
				education_category: 'General',
				education_lowest_grade_level: '1',
				education_highest_grade_level: '12',
				account_owner_name: 'New Owner',
				account_owner_email: 'newowner@example.com',
				account_owner_phone: '0987654321',
				subscription_name: 'Pro'
			};
			const expected = { message: 'Tenant updated successfully' };
			mockTenantsService.update.mockResolvedValue(expected);
			const reqUser = { user_nano_id: 'creator-1' };
			const result = await controller.update('tenant-1', dto, reqUser);
			expect(result).toEqual(expected);
		});
	});

	describe('remove', () => {
		it('should remove tenant', async () => {
			const expected = { message: 'Tenant deleted successfully' };
			mockTenantsService.remove.mockResolvedValue(expected);
			const result = await controller.remove('tenant-1');
			expect(result).toEqual(expected);
		});
	});

	describe('updateSettings', () => {
		it('should update settings and return updated data', async () => {
			// Using valid TenantSettingsDto properties (all optional but using one required for sample)
			const dto = { logo: 'https://example.com/logo.png' };
			const expected = { message: 'Settings updated successfully' };
			mockTenantsService.updateSettings.mockResolvedValue(expected);
			const result = await controller.updateSettings('tenant-1', dto);
			expect(result).toEqual(expected);
		});
	});

	describe('addLocation', () => {
		it('should add location and return confirmation', async () => {
			// Using TenantLocationDto with required properties: name, location_type, address_line1, city, country
			const dto = {
				name: 'Main Campus',
				location_type: 'primary',
				address_line1: '123 Main St',
				city: 'Metropolis',
				country: 'CountryX'
			};
			const expected = { message: 'Location added successfully' };
			mockTenantsService.addLocation.mockResolvedValue(expected);
			const result = await controller.addLocation('tenant-1', dto);
			expect(result).toEqual(expected);
		});
	});

	describe('getLocations', () => {
		it('should return tenant locations', async () => {
			const expected = [{ address: 'Location A' }];
			mockTenantsService.getLocations.mockResolvedValue(expected);
			const result = await controller.getLocations('tenant-1');
			expect(result).toEqual(expected);
		});
	});

	describe('updateLocation', () => {
		it('should update location and return confirmation', async () => {
			// Using the same TenantLocationDto structure as above
			const dto = {
				name: 'Updated Campus',
				location_type: 'secondary',
				address_line1: '456 New St',
				city: 'Gotham',
				country: 'CountryY'
			};
			const expected = { message: 'Location updated successfully' };
			mockTenantsService.updateLocation.mockResolvedValue(expected);
			const result = await controller.updateLocation('tenant-1', 'loc-1', dto);
			expect(result).toEqual(expected);
		});
	});

	describe('createSubscription', () => {
		it('should create subscription and return it', async () => {
			const dto = { subscription_name: 'Basic',tenant_nano_id: 'tenant-1' };
			const expected = { subscription: { name: 'Basic' } };
			mockTenantsService.createSubscription.mockResolvedValue(expected);
			const req = { user: { full_name: 'Tester' } };
			const result = await controller.createSubscription('tenant-1', dto, req);
			expect(result).toEqual(expected);
		});
	});

	describe('getSubscriptions', () => {
		it('should return subscriptions', async () => {
			const expected = [{ subscription_name: 'Basic' }];
			mockTenantsService.getSubscriptions.mockResolvedValue(expected);
			const result = await controller.getSubscriptions('tenant-1');
			expect(result).toEqual(expected);
		});
	});

	describe('updateSubscription', () => {
		it('should update subscription and return updated data', async () => {
			const expected = { subscription: { subscription_name: 'Pro' } };
			mockTenantsService.updateSubscription.mockResolvedValue(expected);
			const dto = { subscription_name: 'Pro' };
			const req = { user: { full_name: 'Tester' } };
			const result = await controller.updateSubscription('sub-1', dto, req);
			expect(result).toEqual(expected);
		});
	});
});
