import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AccessTokenGuard } from 'src/core/guards/access-token.guard';
import { User } from 'src/core/decorators/user.decorator';
import { ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get()
  @UseGuards(AccessTokenGuard)
  async getProfile(@User('id') userId: string) {
    const userData = await this.userService.findOne(userId);

    if (userData.picture) {
      //TODO: change to env variable
      userData.picture = `http://localhost:3000/api/files/${userData.picture}`;
    }

    delete userData.password;
    delete userData.token;

    return userData;
  }
}
