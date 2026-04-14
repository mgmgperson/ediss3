import type { NewCustomer } from '../types/customer.js';

const US_STATE_CODES = new Set([
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'DC',
]);

export function isValidEmail(value: unknown): boolean {
    if (typeof value !== 'string') {
        return false;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidState(value: unknown): boolean {
    if (typeof value !== 'string') {
        return false;
    }

    return US_STATE_CODES.has(value.toUpperCase());
}

export function isValidCustomerBody(body: unknown): body is NewCustomer {
    if (!body || typeof body !== 'object') {
        return false;
    }

    const c = body as Record<string, unknown>;

    const address2Valid =
        c.address2 === null ||
        c.address2 === undefined ||
        typeof c.address2 === 'string';

    return (
        isValidEmail(c.userId) &&
        typeof c.name === 'string' &&
        c.name.trim() !== '' &&
        typeof c.phone === 'string' &&
        c.phone.trim() !== '' &&
        typeof c.address === 'string' &&
        c.address.trim() !== '' &&
        address2Valid &&
        typeof c.city === 'string' &&
        c.city.trim() !== '' &&
        isValidState(c.state) &&
        typeof c.zipcode === 'string' &&
        c.zipcode.trim() !== ''
    );
}