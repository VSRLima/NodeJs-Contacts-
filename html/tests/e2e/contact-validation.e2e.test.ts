import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { ContactService } from '../../src/backend/application/contact-service.js';
import { validationExceptionFactory } from '../../src/backend/application/validators.js';
import { ContactController } from '../../src/backend/controllers/contact-controller.js';
import { Role } from '../../src/backend/domain/role.js';
import { AppExceptionFilter } from '../../src/backend/infrastructure/filters/app-exception.filter.js';
import { JwtAuthGuard } from '../../src/backend/infrastructure/guards/jwt-auth.guard.js';
import { requestIdMiddleware } from '../../src/backend/infrastructure/middleware/request-id.js';

let app: INestApplication | undefined;

const makeApp = async () => {
  const moduleBuilder = Test.createTestingModule({
    controllers: [ContactController],
    providers: [
      {
        provide: ContactService,
        useValue: {
          list: async () => [],
          get: async () => ({
            id: 'contact-1',
            name: 'Ana Maria',
            contact: '912345678',
            email_address: 'ana@example.com',
            picture: 'https://example.com/ana.jpg',
            created_by: 'user-1'
          }),
          create: async (_user: unknown, payload: object) => ({
            id: 'contact-1',
            ...payload,
            created_by: 'user-1'
          }),
          update: async (_user: unknown, id: string, payload: object) => ({
            id,
            ...payload,
            created_by: 'user-1'
          }),
          delete: async () => undefined
        }
      }
    ]
  });

  const module = await moduleBuilder
    .overrideGuard(JwtAuthGuard)
    .useValue({
      canActivate(context: { switchToHttp: () => { getRequest: () => { user?: unknown } } }) {
        const request = context.switchToHttp().getRequest();
        request.user = { id: 'user-1', name: 'basic', role: Role.Basic };
        return true;
      }
    })
    .compile();

  app = module.createNestApplication();
  app.use(requestIdMiddleware);
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: validationExceptionFactory,
      transform: true,
      whitelist: true
    })
  );
  app.useGlobalFilters(new AppExceptionFilter());
  await app.init();
  return app;
};

afterEach(async () => {
  await app?.close();
  app = undefined;
});

describe('contact requests', () => {
  it('returns validation errors for invalid contact DTOs', async () => {
    const response = await request((await makeApp()).getHttpAdapter().getInstance())
      .post('/api/contacts')
      .send({
        name: 'Ana',
        contact: '+351912345678',
        email_address: 'ana',
        picture: 'https://example.com/ana.jpg'
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details.contact).toContain('9 digits');
  });

  it('creates contacts with valid DTOs', async () => {
    const response = await request((await makeApp()).getHttpAdapter().getInstance())
      .post('/api/contacts')
      .send({
        name: 'Ana Maria',
        contact: '912345678',
        email_address: 'ana@example.com',
        picture: 'https://example.com/ana.jpg'
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toBe('contact-1');
  });

  it('supports the exercise REST path without the api prefix', async () => {
    const response = await request((await makeApp()).getHttpAdapter().getInstance())
      .get('/contacts')
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});
