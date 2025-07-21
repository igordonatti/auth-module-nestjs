import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  Body,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { isPublic } from './decorators/is-public.decorator';
import { AuthService } from './auth.service';
import { AuthRequest } from './models/AuthRequest';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @isPublic()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  login(@Request() req: AuthRequest) {
    return this.authService.login(req.user);
  }

  @isPublic()
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  validateToken(@Body() body: { token: string }) {
    return this.authService.validateToken(body.token);
  }

  @isPublic()
  @Post('forgot-password')
  async forgotPassword(@Body() { email }: { email: string }) {
    return await this.authService.forgotPassword(email);
  }

  @isPublic()
  @Post('reset-password')
  async resetPassword(
    @Body() { token, password }: { token: string; password: string },
  ) {
    return await this.authService.resetPassword(token, password);
  }
}
