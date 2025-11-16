const SESSION_COOKIE_NAME = 'user_session';

const SESSION_COOKIE_PATTERN = new RegExp(`${SESSION_COOKIE_NAME}=[^;]+`, 'i');

export function extractSessionCookie(setCookieHeader?: string | string[] | null): string | null {
  if (!setCookieHeader) {
    return null;
  }

  const source = Array.isArray(setCookieHeader) ? setCookieHeader.join(';') : setCookieHeader;
  const match = source.match(SESSION_COOKIE_PATTERN);
  return match ? match[0] : null;
}

export function buildCookieHeader(cookie?: string | null): string | undefined {
  if (!cookie) {
    return undefined;
  }

  return cookie.trim();
}

export function clearCookieHeader(): string {
  return '';
}

export { SESSION_COOKIE_NAME };
