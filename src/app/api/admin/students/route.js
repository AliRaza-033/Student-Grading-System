import { NextResponse } from 'next/server';
import db from '@/DB/db.js';
import bcrypt from 'bcryptjs';
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
                s.StudentID,
                s.UserID,
                s.RollNo,
                s.FullName,
                s.Department,
                s.Semester,
                s.CreatedAt,
                u.Username
            FROM Students s
            JOIN Users u ON s.UserID = u.UserID
            ORDER BY s.RollNo
        `);

        return NextResponse.json({ success: true, students: result.recordset });
    } catch (error) {
        console.error('Error fetching students:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch students' }, { status: 500 });
    }
}

export async function POST(request) {
    const authResult = requireAuth(request, 'Admin');
    if (authResult instanceof NextResponse) {
        return authResult;
    }

    try {
        const { rollNo, fullName, department, semester } = await request.json();

        if (!rollNo || !fullName) {
            return NextResponse.json({ success: false, error: 'Roll number and full name are required' }, { status: 400 });
        }

        const pool = await db();

        // Check if roll number exists
        const existingRoll = await pool.request()
            .input('rollNo', rollNo)
            .query('SELECT StudentID FROM Students WHERE RollNo = @rollNo');

        if (existingRoll.recordset.length > 0) {
            return NextResponse.json({ success: false, error: 'Roll number already exists' }, { status: 400 });
        }

        // Use Roll Number as username and set default password
        const username = rollNo;
        const defaultPassword = '12345678';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Create user
        const userResult = await pool.request()
            .input('username', username)
            .input('password', hashedPassword)
            .input('role', 'Student')
            .query(`
                INSERT INTO Users (Username, Password, Role)
                OUTPUT INSERTED.UserID
                VALUES (@username, @password, @role)
            `);

        const userId = userResult.recordset[0].UserID;

        // Create student
        await pool.request()
            .input('userId', userId)
            .input('rollNo', rollNo)
            .input('fullName', fullName)
            .input('department', department || null)
            .input('semester', semester || null)
            .query(`
                INSERT INTO Students (UserID, RollNo, FullName, Department, Semester)
                VALUES (@userId, @rollNo, @fullName, @department, @semester)
            `);

        return NextResponse.json({ success: true, message: 'Student created successfully' });
    } catch (error) {
        console.error('Error creating student:', error);
        return NextResponse.json({ success: false, error: 'Failed to create student' }, { status: 500 });
    }
}
