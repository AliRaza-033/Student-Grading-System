'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Pencil, Trash2, Search, Key, Eye, EyeOff, Info, BookOpen, Award, BarChart3, User } from 'lucide-react';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function StudentsManagementPage() {
    const { toast } = useToast();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [editingStudent, setEditingStudent] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [viewingStudent, setViewingStudent] = useState(null);
    const [studentDetails, setStudentDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [formData, setFormData] = useState({
        rollNo: '',
        fullName: '',
        department: '',
        semester: '',
        password: ''
    });

    // Zod validation schema
    const studentSchema = z.object({
        rollNo: z.string().min(5, 'Roll number must be at least 5 characters').regex(/^[0-9-]+$/, 'Roll number should contain only numbers and hyphens'),
        fullName: z.string().min(2, 'Name must be at least 2 characters'),
        department: z.string().optional(),
        semester: z.string().optional(),
        password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal(''))
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const studRes = await fetch('/api/admin/students');
            const studData = await studRes.json();
            
            if (studData.success) setStudents(studData.students);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast({
                title: "Error",
                description: "Failed to load students",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationErrors({});

        // Validate with Zod
        try {
            studentSchema.parse(formData);
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
            const url = editingStudent 
                ? `/api/admin/students/${editingStudent.StudentID}`
                : '/api/admin/students';
            
            const method = editingStudent ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingStudent ? 
                    { ...formData, studentId: editingStudent.StudentID } : 
                    formData
                )
            });

            const data = await res.json();

            if (data.success) {
                toast({
                    title: "Success",
                    description: editingStudent ? "Student updated successfully" : "Student created successfully",
                });
                setIsDialogOpen(false);
                resetForm();
                fetchData();
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Operation failed",
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

    const handleEdit = (student) => {
        setEditingStudent(student);
        setFormData({
            rollNo: student.RollNo,
            fullName: student.FullName,
            department: student.Department || '',
            semester: student.Semester?.toString() || '',
            password: '' // Empty by default, admin can change it
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (studentId) => {
        setStudentToDelete(studentId);
        setDeleteDialogOpen(true);
    };

    const handleViewDetails = async (student) => {
        setViewingStudent(student);
        setDetailsDialogOpen(true);
        setLoadingDetails(true);
        
        try {
            // Fetch detailed student information
            const [enrollmentsRes, gradesRes, resultsRes] = await Promise.all([
                fetch(`/api/admin/students/${student.StudentID}/enrollments`),
                fetch(`/api/admin/students/${student.StudentID}/grades`),
                fetch(`/api/admin/students/${student.StudentID}/results`)
            ]);
            
            const [enrollmentsData, gradesData, resultsData] = await Promise.all([
                enrollmentsRes.json(),
                gradesRes.json(),
                resultsRes.json()
            ]);
            
            // Calculate statistics
            const enrollments = enrollmentsData.enrollments || [];
            const grades = gradesData.grades || [];
            const results = resultsData.results || [];
            
            const passedCourses = results.filter(r => ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D'].includes(r.Grade)).length;
            const failedCourses = results.filter(r => r.Grade === 'F').length;
            const avgPercentage = results.length > 0 
                ? results.reduce((sum, r) => sum + (parseFloat(r.Percentage) || 0), 0) / results.length 
                : 0;
            
            setStudentDetails({
                enrollments,
                grades,
                results,
                statistics: {
                    totalCourses: enrollments.length,
                    passedCourses,
                    failedCourses,
                    gpa: results.length > 0 ? results[0].GPA : 0,
                    avgPercentage
                }
            });
        } catch (error) {
            console.error('Error fetching student details:', error);
            toast({
                title: "Error",
                description: "Failed to load student details",
                variant: "destructive",
            });
        } finally {
            setLoadingDetails(false);
        }
    };

    const confirmDelete = async () => {

        try {
            const res = await fetch(`/api/admin/students/${studentToDelete}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (data.success) {
                toast({
                    title: "Success",
                    description: "Student deleted successfully",
                });
                fetchData();
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to delete student",
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
        setEditingStudent(null);
        setFormData({
            rollNo: '',
            fullName: '',
            department: '',
            semester: '',
            password: '' // For editing only
        });
    };

    const filteredStudents = students.filter(student =>
        student.FullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.RollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.Department?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && students.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Students Management</h2>
                    <p className="text-muted-foreground mt-2">
                        Add, edit, or remove student accounts
                    </p>
                </div>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Student
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Students</CardTitle>
                            <CardDescription>
                                Total: <Badge variant="secondary">{students.length}</Badge>
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 w-full max-w-sm">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredStudents.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Roll No</TableHead>
                                        <TableHead>Full Name</TableHead>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Semester</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudents.map((student) => (
                                        <TableRow key={student.StudentID}>
                                            <TableCell className="font-medium">{student.RollNo}</TableCell>
                                            <TableCell>{student.FullName}</TableCell>
                                            <TableCell>{student.Username}</TableCell>
                                            <TableCell>{student.Department || 'N/A'}</TableCell>
                                            <TableCell>{student.Semester || 'N/A'}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <a href={`/admin/dashboard/students/${student.StudentID}`} title="View Details">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <Info className="h-3 w-3" />
                                                        </Button>
                                                    </a>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(student)}
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDelete(student.StudentID)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No students found</h3>
                            <p className="text-muted-foreground">
                                {searchQuery ? 'Try adjusting your search' : 'Add your first student to get started'}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
                        <DialogDescription>
                            {editingStudent ? 'Update student information' : 'Create a new student account'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="rollNo">Roll Number*</Label>
                                <Input
                                    id="rollNo"
                                    placeholder="24014198-109"
                                    value={formData.rollNo}
                                    onChange={(e) => setFormData({...formData, rollNo: e.target.value})}
                                    required
                                    disabled={editingStudent}
                                    className={validationErrors.rollNo ? 'border-red-500' : ''}
                                />
                                {validationErrors.rollNo && (
                                    <p className="text-xs text-red-500">{validationErrors.rollNo}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name*</Label>
                                <Input
                                    id="fullName"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                    required
                                    className={validationErrors.fullName ? 'border-red-500' : ''}
                                />
                                {validationErrors.fullName && (
                                    <p className="text-xs text-red-500">{validationErrors.fullName}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <Input
                                    id="department"
                                    placeholder="Computer Science"
                                    value={formData.department}
                                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="semester">Semester</Label>
                                <Input
                                    id="semester"
                                    type="number"
                                    min="1"
                                    max="8"
                                    placeholder="5"
                                    value={formData.semester}
                                    onChange={(e) => setFormData({...formData, semester: e.target.value})}
                                />
                            </div>
                        </div>

                        {!editingStudent && (
                            <div className="border-t pt-4">
                                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                    <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <div>
                                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                            Default Password: 12345678
                                        </p>
                                        <p className="text-xs text-blue-700 dark:text-blue-300">
                                            Student can change this after first login
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {editingStudent && (
                            <div className="border-t pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">New Password (Optional)</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Min 6 characters"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            className={`pr-10 ${validationErrors.password ? 'border-red-500' : ''}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {validationErrors.password && (
                                        <p className="text-xs text-red-500">{validationErrors.password}</p>
                                    )}
                                    {!validationErrors.password && (
                                        <p className="text-xs text-muted-foreground">
                                            Leave empty to keep current password
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : (editingStudent ? 'Update Student' : 'Create Student')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this student and all related data (enrollments, grades, results). This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Student Details Dialog */}
            <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Student Details
                        </DialogTitle>
                        <DialogDescription>
                            Complete academic overview and performance metrics
                        </DialogDescription>
                    </DialogHeader>
                    
                    {loadingDetails ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : viewingStudent && studentDetails ? (
                        <div className="space-y-6">
                            {/* Personal Info Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Personal Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Full Name</p>
                                            <p className="font-semibold">{viewingStudent.FullName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Roll Number</p>
                                            <p className="font-semibold">{viewingStudent.RollNo}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Username</p>
                                            <p className="font-semibold">{viewingStudent.Username}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Department</p>
                                            <p className="font-semibold">{viewingStudent.Department || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Semester</p>
                                            <p className="font-semibold">{viewingStudent.Semester || 'N/A'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Statistics Grid */}
                            <div className="grid grid-cols-4 gap-4">
                                <Card className="border-l-4 border-l-blue-500">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">GPA</CardTitle>
                                            <BarChart3 className="h-4 w-4 text-blue-500" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-blue-600">
                                            {studentDetails.statistics.gpa ? Number(studentDetails.statistics.gpa).toFixed(2) : 'N/A'}
                                        </div>
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
                                        <div className="text-2xl font-bold text-green-600">
                                            {studentDetails.statistics.totalCourses}
                                        </div>
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
                                        <div className="text-2xl font-bold text-purple-600">
                                            {studentDetails.statistics.passedCourses}
                                        </div>
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
                                        <div className="text-2xl font-bold text-orange-600">
                                            {studentDetails.statistics.avgPercentage.toFixed(1)}%
                                        </div>
                                        <p className="text-xs text-muted-foreground">Performance</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Tabbed Content */}
                            <Tabs defaultValue="enrollments" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
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
                                            {studentDetails.enrollments.length > 0 ? (
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
                                                        {studentDetails.enrollments.map((enrollment, idx) => (
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
                                                <div className="text-center py-8 text-muted-foreground">
                                                    No enrollments found
                                                </div>
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
                                            {studentDetails.grades.length > 0 ? (
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
                                                        {studentDetails.grades.map((grade, idx) => {
                                                            const percentage = (grade.ObtainedMarks / grade.TotalMarks) * 100;
                                                            return (
                                                                <TableRow key={idx}>
                                                                    <TableCell className="font-medium">{grade.CourseCode}</TableCell>
                                                                    <TableCell>{grade.AssessmentTitle}</TableCell>
                                                                    <TableCell>{grade.ObtainedMarks}</TableCell>
                                                                    <TableCell>{grade.TotalMarks}</TableCell>
                                                                    <TableCell>
                                                                        <Badge variant={percentage >= 50 ? "default" : "destructive"}>
                                                                            {percentage.toFixed(1)}%
                                                                        </Badge>
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            ) : (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    No grades found
                                                </div>
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
                                            {studentDetails.results.length > 0 ? (
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
                                                        {studentDetails.results.map((result, idx) => (
                                                            <TableRow key={idx}>
                                                                <TableCell className="font-medium">{result.CourseCode}</TableCell>
                                                                <TableCell>{result.CourseName}</TableCell>
                                                                <TableCell>
                                                                    <Badge variant={result.Grade === 'F' ? "destructive" : "default"}>
                                                                        {result.Grade}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>{Number(result.Percentage).toFixed(2)}%</TableCell>
                                                                <TableCell>
                                                                    <Badge variant={result.Status === 'Pass' ? "default" : "destructive"}>
                                                                        {result.Status}
                                                                    </Badge>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            ) : (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    No results found
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    );
}

