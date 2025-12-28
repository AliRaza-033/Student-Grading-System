import { executeQuery } from '@/DB/db';
import { requireAuth } from '@/lib/auth';

// GET student's grades
export async function GET(request) {
    const auth = await requireAuth('Student');
    if (!auth.authorized) {
        return Response.json({ error: auth.error }, { status: 401 });
    }
    
    try {
        const studentId = auth.user.StudentID;
        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get('courseId');
        
        let query = `
            SELECT 
                g.GradeID, g.ObtainedMarks,
                a.AssessmentID, a.Title, a.TotalMarks, a.Weightage,
                c.CourseCode, c.CourseName,
                e.EnrollmentID
            FROM Grades g
            JOIN Enrollments e ON g.EnrollmentID = e.EnrollmentID
            JOIN Assessments a ON g.AssessmentID = a.AssessmentID
            JOIN Courses c ON a.CourseID = c.CourseID
            WHERE e.StudentID = @studentId
        `;
        
        let params = { studentId };
        if (courseId) {
            query += ' AND c.CourseID = @courseId';
            params.courseId = parseInt(courseId);
        }
        
        query += ' ORDER BY c.CourseCode, a.AssessmentID';
        
        const result = await executeQuery(query, params);
        
        return Response.json({
            success: true,
            grades: result.recordset
        });
    } catch (error) {
        console.error('Error fetching grades:', error);
        return Response.json({ error: 'Failed to fetch grades' }, { status: 500 });
    }
}
