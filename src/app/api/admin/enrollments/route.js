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

      
        const enrollmentsResult = await pool.request().query(`
            SELECT EnrollmentID, StudentID, CourseID, AcademicYear
            FROM Enrollments
            ORDER BY EnrollmentID DESC
        `);

     
        const studentsResult = await pool.request().query(`
            SELECT StudentID, RollNo, FullName
            FROM Students
        `);


        const coursesResult = await pool.request().query(`
            SELECT CourseID, CourseCode, CourseName
            FROM Courses
        `);

        const enrollments = enrollmentsResult.recordset;
        const students = studentsResult.recordset;
        const courses = coursesResult.recordset;


        const finalEnrollments = enrollments.map(e => {
            const student = students.find(s => s.StudentID === e.StudentID);
            const course = courses.find(c => c.CourseID === e.CourseID);

            return {
                EnrollmentID: e.EnrollmentID,
                StudentID: e.StudentID,
                CourseID: e.CourseID,
                AcademicYear: e.AcademicYear,
                RollNo: student ? student.RollNo : null,
                StudentName: student ? student.FullName : null,
                CourseCode: course ? course.CourseCode : null,
                CourseName: course ? course.CourseName : null
            };
        });

        return NextResponse.json({
            success: true,
            enrollments: finalEnrollments
        });
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch enrollments' },
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
        const { studentId, courseId, academicYear } = await request.json();

        if (!studentId || !courseId) {
            return NextResponse.json(
                { success: false, error: 'Student and course are required' },
                { status: 400 }
            );
        }

        const pool = await db();

        
        const existing = await pool.request()
            .input('studentId', studentId)
            .input('courseId', courseId)
            .query(`
                SELECT EnrollmentID
                FROM Enrollments
                WHERE StudentID = @studentId AND CourseID = @courseId
            `);

        if (existing.recordset.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Student already enrolled in this course' },
                { status: 400 }
            );
        }

        
        await pool.request()
            .input('studentId', studentId)
            .input('courseId', courseId)
            .input(
                'academicYear',
                academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
            )
            .query(`
                INSERT INTO Enrollments (StudentID, CourseID, AcademicYear)
                VALUES (@studentId, @courseId, @academicYear)
            `);

        return NextResponse.json({
            success: true,
            message: 'Enrollment created successfully'
        });
    } catch (error) {
        console.error('Error creating enrollment:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create enrollment' },
            { status: 500 }
        );
    }
}
