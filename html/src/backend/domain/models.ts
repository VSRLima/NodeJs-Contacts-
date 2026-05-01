import { Role } from './role.js';

export interface User {
  id: string;
  name: string;
  password: string;
  role: Role;
}

export interface Contact {
  id: string;
  name: string;
  contact: string;
  email_address: string;
  picture: string;
  created_by: string;
  creator?: User;
}

export interface AuthSession {
  user: Omit<User, 'password'>;
  access_token: string;
  refresh_token: string;
}

export interface RefreshToken {
  id: string;
  token_hash: string;
  user_id: string;
  expires_at: Date;
  revoked_at?: Date | null;
  user?: User;
}
