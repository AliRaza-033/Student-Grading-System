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
        const { courseCode, courseName, creditHours } = await request.json();

        if (!courseCode || !courseName) {
            return NextResponse.json({ success: false, error: 'Course code and course name are required' }, { status: 400 });
        }

        const pool = await db();

        // Check if course code exists for another course
        const existingCourse = await pool.request()
            .input('courseCode', courseCode)
            .input('courseId', id)
            .query('SELECT CourseID FROM Courses WHERE CourseCode = @courseCode AND CourseID != @courseId');

        if (existingCourse.recordset.length > 0) {
            return NextResponse.json({ success: false, error: 'Course code already exists' }, { status: 400 });
        }

        await pool.request()
            .input('id', id)
            .input('courseCode', courseCode)
            .input('courseName', courseName)
            .input('creditHours', creditHours || null)
            .query(`
                UPDATE Courses 
                SET CourseCode = @courseCode, CourseName = @courseName, CreditHours = @creditHours
                WHERE CourseID = @id
            `);

        return NextResponse.json({ success: true, message: 'Course updated successfully' });
    } catch (error) {
        console.error('Error updating course:', error);
        return NextResponse.json({ success: false, error: 'Failed to update course' }, { status: 500 });
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

        // Delete course (cascade will handle enrollments, assessments, grades)
        await pool.request()
            .input('id', id)
            .query('DELETE FROM Courses WHERE CourseID = @id');

        return NextResponse.json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete course' }, { status: 500 });
    }
}
