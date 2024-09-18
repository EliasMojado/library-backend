import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { AuthorsRepository } from 'src/authors/authors.repository';
import { BooksRepository } from './books.repository';

@Module({
  providers: [BooksService, BooksRepository, AuthorsRepository],
  controllers: [BooksController]
})
export class BooksModule {}
