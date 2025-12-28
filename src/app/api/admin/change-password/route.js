import { NextResponse } from 'next/server';
import db from '@/DB/db.js';
import bcrypt from 'bcryptjs';
import { requireAuth } from '@/lib/auth.js';

export async function POST(request) {
    const authResult = requireAuth(request, 'Admin');
    if (authResult instanceof NextResponse) {
        return authResult;
    }
    const auth = authResult;

    try {
        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ success: false, error: 'New password must be at least 8 characters' }, { status: 400 });
        }

        const pool = await db();

        // Get current password hash
        const userResult = await pool.request()
            .input('userId', auth.user.userId)
            .query('SELECT Password FROM Users WHERE UserID = @userId');

        if (userResult.recordset.length === 0) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        const user = userResult.recordset[0];

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.Password);
        if (!isValid) {
            return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 401 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await pool.request()
            .input('userId', auth.user.userId)
            .input('password', hashedPassword)
            .query('UPDATE Users SET Password = @password WHERE UserID = @userId');

        return NextResponse.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        return NextResponse.json({ success: false, error: 'Failed to change password' }, { status: 500 });
    }
}
