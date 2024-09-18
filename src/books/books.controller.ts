import { Controller, Get, Post, Put, Delete, Param, Body, Patch, Query } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { Book } from './books.entity';
import { UpdateBookDto } from './dto/update-book.dto';
import e from 'express';
import { Author } from 'src/authors/authors.entity';

@Controller('books')
export class BooksController {
    constructor(private readonly booksService: BooksService) {}

    // CREATE BOOK
    // /books (POST)
    @Post()
    async createBook(@Body() createBookDto: CreateBookDto): Promise<Book> {
        return this.booksService.createBook(createBookDto);
    }

    // ADD AUTHOR TO BOOK
    // /books/add-author?bookId={bookId}&authorId={authorId} (POST)
    @Post('add-author')
    async addAuthor(
        @Query('bookId') bookId: string,
        @Query('authorId') authorId: string
    ): Promise<Book> {
        return this.booksService.addAuthor(bookId, authorId);
    }

    // REMOVE AUTHOR FROM BOOK
    // /books/remove-author?bookId={bookId}&authorId={authorId} (DELETE)
    @Delete('remove-author')
    async removeAuthor(
        @Query('bookId') bookId: string,
        @Query('authorId') authorId: string
    ): Promise<Book> {
        return this.booksService.removeAuthor(bookId, authorId);
    }

    // GET ALL BOOKS
    // /books (GET)
    @Get()
    async getBooks(@Query('authorId') authorId?: string): Promise<Book[]> {
        if (authorId) {
            return this.booksService.getBooksByAuthorId(authorId);
        }
        return this.booksService.getAllBooks();
    }

    // GET BOOK BY ID
    // /books/:id (GET)
    @Get(':id')
    async getBookById(@Param('id') id: string): Promise<Book> {
        return this.booksService.getBookById(id);
    }

    // UPDATE A BOOK BY ID
    // /books/:id (PUT)
    @Patch(':id')
    async updateBook(
        @Param('id') id: string,
        @Body() updateBookDto: UpdateBookDto
    ): Promise<Book> {
        return this.booksService.updateBook(id, updateBookDto);
    }

    // GET ALL AUTHORS BY BOOK ID
    @Get(':id/authors')
    async getAllAuthorsByBookId(@Param('id') bookId: string): Promise<Author[]> {
        return this.booksService.getAuthorsByBookId(bookId);
    }

    // DELETE BOOK BY ID
    // /books/:id (DELETE)
    @Delete(':id')
    async deleteBook(@Param('id') id: string): Promise<void> {
        await this.booksService.deleteBook(id);
    }
}
