'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { ClipboardList, Plus, Pencil, Trash2, Search, Check, ChevronsUpDown, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

const assessmentSchema = z.object({
    courseId: z.string().min(1, 'Course is required'),
    title: z.string().min(2, 'Title must be at least 2 characters'),
    totalMarks: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
        message: 'Total marks must be a positive number'
    }),
    weightage: z.string().refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0 && num <= 100;
    }, {
        message: 'Weightage must be between 0 and 100'
    })
});

export default function AssessmentsManagementPage() {
    const { toast } = useToast();
    const [assessments, setAssessments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAssessment, setEditingAssessment] = useState(null);
    const [courseOpen, setCourseOpen] = useState(false);
    const [weightageWarning, setWeightageWarning] = useState('');
    
    const { register, handleSubmit: handleFormSubmit, formState: { errors }, reset, setValue, watch } = useForm({
        resolver: zodResolver(assessmentSchema),
        defaultValues: {
            courseId: '',
            title: '',
            totalMarks: '',
            weightage: ''
        }
    });
    
    const watchCourseId = watch('courseId');
    const watchWeightage = watch('weightage');

    useEffect(() => {
        fetchData();
    }, []);

    // Calculate remaining weightage for selected course
    useEffect(() => {
        if (watchCourseId && watchWeightage) {
            const courseAssessments = assessments.filter(a => 
                a.CourseID.toString() === watchCourseId && 
                (!editingAssessment || a.AssessmentID !== editingAssessment.AssessmentID)
            );
            
            const currentWeightage = courseAssessments.reduce((sum, a) => 
                sum + parseFloat(a.Weightage || 0), 0
            );
            
            const newWeightage = parseFloat(watchWeightage) || 0;
            const totalWeightage = currentWeightage + newWeightage;
            const remaining = 100 - totalWeightage;
            
            if (totalWeightage > 100) {
                setWeightageWarning(`⚠️ Total weightage will be ${totalWeightage.toFixed(2)}%. Exceeds maximum of 100%!`);
            } else if (remaining < 20 && remaining > 0) {
                setWeightageWarning(`ℹ️ Remaining weightage for this course: ${remaining.toFixed(2)}%`);
            } else if (remaining === 0) {
                setWeightageWarning(`✓ Total weightage will be exactly 100%`);
            } else {
                setWeightageWarning('');
            }
        }
    }, [watchCourseId, watchWeightage, assessments, editingAssessment]);

    const fetchData = async () => {
        try {
            const [assessRes, courseRes] = await Promise.all([
                axios.get('/api/admin/assessments'),
                axios.get('/api/admin/courses')
            ]);
            
            if (assessRes.data.success) setAssessments(assessRes.data.assessments);
            if (courseRes.data.success) setCourses(courseRes.data.courses);
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

    const handleSubmit = async (data) => {
        // Check total weightage for the course
        const courseAssessments = assessments.filter(a => 
            a.CourseID.toString() === data.courseId && 
            (!editingAssessment || a.AssessmentID !== editingAssessment.AssessmentID)
        );
        
        const currentWeightage = courseAssessments.reduce((sum, a) => 
            sum + parseFloat(a.Weightage || 0), 0
        );
        
        const newWeightage = parseFloat(data.weightage);
        const totalWeightage = currentWeightage + newWeightage;
        
        if (totalWeightage > 100) {
            toast({
                title: "Weightage Limit Exceeded",
                description: `Total weightage would be ${totalWeightage.toFixed(2)}%. Maximum allowed is 100%. You can add ${(100 - currentWeightage).toFixed(2)}% more.`,
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const url = `/api/admin/assessments${editingAssessment ? `/${editingAssessment.AssessmentID}` : ''}`;
            const response = editingAssessment
                ? await axios.put(url, data)
                : await axios.post(url, data);

            if (response.data.success) {
                toast({
                    title: "Success",
                    description: `Assessment ${editingAssessment ? 'updated' : 'created'} successfully`,
                    variant: "default",
                });
                setIsDialogOpen(false);
                resetForm();
                await fetchData();
            } else {
                toast({
                    title: "Error",
                    description: response.data.error || 'Operation failed',
                    variant: "destructive",
                });
            }
        } catch (error) {
            const errorMessage = error?.error || error?.message || 'An error occurred';
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (assessment) => {
        setEditingAssessment(assessment);
        setValue('courseId', assessment.CourseID.toString());
        setValue('title', assessment.Title);
        setValue('totalMarks', assessment.TotalMarks.toString());
        setValue('weightage', assessment.Weightage?.toString() || '');
        setIsDialogOpen(true);
    };

    const handleDelete = async (assessmentId) => {
        if (!confirm('Are you sure you want to delete this assessment?')) return;

        try {
            const { data } = await axios.delete(`/api/admin/assessments/${assessmentId}`);

            if (data.success) {
                toast({
                    title: "Success",
                    description: "Assessment deleted successfully",
                });
                fetchData();
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to delete assessment",
                    variant: "destructive",
                });
            }
        } catch (error) {
            const errorMessage = error?.error || error?.message || 'An error occurred';
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    const resetForm = () => {
        setEditingAssessment(null);
        reset({
            courseId: '',
            title: '',
            totalMarks: '',
            weightage: ''
        });
        setCourseOpen(false);
        setWeightageWarning('');
    };

    const filteredAssessments = assessments.filter(assessment =>
        assessment.Title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assessment.CourseName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && assessments.length === 0) {
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
                    <h2 className="text-3xl font-bold tracking-tight">Assessments Management</h2>
                    <p className="text-muted-foreground mt-2">
                        Create and manage course assessments
                    </p>
                </div>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Assessment
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Assessments</CardTitle>
                            <CardDescription>
                                Total: <Badge variant="secondary">{assessments.length}</Badge>
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 w-full max-w-sm">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search assessments..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredAssessments.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Assessment Title</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Total Marks</TableHead>
                                        <TableHead>Weightage</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAssessments.map((assessment) => (
                                        <TableRow key={assessment.AssessmentID}>
                                            <TableCell className="font-medium">{assessment.Title}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{assessment.CourseName}</div>
                                                    <div className="text-xs text-muted-foreground">{assessment.CourseCode}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{assessment.TotalMarks}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {assessment.Weightage ? `${assessment.Weightage}%` : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(assessment)}
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDelete(assessment.AssessmentID)}
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
                            <ClipboardList className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No assessments found</h3>
                            <p className="text-muted-foreground">
                                {searchQuery ? 'Try adjusting your search' : 'Add your first assessment to get started'}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingAssessment ? 'Edit Assessment' : 'Add New Assessment'}</DialogTitle>
                        <DialogDescription>
                            {editingAssessment ? 'Update assessment information' : 'Create a new assessment for a course'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleFormSubmit(handleSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Course*</Label>
                            <Popover open={courseOpen} onOpenChange={setCourseOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={courseOpen}
                                        className={cn(
                                            "w-full justify-between",
                                            errors.courseId ? "border-red-500" : ""
                                        )}
                                    >
                                        {watchCourseId
                                            ? courses.find((c) => c.CourseID.toString() === watchCourseId)
                                                ? `${courses.find((c) => c.CourseID.toString() === watchCourseId).CourseCode} - ${courses.find((c) => c.CourseID.toString() === watchCourseId).CourseName}`
                                                : "Select course..."
                                            : "Select course..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[500px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search course..." />
                                        <CommandEmpty>No course found.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {courses.map((course) => (
                                                <CommandItem
                                                    key={course.CourseID}
                                                    value={`${course.CourseCode} ${course.CourseName}`}
                                                    onSelect={() => {
                                                        setValue('courseId', course.CourseID.toString());
                                                        setCourseOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            watchCourseId === course.CourseID.toString() ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {course.CourseCode} - {course.CourseName}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {errors.courseId && (
                                <p className="text-xs text-red-500">{errors.courseId.message}</p>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="title">Assessment Title*</Label>
                            <Input
                                id="title"
                                placeholder="Midterm Exam, Quiz 1"
                                {...register('title')}
                                className={errors.title ? 'border-red-500' : ''}
                            />
                            {errors.title && (
                                <p className="text-xs text-red-500">{errors.title.message}</p>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="totalMarks">Total Marks*</Label>
                            <Input
                                id="totalMarks"
                                type="number"
                                placeholder="100"
                                {...register('totalMarks')}
                                className={errors.totalMarks ? 'border-red-500' : ''}
                            />
                            {errors.totalMarks && (
                                <p className="text-xs text-red-500">{errors.totalMarks.message}</p>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="weightage">Weightage (%)*</Label>
                            <Input
                                id="weightage"
                                type="number"
                                step="0.01"
                                placeholder="30"
                                {...register('weightage')}
                                className={errors.weightage ? 'border-red-500' : ''}
                            />
                            {errors.weightage && (
                                <p className="text-xs text-red-500">{errors.weightage.message}</p>
                            )}
                            {weightageWarning && (
                                <Alert className={weightageWarning.includes('Exceeds') ? 'border-red-500 bg-red-50' : weightageWarning.includes('Remaining') ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'}>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-sm">
                                        {weightageWarning}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                        
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : (editingAssessment ? 'Update Assessment' : 'Create Assessment')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
