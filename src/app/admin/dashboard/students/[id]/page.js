"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, BookOpen, Award, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudentOverviewPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params?.id;
  const [student, setStudent] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("enrollments");

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/admin/students`).then(r => r.json()),
      fetch(`/api/admin/students/${studentId}/enrollments`).then(r => r.json()),
      fetch(`/api/admin/students/${studentId}/grades`).then(r => r.json()),
      fetch(`/api/admin/students/${studentId}/results`).then(r => r.json()),
    ]).then(([studentsRes, enrollmentsRes, gradesRes, resultsRes]) => {
      const s = studentsRes.students?.find(stu => String(stu.StudentID) === String(studentId));
      setStudent(s || null);
      setDetails({
        enrollments: enrollmentsRes.enrollments || [],
        grades: gradesRes.grades || [],
        results: resultsRes.results || [],
      });
    }).finally(() => setLoading(false));
  }, [studentId]);

  // Function to get percentage from grade
  const getPercentageFromGrade = (grade) => {
    const gradeMap = {
      'A+': 95, 'A': 90, 'A-': 85,
      'B+': 80, 'B': 75, 'B-': 70,
      'C+': 65, 'C': 60, 'C-': 55,
      'D+': 50, 'D': 45, 'F': 0
    };
    return gradeMap[grade] || 0;
  };

  // Calculate statistics
  const stats = (() => {
    if (!details) return { gpa: 0, totalCourses: 0, passedCourses: 0, failedCourses: 0, avgPercentage: 0 };
    const { enrollments, results } = details;
    const passedCourses = results.filter(r => ["A+","A","A-","B+","B","B-","C+","C","C-","D"].includes(r.Grade)).length;
    const failedCourses = results.filter(r => r.Grade === "F").length;
    const avgPercentage = results.length > 0 ? results.reduce((sum, r) => sum + (parseFloat(r.TotalMarks) || 0), 0) / results.length : 0;
    return {
      gpa: results.length > 0 ? results[0].GPA : 0,
      totalCourses: enrollments.length,
      passedCourses,
      failedCourses,
      avgPercentage,
    };
  })();

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
  if (!student) return (
    <div className="text-center py-12 text-muted-foreground">Student not found</div>
  );

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-2">&larr; Back</Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Student Overview</CardTitle>
          <CardDescription>Complete academic overview and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-semibold">{student.FullName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Roll Number</p>
              <p className="font-semibold">{student.RollNo}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Username</p>
              <p className="font-semibold">{student.Username}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-semibold">{student.Department || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Semester</p>
              <p className="font-semibold">{student.Semester || 'N/A'}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">GPA</CardTitle>
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.gpa ? Number(stats.gpa).toFixed(2) : 'N/A'}</div>
                <p className="text-xs text-muted-foreground">Out of 4.0</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.totalCourses}</div>
                <p className="text-xs text-muted-foreground">Enrolled</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Passed</CardTitle>
                  <Award className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.passedCourses}</div>
                <p className="text-xs text-muted-foreground">Courses</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Average</CardTitle>
                  <BarChart3 className="h-4 w-4 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.avgPercentage.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Performance</p>
              </CardContent>
            </Card>
          </div>
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
              <TabsTrigger value="grades">Grades</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>
            <TabsContent value="enrollments">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Enrolled Courses</CardTitle>
                  <CardDescription>All courses this student is enrolled in</CardDescription>
                </CardHeader>
                <CardContent>
                  {details?.enrollments?.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course Code</TableHead>
                          <TableHead>Course Name</TableHead>
                          <TableHead>Credit Hours</TableHead>
                          <TableHead>Academic Year</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {details.enrollments.map((enrollment, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{enrollment.CourseCode}</TableCell>
                            <TableCell>{enrollment.CourseName}</TableCell>
                            <TableCell>{enrollment.CreditHours}</TableCell>
                            <TableCell>{enrollment.AcademicYear}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No enrollments found</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="grades">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Assessment Grades</CardTitle>
                  <CardDescription>Detailed breakdown of all assessments</CardDescription>
                </CardHeader>
                <CardContent>
                  {details?.grades?.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course</TableHead>
                          <TableHead>Assessment</TableHead>
                          <TableHead>Obtained</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {details.grades.map((grade, idx) => {
                          const percentage = (grade.ObtainedMarks / grade.TotalMarks) * 100;
                          return (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{grade.CourseCode}</TableCell>
                              <TableCell>{grade.AssessmentTitle}</TableCell>
                              <TableCell>{grade.ObtainedMarks}</TableCell>
                              <TableCell>{grade.TotalMarks}</TableCell>
                              <TableCell>
                                <Badge variant={percentage >= 50 ? "default" : "destructive"}>{percentage.toFixed(1)}%</Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No grades found</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="results">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Course Results</CardTitle>
                  <CardDescription>Final grades and performance summary</CardDescription>
                </CardHeader>
                <CardContent>
                  {details?.results?.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course</TableHead>
                          <TableHead>Course Name</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Percentage</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {details.results.map((result, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{result.CourseCode}</TableCell>
                            <TableCell>{result.CourseName}</TableCell>
                            <TableCell>
                              <Badge variant={result.Grade === 'F' ? "destructive" : "default"}>{result.Grade}</Badge>
                            </TableCell>
                            <TableCell>{Number(result.TotalMarks).toFixed(2)}%</TableCell>
                            <TableCell>
                              <Badge variant={result.Status === 'Pass' ? "default" : "destructive"}>{result.Status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No results found</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
