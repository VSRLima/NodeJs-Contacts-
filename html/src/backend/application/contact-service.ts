import { Contact } from '../domain/models.js';
import { Role } from '../domain/role.js';
import { ForbiddenError, NotFoundError } from './errors.js';
import { AuthUser } from './auth-service.js';
import { ContactPayload, validateContactUniqueness } from './validators.js';

interface ContactStore {
  list(createdBy?: string): Promise<Contact[]>;
  findById(id: string): Promise<Contact | null>;
  findByContact(contact: string): Promise<Contact | null>;
  findByEmailAddress(emailAddress: string): Promise<Contact | null>;
  create(contact: Omit<Contact, 'id'>): Promise<Contact>;
  update(id: string, contact: Omit<Contact, 'id'>): Promise<Contact | null>;
  delete(id: string): Promise<unknown>;
}

export class ContactService {
  constructor(private contacts: ContactStore) {}

  list(user?: AuthUser) {
    if (!user) {
      throw new ForbiddenError();
    }

    if (user.role === Role.Admin) {
      return this.contacts.list();
    }

    return this.contacts.list(user.id);
  }

  async get(user: AuthUser, id: string) {
    const contact = await this.contacts.findById(id);
    this.assertCanAccess(user, contact);
    return contact;
  }

  async create(user: AuthUser, payload: ContactPayload) {
    await validateContactUniqueness(payload, this.contacts);

    const created_by =
      user.role === Role.Admin && payload.created_by ? payload.created_by : user.id;

    return this.contacts.create({
      name: payload.name,
      contact: payload.contact,
      email_address: payload.email_address,
      picture: payload.picture,
      created_by
    });
  }

  async update(user: AuthUser, id: string, payload: ContactPayload) {
    const existing = await this.contacts.findById(id);
    this.assertCanAccess(user, existing);
    await validateContactUniqueness(payload, this.contacts, id);

    const created_by =
      user.role === Role.Admin && payload.created_by ? payload.created_by : existing.created_by;
    return this.contacts.update(id, {
      name: payload.name,
      contact: payload.contact,
      email_address: payload.email_address,
      picture: payload.picture,
      created_by
    });
  }

  async delete(user: AuthUser, id: string) {
    const existing = await this.contacts.findById(id);
    this.assertCanAccess(user, existing);
    await this.contacts.delete(id);
  }

  private assertCanAccess(user: AuthUser, contact: Contact | null): asserts contact is Contact {
    if (!contact) {
      throw new NotFoundError('Contact');
    }

    if (user.role !== Role.Admin && contact.created_by !== user.id) {
      throw new ForbiddenError('You can only access your own contacts');
    }
  }
}
