'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart3,
  Search,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function GradesPage() {
    const [grades, setGrades] = useState([]);
    const [filteredGrades, setFilteredGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCourse, setFilterCourse] = useState('all');

    useEffect(() => {
        fetchGrades();
    }, []);

    useEffect(() => {
        let filtered = grades;
        
        if (filterCourse !== 'all') {
            filtered = filtered.filter(grade => grade.CourseCode === filterCourse);
        }
        
        if (searchQuery) {
            filtered = filtered.filter(grade => 
                grade.CourseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                grade.Title?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        setFilteredGrades(filtered);
    }, [searchQuery, filterCourse, grades]);

    const fetchGrades = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/student/grades');
            const data = await res.json();
            if (data.success) {
                setGrades(data.grades);
                setFilteredGrades(data.grades);
            }
        } catch (error) {
            console.error('Error fetching grades:', error);
        } finally {
            setLoading(false);
        }
    };

    const uniqueCourses = [...new Set(grades.map(g => g.CourseCode))].filter(Boolean);

    const getPerformanceIcon = (percentage) => {
        if (percentage >= 70) return <TrendingUp className="h-4 w-4 text-green-500" />;
        if (percentage >= 50) return <Minus className="h-4 w-4 text-orange-500" />;
        return <TrendingDown className="h-4 w-4 text-red-500" />;
    };

    const getPerformanceBadge = (percentage) => {
        if (percentage >= 85) return <Badge className="bg-green-500">Excellent</Badge>;
        if (percentage >= 70) return <Badge className="bg-blue-500">Good</Badge>;
        if (percentage >= 50) return <Badge className="bg-orange-500">Average</Badge>;
        return <Badge variant="destructive">Needs Improvement</Badge>;
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
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Assessment Grades</h2>
                <p className="text-muted-foreground mt-2">
                    Detailed breakdown of your performance in each assessment
                </p>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by course or assessment..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <Select value={filterCourse} onValueChange={setFilterCourse}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by course" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Courses</SelectItem>
                                {uniqueCourses.map((course) => (
                                    <SelectItem key={course} value={course}>
                                        {course}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>
            </div>

            {/* Grades Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Grade Details</CardTitle>
                    <CardDescription>Your performance across all assessments and courses</CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredGrades.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Assessment</TableHead>
                                        <TableHead className="text-center">Marks</TableHead>
                                        <TableHead className="text-center">Percentage</TableHead>
                                        <TableHead className="text-center">Weightage</TableHead>
                                        <TableHead className="text-center">Performance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredGrades.map((grade) => {
                                        const percentage = (grade.ObtainedMarks / grade.TotalMarks) * 100;
                                        
                                        return (
                                            <TableRow key={grade.GradeID} className="hover:bg-muted/50">
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{grade.CourseCode}</p>
                                                        <p className="text-xs text-muted-foreground">{grade.CourseName}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium">{grade.Title}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div>
                                                        <span className="font-semibold">{grade.ObtainedMarks}</span>
                                                        <span className="text-muted-foreground"> / {grade.TotalMarks}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            {getPerformanceIcon(percentage)}
                                                            <span className={`font-semibold ${
                                                                percentage >= 70 ? 'text-green-600 dark:text-green-400' : 
                                                                percentage >= 50 ? 'text-orange-600 dark:text-orange-400' : 
                                                                'text-red-600 dark:text-red-400'
                                                            }`}>
                                                                {percentage.toFixed(2)}%
                                                            </span>
                                                        </div>
                                                        <Progress value={percentage} className="h-1" />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline">{grade.Weightage}%</Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {getPerformanceBadge(percentage)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No grades found</h3>
                            <p className="text-muted-foreground">
                                {searchQuery || filterCourse !== 'all' ? 'Try adjusting your filters' : 'No grades available yet'}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
