import { Module } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { AuthorsController } from './authors.controller';
import { AuthorsRepository } from './authors.repository';
import { BooksRepository } from 'src/books/books.repository';

@Module({
  providers: [AuthorsService, AuthorsRepository, BooksRepository],
  controllers: [AuthorsController]
})
export class AuthorsModule {}
