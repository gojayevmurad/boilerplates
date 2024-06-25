import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { strongPasswordOptions } from 'src/constants/validation';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  surname: string;

  @IsDateString()
  @IsNotEmpty()
  birthDate: Date;

  @IsStrongPassword(strongPasswordOptions)
  password: string;
}
