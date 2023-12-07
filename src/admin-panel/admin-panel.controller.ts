import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { Role } from 'src/core/decorators/role.decorator';
import { Roles } from 'src/core/enums/roles.enum';
import { AccessTokenGuard } from 'src/core/guards/access-token.guard';
import { RoleGuard } from 'src/core/guards/role.guard';
import { AdminPanelService } from './admin-panel.service';
import { UserService } from 'src/user/user.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('admin-panel')
@Controller('admin-panel')
export class AdminPanelController {
  constructor(
    private readonly adminPanelService: AdminPanelService,
    private readonly userService: UserService,
  ) {}

  @Get('user')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Role(Roles.ADMIN)
  async getAllUsers() {
    return this.userService.getAll();
  }

  @Delete('post/:id')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Role(Roles.ADMIN)
  async deletePost(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.adminPanelService.deletePost(id, reason);
  }

  @Delete('article/:id')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Role(Roles.ADMIN)
  async deleteArticle(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.adminPanelService.deleteArticle(id, reason);
  }

  // @UseGuards(AccessTokenGuard, RoleGuard)
  // @Role(Roles.ADMIN)
  // async updateUser
}
