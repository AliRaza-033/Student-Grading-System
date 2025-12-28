import { executeQuery } from '@/DB/db';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request) {
    try {
        const { username, password, role, securityQuestions } = await request.json();
        
        // Validation
        if (!username || !password || !role) {
            return Response.json({
                success: false,
                error: 'Username, password, and role are required'
            }, { status: 400 });
        }
        
        if (!['Admin', 'Student'].includes(role)) {
            return Response.json({
                success: false,
                error: 'Invalid role'
            }, { status: 400 });
        }
        
        // Check if username exists
        const existingUser = await executeQuery(
            'SELECT UserID FROM Users WHERE Username = @username',
            { username }
        );
        
        if (existingUser.recordset.length > 0) {
            return Response.json({
                success: false,
                error: 'Username already exists'
            }, { status: 409 });
        }
        
        // Hash password
        const hashedPassword = await hashPassword(password);
        
        // Insert user
        const result = await executeQuery(
            'INSERT INTO Users (Username, Password, Role) OUTPUT INSERTED.UserID VALUES (@username, @password, @role)',
            { username, password: hashedPassword, role }
        );
        
        const userId = result.recordset[0].UserID;
        
        // Insert security questions if provided
        if (securityQuestions && securityQuestions.length > 0) {
            for (const sq of securityQuestions) {
                const hashedAnswer = await hashPassword(sq.answer.toLowerCase().trim());
                await executeQuery(
                    'INSERT INTO UserSecurityAnswers (UserID, QuestionID, Answer) VALUES (@userId, @questionId, @answer)',
                    { userId, questionId: sq.questionId, answer: hashedAnswer }
                );
            }
        }
        
        return Response.json({
            success: true,
            message: 'User registered successfully',
            userId
        }, { status: 201 });
        
    } catch (error) {
        console.error('Registration error:', error);
        return Response.json({
            success: false,
            error: 'Registration failed'
        }, { status: 500 });
    }
}
