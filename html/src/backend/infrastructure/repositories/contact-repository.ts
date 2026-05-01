import { FindOptionsWhere, Repository } from 'typeorm';
import { Contact } from '../../domain/models.js';
import { ContactEntity } from '../db/entities.js';
import { AppDataSource } from '../db/data-source.js';

export class ContactRepository {
  private repo: Repository<Contact>;

  constructor(repo = AppDataSource.getRepository(ContactEntity)) {
    this.repo = repo;
  }

  list(createdBy?: string) {
    const where: FindOptionsWhere<Contact> | undefined = createdBy
      ? { created_by: createdBy }
      : undefined;
    return this.repo.find({ where, order: { name: 'ASC' } });
  }

  findById(id: string) {
    return this.repo.findOneBy({ id });
  }

  findByContact(contact: string) {
    return this.repo.findOneBy({ contact });
  }

  findByEmailAddress(email_address: string) {
    return this.repo.findOneBy({ email_address });
  }

  create(contact: Omit<Contact, 'id'>) {
    return this.repo.save(this.repo.create(contact));
  }

  async update(id: string, contact: Omit<Contact, 'id'>) {
    await this.repo.update({ id }, contact);
    return this.findById(id);
  }

  delete(id: string) {
    return this.repo.delete({ id });
  }
}
