import { Controller, Get, Post, Put, Delete, Param, Body, Patch, Query } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { AuthorsService } from './authors.service';

@Controller('authors')
export class AuthorsController {
    constructor(
        private readonly authorsService: AuthorsService) {}

    // CREATE AUTHOR
    // /authors (POST)
    @Post()
    async createAuthor(@Body() createAuthorDto: CreateAuthorDto) {
        try {
            return await this.authorsService.createAuthor(createAuthorDto);
        } catch (error) {
            throw error;
        }
    }

    // GET ALL AUTHORS
    // /authors (GET)
    @Get()
    async getAllAuthors() {
        return this.authorsService.getAllAuthors();
    }

    // GET BOOKS BY AUTHOR ID
    // /authors/{id}/books (GET)
    @Get(':id/books')
    async getBooksByAuthorId(@Param('id') authorId: string) {
        try {
            return await this.authorsService.getBooksByAuthorId(authorId);
        } catch (error) {
            throw error;
        }
    }

    // GET AUTHOR BY ID
    // /authors/{id} (GET)
    @Get(':id')
    async getAuthorById(@Param('id') id: string) {
        try {
            return await this.authorsService.getAuthorById(id);
        } catch (error) {
            throw error;
        }
    }

    // UPDATE AUTHOR BY ID
    // /authors/{id} (PATCH)
    @Patch(':id')
    async updateAuthorById(
        @Param('id') id: string, 
        @Body() updateAuthorDto: UpdateAuthorDto
    ) {
        try {
            return await this.authorsService.updateAuthorById(id, updateAuthorDto);
        } catch (error) {
            throw error;
        }
    }

    // DELETE AUTHOR BY ID
    // /authors/{id} (DELETE)
    @Delete(':id')
    async deleteAuthorById(
        @Param('id') id: string,
        @Query('force') force: string
    ) {
        try {
            // Convert force query parameter to boolean
            const forceDelete = force === 'true';
            await this.authorsService.deleteAuthorById(id, forceDelete);
            return { message: `Author with ID ${id} deleted successfully` };
        } catch (error) {
            throw error;
        }
    }
}
