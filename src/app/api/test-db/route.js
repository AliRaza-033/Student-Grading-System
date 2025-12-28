import { connectDB, executeQuery } from '@/DB/db';

// Test database connection and run example queries
export async function GET(request) {
    const results = {
        connection: null,
        examples: []
    };

    try {
        // Test 1: Connection
        const pool = await connectDB();
        results.connection = {
            success: true,
            message: 'Database connected successfully',
            connected: pool.connected
        };

        // Test 2: Query all records
        try {
            const allRecords = await executeQuery('SELECT * FROM info');
            results.examples.push({
                test: 'Get all records',
                success: true,
                count: allRecords.recordset.length,
                data: allRecords.recordset
            });
        } catch (err) {
            results.examples.push({
                test: 'Get all records',
                success: false,
                error: err.message
            });
        }

        // Test 3: Query with parameter
        try {
            const singleRecord = await executeQuery(
                'SELECT TOP 1 * FROM info WHERE id = @id',
                { id: 1 }
            );
            results.examples.push({
                test: 'Get record by ID',
                success: true,
                data: singleRecord.recordset[0] || null
            });
        } catch (err) {
            results.examples.push({
                test: 'Get record by ID',
                success: false,
                error: err.message
            });
        }

        // Test 4: Count records
        try {
            const count = await executeQuery('SELECT COUNT(*) as total FROM info');
            results.examples.push({
                test: 'Count all records',
                success: true,
                total: count.recordset[0].total
            });
        } catch (err) {
            results.examples.push({
                test: 'Count all records',
                success: false,
                error: err.message
            });
        }

        return Response.json({
            success: true,
            message: 'Database tests completed',
            results
        });

    } catch (error) {
        console.error('Database test error:', error);
        return Response.json({
            success: false,
            error: error.message,
            results
        }, { status: 500 });
    }
}
