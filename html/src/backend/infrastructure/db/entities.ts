import { EntitySchema } from 'typeorm';
import { Contact, RefreshToken, User } from '../../domain/models.js';
import { Role } from '../../domain/role.js';

export const UserEntity = new EntitySchema<User>({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid'
    },
    name: {
      type: String,
      unique: true
    },
    password: {
      type: String
    },
    role: {
      type: 'enum',
      enum: Role,
      default: Role.Basic
    }
  }
});

export const ContactEntity = new EntitySchema<Contact>({
  name: 'Contact',
  tableName: 'contacts',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid'
    },
    name: {
      type: String
    },
    contact: {
      type: String,
      unique: true
    },
    email_address: {
      type: String,
      unique: true
    },
    picture: {
      type: 'longtext'
    },
    created_by: {
      type: 'uuid'
    }
  },
  relations: {
    creator: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'created_by'
      },
      onDelete: 'CASCADE'
    }
  }
});

export const RefreshTokenEntity = new EntitySchema<RefreshToken>({
  name: 'RefreshToken',
  tableName: 'refresh_tokens',
  indices: [
    {
      name: 'IDX_refresh_tokens_token_hash',
      columns: ['token_hash']
    }
  ],
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid'
    },
    token_hash: {
      type: String,
      length: 512
    },
    user_id: {
      type: 'uuid'
    },
    expires_at: {
      type: Date
    },
    revoked_at: {
      type: Date,
      nullable: true
    }
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'user_id'
      },
      onDelete: 'CASCADE'
    }
  }
});
