import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { Book } from './books.entity';
import * as path from 'path';

@Injectable()
export class BooksRepository {
    private readonly filePath = path.join(__dirname, '../../database/books.json');

    // Helper method to read the books JSON file
    private async readFile(): Promise<Book[]> {
        try {
            const data = await fs.readFile(this.filePath, 'utf-8');
            return data ? JSON.parse(data) : [];
        } catch (err) {
            if (err.code === 'ENOENT') {
                // If the file doesn't exist, initialize it with an empty array
                await this.writeFile([]);
                return [];
            }
            throw err;
        }
    }

    // Helper method to write to the books JSON file
    private async writeFile(data: Book[]): Promise<void> {
        await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    }

    // CREATE BOOK
    async create(book: Book): Promise<Book> {
        const books = await this.readFile();
        books.push(book);
        await this.writeFile(books);
        return book;
    }

    // GET ALL BOOKS
    async findAll(): Promise<Book[]> {
        return this.readFile();
    }

    // FIND BOOK BY ID
    async findById(id: string): Promise<Book | undefined> {
        const books = await this.readFile();
        return books.find(book => book.id === id);
    }

    // FIND BOOK BY AUTHOR ID
    async findByAuthorId(authorId: string): Promise<Book[]> {
        const books = await this.readFile();
        return books.filter(book => book.authorIds.includes(authorId));
    }

    // UPDATE BOOK BY ID
    async update(id: string, updateBookDto: Book): Promise<Book | undefined> {
        const books = await this.readFile();
        const bookIndex = books.findIndex(book => book.id === id);

        if (bookIndex > -1) {
            books[bookIndex] = { 
                ...books[bookIndex], 
                ...updateBookDto 
            };
            await this.writeFile(books);
            return books[bookIndex];
        }

        return undefined;
    }

    // DELETE BY ID
    async delete(id: string): Promise<void> {
        let books = await this.readFile();
        books = books.filter(book => book.id !== id);
        await this.writeFile(books);
    }
}
