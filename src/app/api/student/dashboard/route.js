import { executeQuery } from '@/DB/db';
import { requireAuth } from '@/lib/auth';

// GET student dashboard statistics
export async function GET() {
    const auth = await requireAuth('Student');
    if (!auth.authorized) {
        return Response.json({ error: auth.error }, { status: 401 });
    }
    
    try {
        const studentId = auth.user.StudentID;
        
        // Get enrolled courses count
        const coursesResult = await executeQuery(
            'SELECT COUNT(*) as count FROM Enrollments WHERE StudentID = @studentId',
            { studentId }
        );
        
        // Get results statistics with additional details
        const resultsResult = await executeQuery(`
            SELECT 
                COUNT(*) as totalResults,
                SUM(CASE WHEN Status = 'Pass' THEN 1 ELSE 0 END) as passed,
                SUM(CASE WHEN Status = 'Fail' THEN 1 ELSE 0 END) as failed,
                AVG(CAST(TotalMarks as FLOAT)) as avgPercentage,
                MAX(Grade) as highestGrade,
                MIN(Grade) as lowestGrade
            FROM Results r
            JOIN Enrollments e ON r.EnrollmentID = e.EnrollmentID
            WHERE e.StudentID = @studentId
        `, { studentId });
        
        // Get GPA (simplified calculation)
        const gpaResult = await executeQuery(`
            SELECT 
                AVG(
                    CASE Grade
                        WHEN 'A' THEN 4.0
                        WHEN 'A-' THEN 3.7
                        WHEN 'B+' THEN 3.3
                        WHEN 'B' THEN 3.0
                        WHEN 'B-' THEN 2.7
                        WHEN 'C+' THEN 2.3
                        WHEN 'C' THEN 2.0
                        WHEN 'C-' THEN 1.7
                        WHEN 'D' THEN 1.0
                        ELSE 0.0
                    END
                ) as gpa
            FROM Results r
            JOIN Enrollments e ON r.EnrollmentID = e.EnrollmentID
            WHERE e.StudentID = @studentId
        `, { studentId });
        
        const stats = resultsResult.recordset[0];
        const gpa = gpaResult.recordset[0].gpa || 0;
        const totalCourses = coursesResult.recordset[0].count;
        const passRate = stats.totalResults > 0 ? (stats.passed / stats.totalResults) * 100 : 0;
        
        return Response.json({
            success: true,
            statistics: {
                totalCourses: totalCourses,
                enrolledCourses: totalCourses,
                totalResults: stats.totalResults || 0,
                passedCourses: stats.passed || 0,
                failedCourses: stats.failed || 0,
                passed: stats.passed || 0,
                failed: stats.failed || 0,
                passRate: parseFloat(passRate.toFixed(2)),
                averagePercentage: stats.avgPercentage ? parseFloat(stats.avgPercentage) : 0,
                avgPercentage: stats.avgPercentage ? parseFloat(stats.avgPercentage).toFixed(2) : '0.00',
                gpa: parseFloat(gpa.toFixed(2)),
                highestGrade: stats.highestGrade || 'N/A',
                lowestGrade: stats.lowestGrade || 'N/A'
            }
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        return Response.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
}
