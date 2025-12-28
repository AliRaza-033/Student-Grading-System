import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export default async function proxy(request) {
    const { pathname } = request.nextUrl;
    
    // Public routes
    const publicRoutes = ['/', '/login', '/forgot-password'];
    if (publicRoutes.includes(pathname)) {
        return NextResponse.next();
    }
    
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    
    try {
        // Verify token
        const { payload } = await jwtVerify(token, JWT_SECRET);
        
        // Role-based routing
        if (pathname.startsWith('/admin') && payload.role !== 'Admin') {
            return NextResponse.redirect(new URL('/student/dashboard', request.url));
        }
        
        if (pathname.startsWith('/student') && payload.role !== 'Student') {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
        
        return NextResponse.next();
    } catch (error) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

export const config = {
    matcher: ['/admin/:path*', '/student/:path*', '/dashboard/:path*']
};
