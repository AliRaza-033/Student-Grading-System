'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { Award, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

export default function ResultsManagementPage() {
    const { toast } = useToast();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const res = await fetch('/api/admin/results');
            const data = await res.json();
            if (data.success) setResults(data.results);
        } catch (error) {
            console.error('Error fetching results:', error);
            toast({
                title: "Error",
                description: "Failed to load results",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateResults = async () => {
        setConfirmDialogOpen(true);
    };

    const confirmGenerate = async () => {
        setConfirmDialogOpen(false);
        setGenerating(true);
        try {
            const res = await fetch('/api/admin/results/generate', {
                method: 'POST'
            });

            const data = await res.json();

            if (data.success) {
                toast({
                    title: "Success",
                    description: `Generated ${data.count} results successfully`,
                });
                fetchResults();
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to generate results",
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
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const passCount = results.filter(r => r.Status === 'Pass').length;
    const failCount = results.filter(r => r.Status === 'Fail').length;
    const passRate = results.length > 0 ? ((passCount / results.length) * 100).toFixed(1) : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Results Management</h2>
                    <p className="text-muted-foreground mt-2">
                        Generate and manage final results for students
                    </p>
                </div>
                <Button onClick={handleGenerateResults} disabled={generating}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
                    {generating ? 'Generating...' : 'Generate All Results'}
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <Award className="h-8 w-8 text-blue-500" />
                            <div className="text-3xl font-bold">{results.length}</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Passed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <TrendingUp className="h-8 w-8 text-green-500" />
                            <div>
                                <div className="text-3xl font-bold text-green-600">{passCount}</div>
                                <div className="text-xs text-muted-foreground">{passRate}% pass rate</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <TrendingDown className="h-8 w-8 text-red-500" />
                            <div>
                                <div className="text-3xl font-bold text-red-600">{failCount}</div>
                                <div className="text-xs text-muted-foreground">{(100 - passRate).toFixed(1)}% fail rate</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Info Alert */}
            <Alert>
                <Award className="h-4 w-4" />
                <AlertDescription>
                    Click "Generate All Results" to calculate final results based on assessment grades. Results are calculated automatically from enrolled students' grades.
                </AlertDescription>
            </Alert>

            {/* Results Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Results</CardTitle>
                    <CardDescription>Final results for all students</CardDescription>
                </CardHeader>
                <CardContent>
                    {results.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Roll No</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead className="text-center">Total Marks</TableHead>
                                        <TableHead className="text-center">Grade</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.map((result) => (
                                        <TableRow key={result.ResultID}>
                                            <TableCell className="font-medium">{result.StudentName}</TableCell>
                                            <TableCell>{result.RollNo}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{result.CourseName}</div>
                                                    <div className="text-xs text-muted-foreground">{result.CourseCode}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-semibold">
                                                {result.TotalMarks ? Number(result.TotalMarks).toFixed(2) : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className={`text-xl font-bold ${
                                                    result.Grade === 'F' ? 'text-red-600' :
                                                    result.Grade?.startsWith('A') ? 'text-green-600' :
                                                    'text-blue-600'
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
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No results available</h3>
                            <p className="text-muted-foreground mb-4">
                                Click "Generate All Results" to create results for enrolled students
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Generate Confirmation Dialog */}
            <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Generate All Results?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will generate results for all enrolled students with complete grades. Existing results will be updated with new calculations.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmGenerate}>
                            Generate Results
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
