import pool from './db.js';

export async function seedDb(): Promise<void> {
    await pool.execute(`DELETE FROM books`);

    await pool.execute(
        `
        INSERT INTO books (ISBN, title, Author, description, genre, price, quantity, summary)
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
        '9780143105534',
        'The Book of Mormon',
        'Joseph Smith',
        'A religious text of the Latter Day Saint movement.',
        'Fiction',
        67.99,
        10,
        null,

        '9780201616224',
        'The Pragmatic Programmer',
        'Andrew Hunt',
        'A classic software engineering book.',
        'Programming',
        45.00,
        7,
        null,
        ]
    );

}