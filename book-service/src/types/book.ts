export interface Book {
    ISBN: string;
    title: string;
    Author: string;
    description: string;
    genre: string;
    price: number;
    quantity: number;
    summary: string | null;
}

export type NewBook = Omit<Book, 'summary'> & {
    summary?: string | null;
};