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
                a.AssessmentID,
                a.CourseID,
                a.Title,
                a.TotalMarks,
                a.Weightage,
                c.CourseCode,
                c.CourseName
            FROM Assessments a
            JOIN Courses c ON a.CourseID = c.CourseID
            ORDER BY c.CourseName, a.Title
        `);

        return NextResponse.json({ success: true, assessments: result.recordset });
    } catch (error) {
        console.error('Error fetching assessments:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch assessments' }, { status: 500 });
    }
}

export async function POST(request) {
    const authResult = requireAuth(request, 'Admin');
    if (authResult instanceof NextResponse) {
        return authResult;
    }

    try {
        const { courseId, title, totalMarks, weightage } = await request.json();

        if (!courseId || !title || !totalMarks) {
            return NextResponse.json({ success: false, error: 'Course, title, and total marks are required' }, { status: 400 });
        }

        const pool = await db();

        const result = await pool.request()
            .input('courseId', courseId)
            .input('title', title)
            .input('totalMarks', totalMarks)
            .input('weightage', weightage || null)
            .query(`
                INSERT INTO Assessments (CourseID, Title, TotalMarks, Weightage)
                VALUES (@courseId, @title, @totalMarks, @weightage)
            `);

        return NextResponse.json({ success: true, message: 'Assessment created successfully' });
    } catch (error) {
        console.error('Error creating assessment:', error);
        return NextResponse.json({ success: false, error: 'Failed to create assessment' }, { status: 500 });
    }
}
