import { Injectable } from '@nestjs/common';
import { Author } from './authors.entity';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class AuthorsRepository {
    private readonly filePath = path.join(__dirname, '../../database/authors.json');

    // Helper method to read the file
    private async readFile(): Promise<Author[]> {
        try {
            const data = await fs.readFile(this.filePath, 'utf-8');
            return JSON.parse(data);
        } catch (err) {
            // If file doesn't exist, return an empty array
            if (err.code === 'ENOENT') {
                return [];
            }
            throw err;
        }
    }

    // Helper method to write to the file
    private async writeFile(authors: Author[]): Promise<void> {
        await fs.writeFile(this.filePath, JSON.stringify(authors, null, 2));
    }

    // CREATE
    async create(author: Author): Promise<Author> {
        const authors = await this.readFile();
        const newAuthor = { ...author, bookIds: [] };
        authors.push(newAuthor);
        await this.writeFile(authors);
        return newAuthor;
    }

    // GET ALL AUTHORS
    async findAll(): Promise<Author[]> {
        return this.readFile();
    }

    // GET AUTHOR BY ID
    async findById(id: string): Promise<Author | undefined> {
        const authors = await this.readFile();
        return authors.find(author => author.id === id);
    }

    // UPDATE AUTHOR BY ID
    async update(id: string, updateAuthorDto: Author): Promise<Author | undefined> {
        const authors = await this.readFile();
        const authorIndex = authors.findIndex(author => author.id === id);

        if (authorIndex > -1) {
            authors[authorIndex] = {
                ...authors[authorIndex],
                ...updateAuthorDto,
            };
            await this.writeFile(authors);
            return authors[authorIndex];
        }

        return undefined;
    }

    // DELETE AUTHOR BY ID
    async delete(id: string): Promise<void> {
        const authors = await this.readFile();
        const updatedAuthors = authors.filter(author => author.id !== id);
        await this.writeFile(updatedAuthors);
    }
}
