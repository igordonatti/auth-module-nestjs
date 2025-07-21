import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  private sendEmail(params: { to: string; subject: string; text: string }) {
    try {
      const from = `${this.configService.get('MAILGUN_FROM')}`;
      this.logger.log(`Email sent out to `, params.to);

      const sendMailParams = {
        to: params.to,
        from,
        subject: params.subject,
        text: params.text,
      };

      return this.mailerService.sendMail(sendMailParams);
    } catch (error) {
      this.logger.log('Error email sent out to ', params.to, ':', error);
    }
  }

  async sendResetPasswordLink(email: string): Promise<any> {
    const payload = { email };

    try {
      const token = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: `${this.configService.get('JWT_VERIFICATION_TOKEN_EXPIRATION_TIME')}s`,
      });
      // await this.userService .updateResetTokenUser(email, token);

      const url = `${this.configService.get('EMAIL_RESET_PASSWORD_URL')}?token=${token}`;
      const text = `Hi, \nTo reset your password, click here: ${url}`;

      return this.sendEmail({
        to: email,
        subject: 'Reset password',
        text,
      });
    } catch (error) {
      this.logger.log('Incapaz de gerar token para usuario: ', error);
    }
  }

  async decodeConfirmationToken(token: string): Promise<string> {
    try {
      const payload: { email: string } = await this.jwtService.verify(token);

      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }
      throw new BadRequestException();
    } catch (error) {
      if (error === 'TokenExpiredError') {
        throw new BadRequestException('Email confirmation token expired.');
      }
      throw new BadRequestException('Bad confirmation token.');
    }
  }
}
