import pool from './db.js';

export async function seedDb(): Promise<void> {
    await pool.execute(`DELETE FROM customers`);

    await pool.execute(
        `
        INSERT INTO customers (userId, name, phone, address, address2, city, state, zipcode)
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
        'alice@example.com',
        'Alice Johnson',
        '412-555-1111',
        '123 Main St',
        null,
        'Pittsburgh',
        'PA',
        '15213',

        'bob@example.com',
        'Bob Smith',
        '412-555-2222',
        '456 Fifth Ave',
        'Apt 5B',
        'Pittsburgh',
        'PA',
        '15222',
        ]
    );
}