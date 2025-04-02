import { Controller, Post, Body, Patch, UseGuards, Req, Get, HttpStatus, HttpCode, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto, VerifyOtpDto, ResendOtpDto, NewPasswordDto, ForgotPasswordDto } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

// Add interface for OAuth user
interface OAuthRequest extends Request {
  user?: any;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user', description: 'Creates a new user account and sends a verification OTP email.' })
  @ApiResponse({ status: 201, description: 'User registered and OTP sent.' })
  @ApiBody({ type: SignUpDto, description: 'User signup payload' })
  async signUp(@Body() signUpDto: SignUpDto) {
    const user = await this.authService.signUp(signUpDto);
    return {
      message:
        'User registered successfully. A verification code has been sent to your email.',
      user,
    };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Verify user email', description: 'Verifies the user email based on the OTP provided.' })
  @ApiResponse({ status: 202, description: 'Email verified successfully.' })
  async verifyEmail(@Body() verifyEmailDto: VerifyOtpDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.ACCEPTED)
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User sign in', description: 'Authenticates a user and returns a JWT token.' })
  @ApiResponse({ status: 200, description: 'Sign in successful, token returned.' })
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('forget-password')
  @HttpCode(HttpStatus.ACCEPTED)
  async forgotPassword(@Body() resetPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(resetPasswordDto);
  }

  @Patch('reset-password')
  @HttpCode(HttpStatus.ACCEPTED)
  async resetPassword(@Body() newPasswordDto: NewPasswordDto) {
    return this.authService.resetPassword(newPasswordDto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth' })
  async googleAuth() {
    // Google authentication will be handled by Passport
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback', description: 'Processes the Google OAuth callback and returns JWT token.' })
  @ApiBearerAuth()  // if protected endpoint
  async googleAuthCallback(@Req() req: OAuthRequest) {
    return this.authService.oauthCallback(req);
  }

  @Get('microsoft')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftAuth() {
    // Microsoft authentication will be handled by Passport
  }

  @Get('microsoft/callback')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftAuthCallback(@Req() req: OAuthRequest) {
    return this.authService.oauthCallback(req);
  }
}
