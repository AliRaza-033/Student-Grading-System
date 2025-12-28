# Student Grading System

A comprehensive offline student grading management system built with Next.js and MS SQL Server. This system provides role-based authentication for Admin and Students, allowing administrators to manage students, courses, enrollments, assessments, and grades, while students can view their academic performance.

---

## 📋 Features

### 🔐 Authentication & Security

- **JWT-based authentication** with httpOnly cookies
- **Role-based access control** (Admin and Student roles)
- **Password hashing** using bcryptjs
- **Security questions** for password recovery
- **Middleware protection** for routes
- **100% offline** - no external dependencies

### 👨‍💼 Admin Features

- Create and manage students with credentials
- Create and manage courses
- Enroll students in courses
- Create assessments (Quiz, Mid, Final, etc.) with weightage
- Enter and update student marks
- Calculate final results automatically
- View comprehensive reports

### 👨‍🎓 Student Features

- View enrolled courses
- View assessment grades by course
- View final results with letter grades
- Dashboard with statistics:
  - GPA calculation
  - Pass/fail statistics
  - Average percentage
  - Grade distribution
- Performance analytics

### 📊 Grading System

- **Automatic grade calculation** based on weightage
- **Letter grade system**: A, A-, B+, B, B-, C+, C, C-, D, F
- **Pass/Fail status** determination (50% passing threshold)
- **Weighted assessments** for accurate final scores

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Microsoft SQL Server (LocalDB/Express)
- **Authentication**: JWT (jose), bcryptjs
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Database Driver**: mssql with msnodesqlv8

---

## 📁 Project Structure

```
project/
├── dbconfig.js                     # Database configuration
├── next.config.mjs                 # Next.js config
├── src/
│   ├── app/
│   │   ├── page.js                 # Home page (redirects based on auth)
│   │   ├── login/page.js           # Login page
│   │   ├── forgot-password/page.js # Password recovery
│   │   ├── admin/
│   │   │   └── dashboard/page.js   # Admin dashboard
│   │   ├── student/
│   │   │   └── dashboard/page.js   # Student dashboard
│   │   └── api/
│   │       ├── auth/               # Authentication routes
│   │       ├── admin/              # Admin operation routes
│   │       └── student/            # Student data routes
│   ├── components/
│   │   ├── ui/                     # shadcn components
│   │   └── LogoutButton.js         # Logout component
│   ├── lib/
│   │   └── auth.js                 # Auth utilities
│   ├── middleware.js               # Route protection
│   └── DB/
│       ├── db.js                   # Database connection
│       └── README.md               # Database documentation
└── README.md                       # This file
```

---

## 🚀 Installation & Setup

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Microsoft SQL Server** (LocalDB, Express, or higher)
3. **ODBC Driver 17 for SQL Server** ([Download](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server))

### Step 1: Clone and Install

```bash
# Install dependencies
npm install
```

### Step 2: Create Database

Run the provided SQL script to create the database:

```sql
CREATE DATABASE StudentGradingSystem;
USE StudentGradingSystem;

-- Run all the table creation statements from your schema
-- (Users, Students, Courses, Enrollments, Assessments, Grades, Results, etc.)
```

**Important:** Don't forget to insert security questions:

```sql
INSERT INTO SecurityQuestions (QuestionText) VALUES
('What is your mother''s maiden name?'),
('What was the name of your first school?'),
('What is your favorite color?');
```

### Step 3: Configure Database Connection

Update `dbconfig.js` with your SQL Server details:

```javascript
const config = {
    connectionString: "server=localhost\\SQLEXPRESS;Database=StudentGradingSystem;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}"
};
```

### Step 4: Create Admin Account

Run this SQL to create the default admin account:

```sql
-- Password: admin123 (hashed)
INSERT INTO Users (Username, Password, Role)
VALUES ('admin', '$2a$10$YourHashedPasswordHere', 'Admin');
```

Or use the application's API:

```bash
# Start the dev server first
npm run dev

# Then use Postman or curl to create admin
POST http://localhost:3000/api/auth/register
{
  "username": "admin",
  "password": "admin123",
  "role": "Admin"
}
```

### Step 5: Run the Application

```bash
npm run dev
```

Visit: `http://localhost:3000`

---

## 📖 Usage Guide

### For Administrators

1. **Login** at `/login` with admin credentials
2. Navigate to **Admin Dashboard**
3. **Create Students**:
   - Go to "Students" tab
   - Fill in student details
   - Set up security question
   - Click "Create Student"

4. **Create Courses**:
   - Go to "Courses" tab
   - Enter course code, name, and credit hours
   - Click "Create Course"

5. **Enroll Students**:
   - Go to "Enrollments" tab
   - Select student and course
   - Set academic year
   - Click "Create Enrollment"

6. **Create Assessments**:
   - Go to "Assessments" tab
   - Select course
   - Enter assessment details (Quiz 1, Mid, Final)
   - Set total marks and weightage %
   - Click "Create Assessment"

7. **Enter Grades**:
   - Go to "Grades" tab
   - Select enrollment and assessment
   - Enter obtained marks
   - Click "Save Grade"

8. **Generate Results**:
   - Go to "Enrollments" tab
   - Click "Calculate Result" button for each enrollment
   - View final results in "Results" tab

### For Students

1. **Login** at `/login` with student credentials
2. View **Dashboard** with:
   - GPA
   - Enrolled courses count
   - Pass rate
   - Average percentage

3. **View Courses**:
   - Click "Courses" tab
   - See all enrolled courses

4. **View Grades**:
   - Click "Grades" tab
   - See marks for each assessment
   - View percentage and weightage

5. **View Results**:
   - Click "Results" tab
   - See final grades and pass/fail status
   - View grade distribution

### Password Recovery

1. Click "Forgot password?" on login page
2. Enter username
3. Select security question
4. Enter answer
5. Set new password

---

## 🔒 Security Features

### Password Security

- All passwords hashed with bcryptjs (10 rounds)
- Security answers stored as hashed values
- Never stored in plain text

### Authentication

- JWT tokens with 24-hour expiration
- HttpOnly cookies (XSS protection)
- Secure flag in production
- SameSite: lax policy

### Authorization

- Middleware-based route protection
- Role-based access control
- API endpoint validation
- Protected admin and student routes

### SQL Injection Prevention

- Parameterized queries throughout
- No raw SQL string concatenation
- Input validation on all forms

---

## 📊 Database Schema

### Core Tables

**Users** - Authentication and user accounts

- UserID, Username, Password, Role, CreatedAt

**Students** - Student information

- StudentID, UserID, RollNo, FullName, Department, Semester

**Courses** - Course catalog

- CourseID, CourseCode, CourseName, CreditHours

**Enrollments** - Student-course relationships

- EnrollmentID, StudentID, CourseID, AcademicYear

**Assessments** - Quizzes, exams, assignments

- AssessmentID, CourseID, Title, TotalMarks, Weightage

**Grades** - Individual assessment marks

- GradeID, EnrollmentID, AssessmentID, ObtainedMarks

**Results** - Final computed results

- ResultID, EnrollmentID, TotalMarks, Grade, Status

**SecurityQuestions** & **UserSecurityAnswers** - Password recovery

---

## 🎯 Grading System Details

### Letter Grade Scale

| Percentage | Grade | GPA |
|------------|-------|-----|
| 85-100 | A | 4.0 |
| 80-84 | A- | 3.7 |
| 75-79 | B+ | 3.3 |
| 70-74 | B | 3.0 |
| 65-69 | B- | 2.7 |
| 61-64 | C+ | 2.3 |
| 58-60 | C | 2.0 |
| 55-57 | C- | 1.7 |
| 50-54 | D | 1.0 |
| <50 | F | 0.0 |

### Result Calculation

1. Each assessment has a weightage (e.g., Quiz: 10%, Mid: 30%, Final: 60%)
2. Calculate percentage for each assessment
3. Apply weightage to get weighted marks
4. Sum all weighted marks for final percentage
5. Convert to letter grade
6. Determine Pass/Fail (≥50% = Pass)

---

## 🔧 Configuration

### Environment Variables (Optional)

Create `.env.local`:

```env
JWT_SECRET=your-secret-key-min-32-chars
DB_SERVER=localhost\SQLEXPRESS
DB_NAME=StudentGradingSystem
```

### Next.js Configuration

The `next.config.mjs` includes:

```javascript
serverExternalPackages: ['mssql', 'mssql/msnodesqlv8', 'msnodesqlv8']
```

This is required for native SQL modules to work.

---

## 📱 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `GET /api/auth/security-questions` - Get questions
- `POST /api/auth/reset-password` - Reset password

### Admin Operations

- `GET/POST/PUT/DELETE /api/admin/students` - Manage students
- `GET/POST/PUT/DELETE /api/admin/courses` - Manage courses
- `GET/POST/DELETE /api/admin/enrollments` - Manage enrollments
- `GET/POST/PUT/DELETE /api/admin/assessments` - Manage assessments
- `GET/POST /api/admin/grades` - Enter grades
- `GET/POST /api/admin/results` - View/calculate results

### Student Operations

- `GET /api/student/courses` - View enrolled courses
- `GET /api/student/grades` - View grades
- `GET /api/student/results` - View results
- `GET /api/student/dashboard` - Get statistics

---

## 🐛 Troubleshooting

### Database Connection Issues

**Error: "Could not resolve sqlserver.node"**

- Ensure `serverExternalPackages` is in `next.config.mjs`
- Restart dev server after config changes

**Error: "Login failed for user"**

- Check Windows Authentication is enabled
- Verify database name is correct
- Test connection with SSMS

**Error: "Cannot connect to SQL Server"**

- Ensure SQL Server is running
- Start SQL Server Browser service
- Check firewall settings

### Authentication Issues

**"Unauthorized" errors**

- Clear browser cookies
- Check JWT_SECRET is set
- Verify middleware.js is in src/ directory

**Password reset not working**

- Ensure security questions are inserted in database
- Verify answers are stored as lowercase
- Check hash comparison logic

---

## 📝 Development Notes

### Adding New Features

**Add a new assessment type:**

1. Simply enter it as Title in Assessment form (e.g., "Assignment 1")
2. No code changes needed

**Modify grading scale:**

1. Edit `calculateLetterGrade()` in `/api/admin/results/route.js`
2. Update GPA calculation in `/api/student/dashboard/route.js`

**Add new user role:**

1. Update Users table CHECK constraint
2. Add role to middleware.js matcher
3. Create new dashboard route
4. Add API routes with role check

---

## 🚀 Production Deployment

### Before Deploying

1. **Change JWT_SECRET** to a strong random string (min 32 characters)
2. **Use production database** (not LocalDB)
3. **Enable HTTPS** for secure cookies
4. **Review security settings** in middleware
5. **Test all features** thoroughly
6. **Backup database** before going live

### Environment Setup

```env
NODE_ENV=production
JWT_SECRET=your-production-secret-min-32-chars
DB_SERVER=production-server
DB_NAME=StudentGradingSystem
```

---

## 📄 License

This project is created for educational purposes.

---

## 👥 Support

For issues or questions:

1. Check troubleshooting section above
2. Review database connection guide in `src/DB/README.md`
3. Verify all prerequisites are installed
4. Check console for detailed error messages

---

## ✅ Quick Start Checklist

- [ ] SQL Server installed and running
- [ ] ODBC Driver 17 installed
- [ ] Database created with all tables
- [ ] Security questions inserted
- [ ] Admin account created
- [ ] Database config updated in `dbconfig.js`
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server running (`npm run dev`)
- [ ] Can login as admin
- [ ] Can create student
- [ ] Can view student dashboard

---

**Built with ❤️ using Next.js and MS SQL Server**
