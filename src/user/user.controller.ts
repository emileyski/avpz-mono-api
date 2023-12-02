import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AccessTokenGuard } from 'src/core/guards/access-token.guard';
import { User } from 'src/core/decorators/user.decorator';
import { ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Public } from 'src/core/decorators/public.decorator';
import { UserId } from 'src/core/decorators/user-id.decorator';
import { Genders } from 'src/core/enums/gender.enum';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'nickname', required: false })
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

  @UseGuards(AccessTokenGuard)
  @Patch('email')
  updateEmail(@UserId() userId: string, @Body('email') email: string) {
    return this.userService.updateEmail(userId, email);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('name')
  updateName(@UserId() userId: string, @Body('name') name: string) {
    return this.userService.updateName(userId, name);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('password')
  updatePassword(@UserId() userId: string, @Body('password') password: string) {
    return this.userService.updatePassword(userId, password);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('birth-date')
  updateBirthDate(
    @UserId() userId: string,
    @Body('birthDate') birthDate: string,
  ) {
    return this.userService.updateBirthDate(userId, birthDate);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('about')
  updateAbout(@UserId() userId: string, @Body('about') about: string) {
    return this.userService.updateAbout(userId, about);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('gender')
  updateGender(@UserId() userId: string, @Body('gender') gender: Genders) {
    return this.userService.updateGender(userId, gender);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('nickname')
  updateNickname(@UserId() userId: string, @Body('nickname') nickname: string) {
    return this.userService.updateNickname(userId, nickname);
  }
}
