import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { IGlobalResponse } from 'src/models/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AUTH_MESSAGES } from 'src/constants/messages/auth';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async signup(createUserDto: CreateUserDto): Promise<IGlobalResponse> {
    const isUserExist = await this.prismaService.user.findUnique({
      where: {
        email: createUserDto.email,
      },
      select: {
        id: true,
      },
    });

    if (isUserExist) {
      throw new ConflictException(AUTH_MESSAGES.USER_ALREADY_EXISTS);
    }

    const user = await this.prismaService.user.create({
      data: createUserDto,
    });

    const emailVerificationToken = await this.jwtService.signAsync(
      {
        userId: user.id,
      },
      {
        expiresIn: process.env.EMAIL_VERIFICATION_EXPIRATION_TIME,
      },
    );

    await this.mailService.sendEmailVerificationMail(
      createUserDto.name,
      createUserDto.email,
      emailVerificationToken,
    );

    return {
      code: 200,
      message: AUTH_MESSAGES.VERIFICATION_EMAIL_SENT,
    };
  }

  login() {}

  logout() {}
  forgotPassword() {}
  resetPassword() {}
  verifyEmail() {}
  resendVerificationEmail() {}
  changePassword() {}
  changeEmail() {}
}
