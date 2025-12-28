import { executeQuery } from '@/DB/db';

// GET: Fetch single record by ID
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const result = await executeQuery(
            'SELECT * FROM info WHERE id = @id',
            { id: parseInt(id) }
        );

        if (result.recordset.length === 0) {
            return Response.json({
                success: false,
                error: 'Record not found'
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            data: result.recordset[0]
        });
    } catch (error) {
        console.error('GET /api/info/[id] error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
