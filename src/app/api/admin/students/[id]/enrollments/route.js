import { NextResponse } from 'next/server';

import { executeQuery } from '@/DB/db';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        // Fetch enrollments for the student
        const enrollmentsResult = await executeQuery(`
            SELECT 
                e.EnrollmentID,
                e.AcademicYear,
                c.CourseID,
                c.CourseCode,
                c.CourseName,
                c.CreditHours
            FROM Enrollments e
            JOIN Courses c ON e.CourseID = c.CourseID
            WHERE e.StudentID = @id
            ORDER BY e.AcademicYear DESC, c.CourseCode
        `, { id });

        return NextResponse.json({
            success: true,
            enrollments: enrollmentsResult.recordset || []
        });
    } catch (error) {
        console.error('Error fetching student enrollments:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch enrollments' },
            { status: 500 }
        );
    }
}
