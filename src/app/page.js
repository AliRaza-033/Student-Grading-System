import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { GraduationCap, BookOpen, Award, Users } from 'lucide-react';

export default async function Home() {
  const user = await getCurrentUser();
  
  if (user) {
    if (user.role === 'Admin') {
      redirect('/admin/dashboard');
    } else {
      redirect('/student/dashboard');
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">Student Grading System</h1>
          </div>
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Academic Excellence Management
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Streamline student grading, course management, and academic performance tracking with our comprehensive offline system.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Student Management</CardTitle>
              <CardDescription>
                Comprehensive student profiles with enrollment tracking and academic records.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Course Management</CardTitle>
              <CardDescription>
                Create and manage courses, assessments, and track student progress effortlessly.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Automated Grading</CardTitle>
              <CardDescription>
                Automatic grade calculations with weighted assessments and letter grade conversion.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle>Role-Based Access</CardTitle>
              <CardDescription>
                Secure authentication with admin and student roles for proper access control.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Info Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">For Administrators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-600 mt-2" />
                <p>Create and manage student accounts with security questions</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-600 mt-2" />
                <p>Set up courses with credit hours and academic details</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-600 mt-2" />
                <p>Create assessments with custom weightage (Quiz, Mid, Final)</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-600 mt-2" />
                <p>Enter grades and automatically calculate final results</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-600 mt-2" />
                <p>Generate comprehensive academic reports</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">For Students</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-600 mt-2" />
                <p>View enrolled courses and academic schedule</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-600 mt-2" />
                <p>Check assessment grades with detailed breakdowns</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-600 mt-2" />
                <p>View final results with letter grades</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-600 mt-2" />
                <p>Track GPA and academic performance statistics</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-600 mt-2" />
                <p>Monitor pass rates and grade distribution</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0">
          <CardContent className="py-12 text-center text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-lg mb-6 opacity-90">
              Login now to access your dashboard and manage academic records efficiently.
            </p>
            <Link href="/login">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Login to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>© 2025 Student Grading System. Built with Next.js & SQL Server.</p>
        </div>
      </footer>
    </div>
  );
}

        