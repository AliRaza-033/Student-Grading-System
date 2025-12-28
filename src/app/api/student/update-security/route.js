import { executeQuery } from '@/DB/db';
import { requireAuth } from '@/lib/auth';

export async function POST(request) {
    const auth = await requireAuth('Student');
    if (!auth.authorized) {
        return Response.json({ error: auth.error }, { status: 401 });
    }

    try {
        const { securityQuestionId, securityAnswer } = await request.json();

        if (!securityQuestionId || !securityAnswer) {
            return Response.json({ error: 'Security question and answer are required' }, { status: 400 });
        }

        const userId = auth.user.userId;

        // Check if user already has a security answer
        const existingResult = await executeQuery(
            'SELECT AnswerID FROM UserSecurityAnswers WHERE UserID = @userId',
            { userId }
        );

        if (existingResult.recordset.length > 0) {
            // Update existing security answer
            await executeQuery(`
                UPDATE UserSecurityAnswers 
                SET QuestionID = @questionId, 
                    Answer = @answer 
                WHERE UserID = @userId
            `, { 
                questionId: securityQuestionId, 
                answer: securityAnswer, 
                userId 
            });
        } else {
            // Insert new security answer
            await executeQuery(`
                INSERT INTO UserSecurityAnswers (UserID, QuestionID, Answer)
                VALUES (@userId, @questionId, @answer)
            `, { 
                userId,
                questionId: securityQuestionId, 
                answer: securityAnswer
            });
        }

        return Response.json({ 
            success: true, 
            message: 'Security question updated successfully' 
        });

    } catch (error) {
        console.error('Error updating security question:', error);
        return Response.json({ error: 'Failed to update security question' }, { status: 500 });
    }
}
