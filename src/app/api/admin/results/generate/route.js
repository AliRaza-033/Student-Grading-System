import { NextResponse } from 'next/server';
import db from '@/DB/db.js';
import { requireAuth } from '@/lib/auth.js';

export async function POST(request) {
    const authResult = requireAuth(request, 'Admin');
    if (authResult instanceof NextResponse) {
        return authResult;
    }

    try {
        const pool = await db();

        // Get all enrollments with their grades
        const enrollments = await pool.request().query(`
            SELECT 
                e.EnrollmentID,
                e.StudentID,
                e.CourseID,
                c.CreditHours,
                AVG(CAST(g.ObtainedMarks AS FLOAT) / CAST(a.TotalMarks AS FLOAT) * 100) as AveragePercentage,
                COUNT(DISTINCT a.AssessmentID) as TotalAssessments,
                COUNT(DISTINCT g.GradeID) as GradedAssessments
            FROM Enrollments e
            JOIN Courses c ON e.CourseID = c.CourseID
            LEFT JOIN Assessments a ON a.CourseID = c.CourseID
            LEFT JOIN Grades g ON g.EnrollmentID = e.EnrollmentID AND g.AssessmentID = a.AssessmentID
            GROUP BY e.EnrollmentID, e.StudentID, e.CourseID, c.CreditHours
        `);

        let generated = 0;
        let skipped = 0;

        for (const enrollment of enrollments.recordset) {
            // Only generate if student has grades for all assessments
            if (enrollment.TotalAssessments === 0 || enrollment.GradedAssessments === 0) {
                skipped++;
                continue;
            }

            if (enrollment.TotalAssessments !== enrollment.GradedAssessments) {
                skipped++;
                continue;
            }

            const percentage = enrollment.AveragePercentage || 0;
            
            // Calculate grade based on percentage
            let grade, status;
            if (percentage >= 85) {
                grade = 'A';
            } else if (percentage >= 80) {
                grade = 'A-';
            } else if (percentage >= 75) {
                grade = 'B+';
            } else if (percentage >= 70) {
                grade = 'B';
            } else if (percentage >= 65) {
                grade = 'B-';
            } else if (percentage >= 60) {
                grade = 'C+';
            } else if (percentage >= 55) {
                grade = 'C';
            } else if (percentage >= 50) {
                grade = 'C-';
            } else if (percentage >= 45) {
                grade = 'D';
            } else {
                grade = 'F';
            }
            
            status = percentage >= 50 ? 'Pass' : 'Fail';

            // Check if result already exists
            const existingResult = await pool.request()
                .input('enrollmentId', enrollment.EnrollmentID)
                .query('SELECT ResultID FROM Results WHERE EnrollmentID = @enrollmentId');

            if (existingResult.recordset.length > 0) {
                // Update existing result
                await pool.request()
                    .input('resultId', existingResult.recordset[0].ResultID)
                    .input('totalMarks', percentage)
                    .input('grade', grade)
                    .input('status', status)
                    .query(`
                        UPDATE Results 
                        SET TotalMarks = @totalMarks, Grade = @grade, Status = @status
                        WHERE ResultID = @resultId
                    `);
            } else {
                // Create new result
                await pool.request()
                    .input('enrollmentId', enrollment.EnrollmentID)
                    .input('totalMarks', percentage)
                    .input('grade', grade)
                    .input('status', status)
                    .query(`
                        INSERT INTO Results (EnrollmentID, TotalMarks, Grade, Status)
                        VALUES (@enrollmentId, @totalMarks, @grade, @status)
                    `);
            }

            generated++;
        }

        return NextResponse.json({ 
            success: true, 
            message: `Generated ${generated} results. Skipped ${skipped} incomplete enrollments.`,
            generated,
            skipped
        });
    } catch (error) {
        console.error('Error generating results:', error);
        return NextResponse.json({ success: false, error: 'Failed to generate results' }, { status: 500 });
    }
}
