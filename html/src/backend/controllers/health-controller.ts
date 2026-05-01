import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AppDataSource } from '../infrastructure/db/data-source.js';

@Controller('health')
export class HealthController {
  @Get('live')
  live() {
    return { status: 'ok' };
  }

  @Get('ready')
  ready(@Res({ passthrough: true }) response: Response) {
    response.status(AppDataSource.isInitialized ? 200 : 503);
    return {
      status: AppDataSource.isInitialized ? 'ready' : 'not_ready'
    };
  }
}
