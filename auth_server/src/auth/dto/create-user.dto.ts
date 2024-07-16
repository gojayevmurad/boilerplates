import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { DTO_MESSAGES } from 'src/constants/messages/dto';
import { strongPasswordOptions } from 'src/constants/validation';

export class CreateUserDto {
  @IsString({
    message: DTO_MESSAGES.IS_STRING('Name'),
  })
  @IsNotEmpty({
    message: DTO_MESSAGES.IS_NOT_EMPTY('Name'),
  })
  name: string;

  @IsString({
    message: DTO_MESSAGES.IS_STRING('Email'),
  })
  @IsNotEmpty({
    message: DTO_MESSAGES.IS_NOT_EMPTY('Email'),
  })
  @IsEmail()
  email: string;

  @IsString({
    message: DTO_MESSAGES.IS_STRING('Surname'),
  })
  @IsNotEmpty({
    message: DTO_MESSAGES.IS_NOT_EMPTY('Surname'),
  })
  surname: string;

  @IsDateString()
  @IsNotEmpty({
    message: DTO_MESSAGES.IS_NOT_EMPTY('Birth date'),
  })
  birthDate: Date;

  @IsStrongPassword(strongPasswordOptions)
  password: string;
}
