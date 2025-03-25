import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RoleName } from './dto/role.dto';

describe('RolesController', () => {
	const mockRolesService = {
		findAll: jest.fn(),
		findOne: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		remove: jest.fn(),
	};
	let controller: RolesController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [RolesController],
			providers: [
				{
					provide: RolesService,
					useValue: mockRolesService,
				},
			],
		}).compile();

		controller = module.get<RolesController>(RolesController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('findAll', () => {
		it('should return all roles', async () => {
			const expected = [{ name: 'admin' }];
			mockRolesService.findAll.mockResolvedValue(expected);
			const result = await controller.findAll();
			expect(result).toEqual(expected);
		});
	});

	describe('findOne', () => {
		it('should return one role', async () => {
			const expected = { role_nano_id: 'role-1' };
			mockRolesService.findOne.mockResolvedValue(expected);
			const result = await controller.findOne('role-1');
			expect(result).toEqual(expected);
		});
	});

	describe('create', () => {
		it('should create role and return result', async () => {
			const expected = { message: 'Role created successfully' };
			mockRolesService.create.mockResolvedValue(expected);
			const req = { user: { full_name: 'Tester' } };
			const dto = { name: RoleName.EDITOR};
			const result = await controller.create(dto, req);
			expect(result).toEqual(expected);
		});
	});

	describe('update', () => {
		it('should update role and return result', async () => {
			const expected = { message: 'Role updated successfully' };
			mockRolesService.update.mockResolvedValue(expected);
			const dto = { name:RoleName.MANAGER };
			const result = await controller.update('manager', dto);
			expect(result).toEqual(expected);
		});
	});

	describe('remove', () => {
		it('should remove role and return message', async () => {
			const expected = { message: 'Role deleted successfully' };
			mockRolesService.remove.mockResolvedValue(expected);
			const result = await controller.remove('role-1');
			expect(result).toEqual(expected);
		});
	});
});
