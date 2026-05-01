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
import { ContactService } from '../application/contact-service.js';
import { ForbiddenError } from '../application/errors.js';
import { ContactPayloadDto, dtoValidationPipe } from '../application/validators.js';
import { JwtAuthGuard } from '../infrastructure/guards/jwt-auth.guard.js';

@Controller(['api/contacts', 'contacts'])
export class ContactController {
  constructor(@Inject(ContactService) private readonly contacts: ContactService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  list(@Req() request: Request) {
    if (!request.user) {
      throw new ForbiddenError();
    }

    return this.contacts.list(request.user);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Req() request: Request,
    @Body(dtoValidationPipe(ContactPayloadDto)) body: ContactPayloadDto
  ) {
    if (!request.user) {
      throw new ForbiddenError();
    }

    return this.contacts.create(request.user, body);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Req() request: Request, @Param('id') id: string) {
    if (!request.user) {
      throw new ForbiddenError();
    }

    return this.contacts.get(request.user, id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Req() request: Request,
    @Param('id') id: string,
    @Body(dtoValidationPipe(ContactPayloadDto)) body: ContactPayloadDto
  ) {
    if (!request.user) {
      throw new ForbiddenError();
    }

    return this.contacts.update(request.user, id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async remove(@Req() request: Request, @Param('id') id: string) {
    if (!request.user) {
      throw new ForbiddenError();
    }

    await this.contacts.delete(request.user, id);
  }
}
