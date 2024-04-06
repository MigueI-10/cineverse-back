import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @UseGuards(AuthGuard) 
  @Post()
  create(@Body() createMediaDto: CreateMediaDto) {
    return this.mediaService.create(createMediaDto);
  }

  @Get()
  findAll() {
    return this.mediaService.findAll();
  }


  @Get('/films')
  findAllFilms() {
    return this.mediaService.findAllFilmList();
  }

 
  @Get('/series')
  findAllSeries() {
    return this.mediaService.findAllSeriesList();
  }

  @Get('/byYear')
  filterByYear(@Query('year') year: number,) {
    return this.mediaService.filterByYear(year);
  }

  @Get('/byPoints')
  filterByPoints(
    @Query('points') points: number,
    @Query('filter') filter?: string ) {
    return this.mediaService.filterByPoints(points, filter);
  }

  @Get('average/:id')
  findTheAverage(@Param('id') id: string) {
    return this.mediaService.updateMoviePoints(id);
  }

  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  

  @Get(':id/comments')
  findCommentsFromFilm(@Param('id') id: string) {
    return this.mediaService.getCommentsFromFilms(id);
  }

  @UseGuards(AuthGuard) 
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMediaDto: UpdateMediaDto) {
    return this.mediaService.update(id, updateMediaDto);
  }

  @UseGuards(AuthGuard) 
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}
