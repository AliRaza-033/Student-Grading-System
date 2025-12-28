'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen,
  Search,
  GraduationCap,
  Calendar
} from 'lucide-react';

export default function CoursesPage() {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const filtered = courses.filter(course => 
                course.CourseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.CourseCode?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredCourses(filtered);
        } else {
            setFilteredCourses(courses);
        }
    }, [searchQuery, courses]);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/student/courses');
            const data = await res.json();
            if (data.success) {
                setCourses(data.courses);
                setFilteredCourses(data.courses);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">My Courses</h2>
                    <p className="text-muted-foreground mt-2">
                        View all courses you are currently enrolled in
                    </p>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                    <BookOpen className="h-4 w-4 mr-2" />
                    {courses.length} Courses
                </Badge>
            </div>

            {/* Search Bar */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search courses by name or code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Courses Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Enrolled Courses</CardTitle>
                    <CardDescription>All your active course enrollments for this semester</CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredCourses.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[120px]">Course Code</TableHead>
                                        <TableHead>Course Name</TableHead>
                                        <TableHead className="w-[120px]">Credit Hours</TableHead>
                                        <TableHead className="w-[150px]">Academic Year</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCourses.map((course) => (
                                        <TableRow key={course.EnrollmentID} className="hover:bg-muted/50">
                                            <TableCell className="font-mono font-semibold">
                                                {course.CourseCode}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{course.CourseName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{course.CreditHours} hrs</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span>{course.AcademicYear || 'N/A'}</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                            <p className="text-muted-foreground">
                                {searchQuery ? 'Try adjusting your search query' : 'You are not enrolled in any courses yet'}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
