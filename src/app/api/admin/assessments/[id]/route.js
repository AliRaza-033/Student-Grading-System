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
        const { courseId, title, totalMarks, weightage } = await request.json();

        if (!courseId || !title || !totalMarks) {
            return NextResponse.json({ success: false, error: 'Course, title, and total marks are required' }, { status: 400 });
        }

        const pool = await db();

        await pool.request()
            .input('id', id)
            .input('courseId', courseId)
            .input('title', title)
            .input('totalMarks', totalMarks)
            .input('weightage', weightage || null)
            .query(`
                UPDATE Assessments 
                SET CourseID = @courseId, Title = @title, TotalMarks = @totalMarks, Weightage = @weightage
                WHERE AssessmentID = @id
            `);

        return NextResponse.json({ success: true, message: 'Assessment updated successfully' });
    } catch (error) {
        console.error('Error updating assessment:', error);
        return NextResponse.json({ success: false, error: 'Failed to update assessment' }, { status: 500 });
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

        // Delete assessment (grades will be cascade deleted if foreign key is set up)
        await pool.request()
            .input('id', id)
            .query('DELETE FROM Assessments WHERE AssessmentID = @id');

        return NextResponse.json({ success: true, message: 'Assessment deleted successfully' });
    } catch (error) {
        console.error('Error deleting assessment:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete assessment' }, { status: 500 });
    }
}
