import { IsStrongPasswordOptions } from 'class-validator';

export const strongPasswordOptions: IsStrongPasswordOptions = {
  minLength: 6,
  minLowercase: 0,
  minNumbers: 0,
  minSymbols: 0,
  minUppercase: 0,
};
