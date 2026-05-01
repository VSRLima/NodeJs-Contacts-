import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from '../config.js';
import { ContactEntity, RefreshTokenEntity, UserEntity } from './entities.js';

export const AppDataSource = new DataSource({
  type: 'mariadb',
  host: config.db.host,
  port: config.db.port,
  username: config.db.username,
  password: config.db.password,
  database: config.db.database,
  synchronize: config.db.synchronize,
  logging: false,
  entities: [UserEntity, ContactEntity, RefreshTokenEntity]
});
