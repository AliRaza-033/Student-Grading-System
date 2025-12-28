import sql from 'mssql/msnodesqlv8.js';
import config from '../../dbconfig.js';

let pool = null;

/**
 * Connect to database and return connection pool
 * @returns {Promise<sql.ConnectionPool>} Database connection pool
 */
export async function connectDB() {
    try {
        if (pool) {
            return pool;
        }
        
        pool = await sql.connect(config);
        
        pool.on('error', err => {
            console.error('SQL Pool Error:', err);
            pool = null;
        });
        
        console.log('Database connected successfully');
        return pool;
    } catch (err) {
        console.error('Database connection failed:', err);
        throw err;
    }
}

/**
 * Execute a SQL query
 * @param {string} query - SQL query string
 * @param {Object} params - Query parameters (optional)
 * @returns {Promise<Object>} Query result
 */
export async function executeQuery(query, params = {}) {
    try {
        const connection = await connectDB();
        const request = connection.request();
        
        // Add parameters to request if provided
        Object.keys(params).forEach(key => {
            request.input(key, params[key]);
        });
        
        const result = await request.query(query);
        return result;
    } catch (err) {
        console.error('Query execution failed:', err);
        throw err;
    }
}

/**
 * Close the database connection pool
 */
export async function closeConnection() {
    try {
        if (pool) {
            await pool.close();
            pool = null;
            console.log('Database connection closed');
        }
    } catch (err) {
        console.error('Error closing connection:', err);
        throw err;
    }
}

export { sql };
export default connectDB;