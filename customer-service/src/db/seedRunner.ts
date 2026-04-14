import { initDb } from './init.js';
import { seedDb } from './seed.js';
import pool from './db.js';

async function main(): Promise<void> {
    try {
        await initDb();
        await seedDb();
        console.log('Database seeded successfully.');
    } catch (error) {
        console.error('Failed to seed database:', error);
    } finally {
        await pool.end();
    }
}

main();