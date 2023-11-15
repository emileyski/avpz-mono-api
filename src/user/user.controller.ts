import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AccessTokenGuard } from 'src/core/guards/access-token.guard';
import { User } from 'src/core/decorators/user.decorator';
import { ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Public } from 'src/core/decorators/public.decorator';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Get()
  getAllUsers(
    @Query('name') name?: string,
    @Query('nickname') nickname?: string,
  ) {
    return this.userService.getAll(name, nickname);
  }

  @Public()
  @Get('random')
  getRandomUsers(@Query('count') count?: number) {
    return this.userService.getRandomUsers(count);
  }

  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get('profile')
  @UseGuards(AccessTokenGuard)
  async getProfile(@User('id') userId: string) {
    const userData = await this.userService.findOne(userId);

    if (userData.picture) {
      const API_URL = process.env.API_URL || 'http://localhost:3000';
      userData.picture = `${API_URL}/api/files/${userData.picture}`;
    }

    delete userData.password;
    delete userData.token;

    return userData;
  }
}
