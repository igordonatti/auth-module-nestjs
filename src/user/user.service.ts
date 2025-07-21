import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/databases/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async createUser(email: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    const data = {
      email,
      password: await bcrypt.hash(password, 10),
    };

    const user = await this.prisma.user.create({
      data,
    });

    return {
      ...user,
      password: undefined,
      message: 'User created successfully',
    };
  }

  async updatePassword(email: string, password: string) {
    const user = await this.prisma.user.update({
      where: { email },
      data: {
        password: await bcrypt.hash(password, 10),
        resetToken: null,
      },
    });

    return {
      ...user,
      password: undefined,
    };
  }
}
