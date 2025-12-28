'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus, Pencil, Trash2, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CoursesManagementPage() {
    const { toast } = useToast();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    const courseSchema = z.object({
        courseCode: z.string().min(2, 'Course code must be at least 2 characters'),
        courseName: z.string().min(3, 'Course name must be at least 3 characters'),
        creditHours: z.string().optional().refine((val) => {
            if (!val || val === '') return true;
            const num = parseInt(val);
            return !isNaN(num) && num >= 1 && num <= 6;
        }, {
            message: 'Credit hours must be between 1 and 6'
        })
    });

    const { register, handleSubmit: handleFormSubmit, formState: { errors }, reset, setValue } = useForm({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            courseCode: '',
            courseName: '',
            creditHours: ''
        }
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await fetch('/api/admin/courses');
            const data = await res.json();
            if (data.success) setCourses(data.courses);
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast({
                title: "Error",
                description: "Failed to load courses",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (data) => {
        setLoading(true);

        try {
            const url = editingCourse 
                ? `/api/admin/courses/${editingCourse.CourseID}`
                : '/api/admin/courses';
            
            const method = editingCourse ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (result.success) {
                toast({
                    title: "Success",
                    description: editingCourse ? "Course updated successfully" : "Course created successfully",
                });
                setIsDialogOpen(false);
                resetForm();
                fetchCourses();
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Operation failed",
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

    const handleEdit = (course) => {
        setEditingCourse(course);
        setValue('courseCode', course.CourseCode);
        setValue('courseName', course.CourseName);
        setValue('creditHours', course.CreditHours?.toString() || '');
        setIsDialogOpen(true);
    };

    const handleDelete = async (courseId) => {
        if (!confirm('Are you sure you want to delete this course? This will also delete all related enrollments and grades.')) return;

        try {
            const res = await fetch(`/api/admin/courses/${courseId}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (data.success) {
                toast({
                    title: "Success",
                    description: "Course deleted successfully",
                });
                fetchCourses();
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to delete course",
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
        setEditingCourse(null);
        reset({
            courseCode: '',
            courseName: '',
            creditHours: ''
        });
    };

    const filteredCourses = courses.filter(course =>
        course.CourseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.CourseCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && courses.length === 0) {
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
                    <h2 className="text-3xl font-bold tracking-tight">Courses Management</h2>
                    <p className="text-muted-foreground mt-2">
                        Add, edit, or remove courses from the system
                    </p>
                </div>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Course
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Courses</CardTitle>
                            <CardDescription>
                                Total: <Badge variant="secondary">{courses.length}</Badge>
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 w-full max-w-sm">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredCourses.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Course Code</TableHead>
                                        <TableHead>Course Name</TableHead>
                                        <TableHead>Credit Hours</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCourses.map((course) => (
                                        <TableRow key={course.CourseID}>
                                            <TableCell className="font-medium">{course.CourseCode}</TableCell>
                                            <TableCell>{course.CourseName}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{course.CreditHours} Hours</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(course)}
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDelete(course.CourseID)}
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
                            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                            <p className="text-muted-foreground">
                                {searchQuery ? 'Try adjusting your search' : 'Add your first course to get started'}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
                        <DialogDescription>
                            {editingCourse ? 'Update course information' : 'Create a new course in the system'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleFormSubmit(handleSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="courseCode">Course Code*</Label>
                            <Input
                                id="courseCode"
                                placeholder="CS-101"
                                {...register('courseCode', {
                                    onChange: (e) => e.target.value = e.target.value.toUpperCase()
                                })}
                                className={errors.courseCode ? 'border-red-500' : ''}
                            />
                            {errors.courseCode && (
                                <p className="text-xs text-red-500">{errors.courseCode.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="courseName">Course Name*</Label>
                            <Input
                                id="courseName"
                                placeholder="Introduction to Programming"
                                {...register('courseName')}
                                className={errors.courseName ? 'border-red-500' : ''}
                            />
                            {errors.courseName && (
                                <p className="text-xs text-red-500">{errors.courseName.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="creditHours">Credit Hours*</Label>
                            <Input
                                id="creditHours"
                                type="number"
                                min="1"
                                max="6"
                                placeholder="3"
                                {...register('creditHours')}
                                className={errors.creditHours ? 'border-red-500' : ''}
                            />
                            {errors.creditHours && (
                                <p className="text-xs text-red-500">{errors.creditHours.message}</p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : (editingCourse ? 'Update Course' : 'Create Course')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
