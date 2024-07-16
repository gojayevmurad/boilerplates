import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { DTO_MESSAGES } from 'src/constants/messages/dto';

export class LoginUserDto {
  @IsEmail(null, {
    message: DTO_MESSAGES.IS_EMAIL('Email'),
  })
  @IsString({
    message: DTO_MESSAGES.IS_STRING('Email'),
  })
  @IsNotEmpty({
    message: DTO_MESSAGES.IS_NOT_EMPTY('Email'),
  })
  email: string;

  @IsString({
    message: DTO_MESSAGES.IS_STRING('Password'),
  })
  @IsNotEmpty({
    message: DTO_MESSAGES.IS_NOT_EMPTY('Password'),
  })
  password: string;
}
