import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';
import { DTO_MESSAGES } from 'src/constants/messages/dto';
import { strongPasswordOptions } from 'src/constants/validation';

export class ChangePasswordDto {
  @IsString({
    message: DTO_MESSAGES.IS_STRING('Current password'),
  })
  @IsNotEmpty({
    message: DTO_MESSAGES.IS_NOT_EMPTY('Current password'),
  })
  password: string;

  @IsStrongPassword(strongPasswordOptions)
  newPassword: string;
}
