import { NextResponse } from 'next/server';

import { executeQuery } from '@/DB/db';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        // Fetch results for the student (admin view, no auth required)
        const result = await executeQuery(`
            SELECT 
                r.ResultID, r.TotalMarks, r.Grade, r.Status,
                c.CourseCode, c.CourseName, c.CreditHours,
                e.AcademicYear
            FROM Results r
            JOIN Enrollments e ON r.EnrollmentID = e.EnrollmentID
            JOIN Courses c ON e.CourseID = c.CourseID
            WHERE e.StudentID = @id
            ORDER BY c.CourseCode
        `, { id });
        console.log('Admin student results SQL output:', result);
        return NextResponse.json({
            success: true,
            results: result.recordset || []
        });
    } catch (error) {
        console.error('Error fetching student results:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch results' },
            { status: 500 }
        );
    }
}
