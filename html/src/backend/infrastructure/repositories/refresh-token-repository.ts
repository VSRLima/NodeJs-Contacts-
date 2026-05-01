import { IsNull, MoreThan, Repository } from 'typeorm';
import { refreshTokenHash } from '../../application/auth-service.js';
import { RefreshToken } from '../../domain/models.js';
import { AppDataSource } from '../db/data-source.js';
import { RefreshTokenEntity } from '../db/entities.js';

export class RefreshTokenRepository {
  private repo: Repository<RefreshToken>;

  constructor(repo = AppDataSource.getRepository(RefreshTokenEntity)) {
    this.repo = repo;
  }

  create(token: Omit<RefreshToken, 'id'>) {
    return this.repo.save(this.repo.create(token));
  }

  findActiveByHash(tokenOrHash: string) {
    const token_hash = /^[a-f0-9]{64}$/i.test(tokenOrHash)
      ? tokenOrHash
      : refreshTokenHash(tokenOrHash);

    return this.repo.findOne({
      where: {
        token_hash,
        revoked_at: IsNull(),
        expires_at: MoreThan(new Date())
      }
    });
  }

  async revoke(id: string) {
    await this.repo.update({ id }, { revoked_at: new Date() });
  }
}
