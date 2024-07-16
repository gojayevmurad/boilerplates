import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IGlobalResponse } from 'src/models/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AUTH_MESSAGES } from 'src/constants/messages/auth';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { TokenType } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<IGlobalResponse> {
    const isUserExists = await this.prismaService.user.findUnique({
      where: {
        email: createUserDto.email,
      },
      select: {
        id: true,
      },
    });

    if (isUserExists) {
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

  async login(loginUserDto: LoginUserDto): Promise<IGlobalResponse> {
    const isUserExists = await this.prismaService.user.findUnique({
      where: {
        email: loginUserDto.email,
      },
    });

    if (!isUserExists) {
      throw new ConflictException(AUTH_MESSAGES.INVALID_CREDS);
    }

    const isPasswordMatched = await bcrypt.compare(
      loginUserDto.password,
      isUserExists.password,
    );

    if (!isPasswordMatched) {
      await this.prismaService.loginAttempt.create({
        data: {
          success: false,
          browser: '',
          ip: '',
          password: '',
          userId: isUserExists.id,
        },
      });

      throw new ConflictException(AUTH_MESSAGES.INVALID_CREDS);
    }

    if (isUserExists.isBlocked) {
      throw new ConflictException(AUTH_MESSAGES.USER_BLOCKED);
    }

    if (!isUserExists.isVerified) {
      throw new ConflictException(AUTH_MESSAGES.EMAIL_NOT_VERIFIED);
    }

    const candidateToken = await this.jwtService.signAsync({
      userId: isUserExists.id,
    });

    const createdToken = await this.prismaService.token.create({
      data: {
        token: candidateToken,
        userId: isUserExists.id,
        type: TokenType.ACCESS,
      },
    });

    delete isUserExists.isBlocked;
    delete isUserExists.isVerified;
    delete isUserExists.id;
    delete isUserExists.password;
    delete isUserExists.updatedAt;

    return {
      code: 200,
      message: 'User logged in',
      data: {
        token: createdToken.token,
        user: isUserExists,
      },
    };
  }

  async logout(token: string): Promise<IGlobalResponse> {
    const isTokenExists = await this.prismaService.token.findUnique({
      where: {
        token,
        type: TokenType.ACCESS,
      },
    });

    if (!isTokenExists) {
      throw new ConflictException(AUTH_MESSAGES.INVALID_CREDS);
    }

    await this.prismaService.token.delete({
      where: {
        id: isTokenExists.id,
      },
    });

    return {
      code: 200,
      message: 'User logged out',
    };
  }

  async forgotPassword(email: string): Promise<IGlobalResponse> {
    const isUserExists = await this.prismaService.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!isUserExists) {
      throw new ConflictException(AUTH_MESSAGES.USER_NOT_FOUND);
    }

    // generate token
    const candidateForgotPasswordToken = await this.jwtService.signAsync(
      {
        userId: isUserExists.id,
      },
      {
        secret: process.env.FORGOT_PASSWORD_SECRET,
        expiresIn: process.env.FORGOT_PASSWORD_EXPIRATION_TIME,
      },
    );

    // save token in db

    const createdForgotPasswordToken = await this.prismaService.token.create({
      data: {
        token: candidateForgotPasswordToken,
        userId: isUserExists.id,
        type: TokenType.FORGOT_PASSWORD,
      },
      select: {
        token: true,
      },
    });

    // send reset password email

    await this.mailService.sendForgotPasswordMail(
      isUserExists.email,
      createdForgotPasswordToken.token,
    );

    return {
      code: 200,
      message: AUTH_MESSAGES.FORGOT_PASSWORD_EMAIL_SENT,
    };
  }

  async resetPassword(
    token: string,
    password: string,
  ): Promise<IGlobalResponse> {
    const isTokenExists = await this.prismaService.token.findUnique({
      where: {
        token,
        type: TokenType.FORGOT_PASSWORD,
      },
    });

    if (!isTokenExists) {
      throw new NotFoundException(AUTH_MESSAGES.INVALID_TOKEN);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prismaService.$transaction([
      this.prismaService.token.delete({
        where: {
          id: isTokenExists.id,
        },
      }),
      this.prismaService.user.update({
        where: {
          id: isTokenExists.userId,
        },
        data: {
          password: hashedPassword,
        },
      }),
    ]);

    return {
      code: 200,
      message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESS,
    };
  }

  async verifyEmail(token: string): Promise<IGlobalResponse> {
    const isTokenExists = await this.prismaService.token.findUnique({
      where: {
        token,
        type: TokenType.EMAIL_VERIFICATION,
      },
    });

    if (!isTokenExists) {
      throw new NotFoundException(AUTH_MESSAGES.INVALID_TOKEN);
    }

    await this.prismaService.$transaction([
      this.prismaService.token.delete({
        where: {
          token,
          type: TokenType.EMAIL_VERIFICATION,
        },
      }),
      this.prismaService.user.update({
        where: {
          id: isTokenExists.userId,
        },
        data: {
          isVerified: true,
        },
      }),
    ]);

    return {
      code: 200,
      message: AUTH_MESSAGES.VERIFY_EMAIL_SUCCESS,
    };
  }

  resendVerificationEmail() {
    // check if user exists
    // generate token
    // send verification email
    // return response
  }

  changePassword() {
    // check if user exists
    // update password
    // return response
  }

  changeEmail() {
    // check if user exists
    // update email
    // return response
  }
}
