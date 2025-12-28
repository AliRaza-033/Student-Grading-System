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
        
        const result = await pool.request().query(`
            SELECT 
                CourseID,
                CourseCode,
                CourseName,
                CreditHours
            FROM Courses
            ORDER BY CourseCode
        `);

        return NextResponse.json({ success: true, courses: result.recordset });
    } catch (error) {
        console.error('Error fetching courses:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch courses' }, { status: 500 });
    }
}

export async function POST(request) {
    const authResult = requireAuth(request, 'Admin');
    if (authResult instanceof NextResponse) {
        return authResult;
    }

    try {
        const { courseCode, courseName, creditHours } = await request.json();

        if (!courseCode || !courseName) {
            return NextResponse.json({ success: false, error: 'Course code and course name are required' }, { status: 400 });
        }

        const pool = await db();

        // Check if course code exists
        const existingCourse = await pool.request()
            .input('courseCode', courseCode)
            .query('SELECT CourseID FROM Courses WHERE CourseCode = @courseCode');

        if (existingCourse.recordset.length > 0) {
            return NextResponse.json({ success: false, error: 'Course code already exists' }, { status: 400 });
        }

        await pool.request()
            .input('courseCode', courseCode)
            .input('courseName', courseName)
            .input('creditHours', creditHours || null)
            .query(`
                INSERT INTO Courses (CourseCode, CourseName, CreditHours)
                VALUES (@courseCode, @courseName, @creditHours)
            `);

        return NextResponse.json({ success: true, message: 'Course created successfully' });
    } catch (error) {
        console.error('Error creating course:', error);
        return NextResponse.json({ success: false, error: 'Failed to create course' }, { status: 500 });
    }
}
