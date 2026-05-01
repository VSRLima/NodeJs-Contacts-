import { Body, Controller, Get, Inject, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../application/auth-service.js';
import {
  CredentialsPayloadDto,
  RefreshPayloadDto,
  dtoValidationPipe
} from '../application/validators.js';
import { JwtAuthGuard } from '../infrastructure/guards/jwt-auth.guard.js';

@Controller('api/auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('login')
  login(@Body(dtoValidationPipe(CredentialsPayloadDto)) body: CredentialsPayloadDto) {
    return this.authService.login(body.name, body.password);
  }

  @Post('refresh')
  refresh(@Body(dtoValidationPipe(RefreshPayloadDto)) body: RefreshPayloadDto) {
    return this.authService.refresh(body.refresh_token);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() request: Request) {
    return { user: request.user };
  }
}
