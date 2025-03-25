import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
	// Create a comprehensive mock for all methods
	const mockUsersService = {
		findAll: jest.fn(),
		searchUsers: jest.fn(),
		findOne: jest.fn(),
		update: jest.fn(),
		remove: jest.fn(),
		getUsersByRole: jest.fn(),
		getUserRoles: jest.fn(),
		assignRole: jest.fn(),
		removeRole: jest.fn(),
		addLocation: jest.fn(),
		getLocations: jest.fn(),
		updateLocation: jest.fn(),
		removeLocation: jest.fn(),
		assignTenant: jest.fn(),
		createPayment: jest.fn(),
		getUserPayments: jest.fn(),
		updatePayment: jest.fn(),
	};
	let controller: UsersController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UsersController],
			providers: [
				{
					provide: UsersService,
					useValue: mockUsersService,
				},
			],
		}).compile();

		controller = module.get<UsersController>(UsersController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('findAll', () => {
		it('should return paginated users', async () => {
			const expected = { data: [1, 2] };
			mockUsersService.findAll.mockResolvedValue(expected);
			const result = await controller.findAll(1, 10);
			expect(result).toEqual(expected);
		});
	});

	describe('searchUsers', () => {
		it('should search and return users', async () => {
			const expected = { data: [] };
			mockUsersService.searchUsers.mockResolvedValue(expected);
			const result = await controller.searchUsers('test', 1, 10);
			expect(result).toEqual(expected);
		});
	});

	describe('findOne', () => {
		it('should return one user', async () => {
			const expected = { user_nano_id: '123' };
			mockUsersService.findOne.mockResolvedValue(expected);
			const result = await controller.findOne('123');
			expect(result).toEqual(expected);
		});
	});

	describe('update', () => {
		it('should update and return user', async () => {
			// Using complete UserUpdateDto
			const dto = { 
				user: { username: 'newUsername', email: 'new@example.com' },
				profile: { full_name: 'New Full', first_name: 'New', last_name: 'User' }
			};
			const expected = { message: 'User updated successfully' };
			mockUsersService.update.mockResolvedValue(expected);
			const result = await controller.update('123', dto);
			expect(result).toEqual(expected);
		});
	});

	describe('remove', () => {
		it('should remove user', async () => {
			const expected = { message: 'User deleted successfully' };
			mockUsersService.remove.mockResolvedValue(expected);
			const result = await controller.remove('123');
			expect(result).toEqual(expected);
		});
	});

	describe('getUsersByRole', () => {
		it('should return users by role', async () => {
			const expected = { data: [] };
			mockUsersService.getUsersByRole.mockResolvedValue(expected);
			const query = { page: 1, limit: 10 };
			const result = await controller.getUsersByRole('role-123', query);
			expect(result).toEqual(expected);
		});
	});

	describe('getUserRoles', () => {
		it('should return user roles', async () => {
			const expected = [{ name: 'admin' }];
			mockUsersService.getUserRoles.mockResolvedValue(expected);
			const result = await controller.getUserRoles('123');
			expect(result).toEqual(expected);
		});
	});

	describe('assignRole', () => {
		it('should assign role and return message', async () => {
			const dto = { role_nano_id: 'role-456' };
			const expected = { message: 'Role assigned successfully' };
			mockUsersService.assignRole.mockResolvedValue(expected);
			const result = await controller.assignRole('123', dto);
			expect(result).toEqual(expected);
		});
	});

	describe('removeRole', () => {
		it('should remove role and return message', async () => {
			const expected = { message: 'Role removed successfully' };
			mockUsersService.removeRole.mockResolvedValue(expected);
			const result = await controller.removeRole('123', 'role-456');
			expect(result).toEqual(expected);
		});
	});

	describe('addLocation', () => {
		it('should add location and return confirmation', async () => {
			// Using complete UserLocationDto (address_line1, city, country are required)
			const dto = { address_line1: 'Test St.', city: 'Test City', country: 'Test Country' };
			const expected = { message: 'Location added successfully' };
			mockUsersService.addLocation.mockResolvedValue(expected);
			const result = await controller.addLocation('123', dto);
			expect(result).toEqual(expected);
		});
	});

	describe('getLocations', () => {
		it('should return user locations', async () => {
			const expected = [{ address: 'Test St.' }];
			mockUsersService.getLocations.mockResolvedValue(expected);
			const result = await controller.getLocations('123');
			expect(result).toEqual(expected);
		});
	});

	describe('updateLocation', () => {
		it('should update location and return message', async () => {
			const dto = { address_line1: 'New St.',city:"Freetown",country:"Sierra Leone" };
			const expected = { message: 'Location updated successfully' };
			mockUsersService.updateLocation.mockResolvedValue(expected);
			const result = await controller.updateLocation('123', 'loc-1', dto);
			expect(result).toEqual(expected);
		});
	});

	describe('removeLocation', () => {
		it('should remove location', async () => {
			const expected = { message: 'Location removed successfully' };
			mockUsersService.removeLocation.mockResolvedValue(expected);
			const result = await controller.removeLocation('123', 'loc-1');
			expect(result).toEqual(expected);
		});
	});

	describe('assignTenant', () => {
		it('should assign tenant and return message', async () => {
			const dto = { tenant_nano_id: 'tenant-456' };
			const expected = { message: 'Tenant assigned successfully' };
			mockUsersService.assignTenant.mockResolvedValue(expected);
			const result = await controller.assignTenant('123', dto);
			expect(result).toEqual(expected);
		});
	});

	describe('createPayment', () => {
		it('should create payment and return new payment', async () => {
			// Using complete CreateUserPaymentDto (required: user_nano_id, payment_type, payment_method)
			const dto = { user_nano_id: '123', payment_type: 'card', payment_method: 'visa' };
			const expected = { payment: { amount: 100 } };
			mockUsersService.createPayment.mockResolvedValue(expected);
			const req = { user: { full_name: 'Test User' } };
			const result = await controller.createPayment('123', dto, req);
			expect(result).toEqual(expected);
		});
	});

	describe('getUserPayments', () => {
		it('should return user payments', async () => {
			const expected = [{ amount: 100 }];
			mockUsersService.getUserPayments.mockResolvedValue(expected);
			const result = await controller.getUserPayments('123');
			expect(result).toEqual(expected);
		});
	});

	describe('updatePayment', () => {
		it('should update payment and return updated data', async () => {
			// Using complete UpdateUserPaymentDto
			const dto = { payment_type: 'card', payment_method: 'master', payment_details: 'details' };
			const expected = { payment: { amount: 200 } };
			mockUsersService.updatePayment.mockResolvedValue(expected);
			const req = { user: { full_name: 'Test User' } };
			const result = await controller.updatePayment('pay-1', dto, req);
			expect(result).toEqual(expected);
		});
	});
});
