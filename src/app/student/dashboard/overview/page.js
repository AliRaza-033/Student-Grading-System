'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  TrendingUp, 
  BookOpen, 
  Award,
  BarChart3,
  TrendingDown,
  Activity
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function OverviewPage() {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/student/dashboard');
            const data = await res.json();
            if (data.success) {
                setStatistics(data.statistics);
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
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
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Academic Overview</h2>
                <p className="text-muted-foreground mt-2">
                    Monitor your academic performance and progress
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Current GPA</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {statistics?.gpa ? Number(statistics.gpa).toFixed(2) : 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Out of 4.0 scale</p>
                        <Progress value={(Number(statistics?.gpa || 0) / 4.0) * 100} className="mt-2" />
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
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
                        <p className="text-xs text-muted-foreground mt-1">Active this semester</p>
                        <div className="flex items-center gap-2 mt-2 text-xs">
                            <Activity className="h-3 w-3 text-green-500" />
                            <span className="text-muted-foreground">All courses in progress</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
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
                        <p className="text-xs text-muted-foreground mt-1">Success rate overall</p>
                        <Progress value={Number(statistics?.passRate || 0)} className="mt-2" />
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
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
                        <Progress value={Number(statistics?.averagePercentage || 0)} className="mt-2" />
                    </CardContent>
                </Card>
            </div>

            {/* Academic Performance Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Academic Summary</CardTitle>
                        <CardDescription>Comprehensive overview of your academic standing</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                                        <Award className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Courses Passed</p>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {statistics?.passedCourses || 0}
                                        </p>
                                    </div>
                                </div>
                                <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center">
                                        <TrendingDown className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Courses Failed</p>
                                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                            {statistics?.failedCourses || 0}
                                        </p>
                                    </div>
                                </div>
                                <TrendingDown className="h-8 w-8 text-red-500 opacity-50" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Grade Range</CardTitle>
                        <CardDescription>Your highest and lowest performance grades</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                        <TrendingUp className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Highest Grade</p>
                                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                            {statistics?.highestGrade || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                                        <BarChart3 className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Lowest Grade</p>
                                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                            {statistics?.lowestGrade || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
