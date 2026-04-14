import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from './db.js';
import type { Book, NewBook } from '../types/book.js';

type BookRow = Book & RowDataPacket;

type RawBookRow = Omit<Book, 'price'> & {
  price: string | number;
} & RowDataPacket;

function normalizeBook(row: RawBookRow): Book {
  return {
    ISBN: row.ISBN,
    title: row.title,
    Author: row.Author,
    description: row.description,
    genre: row.genre,
    price: Number(row.price),
    quantity: row.quantity,
    summary: row.summary,
  };
}

export async function getBookByIsbn(ISBN: string): Promise<Book | null> {
  const [rows] = await pool.query<RawBookRow[]>(
    `
    SELECT ISBN, title, Author, description, genre, price, quantity, summary
    FROM books
    WHERE ISBN = ?
    `,
    [ISBN]
  );

  return rows[0] ? normalizeBook(rows[0]) : null;
}

export async function createBook(book: NewBook): Promise<void> {
    await pool.execute<ResultSetHeader>(
        `
        INSERT INTO books (ISBN, title, Author, description, genre, price, quantity, summary)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
        book.ISBN,
        book.title,
        book.Author,
        book.description,
        book.genre,
        book.price,
        book.quantity,
        book.summary ?? null,
        ]
    );
}

export async function updateBookByIsbn(ISBN: string, book: NewBook): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
        `
        UPDATE books
        SET title = ?, Author = ?, description = ?, genre = ?, price = ?, quantity = ?
        WHERE ISBN = ?
        `,
        [
        book.title,
        book.Author,
        book.description,
        book.genre,
        book.price,
        book.quantity,
        ISBN,
        ]
    );

    return result.affectedRows > 0;
}

export async function updateBookSummary(ISBN: string, summary: string): Promise<void> {
    await pool.execute<ResultSetHeader>(
        `
        UPDATE books
        SET summary = ?
        WHERE ISBN = ?
        `,
        [summary, ISBN]
    );
}

export async function bookExistsByIsbn(ISBN: string): Promise<boolean> {
    const [rows] = await pool.query<BookRow[]>(
        `
        SELECT ISBN
        FROM books
        WHERE ISBN = ?
        `,
        [ISBN]
    );

    return rows.length > 0;
}