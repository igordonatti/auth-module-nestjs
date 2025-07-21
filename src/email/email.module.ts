import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  controllers: [EmailController],
  providers: [EmailService],
  imports: [
    UserModule,
    JwtModule,
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: 'smtp.mailgun.org',
          port: 587,
          secure: false,
          tls: {
            rejectUnauthorized: false,
          },
          auth: {
            user: configService.get('MAILGUN_USER'),
            pass: configService.get('MAILGUN_PASS'),
          },
        },
        defaults: {
          from: 'igordonatti.id@gmail.com',
        },
      }),
    }),
  ],
})
export class EmailModule {}
