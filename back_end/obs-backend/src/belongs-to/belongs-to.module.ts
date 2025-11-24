// src/belongs-to/belongs-to.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BelongsToController } from './belongs-to.controller';
import { BelongsToService } from './belongs-to.service';
import { BelongsTo } from './entities/belongs-to.entity';
import { Book } from '../book/entityies/book.entity';
import { Category } from '../category/entities/categories.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BelongsTo, Book, Category])],
  controllers: [BelongsToController],
  providers: [BelongsToService],
  exports: [BelongsToService],
})
export class BelongsToModule {}
