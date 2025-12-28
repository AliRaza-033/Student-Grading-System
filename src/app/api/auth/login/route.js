import { executeQuery } from '@/DB/db';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request) {
    try {
        const { username, password } = await request.json();
        
        // Validation
        if (!username || !password) {
            return Response.json({
                success: false,
                error: 'Username and password are required'
            }, { status: 400 });
        }
        
        // Get user from database
        const result = await executeQuery(
            'SELECT UserID, Username, Password, Role FROM Users WHERE Username = @username',
            { username }
        );
        
        if (result.recordset.length === 0) {
            return Response.json({
                success: false,
                error: 'Invalid credentials'
            }, { status: 401 });
        }
        
        const user = result.recordset[0];
        
        // Verify password
        const isValid = await verifyPassword(password, user.Password);
        
        if (!isValid) {
            return Response.json({
                success: false,
                error: 'Invalid credentials'
            }, { status: 401 });
        }
        
        // Get additional info based on role
        let additionalInfo = {};
        if (user.Role === 'Student') {
            const studentInfo = await executeQuery(
                'SELECT StudentID, RollNo, FullName, Department, Semester FROM Students WHERE UserID = @userId',
                { userId: user.UserID }
            );
            if (studentInfo.recordset.length > 0) {
                additionalInfo = studentInfo.recordset[0];
            }
        }
        
        // Create JWT token
        const token = await createToken({
            userId: user.UserID,
            username: user.Username,
            role: user.Role,
            ...additionalInfo
        });
        
        // Set cookie
        await setAuthCookie(token);
        
        return Response.json({
            success: true,
            message: 'Login successful',
            user: {
                userId: user.UserID,
                username: user.Username,
                role: user.Role,
                ...additionalInfo
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        return Response.json({
            success: false,
            error: 'Login failed'
        }, { status: 500 });
    }
}
