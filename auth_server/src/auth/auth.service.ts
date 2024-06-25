import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { IGlobalResponse } from 'src/models/common';
import { MailService } from 'src/mail/mail.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async createOrUpdateSession(userId: string, token: string) {
    return await this.prismaService.session.upsert({
      where: {
        id: userId,
      },
      update: {
        token,
      },
      create: {
        token,
        userId,
      },
    });
  }

  async signup(createUserDto: CreateUserDto): Promise<IGlobalResponse> {
    const isUserExist = await this.userService.findByEmail(createUserDto.email);

    if (isUserExist) {
      throw new BadRequestException('Bad credentials');
    }

    const hashed = await bcrypt.hash(createUserDto.password, 12);

    const user = await this.prismaService.user.create({
      data: { ...createUserDto, password: hashed },
    });

    const confirmationToken = await this.jwtService.signAsync(
      {
        id: user.id,
      },
      {
        expiresIn: '1d',
        secret: 'email-verification-secret',
      },
    );

    await this.prismaService.confirmationToken.create({
      data: {
        token: confirmationToken,
        userId: user.id,
      },
    });

    await this.mailService.sendUserConfirmation(
      createUserDto.name,
      createUserDto.email,
      confirmationToken,
    );

    return {
      code: HttpStatus.CREATED,
      message: 'Success',
    };
  }

  async login(loginUserDto: LoginUserDto): Promise<IGlobalResponse> {
    const isUserExist = await this.prismaService.user.findUnique({
      where: {
        email: loginUserDto.email,
      },
      select: {
        id: true,
        isVerified: true,
        birthDate: true,
        email: true,
        name: true,
        password: true,
        surname: true,
        isBlocked: true,
      },
    });

    if (!isUserExist) {
      throw new BadRequestException({
        message: 'Bad credentials',
        code: HttpStatus.BAD_REQUEST,
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      loginUserDto.password,
      isUserExist.password,
    );

    if (!isPasswordCorrect) {
      throw new BadRequestException({
        code: HttpStatus.BAD_REQUEST,
        message: 'Bad credentials',
      });
    }

    if (isUserExist.isBlocked) {
      throw new BadRequestException({
        message: 'User is blocked',
        code: HttpStatus.BAD_REQUEST,
      });
    }

    if (!isUserExist.isVerified) {
      throw new BadRequestException({
        code: HttpStatus.BAD_REQUEST,
        message: 'Email is not verified',
      });
    }

    const token = await this.jwtService.signAsync({ id: isUserExist.id });

    await this.createOrUpdateSession(isUserExist.id, token);

    delete isUserExist.password;
    delete isUserExist.isVerified;
    delete isUserExist.isBlocked;

    return {
      code: HttpStatus.OK,
      message: 'Success',
      user: isUserExist,
      access_token: token,
    };
  }

  async signout(token: string): Promise<IGlobalResponse> {
    const isSessionExist = await this.prismaService.session.findFirst({
      where: {
        token,
      },
    });

    if (!isSessionExist) {
      throw new BadRequestException('Bad credentials');
    }

    await this.prismaService.session.delete({
      where: {
        id: isSessionExist.id,
      },
    });

    return {
      code: HttpStatus.OK,
      message: 'Successfully signed out',
    };
  }

  forgotPassword() {}

  resetPassword() {}

  async changePassword(
    changePasswordDto: ChangePasswordDto,
    id: string,
  ): Promise<IGlobalResponse> {
    const isUserExist = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });

    if (!isUserExist) {
      throw new BadRequestException('Bad credentials');
    }

    const isPasswordCorrect = await bcrypt.compare(
      changePasswordDto.password,
      isUserExist.password,
    );

    if (!isPasswordCorrect) {
      throw new BadRequestException({
        code: HttpStatus.BAD_REQUEST,
        message: 'Bad credentials',
        errors: {
          password: 'Password is incorrect',
        },
      });
    }

    const hashed = await bcrypt.hash(changePasswordDto.newPassword, 12);

    await this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        password: hashed,
      },
    });

    return {
      code: HttpStatus.CREATED,
      message: 'Success',
    };
  }

  async verifyEmail(token: string) {
    const isTokenExist = this.prismaService.confirmationToken.findFirst({
      where: {
        token,
      },
    });

    if (!isTokenExist) {
      throw new BadRequestException('Invalid token');
    }

    let decoded;

    try {
      decoded = await this.jwtService.verifyAsync(token, {
        secret: 'email-verification-secret',
      });
    } catch {
      throw new BadRequestException('Invalid token');
    }

    const user = await this.prismaService.user.update({
      where: {
        id: decoded.id,
      },
      data: {
        isVerified: true,
      },
      select: {
        id: true,
        isVerified: true,
        birthDate: true,
        email: true,
        name: true,
        password: true,
        surname: true,
        isBlocked: true,
      },
    });

    const access_token = await this.jwtService.signAsync({ id: user.id });

    await this.createOrUpdateSession(user.id, access_token);

    await this.prismaService.confirmationToken.delete({
      where: {
        token,
      },
    });

    return {
      code: HttpStatus.OK,
      message: 'Success',
      user,
      access_token,
    };
  }

  async resendVerificationEmail(email: string): Promise<IGlobalResponse> {
    const isUserExist = await this.prismaService.user.findUnique({
      where: {
        email,
      },
      select: {
        isVerified: true,
        id: true,
        name: true,
      },
    });

    if (!isUserExist) {
      throw new BadRequestException('Bad credentials');
    }

    if (isUserExist.isVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const confirmationToken = await this.jwtService.signAsync(
      {
        id: isUserExist.id,
      },
      {
        expiresIn: '1d',
        secret: 'email-verification-secret',
      },
    );

    const isTokenExist = await this.prismaService.confirmationToken.findFirst({
      where: {
        userId: isUserExist.id,
      },
      select: {
        id: true,
        updatedAt: true,
      },
    });

    const ONE_HOUR = 60000 * 60;
    if (
      isTokenExist &&
      new Date().getTime() - isTokenExist.updatedAt.getTime() < ONE_HOUR
    ) {
      throw new BadRequestException('Email limited to once per hour');
    }

    if (isTokenExist) {
      await this.prismaService.confirmationToken.update({
        where: {
          id: isTokenExist.id,
        },
        data: {
          token: confirmationToken,
        },
      });
    } else {
      await this.prismaService.confirmationToken.create({
        data: {
          token: confirmationToken,
          userId: isUserExist.id,
        },
      });
    }

    await this.mailService.sendUserConfirmation(
      isUserExist.name,
      email,
      confirmationToken,
    );

    return {
      code: HttpStatus.OK,
      message: 'Verification email has been sent',
    };
  }

  sendPasswordResetEmail() {}

  updateProfile() {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateEmail(newEmail: string): IGlobalResponse {
    return {
      code: 200,
      message: 'Success',
      hello: 'world',
    };
  }
}
