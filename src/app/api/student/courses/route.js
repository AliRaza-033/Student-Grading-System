import { executeQuery } from '@/DB/db';
import { requireAuth } from '@/lib/auth';

// GET student's enrolled courses
export async function GET() {
    const auth = await requireAuth('Student');
    if (!auth.authorized) {
        return Response.json({ error: auth.error }, { status: 401 });
    }
    
    try {
        const studentId = auth.user.StudentID;
        
        const result = await executeQuery(`
            SELECT 
                e.EnrollmentID, e.AcademicYear,
                c.CourseID, c.CourseCode, c.CourseName, c.CreditHours
            FROM Enrollments e
            JOIN Courses c ON e.CourseID = c.CourseID
            WHERE e.StudentID = @studentId
            ORDER BY c.CourseCode
        `, { studentId });
        
        return Response.json({
            success: true,
            courses: result.recordset
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        return Response.json({ error: 'Failed to fetch courses' }, { status: 500 });
    }
}
