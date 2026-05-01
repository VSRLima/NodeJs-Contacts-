import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { createHash, randomUUID } from 'node:crypto';
import { User, RefreshToken } from '../domain/models.js';
import { Role } from '../domain/role.js';
import { config } from '../infrastructure/config.js';
import { ForbiddenError, UnauthorizedError, ValidationError } from './errors.js';

interface UserStore {
  findById(id: string): Promise<User | null>;
  findByName(name: string): Promise<User | null>;
  create(user: Omit<User, 'id'>): Promise<User>;
  update(id: string, user: Omit<User, 'id'>): Promise<User | null>;
  delete(id: string): Promise<unknown>;
}

interface RefreshTokenStore {
  create(token: Omit<RefreshToken, 'id'>): Promise<RefreshToken>;
  findActiveByHash(tokenHash: string): Promise<RefreshToken | null>;
  revoke(id: string): Promise<void>;
}

export interface AuthUser {
  id: string;
  name: string;
  role: Role;
}

export interface AccessTokenPayload {
  sub: string;
  name: string;
  role: Role;
}

const publicUser = (user: User): AuthUser => ({
  id: user.id,
  name: user.name,
  role: user.role
});

const signJwt = (payload: object, secret: string, expiresIn: string) =>
  jwt.sign(payload, secret, { expiresIn } as SignOptions);

export const refreshTokenHash = (token: string) => createHash('sha256').update(token).digest('hex');

export class AuthService {
  constructor(
    private users: UserStore,
    private refreshTokens: RefreshTokenStore
  ) {}

  async login(name: string, password: string) {
    const user = await this.users.findByName(name);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedError('Invalid credentials');
    }

    return this.issueSession(user);
  }

  async refresh(refreshToken: string) {
    const payload = this.verifyRefreshToken(refreshToken);
    const activeToken = await this.findMatchingActiveToken(refreshToken);

    if (
      !activeToken ||
      activeToken.user_id !== payload.sub ||
      activeToken.expires_at <= new Date()
    ) {
      throw new UnauthorizedError('Refresh token expired or revoked');
    }

    await this.refreshTokens.revoke(activeToken.id);
    const user = await this.users.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return this.issueSession(user);
  }

  async createUser(currentUser: AuthUser, name: string, password: string, role: Role) {
    if (currentUser.role !== Role.Admin) {
      throw new ForbiddenError('Only admins can create users');
    }

    const existing = await this.users.findByName(name);
    if (existing) {
      throw new ValidationError({ name: 'name is already in use' });
    }

    const hash = await bcrypt.hash(password, 12);
    const user = await this.users.create({ name, password: hash, role });
    return publicUser(user);
  }

  async updateUser(currentUser: AuthUser, id: string, name: string, role: Role, password?: string) {
    if (currentUser.role !== Role.Admin) {
      throw new ForbiddenError('Only admins can update users');
    }

    const existing = await this.users.findById(id);
    if (!existing) {
      throw new ValidationError({ user: 'user was not found' });
    }

    const nameMatch = await this.users.findByName(name);
    if (nameMatch && nameMatch.id !== id) {
      throw new ValidationError({ name: 'name is already in use' });
    }

    const hash = password ? await bcrypt.hash(password, 12) : existing.password;
    const user = await this.users.update(id, { name, password: hash, role });
    return publicUser(user ?? existing);
  }

  async deleteUser(currentUser: AuthUser, id: string) {
    if (currentUser.role !== Role.Admin) {
      throw new ForbiddenError('Only admins can delete users');
    }

    if (currentUser.id === id) {
      throw new ValidationError({ user: 'you cannot delete your own user' });
    }

    const existing = await this.users.findById(id);
    if (!existing) {
      throw new ValidationError({ user: 'user was not found' });
    }

    await this.users.delete(id);
  }

  verifyAccessToken(token: string): AuthUser {
    const payload = jwt.verify(token, config.jwt.accessSecret) as AccessTokenPayload;
    return {
      id: payload.sub,
      name: payload.name,
      role: payload.role
    };
  }

  async ensureAdminSeed(adminName: string, adminPassword: string) {
    const existing = await this.users.findByName(adminName);
    if (existing) {
      return;
    }

    await this.users.create({
      name: adminName,
      password: await bcrypt.hash(adminPassword, 12),
      role: Role.Admin
    });
  }

  private async issueSession(user: User) {
    const access_token = signJwt(
      { sub: user.id, name: user.name, role: user.role },
      config.jwt.accessSecret,
      config.jwt.accessExpiresIn
    );
    const refresh_token = signJwt(
      { sub: user.id, tokenId: randomUUID() },
      config.jwt.refreshSecret,
      config.jwt.refreshExpiresIn
    );
    const token_hash = refreshTokenHash(refresh_token);
    const expires_at = new Date(Date.now() + 2 * 60 * 60 * 1000);

    await this.refreshTokens.create({
      token_hash,
      user_id: user.id,
      expires_at,
      revoked_at: null
    });

    return {
      user: publicUser(user),
      access_token,
      refresh_token
    };
  }

  private verifyRefreshToken(token: string) {
    return jwt.verify(token, config.jwt.refreshSecret) as { sub: string; tokenId: string };
  }

  private async findMatchingActiveToken(refreshToken: string) {
    return this.refreshTokens.findActiveByHash(refreshToken);
  }
}
