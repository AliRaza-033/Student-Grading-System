import { NextResponse } from 'next/server';
import db from '@/DB/db.js';
import { requireAuth } from '@/lib/auth.js';

export async function PUT(request, { params }) {
    const authResult = requireAuth(request, 'Admin');
    if (authResult instanceof NextResponse) {
        return authResult;
    }

    try {
        const { id } = await params;
        const { rollNo, fullName, department, semester, password } = await request.json();

        if (!rollNo || !fullName) {
            return NextResponse.json({ success: false, error: 'Roll number and full name are required' }, { status: 400 });
        }

        // Validate password if provided
        if (password && password.length < 6) {
            return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        const pool = await db();

        // Get UserID
        const studentResult = await pool.request()
            .input('id', id)
            .query('SELECT UserID FROM Students WHERE StudentID = @id');

        if (studentResult.recordset.length === 0) {
            return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
        }

        const userId = studentResult.recordset[0].UserID;

        // Check if roll number exists for another student
        const existingRoll = await pool.request()
            .input('rollNo', rollNo)
            .input('studentId', id)
            .query('SELECT StudentID FROM Students WHERE RollNo = @rollNo AND StudentID != @studentId');

        if (existingRoll.recordset.length > 0) {
            return NextResponse.json({ success: false, error: 'Roll number already exists' }, { status: 400 });
        }

        // Update student info
        await pool.request()
            .input('id', id)
            .input('rollNo', rollNo)
            .input('fullName', fullName)
            .input('department', department || null)
            .input('semester', semester || null)
            .query(`
                UPDATE Students 
                SET RollNo = @rollNo, FullName = @fullName, Department = @department, Semester = @semester
                WHERE StudentID = @id
            `);

        // Update password if provided
        if (password) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.request()
                .input('userId', userId)
                .input('password', hashedPassword)
                .query('UPDATE Users SET Password = @password WHERE UserID = @userId');
        }

        return NextResponse.json({ success: true, message: 'Student updated successfully' });
    } catch (error) {
        console.error('Error updating student:', error);
        return NextResponse.json({ success: false, error: 'Failed to update student' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const authResult = requireAuth(request, 'Admin');
    if (authResult instanceof NextResponse) {
        return authResult;
    }

    try {
        const { id } = await params;
        const pool = await db();

        // Get UserID
        const student = await pool.request()
            .input('id', id)
            .query('SELECT UserID FROM Students WHERE StudentID = @id');

        if (student.recordset.length === 0) {
            return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
        }

        const userId = student.recordset[0].UserID;

        // Delete student (cascade will handle enrollments, grades, results)
        await pool.request()
            .input('id', id)
            .query('DELETE FROM Students WHERE StudentID = @id');

        // Delete user
        await pool.request()
            .input('userId', userId)
            .query('DELETE FROM Users WHERE UserID = @userId');

        return NextResponse.json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete student' }, { status: 500 });
    }
}
