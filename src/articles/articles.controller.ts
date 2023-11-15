import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { AccessTokenGuard } from 'src/core/guards/access-token.guard';
import { UserId } from 'src/core/decorators/user-id.decorator';
import { Public } from 'src/core/decorators/public.decorator';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  create(@Body() createArticleDto: CreateArticleDto, @UserId() userId: string) {
    // console.log(createArticleDto);
    return this.articlesService.create(createArticleDto, userId);
  }

  @Public()
  @Get()
  findAll() {
    return this.articlesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articlesService.update(+id, updateArticleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.articlesService.remove(+id);
  }
}
