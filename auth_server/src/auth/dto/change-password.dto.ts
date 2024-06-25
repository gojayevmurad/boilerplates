import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';
import { strongPasswordOptions } from 'src/constants/validation';

export class ChangePasswordDto {
  @IsString({
    message: 'Current password must be a string',
  })
  @IsNotEmpty({
    message: 'Current password is required',
  })
  password: string;

  @IsStrongPassword(strongPasswordOptions)
  newPassword: string;
}
