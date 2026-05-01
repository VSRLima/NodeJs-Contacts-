import { Type, ValidationPipe } from '@nestjs/common';
import { plainToInstance, Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  MinLength,
  validateSync,
  ValidationError as ClassValidationError
} from 'class-validator';
import { Contact } from '../domain/models.js';
import { Role } from '../domain/role.js';
import { ValidationError } from './errors.js';

type ValidationShape = Record<string, string>;

const phoneRegex = /^\d{9}$/;

const trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const firstConstraint = (error: ClassValidationError) =>
  error.constraints ? Object.values(error.constraints)[0] : 'is invalid';

export const validationExceptionFactory = (errors: ClassValidationError[]) => {
  const details = errors.reduce<ValidationShape>((accumulator, error) => {
    accumulator[error.property] = firstConstraint(error);
    return accumulator;
  }, {});

  return new ValidationError(details);
};

export const dtoValidationPipe = (expectedType: Type<object>) =>
  new ValidationPipe({
    exceptionFactory: validationExceptionFactory,
    expectedType,
    transform: true,
    whitelist: true
  });

const validateDto = <T extends object>(Dto: new () => T, payload: unknown): T => {
  if (!isRecord(payload)) {
    throw new ValidationError({ body: 'Request body must be an object' });
  }

  const dto = plainToInstance(Dto, payload);
  const errors = validateSync(dto, {
    forbidUnknownValues: true,
    whitelist: true
  });

  if (errors.length > 0) {
    throw validationExceptionFactory(errors);
  }

  return dto;
};

export interface ContactPayload {
  name: string;
  contact: string;
  email_address: string;
  picture: string;
  created_by?: string;
}

export class ContactPayloadDto implements ContactPayload {
  @trim()
  @IsString({ message: 'name is required and must be a string' })
  @MinLength(6, { message: 'name must contain more than 5 characters' })
  name!: string;

  @trim()
  @IsString({ message: 'contact is required and must be a string' })
  @Matches(phoneRegex, { message: 'contact must contain exactly 9 digits' })
  contact!: string;

  @trim()
  @IsString({ message: 'email_address is required and must be a string' })
  @IsEmail({}, { message: 'email_address must be a valid email' })
  email_address!: string;

  @trim()
  @IsString({ message: 'picture is required and must be a string' })
  @IsNotEmpty({ message: 'picture is required' })
  @IsUrl({}, { message: 'picture must be a valid URL' })
  picture!: string;

  @trim()
  @IsOptional()
  @IsString({ message: 'created_by must be a string' })
  @IsNotEmpty({ message: 'created_by must be a non-empty string' })
  created_by?: string;
}

export interface UserPayload {
  name: string;
  password: string;
  role?: Role;
}

export interface UserUpdatePayload {
  name: string;
  password?: string;
  role?: Role;
}

export class UserPayloadDto implements UserPayload {
  @trim()
  @IsString({ message: 'name is required and must be a string' })
  @IsNotEmpty({ message: 'name is required' })
  name!: string;

  @IsString({ message: 'password is required and must be a string' })
  @Length(6, 128, { message: 'password must contain at least 6 characters' })
  password!: string;

  @IsOptional()
  @IsEnum(Role, { message: 'role must be basic or admin' })
  role: Role = Role.Basic;
}

export class UserUpdatePayloadDto implements UserUpdatePayload {
  @trim()
  @IsString({ message: 'name is required and must be a string' })
  @IsNotEmpty({ message: 'name is required' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'password must be a string' })
  @Length(6, 128, { message: 'password must contain at least 6 characters' })
  password?: string;

  @IsOptional()
  @IsEnum(Role, { message: 'role must be basic or admin' })
  role: Role = Role.Basic;
}

export class CredentialsPayloadDto {
  @trim()
  @IsString({ message: 'name is required and must be a string' })
  @IsNotEmpty({ message: 'name is required' })
  name!: string;

  @IsString({ message: 'password is required and must be a string' })
  @IsNotEmpty({ message: 'password is required' })
  password!: string;
}

export class RefreshPayloadDto {
  @trim()
  @IsString({ message: 'refresh_token is required and must be a string' })
  @IsNotEmpty({ message: 'refresh_token is required' })
  refresh_token!: string;
}

export interface ContactUniqueLookup {
  findByContact(contact: string): Promise<Contact | null>;
  findByEmailAddress(emailAddress: string): Promise<Contact | null>;
}

export const validateContactUniqueness = async (
  payload: ContactPayload,
  contacts: ContactUniqueLookup,
  currentContactId?: string
) => {
  const [contactMatch, emailMatch] = await Promise.all([
    contacts.findByContact(payload.contact),
    contacts.findByEmailAddress(payload.email_address)
  ]);

  const errors: ValidationShape = {};

  if (contactMatch && contactMatch.id !== currentContactId) {
    errors.contact = 'contact is already in use';
  }

  if (emailMatch && emailMatch.id !== currentContactId) {
    errors.email_address = 'email_address is already in use';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
};

export const validateContactPayload = (payload: unknown): ContactPayload =>
  validateDto(ContactPayloadDto, payload);

export const validateUserPayload = (payload: unknown): UserPayload =>
  validateDto(UserPayloadDto, payload);

export const validateCredentialsPayload = (payload: unknown) =>
  validateDto(CredentialsPayloadDto, payload);

export const validateRefreshPayload = (payload: unknown) => validateDto(RefreshPayloadDto, payload);
