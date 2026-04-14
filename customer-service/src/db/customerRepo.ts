import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from './db.js';
import type { Customer, NewCustomer } from '../types/customer.js';

type CustomerRow = Customer & RowDataPacket;

export async function getCustomerById(id: number): Promise<Customer | null> {
    const [rows] = await pool.query<CustomerRow[]>(
        `
        SELECT id, userId, name, phone, address, address2, city, state, zipcode
        FROM customers
        WHERE id = ?
        `,
        [id]
    );

    return rows[0] ?? null;
}

export async function getCustomerByUserId(userId: string): Promise<Customer | null> {
    const [rows] = await pool.query<CustomerRow[]>(
        `
        SELECT id, userId, name, phone, address, address2, city, state, zipcode
        FROM customers
        WHERE userId = ?
        `,
        [userId]
    );

    return rows[0] ?? null;
}

export async function createCustomer(customer: NewCustomer): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
        `
        INSERT INTO customers (userId, name, phone, address, address2, city, state, zipcode)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
        customer.userId,
        customer.name,
        customer.phone,
        customer.address,
        customer.address2,
        customer.city,
        customer.state,
        customer.zipcode,
        ]
    );

    return result.insertId;
}

export async function customerExistsByUserId(userId: string): Promise<boolean> {
    const [rows] = await pool.query<CustomerRow[]>(
        `
        SELECT id
        FROM customers
        WHERE userId = ?
        `,
        [userId]
    );

    return rows.length > 0;
}