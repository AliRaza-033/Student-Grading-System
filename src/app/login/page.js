'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '@/lib/axios';
import useAuthStore from '@/store/authStore';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { setUser, setLoading: setAuthLoading } = useAuthStore();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAuthLoading(true);

        try {
            const { data } = await axios.post('/api/auth/login', {
                username,
                password
            });

            if (data.success) {
                setUser(data.user);
                toast({
                    title: "Login Successful",
                    description: `Welcome ${data.user.role === 'Admin' ? 'Admin' : 'Student'}!`,
                    variant: "default",
                });
                
                // Redirect based on role
                const redirectPath = data.user.role === 'Admin' 
                    ? '/admin/dashboard' 
                    : '/student/dashboard';
                    
                router.push(redirectPath);
                router.refresh();
            } else {
                toast({
                    title: "Login Failed",
                    description: data.error || 'Invalid credentials. Please try again.',
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
            setAuthLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Student Grading System</CardTitle>
                    <CardDescription className="text-center">
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Roll Number</Label>
                            <Input
                                id="username"
                                placeholder="e.g. 24014198-109"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="text-right">
                            <Link 
                                href="/forgot-password" 
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
