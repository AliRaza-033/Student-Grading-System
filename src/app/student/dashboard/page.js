'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  Home, 
  BookOpen, 
  BarChart3, 
  Award,
  LogOut,
  TrendingUp,
  User
} from 'lucide-react';

export default function StudentDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [courses, setCourses] = useState([]);
    const [grades, setGrades] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch user info
            const userRes = await fetch('/api/auth/me');
            const userData = await userRes.json();
            if (userData.success) {
                setUser(userData.user);
            }

            // Fetch statistics
            const statsRes = await fetch('/api/student/dashboard');
            const statsData = await statsRes.json();
            if (statsData.success) {
                setStatistics(statsData.statistics);
            }

            // Fetch courses
            const coursesRes = await fetch('/api/student/courses');
            const coursesData = await coursesRes.json();
            if (coursesData.success) {
                setCourses(coursesData.courses);
            }

            // Fetch grades
            const gradesRes = await fetch('/api/student/grades');
            const gradesData = await gradesRes.json();
            if (gradesData.success) {
                setGrades(gradesData.grades);
            }

            // Fetch results
            const resultsRes = await fetch('/api/student/results');
            const resultsData = await resultsRes.json();
            if (resultsData.success) {
                setResults(resultsData.results);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
    };

    const menuItems = [
        { icon: Home, label: 'Overview', value: 'overview' },
        { icon: BookOpen, label: 'My Courses', value: 'courses' },
        { icon: BarChart3, label: 'Grades', value: 'grades' },
        { icon: Award, label: 'Results', value: 'results' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-lg text-muted-foreground">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <Sidebar>
                    <SidebarHeader className="border-b px-6 py-4">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-6 w-6 text-primary" />
                            <div>
                                <h2 className="font-semibold">Student Portal</h2>
                                <p className="text-xs text-muted-foreground">Academic Dashboard</p>
                            </div>
                        </div>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {menuItems.map((item) => (
                                        <SidebarMenuItem key={item.value}>
                                            <SidebarMenuButton
                                                onClick={() => setActiveTab(item.value)}
                                                isActive={activeTab === item.value}
                                            >
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.label}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        {user && (
                            <SidebarGroup>
                                <SidebarGroupLabel>Profile</SidebarGroupLabel>
                                <SidebarGroupContent className="px-4 py-2 text-sm space-y-1">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <User className="h-4 w-4" />
                                        <span className="font-medium">{user.FullName}</span>
                                    </div>
                                    <div className="pl-6 text-xs space-y-1">
                                        <p>Roll No: <span className="font-medium">{user.RollNo}</span></p>
                                        <p>Department: <span className="font-medium">{user.Department}</span></p>
                                        <p>Semester: <span className="font-medium">{user.Semester}</span></p>
                                    </div>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        )}
                    </SidebarContent>

                    <SidebarFooter className="border-t p-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="w-full justify-start"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </SidebarFooter>
                </Sidebar>

                <main className="flex-1 overflow-auto">
                    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="flex h-16 items-center gap-4 px-6">
                            <SidebarTrigger />
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold">My Dashboard</h1>
                            </div>
                            <ThemeToggle />
                        </div>
                    </header>

                    <div className="p-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsContent value="overview" className="space-y-6">
                                {/* My Profile Card */}
                                {user && (
                                    <Card className="border-t-4 border-t-primary">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <User className="h-5 w-5" />
                                                        My Profile
                                                    </CardTitle>
                                                    <CardDescription>Your personal and academic information</CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                                                    <p className="text-lg font-semibold">{user.FullName}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-muted-foreground">Roll Number</p>
                                                    <p className="text-lg font-semibold">{user.RollNo}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-muted-foreground">Username</p>
                                                    <p className="text-lg font-semibold">{user.Username}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-muted-foreground">Department</p>
                                                    <p className="text-lg font-semibold">{user.Department || 'Not Specified'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-muted-foreground">Semester</p>
                                                    <p className="text-lg font-semibold">{user.Semester ? `Semester ${user.Semester}` : 'Not Specified'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-muted-foreground">Role</p>
                                                    <Badge variant="secondary" className="text-sm">{user.Role}</Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Statistics Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <Card className="border-l-4 border-l-blue-500">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">GPA</CardTitle>
                                                <TrendingUp className="h-4 w-4 text-blue-500" />
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                                {statistics?.gpa ? Number(statistics.gpa).toFixed(2) : 'N/A'}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">Out of 4.0</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-l-4 border-l-green-500">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">Enrolled Courses</CardTitle>
                                                <BookOpen className="h-4 w-4 text-green-500" />
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                                {statistics?.totalCourses || 0}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">Active courses</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-l-4 border-l-purple-500">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">Pass Rate</CardTitle>
                                                <Award className="h-4 w-4 text-purple-500" />
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                                {statistics?.passRate ? Number(statistics.passRate).toFixed(0) : 0}%
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">Success rate</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-l-4 border-l-orange-500">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
                                                <BarChart3 className="h-4 w-4 text-orange-500" />
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                                {statistics?.averagePercentage ? Number(statistics.averagePercentage).toFixed(1) : 0}%
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">Overall performance</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Academic Summary */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Academic Summary</CardTitle>
                                        <CardDescription>Your overall academic performance</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2 p-4 rounded-lg bg-green-50 dark:bg-green-950">
                                                <p className="text-sm text-muted-foreground">Courses Passed</p>
                                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                    {statistics?.passedCourses || 0}
                                                </p>
                                            </div>
                                            <div className="space-y-2 p-4 rounded-lg bg-red-50 dark:bg-red-950">
                                                <p className="text-sm text-muted-foreground">Courses Failed</p>
                                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                                    {statistics?.failedCourses || 0}
                                                </p>
                                            </div>
                                            <div className="space-y-2 p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                                                <p className="text-sm text-muted-foreground">Highest Grade</p>
                                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                    {statistics?.highestGrade || 'N/A'}
                                                </p>
                                            </div>
                                            <div className="space-y-2 p-4 rounded-lg bg-purple-50 dark:bg-purple-950">
                                                <p className="text-sm text-muted-foreground">Lowest Grade</p>
                                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                                    {statistics?.lowestGrade || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="courses" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>My Courses</CardTitle>
                                        <CardDescription>All courses you are currently enrolled in</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {courses.length > 0 ? (
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
                                                    {courses.map((course) => (
                                                        <TableRow key={course.EnrollmentID}>
                                                            <TableCell className="font-medium">{course.CourseCode}</TableCell>
                                                            <TableCell>{course.CourseName}</TableCell>
                                                            <TableCell>{course.CreditHours}</TableCell>
                                                            <TableCell>{course.AcademicYear}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <div className="text-center py-12">
                                                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                <p className="text-muted-foreground">No courses enrolled yet</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="grades" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Assessment Grades</CardTitle>
                                        <CardDescription>Detailed breakdown of your performance in each assessment</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {grades.length > 0 ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Course</TableHead>
                                                        <TableHead>Assessment</TableHead>
                                                        <TableHead>Obtained</TableHead>
                                                        <TableHead>Total</TableHead>
                                                        <TableHead>Percentage</TableHead>
                                                        <TableHead>Weightage</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {grades.map((grade) => {
                                                        const percentage = (grade.ObtainedMarks / grade.TotalMarks) * 100;
                                                        const isGood = percentage >= 70;
                                                        const isAverage = percentage >= 50 && percentage < 70;
                                                        
                                                        return (
                                                            <TableRow key={grade.GradeID}>
                                                                <TableCell className="font-medium">{grade.CourseCode}</TableCell>
                                                                <TableCell>{grade.Title}</TableCell>
                                                                <TableCell>{grade.ObtainedMarks}</TableCell>
                                                                <TableCell>{grade.TotalMarks}</TableCell>
                                                                <TableCell>
                                                                    <span className={`font-semibold ${
                                                                        isGood ? 'text-green-600 dark:text-green-400' : 
                                                                        isAverage ? 'text-orange-600 dark:text-orange-400' : 
                                                                        'text-red-600 dark:text-red-400'
                                                                    }`}>
                                                                        {percentage.toFixed(2)}%
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <span className="text-muted-foreground">{grade.Weightage}%</span>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <div className="text-center py-12">
                                                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                <p className="text-muted-foreground">No grades available yet</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="results" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Final Results</CardTitle>
                                        <CardDescription>Your final grades and performance across all courses</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {results.length > 0 ? (
                                            <div className="space-y-6">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Course</TableHead>
                                                            <TableHead>Total Marks</TableHead>
                                                            <TableHead>Percentage</TableHead>
                                                            <TableHead>Grade</TableHead>
                                                            <TableHead>Status</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {results.map((result) => (
                                                            <TableRow key={result.ResultID}>
                                                                <TableCell className="font-medium">{result.CourseName}</TableCell>
                                                                <TableCell>{result.TotalMarks ? Number(result.TotalMarks).toFixed(2) : 'N/A'}</TableCell>
                                                                <TableCell>
                                                                    <span className="font-semibold">
                                                                        {result.Percentage ? Number(result.Percentage).toFixed(2) : 'N/A'}%
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <span className={`text-lg font-bold ${
                                                                        result.Grade === 'F' ? 'text-red-600 dark:text-red-400' : 
                                                                        result.Grade === 'A' ? 'text-green-600 dark:text-green-400' :
                                                                        'text-blue-600 dark:text-blue-400'
                                                                    }`}>
                                                                        {result.Grade}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                                        result.Status === 'Pass' 
                                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                                                                            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                                    }`}>
                                                                        {result.Status}
                                                                    </span>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>

                                                {/* Grade Distribution */}
                                                <div className="mt-8">
                                                    <h3 className="text-lg font-semibold mb-4">Grade Distribution</h3>
                                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                        {['A', 'B', 'C', 'D', 'F'].map((grade) => {
                                                            const count = results.filter(r => r.Grade?.startsWith(grade)).length;
                                                            return (
                                                                <Card key={grade} className={`border-2 ${
                                                                    grade === 'A' ? 'border-green-500' :
                                                                    grade === 'F' ? 'border-red-500' :
                                                                    'border-blue-500'
                                                                }`}>
                                                                    <CardContent className="pt-6">
                                                                        <div className="text-center">
                                                                            <div className={`text-4xl font-bold ${
                                                                                grade === 'A' ? 'text-green-600 dark:text-green-400' :
                                                                                grade === 'F' ? 'text-red-600 dark:text-red-400' :
                                                                                'text-blue-600 dark:text-blue-400'
                                                                            }`}>
                                                                                {grade}
                                                                            </div>
                                                                            <div className="text-3xl font-semibold mt-2">
                                                                                {count}
                                                                            </div>
                                                                            <div className="text-sm text-muted-foreground">
                                                                                {count === 1 ? 'course' : 'courses'}
                                                                            </div>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                <p className="text-muted-foreground">No results available yet</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}