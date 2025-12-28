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
import { Award, Plus, Pencil, Trash2, Search, Check, ChevronsUpDown } from 'lucide-react';
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

const gradeSchema = z.object({
    enrollmentId: z.string().min(1, 'Enrollment is required'),
    assessmentId: z.string().min(1, 'Assessment is required'),
    obtainedMarks: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
        message: 'Marks must be a positive number'
    })
});

export default function GradesManagementPage() {
    const { toast } = useToast();
    const [grades, setGrades] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingGrade, setEditingGrade] = useState(null);
    const [enrollmentOpen, setEnrollmentOpen] = useState(false);
    const [assessmentOpen, setAssessmentOpen] = useState(false);
    
    const { register, handleSubmit: handleFormSubmit, formState: { errors }, reset, setValue, watch } = useForm({
        resolver: zodResolver(gradeSchema),
        defaultValues: {
            enrollmentId: '',
            assessmentId: '',
            obtainedMarks: ''
        }
    });
    
    const watchEnrollmentId = watch('enrollmentId');
    const watchAssessmentId = watch('assessmentId');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [gradesRes, enrollRes, assessRes] = await Promise.all([
                axios.get('/api/admin/grades'),
                axios.get('/api/admin/enrollments'),
                axios.get('/api/admin/assessments')
            ]);
            
            if (gradesRes.data.success) setGrades(gradesRes.data.grades);
            if (enrollRes.data.success) setEnrollments(enrollRes.data.enrollments);
            if (assessRes.data.success) setAssessments(assessRes.data.assessments);
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
        setLoading(true);

        // Validate marks don't exceed total
        const selectedAssessment = assessments.find(a => a.AssessmentID.toString() === data.assessmentId);
        if (selectedAssessment && parseFloat(data.obtainedMarks) > selectedAssessment.TotalMarks) {
            toast({
                title: "Validation Error",
                description: `Obtained marks cannot exceed ${selectedAssessment.TotalMarks}`,
                variant: "destructive",
            });
            setLoading(false);
            return;
        }

        try {
            const url = `/api/admin/grades${editingGrade ? `/${editingGrade.GradeID}` : ''}`;
            const response = editingGrade
                ? await axios.put(url, data)
                : await axios.post(url, data);

            if (response.data.success) {
                toast({
                    title: "Success",
                    description: `Grade ${editingGrade ? 'updated' : 'created'} successfully`,
                    variant: "default",
                });
                await fetchData();
                setIsDialogOpen(false);
                resetForm();
            } else {
                toast({
                    title: "Error",
                    description: response.data.error || 'Failed to save grade',
                    variant: "destructive",
                });
            }
        } catch (error) {
            const errorMessage = error?.error || error?.message || 'An error occurred while saving the grade';
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (grade) => {
        setEditingGrade(grade);
        setValue('enrollmentId', grade.EnrollmentID.toString());
        setValue('assessmentId', grade.AssessmentID.toString());
        setValue('obtainedMarks', grade.ObtainedMarks.toString());
        setIsDialogOpen(true);
    };

    const handleDelete = async (gradeId) => {
        if (!confirm('Are you sure you want to delete this grade?')) return;

        try {
            const { data } = await axios.delete(`/api/admin/grades/${gradeId}`);

            if (data.success) {
                toast({
                    title: "Success",
                    description: "Grade deleted successfully",
                });
                fetchData();
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to delete grade",
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
        setEditingGrade(null);
        reset({
            enrollmentId: '',
            assessmentId: '',
            obtainedMarks: ''
        });
        setEnrollmentOpen(false);
        setAssessmentOpen(false);
    };

    const filteredGrades = grades.filter(grade =>
        grade.StudentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grade.RollNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grade.CourseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grade.AssessmentTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter assessments based on selected enrollment's course
    const getAvailableAssessments = () => {
        if (!watchEnrollmentId) return [];
        const enrollment = enrollments.find(e => e.EnrollmentID.toString() === watchEnrollmentId);
        if (!enrollment) return [];
        return assessments.filter(a => a.CourseID === enrollment.CourseID);
    };

    const selectedAssessment = assessments.find(a => a.AssessmentID.toString() === watchAssessmentId);

    if (loading && grades.length === 0) {
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
                    <h2 className="text-3xl font-bold tracking-tight">Grades Management</h2>
                    <p className="text-muted-foreground mt-2">
                        Enter and manage student grades for assessments
                    </p>
                </div>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Grade
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Grades</CardTitle>
                            <CardDescription>
                                Total: <Badge variant="secondary">{grades.length}</Badge>
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 w-full max-w-sm">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search grades..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredGrades.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Assessment</TableHead>
                                        <TableHead>Obtained Marks</TableHead>
                                        <TableHead>Total Marks</TableHead>
                                        <TableHead>Percentage</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredGrades.map((grade) => {
                                        const percentage = ((grade.ObtainedMarks / grade.TotalMarks) * 100).toFixed(2);
                                        return (
                                            <TableRow key={grade.GradeID}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{grade.StudentName}</div>
                                                        <div className="text-xs text-muted-foreground">{grade.RollNo}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{grade.CourseName}</div>
                                                        <div className="text-xs text-muted-foreground">{grade.CourseCode}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{grade.AssessmentTitle}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{grade.ObtainedMarks}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{grade.TotalMarks}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={percentage >= 50 ? "default" : "destructive"}>
                                                        {percentage}%
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEdit(grade)}
                                                        >
                                                            <Pencil className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleDelete(grade.GradeID)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No grades found</h3>
                            <p className="text-muted-foreground">
                                {searchQuery ? 'Try adjusting your search' : 'Add grades for assessments to get started'}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingGrade ? 'Edit Grade' : 'Add New Grade'}</DialogTitle>
                        <DialogDescription>
                            {editingGrade ? 'Update grade information' : 'Enter grade for a student assessment'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleFormSubmit(handleSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Student Enrollment*</Label>
                            <Popover open={enrollmentOpen} onOpenChange={setEnrollmentOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={enrollmentOpen}
                                        className={cn(
                                            "w-full justify-between",
                                            errors.enrollmentId ? "border-red-500" : ""
                                        )}
                                    >
                                        {watchEnrollmentId
                                            ? enrollments.find((e) => e.EnrollmentID.toString() === watchEnrollmentId)
                                                ? `${enrollments.find((e) => e.EnrollmentID.toString() === watchEnrollmentId).StudentName} (${enrollments.find((e) => e.EnrollmentID.toString() === watchEnrollmentId).RollNo}) - ${enrollments.find((e) => e.EnrollmentID.toString() === watchEnrollmentId).CourseName}`
                                                : "Select enrollment..."
                                            : "Select enrollment..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[500px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search enrollment..." />
                                        <CommandEmpty>No enrollment found.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {enrollments.map((enrollment) => (
                                                <CommandItem
                                                    key={enrollment.EnrollmentID}
                                                    value={`${enrollment.StudentName} ${enrollment.RollNo} ${enrollment.CourseName}`}
                                                    onSelect={() => {
                                                        setValue('enrollmentId', enrollment.EnrollmentID.toString());
                                                        setValue('assessmentId', ''); // Reset assessment when enrollment changes
                                                        setEnrollmentOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            watchEnrollmentId === enrollment.EnrollmentID.toString() ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {enrollment.StudentName} ({enrollment.RollNo}) - {enrollment.CourseName}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {errors.enrollmentId && (
                                <p className="text-xs text-red-500">{errors.enrollmentId.message}</p>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Assessment*</Label>
                            <Popover open={assessmentOpen} onOpenChange={setAssessmentOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={assessmentOpen}
                                        disabled={!watchEnrollmentId}
                                        className={cn(
                                            "w-full justify-between",
                                            errors.assessmentId ? "border-red-500" : ""
                                        )}
                                    >
                                        {watchAssessmentId
                                            ? assessments.find((a) => a.AssessmentID.toString() === watchAssessmentId)
                                                ? `${assessments.find((a) => a.AssessmentID.toString() === watchAssessmentId).Title} (Total: ${assessments.find((a) => a.AssessmentID.toString() === watchAssessmentId).TotalMarks})`
                                                : "Select assessment..."
                                            : "Select assessment..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[500px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search assessment..." />
                                        <CommandEmpty>No assessment found.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {getAvailableAssessments().map((assessment) => (
                                                <CommandItem
                                                    key={assessment.AssessmentID}
                                                    value={assessment.Title}
                                                    onSelect={() => {
                                                        setValue('assessmentId', assessment.AssessmentID.toString());
                                                        setAssessmentOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            watchAssessmentId === assessment.AssessmentID.toString() ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {assessment.Title} (Total: {assessment.TotalMarks})
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {errors.assessmentId && (
                                <p className="text-xs text-red-500">{errors.assessmentId.message}</p>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="obtainedMarks">Obtained Marks*</Label>
                            <Input
                                id="obtainedMarks"
                                type="number"
                                step="0.01"
                                placeholder="85"
                                {...register('obtainedMarks')}
                                className={errors.obtainedMarks ? 'border-red-500' : ''}
                            />
                            {errors.obtainedMarks && (
                                <p className="text-xs text-red-500">{errors.obtainedMarks.message}</p>
                            )}
                            {!errors.obtainedMarks && selectedAssessment && (
                                <p className="text-xs text-muted-foreground">
                                    Maximum: {selectedAssessment.TotalMarks} marks
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : (editingGrade ? 'Update Grade' : 'Create Grade')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
