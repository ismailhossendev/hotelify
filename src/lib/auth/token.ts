import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-me';
// Default to 6h for better security unless Remember Me is checked
const DEFAULT_EXPIRY = '6h';
const REMEMBER_ME_EXPIRY = '30d';

export interface TokenPayload {
    userId: string;
    role: string;
    email?: string;
    name?: string;
    hotelId?: string;
    tenantId?: string; // Standardize on hotelId usually, but keeping payload flexible
    impersonatedBy?: string; // Super Admin's userId when impersonating
}

export function signToken(payload: TokenPayload, expiresIn: string | number = DEFAULT_EXPIRY): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
}

export function verifyToken(token: string): TokenPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
        return null;
    }
}

export function setAuthCookie(token: string, maxAge: number = 6 * 60 * 60) { // Default 6 hours in seconds
    const cookieStore = cookies();
    cookieStore.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: maxAge,
        path: '/',
    });
}

export function removeAuthCookie() {
    const cookieStore = cookies();
    cookieStore.delete('auth_token');
}

export function getAuthToken(): string | undefined {
    const cookieStore = cookies();
    return cookieStore.get('auth_token')?.value;
}

export async function getCurrentUser() {
    const token = getAuthToken();
    if (!token) return null;
    return verifyToken(token);
}
