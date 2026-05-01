import { describe, expect, it } from 'vitest';
import { ContactService } from '../../src/backend/application/contact-service.js';
import { ForbiddenError } from '../../src/backend/application/errors.js';
import { Role } from '../../src/backend/domain/role.js';

const contact = {
  id: 'contact-1',
  name: 'Ana',
  contact: '912345678',
  email_address: 'ana@example.com',
  picture: 'https://example.com/ana.jpg',
  created_by: 'user-1'
};

describe('ContactService', () => {
  it('scopes basic users to their own contacts', async () => {
    const store = {
      list: async (createdBy?: string) => (createdBy === 'user-1' ? [contact] : []),
      findById: async () => contact,
      findByContact: async () => null,
      findByEmailAddress: async () => null,
      create: async () => contact,
      update: async () => contact,
      delete: async () => undefined
    };

    const service = new ContactService(store);
    await expect(service.list({ id: 'user-1', name: 'basic', role: Role.Basic })).resolves.toEqual([
      contact
    ]);
  });

  it('blocks basic users from accessing contacts owned by others', async () => {
    const service = new ContactService({
      list: async () => [],
      findById: async () => contact,
      findByContact: async () => null,
      findByEmailAddress: async () => null,
      create: async () => contact,
      update: async () => contact,
      delete: async () => undefined
    });

    await expect(
      service.get({ id: 'user-2', name: 'basic', role: Role.Basic }, 'contact-1')
    ).rejects.toThrow(ForbiddenError);
  });
});
