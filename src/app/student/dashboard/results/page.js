'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Award,
  TrendingUp,
  TrendingDown,
  FileCheck
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function ResultsPage() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/student/results');
            const data = await res.json();
            if (data.success) {
                setResults(data.results);
            }
        } catch (error) {
            console.error('Error fetching results:', error);
        } finally {
            setLoading(false);
        }
    };

    const gradeDistribution = ['A', 'B', 'C', 'D', 'F'].map((grade) => ({
        grade,
        count: results.filter(r => r.Grade?.startsWith(grade)).length
    }));

    const passedCount = results.filter(r => r.Status === 'Pass').length;
    const failedCount = results.filter(r => r.Status === 'Fail').length;

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
                <h2 className="text-3xl font-bold tracking-tight">Final Results</h2>
                <p className="text-muted-foreground mt-2">
                    Your official final grades and performance across all courses
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <FileCheck className="h-8 w-8 text-blue-500" />
                            <div className="text-3xl font-bold">{results.length}</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Courses Passed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <TrendingUp className="h-8 w-8 text-green-500" />
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{passedCount}</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Courses Failed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <TrendingDown className="h-8 w-8 text-red-500" />
                            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{failedCount}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Results Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Course Results</CardTitle>
                    <CardDescription>Final grades for all completed courses</CardDescription>
                </CardHeader>
                <CardContent>
                    {results.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Course</TableHead>
                                        <TableHead className="text-center">Total Score</TableHead>
                                        <TableHead className="text-center">Percentage</TableHead>
                                        <TableHead className="text-center">Letter Grade</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.map((result) => {
                                        // Calculate percentage from TotalMarks (which is the obtained score)
                                        const totalMarks = Number(result.TotalMarks || 0);
                                        const percentage = totalMarks; // TotalMarks is already the percentage/score out of 100
                                        return (
                                            <TableRow key={result.ResultID} className="hover:bg-muted/50">
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{result.CourseName}</p>
                                                        <p className="text-xs text-muted-foreground">{result.CourseCode}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="font-semibold">
                                                        {totalMarks.toFixed(2)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="text-center font-semibold">
                                                            {percentage.toFixed(1)}%
                                                        </div>
                                                        <Progress value={percentage} className="h-1" />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className={`text-2xl font-bold ${
                                                        result.Grade === 'F' ? 'text-red-600 dark:text-red-400' : 
                                                        result.Grade?.startsWith('A') ? 'text-green-600 dark:text-green-400' :
                                                        'text-blue-600 dark:text-blue-400'
                                                    }`}>
                                                        {result.Grade}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge 
                                                        variant={result.Status === 'Pass' ? 'default' : 'destructive'}
                                                        className={result.Status === 'Pass' ? 'bg-green-500' : ''}
                                                    >
                                                        {result.Status}
                                                    </Badge>
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
                            <h3 className="text-lg font-semibold mb-2">No results available</h3>
                            <p className="text-muted-foreground">Final results will appear here once declared</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Grade Distribution */}
            {results.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Grade Distribution</CardTitle>
                        <CardDescription>Overview of your performance across different grade levels</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {gradeDistribution.map(({ grade, count }) => (
                                <Card key={grade} className={`border-2 ${
                                    grade === 'A' ? 'border-green-500' :
                                    grade === 'F' ? 'border-red-500' :
                                    'border-blue-500'
                                }`}>
                                    <CardContent className="pt-6">
                                        <div className="text-center space-y-2">
                                            <div className={`text-5xl font-bold ${
                                                grade === 'A' ? 'text-green-600 dark:text-green-400' :
                                                grade === 'F' ? 'text-red-600 dark:text-red-400' :
                                                'text-blue-600 dark:text-blue-400'
                                            }`}>
                                                {grade}
                                            </div>
                                            <div className="text-3xl font-semibold">
                                                {count}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {count === 1 ? 'course' : 'courses'}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
