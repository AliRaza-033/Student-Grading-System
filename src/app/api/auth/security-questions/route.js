import { executeQuery } from '@/DB/db';

// Get all security questions
export async function GET() {
    try {
        const result = await executeQuery(
            'SELECT QuestionID, QuestionText FROM SecurityQuestions'
        );
        
        return Response.json({
            success: true,
            questions: result.recordset
        });
    } catch (error) {
        console.error('Error fetching security questions:', error);
        return Response.json({
            success: false,
            error: 'Failed to fetch security questions'
        }, { status: 500 });
    }
}
