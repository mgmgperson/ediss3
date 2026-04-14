type JwtPayload = {
  sub?: unknown;
  exp?: unknown;
  iss?: unknown;
  [key: string]: unknown;
};

const ALLOWED_SUBJECTS = new Set([
  'starlord',
  'gamora',
  'drax',
  'rocket',
  'groot',
]);

function base64UrlDecode(input: string): string {
  let normalized = input.replace(/-/g, '+').replace(/_/g, '/');

  while (normalized.length % 4 !== 0) {
    normalized += '=';
  }

  return Buffer.from(normalized, 'base64').toString('utf-8');
}

export function decodeAndValidateJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');

    if (parts.length !== 3) {
      return null;
    }

    const payloadJson = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson) as JwtPayload;

    if (typeof payload.sub !== 'string' || !ALLOWED_SUBJECTS.has(payload.sub)) {
      return null;
    }

    if (typeof payload.iss !== 'string' || payload.iss !== 'cmu.edu') {
      return null;
    }

    if (typeof payload.exp !== 'number') {
      return null;
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp <= nowInSeconds) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}