import { executeQuery } from '@/DB/db';
import { requireAuth } from '@/lib/auth';

// GET student's results
export async function GET() {
    const auth = await requireAuth('Student');
    if (!auth.authorized) {
        return Response.json({ error: auth.error }, { status: 401 });
    }
    
    try {
        const studentId = auth.user.StudentID;
        
        const result = await executeQuery(`
            SELECT 
                r.ResultID, r.TotalMarks, r.Grade, r.Status,
                c.CourseCode, c.CourseName, c.CreditHours,
                e.AcademicYear
            FROM Results r
            JOIN Enrollments e ON r.EnrollmentID = e.EnrollmentID
            JOIN Courses c ON e.CourseID = c.CourseID
            WHERE e.StudentID = @studentId
            ORDER BY c.CourseCode
        `, { studentId });
        
        return Response.json({
            success: true,
            results: result.recordset
        });
    } catch (error) {
        console.error('Error fetching results:', error);
        return Response.json({ error: 'Failed to fetch results' }, { status: 500 });
    }
}
