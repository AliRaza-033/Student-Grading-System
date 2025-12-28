import { NextResponse } from 'next/server';
import db from '@/DB/db.js';

export async function GET(request) {
    try {
        const pool = await db();

        // Get statistics in parallel
        const [studentsResult, coursesResult, enrollmentsResult, assessmentsResult, gradesResult, resultsResult] = await Promise.all([
            pool.request().query('SELECT COUNT(*) as count FROM Students'),
            pool.request().query('SELECT COUNT(*) as count FROM Courses'),
            pool.request().query('SELECT COUNT(*) as count FROM Enrollments'),
            pool.request().query('SELECT COUNT(*) as count FROM Assessments'),
            pool.request().query('SELECT COUNT(*) as count FROM Grades'),
            pool.request().query('SELECT COUNT(*) as count FROM Results')
        ]);

        const statistics = {
            totalStudents: studentsResult.recordset[0].count,
            totalCourses: coursesResult.recordset[0].count,
            totalEnrollments: enrollmentsResult.recordset[0].count,
            totalAssessments: assessmentsResult.recordset[0].count,
            totalGrades: gradesResult.recordset[0].count,
            totalResults: resultsResult.recordset[0].count
        };

        return NextResponse.json({ success: true, statistics });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch statistics' }, { status: 500 });
    }
}
