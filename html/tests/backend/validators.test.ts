import { describe, expect, it } from 'vitest';
import {
  validateContactPayload,
  validateContactUniqueness,
  validateUserPayload
} from '../../src/backend/application/validators.js';
import { ValidationError } from '../../src/backend/application/errors.js';
import { Role } from '../../src/backend/domain/role.js';

describe('validators', () => {
  it('accepts a complete contact payload with a 9-digit phone and email', () => {
    expect(
      validateContactPayload({
        name: 'Ana Maria',
        contact: '912345678',
        email_address: 'ana@example.com',
        picture: 'https://example.com/ana.jpg'
      })
    ).toEqual({
      name: 'Ana Maria',
      contact: '912345678',
      email_address: 'ana@example.com',
      picture: 'https://example.com/ana.jpg'
    });
  });

  it('rejects invalid contact formats', () => {
    expect(() =>
      validateContactPayload({
        name: 'Ana',
        contact: '+351912345678',
        email_address: 'ana',
        picture: 'https://example.com/ana.jpg'
      })
    ).toThrow(ValidationError);
  });

  it('requires user name and password and defaults to basic role', () => {
    expect(validateUserPayload({ name: 'joao', password: 'secret123' })).toEqual({
      name: 'joao',
      password: 'secret123',
      role: Role.Basic
    });
  });

  it('rejects duplicate contact and email values', async () => {
    const duplicate = {
      id: 'contact-1',
      name: 'Ana Maria',
      contact: '912345678',
      email_address: 'ana@example.com',
      picture: 'https://example.com/ana.jpg',
      created_by: 'user-1'
    };

    await expect(
      validateContactUniqueness(
        {
          name: 'Joao Silva',
          contact: '912345678',
          email_address: 'ana@example.com',
          picture: 'https://example.com/joao.jpg'
        },
        {
          findByContact: async () => duplicate,
          findByEmailAddress: async () => duplicate
        }
      )
    ).rejects.toThrow(ValidationError);
  });
});
