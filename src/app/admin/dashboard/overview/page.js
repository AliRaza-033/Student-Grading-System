'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, BookOpen, UserPlus, Award, TrendingUp, BarChart3 } from 'lucide-react';

export default function AdminOverviewPage() {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            const res = await fetch('/api/admin/statistics');
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

    const stats = [
        {
            title: 'Total Students',
            value: statistics?.totalStudents || 0,
            icon: Users,
            description: 'Registered students',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-950'
        },
        {
            title: 'Total Courses',
            value: statistics?.totalCourses || 0,
            icon: BookOpen,
            description: 'Available courses',
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-950'
        },
        {
            title: 'Total Enrollments',
            value: statistics?.totalEnrollments || 0,
            icon: UserPlus,
            description: 'Active enrollments',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-950'
        },
        {
            title: 'Total Assessments',
            value: statistics?.totalAssessments || 0,
            icon: BarChart3,
            description: 'Created assessments',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-950'
        },
        {
            title: 'Grades Entered',
            value: statistics?.totalGrades || 0,
            icon: TrendingUp,
            description: 'Recorded grades',
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-50 dark:bg-cyan-950'
        },
        {
            title: 'Results Generated',
            value: statistics?.totalResults || 0,
            icon: Award,
            description: 'Final results',
            color: 'text-pink-600',
            bgColor: 'bg-pink-50 dark:bg-pink-950'
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
                <p className="text-muted-foreground mt-2">
                    System-wide statistics and performance metrics
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button
                            onClick={() => window.location.href = '/admin/dashboard/students'}
                            className="p-4 border rounded-lg hover:bg-accent transition-colors text-left"
                        >
                            <Users className="h-6 w-6 mb-2 text-blue-600" />
                            <div className="font-semibold">Manage Students</div>
                            <div className="text-xs text-muted-foreground">Add or edit students</div>
                        </button>
                        <button
                            onClick={() => window.location.href = '/admin/dashboard/courses'}
                            className="p-4 border rounded-lg hover:bg-accent transition-colors text-left"
                        >
                            <BookOpen className="h-6 w-6 mb-2 text-green-600" />
                            <div className="font-semibold">Manage Courses</div>
                            <div className="text-xs text-muted-foreground">Add or edit courses</div>
                        </button>
                        <button
                            onClick={() => window.location.href = '/admin/dashboard/enrollments'}
                            className="p-4 border rounded-lg hover:bg-accent transition-colors text-left"
                        >
                            <UserPlus className="h-6 w-6 mb-2 text-purple-600" />
                            <div className="font-semibold">Enroll Students</div>
                            <div className="text-xs text-muted-foreground">Manage enrollments</div>
                        </button>
                        <button
                            onClick={() => window.location.href = '/admin/dashboard/results'}
                            className="p-4 border rounded-lg hover:bg-accent transition-colors text-left"
                        >
                            <Award className="h-6 w-6 mb-2 text-pink-600" />
                            <div className="font-semibold">Generate Results</div>
                            <div className="text-xs text-muted-foreground">Create final results</div>
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
