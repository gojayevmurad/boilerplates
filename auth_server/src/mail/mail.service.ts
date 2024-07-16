import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmailVerificationMail(name: string, email: string, token: string) {
    const url = `http://localhost:5555/auth/verification/${token}`;

    await this.mailerService.sendMail({
      // to: createUserDto.email,
      to: email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Welcome to Nice App! Confirm your Email',
      template: './confirmation', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        user_name: name,
        next_step_link: url,
      },
    });
  }
}
