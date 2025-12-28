import { NextResponse } from 'next/server';

import { executeQuery } from '@/DB/db';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        // Fetch grades for the student
        const gradesResult = await executeQuery(`
            SELECT 
                g.GradeID,
                g.ObtainedMarks,
                c.CourseCode,
                c.CourseName,
                a.Title as AssessmentTitle,
                a.TotalMarks
            FROM Grades g
            JOIN Enrollments e ON g.EnrollmentID = e.EnrollmentID
            JOIN Courses c ON e.CourseID = c.CourseID
            JOIN Assessments a ON g.AssessmentID = a.AssessmentID
            WHERE e.StudentID = @id
            ORDER BY c.CourseCode, a.Title
        `, { id });

        return NextResponse.json({
            success: true,
            grades: gradesResult.recordset || []
        });
    } catch (error) {
        console.error('Error fetching student grades:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch grades' },
            { status: 500 }
        );
    }
}
