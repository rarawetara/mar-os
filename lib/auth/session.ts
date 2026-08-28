import { createHmac, timingSafeEqual } from "node:crypto";

// Единственный пользователь — Марта. Сессия — подписанный cookie-токен без
// хранения на сервере: HMAC ключом APP_PASSWORD над временем истечения.
// Нет доступа к APP_PASSWORD → токен не подделать.
export const SESSION_COOKIE = "mar_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 дней

function requireAppPassword(): string {
  const value = process.env.APP_PASSWORD;
  if (!value) throw new Error("Missing required env var: APP_PASSWORD");
  return value;
}

function sign(expiresAt: number): string {
  return createHmac("sha256", requireAppPassword()).update(String(expiresAt)).digest("hex");
}

export function createSessionToken(): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  return `${expiresAt}.${sign(expiresAt)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [expiresAtRaw, signature] = token.split(".");
  if (!expiresAtRaw || !signature) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  const expected = sign(expiresAt);
  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(signature, "hex");
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}

export function verifyAppPassword(candidate: string): boolean {
  const expected = Buffer.from(requireAppPassword());
  const actual = Buffer.from(candidate);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export function verifyCronSecret(candidate: string | undefined | null): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected || !candidate) return false;
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(candidate);
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}

// Токен для машин (MCP-сервер noname). Отдельный от APP_PASSWORD и CRON_SECRET,
// чтобы можно было отозвать доступ агента, не трогая вход в приложение.
export function verifyMcpToken(candidate: string | undefined | null): boolean {
  const expected = process.env.MCP_TOKEN;
  if (!expected || !candidate) return false;
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(candidate);
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}
