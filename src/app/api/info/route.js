import { connectDB, executeQuery, sql } from '@/DB/db';

// GET: Fetch all records from info table
export async function GET(request) {
    try {
        const result = await executeQuery('SELECT * FROM info');
        
        return Response.json({
            success: true,
            message: 'Data fetched successfully',
            count: result.recordset.length,
            data: result.recordset
        });
    } catch (error) {
        console.error('GET /api/info error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

// POST: Insert new record into info table
export async function POST(request) {
    try {
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return Response.json({
                success: false,
                error: 'Name is required'
            }, { status: 400 });
        }

        const result = await executeQuery(
            'INSERT INTO info (name) VALUES (@name); SELECT SCOPE_IDENTITY() AS id;',
            { name }
        );

        return Response.json({
            success: true,
            message: 'Record inserted successfully',
            id: result.recordset[0].id
        }, { status: 201 });
    } catch (error) {
        console.error('POST /api/info error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

// PUT: Update existing record
export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, name } = body;

        if (!id || !name) {
            return Response.json({
                success: false,
                error: 'ID and name are required'
            }, { status: 400 });
        }

        await executeQuery(
            'UPDATE info SET name = @name WHERE id = @id',
            { id, name }
        );

        return Response.json({
            success: true,
            message: 'Record updated successfully'
        });
    } catch (error) {
        console.error('PUT /api/info error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

// DELETE: Delete record by ID
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return Response.json({
                success: false,
                error: 'ID is required'
            }, { status: 400 });
        }

        await executeQuery(
            'DELETE FROM info WHERE id = @id',
            { id: parseInt(id) }
        );

        return Response.json({
            success: true,
            message: 'Record deleted successfully'
        });
    } catch (error) {
        console.error('DELETE /api/info error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
