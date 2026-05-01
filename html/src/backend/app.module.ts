import { Module } from '@nestjs/common';
import { AuthService } from './application/auth-service.js';
import { ContactService } from './application/contact-service.js';
import { AuthController } from './controllers/auth-controller.js';
import { ContactController } from './controllers/contact-controller.js';
import { HealthController } from './controllers/health-controller.js';
import { UserController } from './controllers/user-controller.js';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard.js';
import { ContactRepository } from './infrastructure/repositories/contact-repository.js';
import { RefreshTokenRepository } from './infrastructure/repositories/refresh-token-repository.js';
import { UserRepository } from './infrastructure/repositories/user-repository.js';

@Module({
  controllers: [AuthController, ContactController, HealthController, UserController],
  providers: [
    ContactRepository,
    JwtAuthGuard,
    RefreshTokenRepository,
    UserRepository,
    {
      provide: AuthService,
      inject: [UserRepository, RefreshTokenRepository],
      useFactory: (users: UserRepository, refreshTokens: RefreshTokenRepository) =>
        new AuthService(users, refreshTokens)
    },
    {
      provide: ContactService,
      inject: [ContactRepository],
      useFactory: (contacts: ContactRepository) => new ContactService(contacts)
    }
  ]
})
export class AppModule {}
