import { removeAuthCookie } from '@/lib/auth';

export async function POST() {
    try {
        await removeAuthCookie();
        
        return Response.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        return Response.json({
            success: false,
            error: 'Logout failed'
        }, { status: 500 });
    }
}
