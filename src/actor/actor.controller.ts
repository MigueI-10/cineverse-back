import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ActorService } from './actor.service';
import { CreateActorDto } from './dto/create-actor.dto';
import { UpdateActorDto } from './dto/update-actor.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('actor')
export class ActorController {
  constructor(private readonly actorService: ActorService) {}

  @UseGuards(AuthGuard) 
  @Post()
  create(@Body() createActorDto: CreateActorDto) {
    return this.actorService.create(createActorDto);
  }

  @Get()
  findAll() {
    return this.actorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.actorService.findOne(id);
  }

  @UseGuards(AuthGuard) 
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateActorDto: UpdateActorDto) {
    return this.actorService.update(id, updateActorDto);
  }

  @UseGuards(AuthGuard) 
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.actorService.remove(id);
  }
}
