import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ValidationPipe } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { SearchFavoriteDto } from './dto/search-favorite.dto';
import { Favorite } from './entities/favorite.entity';

@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post()
  create(@Body() createFavoriteDto: CreateFavoriteDto) {
    return this.favoriteService.create(createFavoriteDto);
  }

  @Get('')
  findAll() {
    return this.favoriteService.findAll();
  }

  @Get('filter')
  async searchMedia(@Query(ValidationPipe) searchFavoriteDto: SearchFavoriteDto): Promise<Favorite[]> {
    return this.favoriteService.searchFavorite(searchFavoriteDto);
  }

  @Get('user-favorite/:id')
  findFavoritesOfAnUser(@Param('id') id: string) {
    return this.favoriteService.findFavoritesOfAnUser(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.favoriteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFavoriteDto: UpdateFavoriteDto) {
    return this.favoriteService.update(id, updateFavoriteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.favoriteService.remove(+id);
  }
}
