import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { AuthorsRepository } from './authors.repository';
import { Author } from './authors.entity';
import { BooksRepository } from 'src/books/books.repository';
import { Book } from 'src/books/books.entity';

@Injectable()
export class AuthorsService {
    constructor(
        private readonly authorsRepository: AuthorsRepository,
        private readonly booksRepository: BooksRepository
    ) {}
    
    // CREATE AUTHOR
    async createAuthor(createAuthorDto: CreateAuthorDto): Promise<Author> {
        const newAuthor: Author = {
            id: Date.now().toString(),
            name: createAuthorDto.name,
            biography: createAuthorDto.biography,
            bookIds: [],
        };
        
        return this.authorsRepository.create(newAuthor);
    }
  
    // GET ALL AUTHORS
    getAllAuthors() {
        return this.authorsRepository.findAll();
    }

    // GET ALL BOOKS BY THE AUTHOR
    async getBooksByAuthorId(authorId: string) : Promise<Book[]> {
        const author = await this.authorsRepository.findById(authorId);

        if (!author) {
          throw new NotFoundException(`Author with ID ${authorId} not found`);
        }

        return this.booksRepository.findByAuthorId(authorId);
    }

    // GET AUTHOR BY ID
    async getAuthorById(id: string): Promise<Author> {
        const author = await this.authorsRepository.findById(id);

        if (!author) {
          throw new NotFoundException(`Author with ID ${id} not found`);
        }

        return author;
    }

    // UPDATE AUTHOR BY ID
    async updateAuthorById(id: string, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
        const existingAuthor = await this.authorsRepository.findById(id);
        
        if (!existingAuthor) {
            throw new NotFoundException(`Author with ID ${id} not found`);
        }
    
        const updatedAuthor: Author = {
            id: existingAuthor.id,
            name: updateAuthorDto.name ?? existingAuthor.name,
            biography: updateAuthorDto.biography ?? existingAuthor.biography,
            bookIds: existingAuthor.bookIds, // Preserve existing bookIds
        };
    
        return this.authorsRepository.update(id, updatedAuthor);
    }
    
    // DELETE AUTHOR BY ID
    async deleteAuthorById(id: string, force: boolean): Promise<void> {
        const existingAuthor = await this.authorsRepository.findById(id);
    
        if (!existingAuthor) {
            throw new NotFoundException(`Author with ID ${id} not found`);
        }
    
        // Get all books of the author
        const books = await this.booksRepository.findByAuthorId(id);
    
        if (force) {
            // FORCED: delete all books if they have only one author (which is the author being deleted)
            for (const book of books) {
                if (book.authorIds.length === 1) {
                    await this.booksRepository.delete(book.id);
                } else {
                    book.authorIds = book.authorIds.filter(authorId => authorId !== id);
                    await this.booksRepository.update(book.id, book);
                }
            }
        } else {
            // NOT FORCED: throw an error if any book has only one author
            for (const book of books) {
                if (book.authorIds.length === 1) {
                    throw new ConflictException(`Cannot delete author with ID ${id} as there are books with only this author`);
                }
            }
    
            // Remove the author from the remaining books
            for (const book of books) {
                book.authorIds = book.authorIds.filter(authorId => authorId !== id);
                await this.booksRepository.update(book.id, book);
            }
        }
    
        return this.authorsRepository.delete(id);
    }
}
