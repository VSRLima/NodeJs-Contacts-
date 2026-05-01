import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
  Req,
  UseGuards
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../application/auth-service.js';
import { ForbiddenError } from '../application/errors.js';
import {
  UserPayloadDto,
  UserUpdatePayloadDto,
  dtoValidationPipe
} from '../application/validators.js';
import { User } from '../domain/models.js';
import { Role } from '../domain/role.js';
import { JwtAuthGuard } from '../infrastructure/guards/jwt-auth.guard.js';
import { UserRepository } from '../infrastructure/repositories/user-repository.js';

const toPublicUser = ({ id, name, role }: User) => ({ id, name, role });

@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
    @Inject(UserRepository)
    private readonly users: UserRepository
  ) {}

  @Get()
  async list(@Req() request: Request) {
    if (request.user?.role !== Role.Admin) {
      throw new ForbiddenError('Only admins can list users');
    }

    const rows = await this.users.list();
    return rows.map(toPublicUser);
  }

  @Post()
  create(@Req() request: Request, @Body(dtoValidationPipe(UserPayloadDto)) body: UserPayloadDto) {
    if (!request.user) {
      throw new ForbiddenError();
    }

    return this.authService.createUser(
      request.user,
      body.name,
      body.password,
      body.role ?? Role.Basic
    );
  }

  @Put(':id')
  update(
    @Req() request: Request,
    @Param('id') id: string,
    @Body(dtoValidationPipe(UserUpdatePayloadDto)) body: UserUpdatePayloadDto
  ) {
    if (!request.user) {
      throw new ForbiddenError();
    }

    return this.authService.updateUser(
      request.user,
      id,
      body.name,
      body.role ?? Role.Basic,
      body.password
    );
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Req() request: Request, @Param('id') id: string) {
    if (!request.user) {
      throw new ForbiddenError();
    }

    await this.authService.deleteUser(request.user, id);
  }
}
