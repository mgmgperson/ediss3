import dotenv from 'dotenv';
import type { RelatedBook } from '../types/relatedBook.js';

dotenv.config();

const RECOMMENDATION_SERVICE_BASE_URL = process.env.RECOMMENDATION_SERVICE_BASE_URL;
const REQUEST_TIMEOUT_MS = 3_000;

type RecommendationDto = {
  title?: unknown;
  isbn?: unknown;
  authors?: unknown;
  publisher?: unknown;
};

export class RecommendationTimeoutError extends Error {
  constructor(message = 'Recommendation service timed out') {
    super(message);
    this.name = 'RecommendationTimeoutError';
  }
}

function buildRecommendationUrl(isbn: string): string {
  if (!RECOMMENDATION_SERVICE_BASE_URL) {
    throw new Error('Missing RECOMMENDATION_SERVICE_BASE_URL');
  }

  const baseUrl = RECOMMENDATION_SERVICE_BASE_URL.replace(/\/+$/, '');
  return `${baseUrl}/recommended-titles/isbn/${encodeURIComponent(isbn)}`;
}

function normalizeRecommendation(value: RecommendationDto): RelatedBook | null {
  if (
    typeof value.isbn !== 'string' ||
    typeof value.title !== 'string' ||
    typeof value.authors !== 'string'
  ) {
    return null;
  }

  return {
    ISBN: value.isbn,
    title: value.title,
    Author: value.authors,
  };
}

export async function fetchRelatedBooksByIsbn(isbn: string): Promise<RelatedBook[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(buildRecommendationUrl(isbn), {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (response.status === 204 || response.status === 400 || response.status === 404) {
      return [];
    }

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Recommendation service error ${response.status}: ${text}`);
    }

    const rawText = await response.text();

    if (!rawText.trim()) {
      return [];
    }

    let data: unknown;
    try {
      data = JSON.parse(rawText);
    } catch {
      return [];
    }

    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map(normalizeRecommendation)
      .filter((book): book is RelatedBook => book !== null);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new RecommendationTimeoutError();
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}