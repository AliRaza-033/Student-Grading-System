import { executeQuery } from '@/DB/db';
import { requireAuth } from '@/lib/auth';

/* =========================
   Helper: Letter Grade
   ========================= */
function calculateLetterGrade(percentage) {
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'A-';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 65) return 'B-';
    if (percentage >= 61) return 'C+';
    if (percentage >= 58) return 'C';
    if (percentage >= 55) return 'C-';
    if (percentage >= 50) return 'D';
    return 'F';
}

/* =========================
   POST: Calculate Result
   ========================= */
export async function POST(request) {
    const auth = await requireAuth('Admin');
    if (!auth.authorized) {
        return Response.json({ error: auth.error }, { status: 401 });
    }

    try {
        const { enrollmentId } = await request.json();

        if (!enrollmentId) {
            return Response.json(
                { error: 'Enrollment ID is required' },
                { status: 400 }
            );
        }

        // 1️⃣ Get grades for enrollment
        const grades = await executeQuery(`
            SELECT ObtainedMarks, AssessmentID
            FROM Grades
            WHERE EnrollmentID = @enrollmentId
        `, { enrollmentId });

        if (grades.recordset.length === 0) {
            return Response.json(
                { error: 'No grades found for this enrollment' },
                { status: 400 }
            );
        }

        // 2️⃣ Get all assessments
        const assessments = await executeQuery(`
            SELECT AssessmentID, TotalMarks, Weightage
            FROM Assessments
        `);

        // 3️⃣ Calculate weighted percentage
        let totalWeightedMarks = 0;
        let totalWeightage = 0;

        for (const g of grades.recordset) {
            const assessment = assessments.recordset.find(
                a => a.AssessmentID === g.AssessmentID
            );

            if (!assessment) continue;

            const percentage =
                (g.ObtainedMarks / assessment.TotalMarks) * 100;

            const weightage = assessment.Weightage || 0;

            totalWeightedMarks += (percentage * weightage) / 100;
            totalWeightage += weightage;
        }

        const finalPercentage = totalWeightage > 0 ? totalWeightedMarks : 0;
        const grade = calculateLetterGrade(finalPercentage);
        const status = finalPercentage >= 50 ? 'Pass' : 'Fail';

        // 4️⃣ Check if result already exists
        const existing = await executeQuery(`
            SELECT ResultID
            FROM Results
            WHERE EnrollmentID = @enrollmentId
        `, { enrollmentId });

        if (existing.recordset.length > 0) {
            // Update result
            await executeQuery(`
                UPDATE Results
                SET TotalMarks = @totalMarks,
                    Grade = @grade,
                    Status = @status
                WHERE EnrollmentID = @enrollmentId
            `, {
                enrollmentId,
                totalMarks: finalPercentage.toFixed(2),
                grade,
                status
            });
        } else {
            // Insert result
            await executeQuery(`
                INSERT INTO Results (EnrollmentID, TotalMarks, Grade, Status)
                VALUES (@enrollmentId, @totalMarks, @grade, @status)
            `, {
                enrollmentId,
                totalMarks: finalPercentage.toFixed(2),
                grade,
                status
            });
        }

        return Response.json({
            success: true,
            message: 'Result calculated successfully',
            result: {
                totalMarks: finalPercentage.toFixed(2),
                grade,
                status
            }
        });

    } catch (error) {
        console.error('Error calculating result:', error);
        return Response.json(
            { error: 'Failed to calculate result' },
            { status: 500 }
        );
    }
}

/* =========================
   GET: Fetch Results
   ========================= */
export async function GET(request) {
    const auth = await requireAuth('Admin');
    if (!auth.authorized) {
        return Response.json({ error: auth.error }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('studentId');

        // 1️⃣ Get results
        const results = await executeQuery(`
            SELECT ResultID, EnrollmentID, TotalMarks, Grade, Status
            FROM Results
        `);

        // 2️⃣ Get enrollments
        const enrollments = await executeQuery(`
            SELECT EnrollmentID, StudentID, CourseID, AcademicYear
            FROM Enrollments
        `);

        // 3️⃣ Get students
        const students = await executeQuery(`
            SELECT StudentID, RollNo, FullName
            FROM Students
        `);

        // 4️⃣ Get courses
        const courses = await executeQuery(`
            SELECT CourseID, CourseCode, CourseName
            FROM Courses
        `);

        // 🔗 Merge data in JS
        let finalResults = results.recordset.map(r => {
            const enrollment = enrollments.recordset.find(
                e => e.EnrollmentID === r.EnrollmentID
            );
            const student = students.recordset.find(
                s => s.StudentID === enrollment?.StudentID
            );
            const course = courses.recordset.find(
                c => c.CourseID === enrollment?.CourseID
            );

            return {
                ResultID: r.ResultID,
                TotalMarks: r.TotalMarks,
                Grade: r.Grade?.trim(),
                Status: r.Status?.trim(),

                EnrollmentID: enrollment?.EnrollmentID,
                AcademicYear: enrollment?.AcademicYear,

                StudentID: student?.StudentID,
                RollNo: student?.RollNo,
                StudentName: student?.FullName,

                CourseCode: course?.CourseCode,
                CourseName: course?.CourseName
            };
        });

        // Optional filter by student
        if (studentId) {
            finalResults = finalResults.filter(
                r => r.StudentID === parseInt(studentId)
            );
        }

        return Response.json({
            success: true,
            results: finalResults
        });

    } catch (error) {
        console.error('Error fetching results:', error);
        return Response.json(
            { error: 'Failed to fetch results' },
            { status: 500 }
        );
    }
}
