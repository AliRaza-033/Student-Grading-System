import { NextResponse } from 'next/server';
import db from '@/DB/db.js';
import { requireAuth } from '@/lib/auth.js';

export async function DELETE(request, { params }) {
    const authResult = requireAuth(request, 'Admin');
    if (authResult instanceof NextResponse) {
        return authResult;
    }

    try {
        const { id } = await params;
        const pool = await db();

        // Delete enrollment (cascade will handle grades and results)
        await pool.request()
            .input('id', id)
            .query('DELETE FROM Enrollments WHERE EnrollmentID = @id');

        return NextResponse.json({ success: true, message: 'Enrollment deleted successfully' });
    } catch (error) {
        console.error('Error deleting enrollment:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete enrollment' }, { status: 500 });
    }
}
