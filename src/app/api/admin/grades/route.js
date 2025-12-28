import { NextResponse } from 'next/server';
import db from '@/DB/db.js';
import { requireAuth } from '@/lib/auth.js';


export async function GET(request) {
    const authResult = requireAuth(request, 'Admin');
    if (authResult instanceof NextResponse) {
        return authResult;
    }

    try {
        const pool = await db();

    
        const gradesResult = await pool.request().query(`
            SELECT GradeID, EnrollmentID, AssessmentID, ObtainedMarks
            FROM Grades
        `);

    
        const enrollmentsResult = await pool.request().query(`
            SELECT EnrollmentID, StudentID, CourseID
            FROM Enrollments
        `);

    
        const studentsResult = await pool.request().query(`
            SELECT StudentID, FullName, RollNo
            FROM Students
        `);

    
        const coursesResult = await pool.request().query(`
            SELECT CourseID, CourseCode, CourseName
            FROM Courses
        `);

      
        const assessmentsResult = await pool.request().query(`
            SELECT AssessmentID, Title, TotalMarks
            FROM Assessments
        `);

        const grades = gradesResult.recordset;
        const enrollments = enrollmentsResult.recordset;
        const students = studentsResult.recordset;
        const courses = coursesResult.recordset;
        const assessments = assessmentsResult.recordset;

       
        const finalGrades = grades.map(g => {
            const enrollment = enrollments.find(e => e.EnrollmentID === g.EnrollmentID);
            const student = students.find(s => s.StudentID === enrollment?.StudentID);
            const course = courses.find(c => c.CourseID === enrollment?.CourseID);
            const assessment = assessments.find(a => a.AssessmentID === g.AssessmentID);

            return {
                GradeID: g.GradeID,
                EnrollmentID: g.EnrollmentID,
                AssessmentID: g.AssessmentID,
                ObtainedMarks: g.ObtainedMarks,

                StudentID: student?.StudentID,
                StudentName: student?.FullName,
                RollNo: student?.RollNo,

                CourseID: course?.CourseID,
                CourseCode: course?.CourseCode,
                CourseName: course?.CourseName,

                AssessmentTitle: assessment?.Title,
                TotalMarks: assessment?.TotalMarks
            };
        });

        return NextResponse.json({
            success: true,
            grades: finalGrades
        });
    } catch (error) {
        console.error('Error fetching grades:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch grades' },
            { status: 500 }
        );
    }
}


export async function POST(request) {
    const authResult = requireAuth(request, 'Admin');
    if (authResult instanceof NextResponse) {
        return authResult;
    }

    try {
        const { enrollmentId, assessmentId, obtainedMarks } = await request.json();

        if (!enrollmentId || !assessmentId || obtainedMarks === undefined) {
            return NextResponse.json(
                { success: false, error: 'Enrollment, assessment and marks are required' },
                { status: 400 }
            );
        }

        const pool = await db();

        // 🔍 Check if grade already exists
        const existing = await pool.request()
            .input('enrollmentId', enrollmentId)
            .input('assessmentId', assessmentId)
            .query(`
                SELECT GradeID
                FROM Grades
                WHERE EnrollmentID = @enrollmentId
                AND AssessmentID = @assessmentId
            `);

        if (existing.recordset.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Grade already exists for this assessment' },
                { status: 400 }
            );
        }

        // ➕ Insert grade
        await pool.request()
            .input('enrollmentId', enrollmentId)
            .input('assessmentId', assessmentId)
            .input('obtainedMarks', obtainedMarks)
            .query(`
                INSERT INTO Grades (EnrollmentID, AssessmentID, ObtainedMarks)
                VALUES (@enrollmentId, @assessmentId, @obtainedMarks)
            `);

        return NextResponse.json({
            success: true,
            message: 'Grade created successfully'
        });
    } catch (error) {
        console.error('Error creating grade:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create grade' },
            { status: 500 }
        );
    }
}
