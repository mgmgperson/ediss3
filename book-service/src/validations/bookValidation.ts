import type { NewBook } from '../types/book.js';

export function isValidPrice(value: unknown): boolean {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return false;
    }

    return /^\d+(\.\d{1,2})?$/.test(value.toString());
}

export function isValidBookBody(body: unknown): body is NewBook {
    if (!body || typeof body !== 'object') {
        return false;
    }

    const b = body as Record<string, unknown>;

    return (
        typeof b.ISBN === 'string' &&
        b.ISBN.trim() !== '' &&
        typeof b.title === 'string' &&
        b.title.trim() !== '' &&
        typeof b.Author === 'string' &&
        b.Author.trim() !== '' &&
        typeof b.description === 'string' &&
        b.description.trim() !== '' &&
        typeof b.genre === 'string' &&
        b.genre.trim() !== '' &&
        isValidPrice(b.price) &&
        typeof b.quantity === 'number' &&
        Number.isInteger(b.quantity)
    );
}

export function getIsbnParam(value: unknown): string | null {
    if (typeof value !== 'string' || value.trim() === '') {
        return null;
    }

    return value;
}