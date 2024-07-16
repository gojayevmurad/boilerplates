import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from './auth.guard';

import { Request } from 'express';
import { ChangePasswordDto } from './dto/change-password.dto';
import { extractTokenFromHeader } from 'src/utils/common';
import { checkEnv } from 'src/utils/check-env';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Post('register')
  // register(@Body() createUserDto: CreateUserDto) {
  //   return this.authService.signup(createUserDto);
  // }

  // @Post('login')
  // @HttpCode(HttpStatus.OK)
  // login(@Body() loginUserDto: LoginUserDto) {
  // }

  // @UseGuards(AuthGuard)
  // @Post('signout')
  // signout(@Req() req: Request) {
  //   const token = extractTokenFromHeader(req);
  // }

  // @UseGuards(AuthGuard)
  // @Put('change-password')
  // changePassword(
  //   @Body() changePasswordDto: ChangePasswordDto,
  //   @Req() req: Request,
  // ) {
  // }

  // @UseGuards(AuthGuard)
  // @Put('update-email')
  // updateEmail(@Body('email') email: string) {
  // }

  // @Get('verify-email/:token')
  // verifyEmail(@Param('token') token: string) {
  // }

  // @Post('resend-verification-email')
  // resendVerificationEmail(@Body('email') email: string) {
  // }
}
