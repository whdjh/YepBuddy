import { SignJWT, jwtVerify, JWTPayload } from "jose";
import bcrypt from "bcryptjs";  // 토큰 해시/비교 헬퍼

// 쿠키 설정(httpOnly, sameSite)
export const REFRESH_TOKEN_COOKIE = "refresh_token";
export const refreshCookieOptions = {
  httpOnly: true as const,
  sameSite: "lax" as const,       // CSR 페이지 전환 안정적
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

// 만료 기본값
export const ACCESS_EXPIRES_IN = "15m";   // 접근 토큰
export const REFRESH_EXPIRES_IN = "30d";  // 리프레시 토큰

// jose는 TextEncoder로 key를 Uint8Array로 넣어야 함
const te = new TextEncoder();
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET!;
if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error("Missing ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET in .env");
}
const accessKey = te.encode(ACCESS_SECRET);
const refreshKey = te.encode(REFRESH_SECRET);

// JTI 생성 (리프레시 토큰 고유 식별자)
export function generateJti() {
  const g = globalThis as any;

  if (g.crypto && typeof g.crypto.randomUUID === "function") {
    return g.crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// 접근 토큰 서명
export async function signAccessToken(payload: { sub: string; role?: string }) {
  return await new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(ACCESS_EXPIRES_IN)
    .sign(accessKey);
}

// 리프레시 토큰 서명 (sub = userId, jti 포함)
export async function signRefreshToken(userId: string, jti: string) {
  return await new SignJWT({ sub: userId, jti } as JWTPayload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(userId)
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime(REFRESH_EXPIRES_IN)
    .sign(refreshKey);
}

// 검증기
export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, accessKey);
  return payload as JWTPayload & { sub: string; role?: string };
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, refreshKey);
  return payload as JWTPayload & { sub: string; jti: string };
}

// DB에는 리프레시 원문을 저장하지 말고 해시만!
export async function hashToken(token: string) {
  return bcrypt.hash(token, 10);
}
export async function compareTokenHash(token: string, hash: string) {
  return bcrypt.compare(token, hash);
}

// 쿠키 maxAge(초) 계산 헬퍼
export const refreshMaxAgeSec = 30 * 24 * 60 * 60; // 30d
