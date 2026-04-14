import express from 'express';
import type { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import statusRoutes from './routes/statusRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import { initDb } from './db/init.js';

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use('/status', statusRoutes);
app.use('/books', bookRoutes);

const PORT = Number(process.env.PORT ?? 6767);

async function startServer(): Promise<void> {
    try {
        await initDb();

        app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();