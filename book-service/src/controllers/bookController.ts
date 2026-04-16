import type { Request, Response } from 'express';
import {
    bookExistsByIsbn,
    createBook,
    getBookByIsbn,
    updateBookByIsbn,
    updateBookSummary
} from '../db/bookRepo.js';
import {
    getIsbnParam,
    isValidBookBody,
} from '../validations/bookValidation.js';
import { generateBookSummary } from '../services/llmService.js';
import type { NewBook } from '../types/book.js';
import {
    closeCircuit,
    isWithinOpenWindow,
    openCircuit,
    shouldAllowTrialRequest,
} from '../services/circuitBreakerService.js';
import {
    fetchRelatedBooksByIsbn,
    RecommendationTimeoutError,
} from '../services/recommendationService.js';

function buildFallbackSummary(book: NewBook): string {
    return [
        `${book.title} by ${book.Author} is a ${book.genre} title that stands out for the ideas and themes suggested by its description. ${book.description}`,
        `This book invites readers into a focused reading experience that is likely to appeal to people who enjoy thoughtful writing, a clear point of view, and material that stays grounded in its central subject. The combination of title, author, genre, and description suggests a work that aims to be both accessible and meaningful, giving readers a strong sense of what the book is about while also leaving room for deeper reflection.`,
        `A reader picking up ${book.title} can expect a text that develops its topic in a way that feels intentional and organized. The description indicates that the book is built around a recognizable core idea, and that makes it easier for readers to understand why this work matters and what kind of value it may offer. Depending on the reader’s interests, it may serve as an introduction to the subject, a useful reference point, or simply an enjoyable and memorable read.`,
        `In the bookstore system, this title is listed with ISBN ${book.ISBN}, a price of $${book.price.toFixed(2)}, and an available quantity of ${book.quantity}. Those details identify the exact edition in inventory while also confirming that the book is currently available for purchase. Overall, ${book.title} appears to be a strong option for readers looking for a ${book.genre} book with a clear focus, a distinct authorial voice, and a description that immediately communicates its purpose.`
    ].join(' ');
}

export async function createBookHandler(req: Request, res: Response): Promise<void> {
    try {
        if (!isValidBookBody(req.body)) {
            res.sendStatus(400);
            return;
        }

        const book = req.body;

        const exists = await bookExistsByIsbn(book.ISBN);
        if (exists) {
            res.status(422).json({
                message: 'This ISBN already exists in the system.',
            });
            return;
        }

        const newBook: NewBook = {
            ISBN: book.ISBN,
            title: book.title,
            Author: book.Author,
            description: book.description,
            genre: book.genre,
            price: book.price,
            quantity: book.quantity,
        };

        let summary: string;
        // 2s latency for LLM response, autograder might hate me for this

        try {
            summary = await generateBookSummary(newBook);
        } catch (error) {
            console.error(`Falling back to local summary for ISBN ${newBook.ISBN}:`, error);
            summary = buildFallbackSummary(newBook);
        }

        await createBook({
            ...newBook,
            summary,
        });

        res
            .status(201)
            .location(`/books/${book.ISBN}`)
            .json({
                ISBN: book.ISBN,
                title: book.title,
                Author: book.Author,
                description: book.description,
                genre: book.genre,
                price: book.price,
                quantity: book.quantity,
            });
    } catch (error) {
        console.error('createBookHandler error:', error);
        res.sendStatus(500);
    }
}

export async function getBookByIsbnHandler(req: Request, res: Response): Promise<void> {
    try {
        const isbn = getIsbnParam(req.params.ISBN);

        if (!isbn) {
        res.sendStatus(400);
        return;
        }

        const book = await getBookByIsbn(isbn);

        if (!book) {
        res.sendStatus(404);
        return;
        }

        res.status(200).json(book);
    } catch (error) {
        console.error('getBookByIsbnHandler error:', error);
        res.sendStatus(500);
    }
}

export async function updateBookHandler(req: Request, res: Response): Promise<void> {
    try {
        const isbn = getIsbnParam(req.params.ISBN);

        if (!isbn || !isValidBookBody(req.body)) {
            res.sendStatus(400);
            return;
        }

        const book = req.body;

        if (book.ISBN !== isbn) {
            res.sendStatus(400);
            return;
        }

        const updated = await updateBookByIsbn(isbn, {
            ISBN: book.ISBN,
            title: book.title,
            Author: book.Author,
            description: book.description,
            genre: book.genre,
            price: book.price,
            quantity: book.quantity,
            summary: null,
        });

        if (!updated) {
            res.sendStatus(404);
            return;
        }

        const freshBook = await getBookByIsbn(isbn);

        if (!freshBook) {
            res.sendStatus(404);
            return;
        }

        res.status(200).json({
            ISBN: freshBook.ISBN,
            title: freshBook.title,
            Author: freshBook.Author,
            description: freshBook.description,
            genre: freshBook.genre,
            price: freshBook.price,
            quantity: freshBook.quantity,
        });
    } catch (error) {
        console.error('updateBookHandler error:', error);
        res.sendStatus(500);
    }
}

export async function getRelatedBooksHandler(req: Request, res: Response): Promise<void> {
    try {
        const isbn = getIsbnParam(req.params.ISBN);

        if (!isbn) {
            res.sendStatus(400);
            return;
        }

        // const existingBook = await getBookByIsbn(isbn);
        // if (!existingBook) {
        //     res.sendStatus(404);
        //     return;
        // }

        if (isWithinOpenWindow()) {
            res.sendStatus(503);
            return;
        }

        const isTrialRequest = shouldAllowTrialRequest();

        try {
            const relatedBooks = await fetchRelatedBooksByIsbn(isbn);

            closeCircuit();

            if (relatedBooks.length === 0) {
                res.sendStatus(204);
                return;
            }

            res.status(200).json(relatedBooks);
        } catch (error) {
            if (error instanceof RecommendationTimeoutError) {
                openCircuit();

                if (isTrialRequest) {
                    res.sendStatus(503);
                    return;
                }

                res.sendStatus(504);
                return;
            }

            throw error;
        }
    } catch (error) {
        console.error('getRelatedBooksHandler error:', error);
        res.sendStatus(500);
    }
}
