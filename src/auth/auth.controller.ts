import {
  Controller,
  Post,
  Body,
  Patch,
  UseGuards,
  Req,
  Get,
  HttpStatus,
  HttpCode,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  SignUpDto,
  SignInDto,
  VerifyOtpDto,
  ResendOtpDto,
  NewPasswordDto,
  ForgotPasswordDto,
} from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';

// Add interface for OAuth user
interface OAuthRequest extends Request {
  user?: any;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUpDto: SignUpDto) {
    const user = await this.authService.signUp(signUpDto);
    return {
      message:
        'User registered successfully. A verification code has been sent to your email.',
      user,
    };
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.ACCEPTED)
  async verifyEmail(@Body() verifyEmailDto: VerifyOtpDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.ACCEPTED)
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto);
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
  async googleAuth() {
    // Google authentication will be handled by Passport
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
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
