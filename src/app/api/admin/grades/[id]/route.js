import { NextResponse } from 'next/server';
import db from '@/DB/db.js';
import { requireAuth } from '@/lib/auth.js';

export async function PUT(request, { params }) {
    const authResult = requireAuth(request, 'Admin');
    if (authResult instanceof NextResponse) {
        return authResult;
    }

    try {
        const { id } = await params;
        const { enrollmentId, assessmentId, obtainedMarks } = await request.json();

        if (!enrollmentId || !assessmentId || obtainedMarks === undefined) {
            return NextResponse.json({ success: false, error: 'Enrollment, assessment, and obtained marks are required' }, { status: 400 });
        }

        const pool = await db();

        await pool.request()
            .input('id', id)
            .input('enrollmentId', enrollmentId)
            .input('assessmentId', assessmentId)
            .input('obtainedMarks', obtainedMarks)
            .query(`
                UPDATE Grades 
                SET EnrollmentID = @enrollmentId, AssessmentID = @assessmentId, ObtainedMarks = @obtainedMarks
                WHERE GradeID = @id
            `);

        return NextResponse.json({ success: true, message: 'Grade updated successfully' });
    } catch (error) {
        console.error('Error updating grade:', error);
        return NextResponse.json({ success: false, error: 'Failed to update grade' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const authResult = requireAuth(request, 'Admin');
    if (authResult instanceof NextResponse) {
        return authResult;
    }

    try {
        const { id } = await params;
        const pool = await db();

        await pool.request()
            .input('id', id)
            .query('DELETE FROM Grades WHERE GradeID = @id');

        return NextResponse.json({ success: true, message: 'Grade deleted successfully' });
    } catch (error) {
        console.error('Error deleting grade:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete grade' }, { status: 500 });
    }
}
