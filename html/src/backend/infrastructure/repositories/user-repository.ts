import { Repository } from 'typeorm';
import { User } from '../../domain/models.js';
import { UserEntity } from '../db/entities.js';
import { AppDataSource } from '../db/data-source.js';

export class UserRepository {
  private repo: Repository<User>;

  constructor(repo = AppDataSource.getRepository(UserEntity)) {
    this.repo = repo;
  }

  findById(id: string) {
    return this.repo.findOneBy({ id });
  }

  findByName(name: string) {
    return this.repo.findOneBy({ name });
  }

  list() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  create(user: Omit<User, 'id'>) {
    return this.repo.save(this.repo.create(user));
  }

  async update(id: string, user: Omit<User, 'id'>) {
    await this.repo.update({ id }, user);
    return this.findById(id);
  }

  delete(id: string) {
    return this.repo.delete({ id });
  }
}
