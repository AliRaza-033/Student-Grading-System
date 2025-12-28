import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

/**
 * Create a JWT token
 */
export async function createToken(payload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(JWT_SECRET);
}

/**
 * Verify a JWT token
 */
export async function verifyToken(token) {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload;
    } catch (error) {
        return null;
    }
}

/**
 * Get current user from cookies
 */
export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token');
        
        if (!token) return null;
        
        const payload = await verifyToken(token.value);
        return payload;
    } catch (error) {
        return null;
    }
}

/**
 * Set auth cookie
 */
export async function setAuthCookie(token) {
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 // 24 hours
    });
}

/**
 * Remove auth cookie
 */
export async function removeAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');
}

/**
 * Check if user has required role
 */
export function hasRole(user, role) {
    if (!user) return false;
    return user.role === role;
}

/**
 * Middleware helper to protect routes
 */
export async function requireAuth(requiredRole = null) {
    const user = await getCurrentUser();
    
    if (!user) {
        return { authorized: false, error: 'Unauthorized' };
    }
    
    if (requiredRole && user.role !== requiredRole) {
        return { authorized: false, error: 'Forbidden - Insufficient permissions' };
    }
    
    return { authorized: true, user };
}
