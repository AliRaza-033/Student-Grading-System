'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Key,
  Save,
  Loader2
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [user, setUser] = useState(null);
    const [securityQuestions, setSecurityQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        securityQuestionId: '',
        securityAnswer: ''
    });

    useEffect(() => {
        fetchUserData();
        fetchSecurityQuestions();
    }, []);

    const fetchUserData = async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (data.success) {
                setUser(data.user);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSecurityQuestions = async () => {
        try {
            const res = await fetch('/api/auth/security-questions');
            const data = await res.json();
            if (data.success) {
                setSecurityQuestions(data.questions);
            }
        } catch (error) {
            console.error('Error fetching security questions:', error);
        }
    };

    const handleUpdateSecurity = async () => {
        if (!formData.securityQuestionId || !formData.securityAnswer) {
            toast({
                title: "Error",
                description: "Please select a security question and provide an answer",
                variant: "destructive",
            });
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/student/update-security', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (data.success) {
                toast({
                    title: "Success",
                    description: "Security question updated successfully",
                });
                setFormData({ securityQuestionId: '', securityAnswer: '' });
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to update security question",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while updating",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
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
                <h2 className="text-3xl font-bold tracking-tight">Profile & Settings</h2>
                <p className="text-muted-foreground mt-2">
                    Manage your personal information and security settings
                </p>
            </div>

            {/* Personal Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Your basic profile details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Full Name
                            </Label>
                            <Input value={user?.FullName || ''} disabled />
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Roll Number
                            </Label>
                            <Input value={user?.RollNo || ''} disabled />
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Department
                            </Label>
                            <Input value={user?.Department || ''} disabled />
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Semester
                            </Label>
                            <Input value={user?.Semester || ''} disabled />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security Question */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Security Question
                    </CardTitle>
                    <CardDescription>
                        Set up a security question for account recovery
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Select Security Question</Label>
                        <Select 
                            value={formData.securityQuestionId} 
                            onValueChange={(value) => setFormData({...formData, securityQuestionId: value})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a security question" />
                            </SelectTrigger>
                            <SelectContent>
                                {securityQuestions.map((question) => (
                                    <SelectItem key={question.QuestionID} value={question.QuestionID.toString()}>
                                        {question.QuestionText}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Your Answer</Label>
                        <Input
                            type="text"
                            placeholder="Enter your answer"
                            value={formData.securityAnswer}
                            onChange={(e) => setFormData({...formData, securityAnswer: e.target.value})}
                        />
                    </div>

                    <Button onClick={handleUpdateSecurity} disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Update Security Question
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Password Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        Password Management
                    </CardTitle>
                    <CardDescription>
                        Change your password to keep your account secure
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button 
                        variant="outline" 
                        onClick={() => router.push('/student/dashboard/change-password')}
                    >
                        <Key className="mr-2 h-4 w-4" />
                        Change Password
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
