import { Injectable, NotFoundException } from '@nestjs/common';
import { BooksRepository } from './books.repository';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './books.entity';
import { AuthorsRepository } from 'src/authors/authors.repository';
import { Author } from 'src/authors/authors.entity';

@Injectable()
export class BooksService {
    constructor(
        private readonly booksRepository: BooksRepository,
        private readonly authorsRepository: AuthorsRepository
    ) {}

    // CREATE BOOK
    async createBook(createBookDto: CreateBookDto): Promise<Book> {
        // First, check if all authors exist and prepare them for update
        const authors = await Promise.all(createBookDto.authorIds.map(id => this.authorsRepository.findById(id)));
        
        for (const [index, author] of authors.entries()) {
            if (!author) {
                throw new NotFoundException(`Author with ID ${createBookDto.authorIds[index]} not found`);
            }
        }

        // Create the new book
        const newBook: Book = {
            id: Date.now().toString(),
            title: createBookDto.title,
            description: createBookDto.description,
            authorIds: createBookDto.authorIds,
        };

        // Save the book first
        const savedBook = await this.booksRepository.create(newBook);

        // Update each author by adding the new book's ID to their bookIds array
        for (const authorId of createBookDto.authorIds) {
            const author = await this.authorsRepository.findById(authorId);
            if (!author) throw new NotFoundException(`Author with ID ${authorId} not found`);

            // Add the new book ID to the author's bookIds array
            author.bookIds.push(savedBook.id);

            // Update the author in the repository
            await this.authorsRepository.update(authorId, author);
        }

        return savedBook;
    }

    // ADD AUTHOR TO BOOK
    async addAuthor(bookId: string, authorId: string): Promise<Book> {
        const book = await this.booksRepository.findById(bookId);
        if (!book) throw new NotFoundException(`Book with ID ${bookId} not found`);

        const author = await this.authorsRepository.findById(authorId);
        if (!author) throw new NotFoundException(`Author with ID ${authorId} not found`);

        // Add the author to the book's authorIds if not already present
        if (!book.authorIds.includes(authorId)) {
            book.authorIds.push(authorId);
            await this.booksRepository.update(bookId, book);

            // Add the book to the author's bookIds
            author.bookIds.push(bookId);
            await this.authorsRepository.update(authorId, author);
        }

        return book;
    }

    // REMOVE AUTHOR FROM BOOK
    async removeAuthor(bookId: string, authorId: string): Promise<Book> {
        const book = await this.booksRepository.findById(bookId);
        if (!book) throw new NotFoundException(`Book with ID ${bookId} not found`);

        const author = await this.authorsRepository.findById(authorId);
        if (!author) throw new NotFoundException(`Author with ID ${authorId} not found`);

        // Ensure the book won't be left without any authors
        if (book.authorIds.length === 1 && book.authorIds.includes(authorId)) {
            throw new Error('Book cannot have no authors');
        }

        // Remove the author from the book's authorIds
        book.authorIds = book.authorIds.filter(id => id !== authorId);
        await this.booksRepository.update(bookId, book);

        // Remove the book from the author's bookIds
        author.bookIds = author.bookIds.filter(id => id !== bookId);
        await this.authorsRepository.update(authorId, author);

        return book;
    }

    // GET ALL BOOKS
    async getAllBooks(): Promise<Book[]> {
        return this.booksRepository.findAll();
    }

    // GET BOOK BY ID
    async getBookById(id: string): Promise<Book> {
        const book = await this.booksRepository.findById(id);
        if (!book) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }
        return book;
    }

    // GET BOOKS BY AUTHOR ID
    async getBooksByAuthorId(authorId: string): Promise<Book[]> {
        const author = await this.authorsRepository.findById(authorId);

        if (!author) {
            throw new NotFoundException(`Author with ID ${authorId} not found`);
        }

        return this.booksRepository.findByAuthorId(authorId);
    }

    // GET ALL AUTHORS BY BOOK ID
    async getAuthorsByBookId(bookId: string): Promise<Author[]> {
        // Find the book by its ID
        const book = await this.booksRepository.findById(bookId);

        if (!book) {
            throw new NotFoundException(`Book with ID ${bookId} not found`);
        }

        // Get author IDs from the book
        const authorIds = book.authorIds;

        // Fetch authors by IDs
        const authors = await Promise.all(authorIds.map(id => this.authorsRepository.findById(id)));

        return authors.filter(author => author !== undefined);
    }

    // UPDATE A BOOK BY ID
    async updateBook(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
        const existingBook = await this.booksRepository.findById(id);

        if (!existingBook) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }

        // Create a list of current author IDs in the existing book
        const currentAuthorIds = new Set(existingBook.authorIds);

        // Create a list of new author IDs from the update request
        const newAuthorIds = new Set(updateBookDto.authorIds ?? []);

        // Check if all authors exist
        // const authors = await Promise.all(updateBookDto.authorIds.map(id => this.authorsRepository.findById(id)));
        const authors = await Promise.all((updateBookDto.authorIds ?? []).map(id => this.authorsRepository.findById(id)));

        // Verify all authors exist
        for (const [index, author] of authors.entries()) {
            if (!author) {
                throw new NotFoundException(`Author with ID ${updateBookDto.authorIds[index]} not found`);
            }
        }

        // Determine authors to be added and removed
        const authorsToAdd = [...newAuthorIds].filter(id => !currentAuthorIds.has(id));
        const authorsToRemove = [...currentAuthorIds].filter(id => !newAuthorIds.has(id));

        // Create the updated book object
        const updatedBook: Book = {
            ...existingBook,
            title: updateBookDto.title ?? existingBook.title,
            description: updateBookDto.description ?? existingBook.description,
            authorIds: [...newAuthorIds],
        };

        // Update the book in the repository
        const updatedBookEntity = await this.booksRepository.update(id, updatedBook);

        // Update authors
        for (const authorId of authorsToAdd) {
            const author = await this.authorsRepository.findById(authorId);
            if (!author) throw new NotFoundException(`Author with ID ${authorId} not found`);

            author.bookIds.push(updatedBookEntity.id);
            await this.authorsRepository.update(authorId, author);
        }

        for (const authorId of authorsToRemove) {
            const author = await this.authorsRepository.findById(authorId);
            if (!author) throw new NotFoundException(`Author with ID ${authorId} not found`);

            author.bookIds = author.bookIds.filter(bookId => bookId !== updatedBookEntity.id);
            await this.authorsRepository.update(authorId, author);
        }

        return updatedBookEntity;
    }

    // DELETE BOOK BY ID
    async deleteBook(id: string): Promise<void> {
        // Find the book to delete
        const book = await this.booksRepository.findById(id);
        if (!book) throw new NotFoundException(`Book with ID ${id} not found`);

        // Remove the book from all authors' bookIds
        for (const authorId of book.authorIds) {
            const author = await this.authorsRepository.findById(authorId);
            if (!author) throw new NotFoundException(`Author with ID ${authorId} not found`);

            // Remove the book ID from the author's bookIds
            author.bookIds = author.bookIds.filter(bookId => bookId !== id);
            await this.authorsRepository.update(authorId, author);
        }

        // Now delete the book from the books repository
        await this.booksRepository.delete(id);
    }
}
