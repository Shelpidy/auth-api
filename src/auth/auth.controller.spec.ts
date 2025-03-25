import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
	const mockAuthService = {
		signUp: jest.fn(),
		signIn: jest.fn(),
		verifyEmail: jest.fn(),
		resendOtp: jest.fn(),
		forgotPassword: jest.fn(),
		resetPassword: jest.fn(),
		oauthCallback: jest.fn(),
	};
	let controller: AuthController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				{
					provide: AuthService,
					useValue: mockAuthService,
				},
			],
		}).compile();

		controller = module.get<AuthController>(AuthController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('signUp', () => {
		it('should sign up a user and return confirmation', async () => {
			// Using complete SignUpDto (with nested UserProfileDto)
			const dto = { 
				username: 'testuser',
				email: 'test@example.com', 
				password: '123456',
				user_profile: {
					full_name: 'Test User',
					first_name: 'Test',
					last_name: 'User'
				}
				// user_location is optional
			};
			const expected = { message: 'User registered successfully' };
			mockAuthService.signUp.mockResolvedValue(expected);
			const result = await controller.signUp(dto);
			expect(result).toEqual(expected);
		});
	});

	describe('signIn', () => {
		it('should sign in a user and return token', async () => {
			const expected = { token: 'abc123' };
			mockAuthService.signIn.mockResolvedValue(expected);
			const dto = { email: 'test@example.com', password: '123456' };
			const result = await controller.signIn(dto);
			expect(result).toEqual(expected);
		});
	});

	describe('verifyEmail', () => {
		it('should verify email and return confirmation', async () => {
			const expected = { message: 'Email verified successfully' };
			mockAuthService.verifyEmail.mockResolvedValue(expected);
			const dto = { email: 'test@example.com', otp: '111111' };
			const result = await controller.verifyEmail(dto);
			expect(result).toEqual(expected);
		});
	});

	describe('resendOtp', () => {
		it('should resend OTP and return confirmation', async () => {
			const expected = { message: 'New verification code sent successfully' };
			mockAuthService.resendOtp.mockResolvedValue(expected);
			const dto = { email: 'test@example.com' };
			const result = await controller.resendOtp(dto);
			expect(result).toEqual(expected);
		});
	});

	describe('forgotPassword', () => {
		it('should send password reset instructions', async () => {
			const expected = { message: 'Password reset instructions sent to your email' };
			mockAuthService.forgotPassword.mockResolvedValue(expected);
			const dto = { email: 'test@example.com' };
			const result = await controller.forgotPassword(dto);
			expect(result).toEqual(expected);
		});
	});

	describe('resetPassword', () => {
		it('should reset password and return confirmation', async () => {
			const expected = { message: 'Password reset successful' };
			mockAuthService.resetPassword.mockResolvedValue(expected);
			const dto = { email: 'test@example.com', otp: '111111', new_password: 'newpass' };
			const result = await controller.resetPassword(dto);
			expect(result).toEqual(expected);
		});
	});

	// describe('googleAuthCallback', () => {
	// 	it('should handle Google OAuth callback', async () => {
	// 		const expected = { token: 'oauth-token' };
	// 		mockAuthService.oauthCallback.mockResolvedValue(expected);
	// 		const req = { user: { user_nano_id: 'id', user_roles: [] } };
	// 		const result = await controller.googleAuthCallback(req);
	// 		expect(result).toEqual(expected);
	// 	});
	// });

	// describe('microsoftAuthCallback', () => {
	// 	it('should handle Microsoft OAuth callback', async () => {
	// 		const expected = { token: 'oauth-token' };
	// 		mockAuthService.oauthCallback.mockResolvedValue(expected);
	// 		const req = { user: { user_nano_id: 'id', user_roles: [] } };
	// 		const result = await controller.microsoftAuthCallback(req);
	// 		expect(result).toEqual(expected);
	// 	});
	// });
});
