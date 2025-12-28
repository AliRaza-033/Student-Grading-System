import { executeQuery } from '@/DB/db';
import { requireAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    const auth = await requireAuth('Student');
    if (!auth.authorized) {
        return Response.json({ error: auth.error }, { status: 401 });
    }

    try {
        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return Response.json({ error: 'All fields are required' }, { status: 400 });
        }

        const userId = auth.user.userId;

        // Verify current password
        const userResult = await executeQuery(
            'SELECT Password FROM Users WHERE UserID = @userId',
            { userId }
        );

        if (userResult.recordset.length === 0) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        const user = userResult.recordset[0];
        const isValidPassword = await bcrypt.compare(currentPassword, user.Password);

        if (!isValidPassword) {
            return Response.json({ error: 'Current password is incorrect' }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await executeQuery(
            'UPDATE Users SET Password = @password WHERE UserID = @userId',
            { password: hashedPassword, userId }
        );

        return Response.json({ 
            success: true, 
            message: 'Password changed successfully' 
        });

    } catch (error) {
        console.error('Error changing password:', error);
        return Response.json({ error: 'Failed to change password' }, { status: 500 });
    }
}
