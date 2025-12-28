import { executeQuery } from '@/DB/db';
import { verifyPassword, hashPassword } from '@/lib/auth';

export async function POST(request) {
    try {
        const { username, securityAnswers, newPassword } = await request.json();
        
        // Validation
        if (!username || !securityAnswers || !newPassword) {
            return Response.json({
                success: false,
                error: 'All fields are required'
            }, { status: 400 });
        }
        
        // Get user
        const userResult = await executeQuery(
            'SELECT UserID FROM Users WHERE Username = @username',
            { username }
        );
        
        if (userResult.recordset.length === 0) {
            return Response.json({
                success: false,
                error: 'User not found'
            }, { status: 404 });
        }
        
        const userId = userResult.recordset[0].UserID;
        
        // Verify security answers
        const answersResult = await executeQuery(
            'SELECT QuestionID, Answer FROM UserSecurityAnswers WHERE UserID = @userId',
            { userId }
        );
        
        if (answersResult.recordset.length === 0) {
            return Response.json({
                success: false,
                error: 'No security question set. Please contact admin to reset your password.'
            }, { status: 400 });
        }
        
        // Verify each answer
        for (const provided of securityAnswers) {
            const storedAnswer = answersResult.recordset.find(
                a => a.QuestionID === provided.questionId
            );
            
            if (!storedAnswer) {
                return Response.json({
                    success: false,
                    error: 'Invalid security question'
                }, { status: 400 });
            }
            
            const isValid = await verifyPassword(
                provided.answer.toLowerCase().trim(),
                storedAnswer.Answer
            );
            
            if (!isValid) {
                return Response.json({
                    success: false,
                    error: 'Incorrect security answer'
                }, { status: 401 });
            }
        }
        
        // Update password
        const hashedPassword = await hashPassword(newPassword);
        await executeQuery(
            'UPDATE Users SET Password = @password WHERE UserID = @userId',
            { password: hashedPassword, userId }
        );
        
        return Response.json({
            success: true,
            message: 'Password reset successfully'
        });
        
    } catch (error) {
        console.error('Reset password error:', error);
        return Response.json({
            success: false,
            error: 'Password reset failed'
        }, { status: 500 });
    }
}
