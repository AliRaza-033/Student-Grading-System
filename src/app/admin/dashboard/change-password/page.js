'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, CheckCircle, XCircle, Key } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function AdminChangePasswordPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordStrength, setPasswordStrength] = useState({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false
    });

    useEffect(() => {
        checkPasswordStrength(formData.newPassword);
    }, [formData.newPassword]);

    const checkPasswordStrength = (password) => {
        setPasswordStrength({
            minLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /\d/.test(password)
        });
    };

    const isPasswordValid = Object.values(passwordStrength).every(Boolean);
    const passwordsMatch = formData.newPassword === formData.confirmPassword && formData.confirmPassword !== '';

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isPasswordValid) {
            toast({
                title: "Invalid Password",
                description: "Password does not meet requirements",
                variant: "destructive",
            });
            return;
        }

        if (!passwordsMatch) {
            toast({
                title: "Passwords Don't Match",
                description: "New password and confirmation must match",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/admin/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });

            const data = await res.json();

            if (data.success) {
                toast({
                    title: "Success",
                    description: "Password changed successfully. Please login again.",
                });
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to change password",
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
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Change Password</h2>
                <p className="text-muted-foreground mt-2">
                    Update your account password
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        Password Update
                    </CardTitle>
                    <CardDescription>
                        Enter your current password and choose a new secure password
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <div className="relative">
                                <Input
                                    id="currentPassword"
                                    type={showPassword.current ? 'text' : 'password'}
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type={showPassword.new ? 'text' : 'password'}
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Password Strength Indicators */}
                        {formData.newPassword && (
                            <div className="space-y-2 p-4 bg-muted rounded-lg">
                                <div className="text-sm font-medium mb-2">Password Requirements:</div>
                                <div className="space-y-1">
                                    {[
                                        { key: 'minLength', label: 'At least 8 characters' },
                                        { key: 'hasUpperCase', label: 'One uppercase letter' },
                                        { key: 'hasLowerCase', label: 'One lowercase letter' },
                                        { key: 'hasNumber', label: 'One number' }
                                    ].map((req) => (
                                        <div key={req.key} className="flex items-center gap-2 text-sm">
                                            {passwordStrength[req.key] ? (
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-red-600" />
                                            )}
                                            <span className={passwordStrength[req.key] ? 'text-green-600' : 'text-red-600'}>
                                                {req.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showPassword.confirm ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {formData.confirmPassword && (
                                <div className="flex items-center gap-2 text-sm mt-1">
                                    {passwordsMatch ? (
                                        <>
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="text-green-600">Passwords match</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-4 w-4 text-red-600" />
                                            <span className="text-red-600">Passwords don't match</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={loading || !isPasswordValid || !passwordsMatch}
                        >
                            {loading ? 'Changing Password...' : 'Change Password'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
