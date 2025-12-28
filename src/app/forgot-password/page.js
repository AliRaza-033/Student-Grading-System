'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [questions, setQuestions] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        fetchSecurityQuestions();
    }, []);

    const fetchSecurityQuestions = async () => {
        try {
            const { data } = await axios.get('/api/auth/security-questions');
            if (data.success) {
                setQuestions(data.questions);
            }
        } catch (err) {
            console.error('Error fetching questions:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (newPassword !== confirmPassword) {
            toast({
                title: "Validation Error",
                description: 'Passwords do not match',
                variant: "destructive",
            });
            setLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            toast({
                title: "Validation Error",
                description: 'Password must be at least 6 characters',
                variant: "destructive",
            });
            setLoading(false);
            return;
        }

        try {
            const { data } = await axios.post('/api/auth/reset-password', {
                username,
                securityAnswers: [{ questionId: parseInt(selectedQuestion), answer }],
                newPassword
            });

            if (data.success) {
                toast({
                    title: "Success!",
                    description: 'Password reset successfully! Redirecting to login...',
                    variant: "default",
                });
                setTimeout(() => router.push('/login'), 2000);
            } else {
                toast({
                    title: "Reset Failed",
                    description: data.error || 'Password reset failed. Please check your details.',
                    variant: "destructive",
                });
            }
        } catch (err) {
            const errorMessage = err?.error || err?.message || 'An error occurred. Please check your connection and try again.';
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Student Password Reset</CardTitle>
                    <CardDescription className="text-center">
                        Enter your roll number and answer your security question
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Roll Number</Label>
                            <Input
                                id="username"
                                placeholder="Enter your roll number (e.g., 24014198-109)"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="question">Security Question</Label>
                            <Select 
                                value={selectedQuestion} 
                                onValueChange={setSelectedQuestion}
                                disabled={loading}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a security question" />
                                </SelectTrigger>
                                <SelectContent>
                                    {questions.map(q => (
                                        <SelectItem key={q.QuestionID} value={q.QuestionID.toString()}>
                                            {q.QuestionText}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="answer">Answer</Label>
                            <Input
                                id="answer"
                                placeholder="Enter your answer"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="text-center">
                            <Link 
                                href="/login" 
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Back to login
                            </Link>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={loading || !selectedQuestion}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
