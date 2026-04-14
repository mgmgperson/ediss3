import pool from './db.js';

export async function initDb(): Promise<void> {
    await pool.execute(`
        CREATE TABLE IF NOT EXISTS books (
        ISBN VARCHAR(32) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        Author VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        genre VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        summary TEXT NULL
        )
    `);
}