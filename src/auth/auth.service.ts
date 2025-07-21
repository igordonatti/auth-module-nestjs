/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserPayload } from './models/UserPayload';
import { UserToken } from './models/UserToken';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  login(user: User): UserToken {
    // Transforma o user em um JWT
    const payload: UserPayload = {
      sub: user.id,
      email: user.email,
    };

    const jwtToken = this.jwtService.sign(payload);

    return {
      ...user,
      access_token: jwtToken,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (user) {
      // Checar se a senha informada corresponde a hash que está no banco
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        return {
          ...user,
          password: undefined,
        };
      }
    }

    // Se chegar aqui, significa que não encontrou um user e/ou a senha não corresponde
    throw new Error('Email address or password provided is incorrect.');
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async validateToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      return decoded;
    } catch (error) {
      throw new UnauthorizedException('Token Inválido');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);

    if (!user) throw new NotFoundException(`No user found for email: ${email}`);
    await this.emailService.sendResetPasswordLink(email);
  }

  async resetPassword(token: string, password: string) {
    const email = await this.emailService.decodeConfirmationToken(token);
    const user = await this.userService.findByEmail(email);

    if (!user) throw new NotFoundException('User not found');
    const response = await this.userService.updatePassword(email, password);
    return response;
  }
}
