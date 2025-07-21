import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { isPublic } from 'src/auth/decorators/is-public.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('findByEmail')
  findByEmail(@Body('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @isPublic()
  @Post()
  createUser(@Body() user: { email: string; password: string }) {
    return this.userService.createUser(user.email, user.password);
  }
}
