'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Trash2, Search, Users } from 'lucide-react';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function EnrollmentsManagementPage() {
    const { toast } = useToast();
    const [enrollments, setEnrollments] = useState([]);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [formData, setFormData] = useState({
        studentId: '',
        courseId: '',
        academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
    });

    const enrollmentSchema = z.object({
        studentId: z.string().min(1, 'Student is required'),
        courseId: z.string().min(1, 'Course is required'),
        academicYear: z.string().regex(/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY')
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [enrollRes, studRes, courseRes] = await Promise.all([
                fetch('/api/admin/enrollments'),
                fetch('/api/admin/students'),
                fetch('/api/admin/courses')
            ]);
            
            const enrollData = await enrollRes.json();
            const studData = await studRes.json();
            const courseData = await courseRes.json();
            
            if (enrollData.success) setEnrollments(enrollData.enrollments);
            if (studData.success) setStudents(studData.students);
            if (courseData.success) setCourses(courseData.courses);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast({
                title: "Error",
                description: "Failed to load data",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationErrors({});

        try {
            // Validate form data
            enrollmentSchema.parse(formData);
        } catch (error) {
            if (error?.errors && Array.isArray(error.errors)) {
                const errors = {};
                error.errors.forEach((err) => {
                    if (err.path && err.path.length > 0) {
                        errors[err.path[0]] = err.message;
                    }
                });
                setValidationErrors(errors);
                toast({
                    title: "Validation Error",
                    description: "Please fix the errors in the form",
                    variant: "destructive",
                });
            }
            return;
        }

        setLoading(true);

        try {

            const res = await fetch('/api/admin/enrollments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.success) {
                toast({
                    title: "Success",
                    description: "Student enrolled successfully",
                });
                setIsDialogOpen(false);
                resetForm();
                fetchData();
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Enrollment failed",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (enrollmentId) => {
        if (!confirm('Are you sure you want to remove this enrollment?')) return;

        try {
            const res = await fetch(`/api/admin/enrollments/${enrollmentId}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (data.success) {
                toast({
                    title: "Success",
                    description: "Enrollment removed successfully",
                });
                fetchData();
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to remove enrollment",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred",
                variant: "destructive",
            });
        }
    };

    const resetForm = () => {
        setFormData({
            studentId: '',
            courseId: '',
            academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
        });
    };

    const filteredEnrollments = enrollments.filter(enrollment =>
        enrollment.StudentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enrollment.CourseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enrollment.RollNo?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && enrollments.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Enrollments Management</h2>
                    <p className="text-muted-foreground mt-2">
                        Enroll students in courses
                    </p>
                </div>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Enroll Student
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Enrollments</CardTitle>
                            <CardDescription>
                                Total: <Badge variant="secondary">{enrollments.length}</Badge>
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 w-full max-w-sm">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search enrollments..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredEnrollments.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Roll No</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Academic Year</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEnrollments.map((enrollment) => (
                                        <TableRow key={enrollment.EnrollmentID}>
                                            <TableCell className="font-medium">{enrollment.StudentName}</TableCell>
                                            <TableCell>{enrollment.RollNo}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{enrollment.CourseName}</div>
                                                    <div className="text-xs text-muted-foreground">{enrollment.CourseCode}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{enrollment.AcademicYear}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(enrollment.EnrollmentID)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No enrollments found</h3>
                            <p className="text-muted-foreground">
                                {searchQuery ? 'Try adjusting your search' : 'Enroll students in courses to get started'}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Enroll Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enroll Student</DialogTitle>
                        <DialogDescription>
                            Select a student and course for enrollment
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Student*</Label>
                            <Select
                                value={formData.studentId}
                                onValueChange={(value) => setFormData({...formData, studentId: value})}
                                required
                            >
                                <SelectTrigger className={validationErrors.studentId ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select student" />
                                </SelectTrigger>
                                <SelectContent>
                                    {students.map((student) => (
                                        <SelectItem key={student.StudentID} value={student.StudentID.toString()}>
                                            {student.RollNo} - {student.FullName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {validationErrors.studentId && (
                                <p className="text-xs text-red-500">{validationErrors.studentId}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Course*</Label>
                            <Select
                                value={formData.courseId}
                                onValueChange={(value) => setFormData({...formData, courseId: value})}
                                required
                            >
                                <SelectTrigger className={validationErrors.courseId ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map((course) => (
                                        <SelectItem key={course.CourseID} value={course.CourseID.toString()}>
                                            {course.CourseCode} - {course.CourseName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {validationErrors.courseId && (
                                <p className="text-xs text-red-500">{validationErrors.courseId}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="academicYear">Academic Year*</Label>
                            <Input
                                id="academicYear"
                                placeholder="2024-2025"
                                value={formData.academicYear}
                                onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                                required
                                className={validationErrors.academicYear ? 'border-red-500' : ''}
                            />
                            {validationErrors.academicYear && (
                                <p className="text-xs text-red-500">{validationErrors.academicYear}</p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Enrolling...' : 'Enroll Student'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
