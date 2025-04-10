import { Controller, Post, Body, Patch, UseGuards, Req, Get, HttpStatus, HttpCode, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto, VerifyOtpDto, ResendOtpDto, NewPasswordDto, ForgotPasswordDto, RequestOtpDto} from './dto/auth.dto';
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

  // Public routes - no CurrentUser needed
  @Post('signup')
  @HttpCode(HttpStatus.CREATED) // 201
  @ApiOperation({ summary: 'Register new user and send OTP' })
  async signUp(@Body() dto: SignUpDto) {
    const user = await this.authService.signUp(dto);
    return {
      message: 'User registered successfully. OTP sent for verification.',
      user,
    };
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and complete authentication' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK) 
  @ApiOperation({ summary: 'Request new OTP via SMS or email' })
  async resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in and receive 2FA OTP' })
  async signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  @Post('forget-password')
  @HttpCode(HttpStatus.ACCEPTED)
  async forgotPassword(@Body() resetPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(resetPasswordDto);
  }

  @Patch('reset-password')
  @HttpCode(HttpStatus.ACCEPTED) // 202
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

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Initiate Facebook OAuth' })
  async facebookAuth() {
    // Facebook authentication will be handled by Passport
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ 
    summary: 'Facebook OAuth callback',
    description: 'Processes the Facebook OAuth callback and returns JWT token.'
  })
  @ApiBearerAuth()
  async facebookAuthCallback(@Req() req: OAuthRequest) {
    return this.authService.oauthCallback(req);
  }

  @Get('apple')
  @UseGuards(AuthGuard('apple'))
  @ApiOperation({ summary: 'Initiate Apple OAuth' })
  async appleAuth() {
    // Apple authentication will be handled by Passport
  }

  @Get('apple/callback')
  @UseGuards(AuthGuard('apple'))
  @ApiOperation({ 
    summary: 'Apple OAuth callback',
    description: 'Processes the Apple OAuth callback and returns JWT token.'
  })
  @ApiBearerAuth()
  async appleAuthCallback(@Req() req: OAuthRequest) {
    return this.authService.oauthCallback(req);
  }
}
