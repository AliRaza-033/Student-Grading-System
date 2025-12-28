'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Key,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function ChangePasswordPage() {
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
        length: false,
        uppercase: false,
        lowercase: false,
        number: false
    });

    const checkPasswordStrength = (password) => {
        setPasswordStrength({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password)
        });
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setFormData({...formData, newPassword});
        checkPasswordStrength(newPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast({
                title: "Error",
                description: "New passwords do not match",
                variant: "destructive",
            });
            return;
        }

        if (!Object.values(passwordStrength).every(Boolean)) {
            toast({
                title: "Error",
                description: "Password does not meet security requirements",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/student/change-password', {
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
                description: "An error occurred while changing password",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Page Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Change Password</h2>
                <p className="text-muted-foreground mt-2">
                    Update your password to keep your account secure
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
                        {/* Current Password */}
                        <div className="space-y-2">
                            <Label>Current Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type={showPassword.current ? "text" : "password"}
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                                    className="pl-10 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                >
                                    {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                            <Label>New Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type={showPassword.new ? "text" : "password"}
                                    value={formData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="pl-10 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                >
                                    {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Password Strength Indicators */}
                        <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm font-medium mb-3">Password Requirements:</p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    {passwordStrength.length ? 
                                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                                        <XCircle className="h-4 w-4 text-muted-foreground" />
                                    }
                                    <span className={passwordStrength.length ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                                        At least 8 characters
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    {passwordStrength.uppercase ? 
                                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                                        <XCircle className="h-4 w-4 text-muted-foreground" />
                                    }
                                    <span className={passwordStrength.uppercase ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                                        One uppercase letter
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    {passwordStrength.lowercase ? 
                                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                                        <XCircle className="h-4 w-4 text-muted-foreground" />
                                    }
                                    <span className={passwordStrength.lowercase ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                                        One lowercase letter
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    {passwordStrength.number ? 
                                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                                        <XCircle className="h-4 w-4 text-muted-foreground" />
                                    }
                                    <span className={passwordStrength.number ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                                        One number
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Confirm New Password */}
                        <div className="space-y-2">
                            <Label>Confirm New Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type={showPassword.confirm ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                    className="pl-10 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                >
                                    {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <XCircle className="h-3 w-3" />
                                    Passwords do not match
                                </p>
                            )}
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-3">
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Changing Password...
                                    </>
                                ) : (
                                    <>
                                        <Key className="mr-2 h-4 w-4" />
                                        Change Password
                                    </>
                                )}
                            </Button>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => router.back()}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
