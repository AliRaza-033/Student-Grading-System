import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getCurrentUser();
        
        if (!user) {
            return Response.json({
                success: false,
                error: 'Not authenticated'
            }, { status: 401 });
        }
        
        return Response.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get user error:', error);
        return Response.json({
            success: false,
            error: 'Failed to get user'
        }, { status: 500 });
    }
}
