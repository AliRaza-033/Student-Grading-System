'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  GraduationCap, 
  Home, 
  BookOpen, 
  BarChart3, 
  Award,
  LogOut,
  User,
  Key
} from 'lucide-react';

export default function StudentDashboardLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        // Redirect to overview if on base dashboard path
        if (pathname === '/student/dashboard') {
            router.push('/student/dashboard/overview');
        }
    }, [pathname, router]);

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (data.success) {
                setUser(data.user);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
    };

    const menuItems = [
        { icon: Home, label: 'Overview', path: '/student/dashboard/overview' },
        { icon: BookOpen, label: 'My Courses', path: '/student/dashboard/courses' },
        { icon: BarChart3, label: 'Grades', path: '/student/dashboard/grades' },
        { icon: Award, label: 'Results', path: '/student/dashboard/results' },
    ];

    const settingsItems = [
        { icon: User, label: 'Profile', path: '/student/dashboard/profile' },
        { icon: Key, label: 'Change Password', path: '/student/dashboard/change-password' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-lg text-muted-foreground">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <Sidebar>
                    <SidebarHeader className="border-b px-6 py-4">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-6 w-6 text-primary" />
                            <div>
                                <h2 className="font-semibold">Student Portal</h2>
                                <p className="text-xs text-muted-foreground">Academic Dashboard</p>
                            </div>
                        </div>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {menuItems.map((item) => (
                                        <SidebarMenuItem key={item.path}>
                                            <SidebarMenuButton
                                                onClick={() => router.push(item.path)}
                                                isActive={pathname === item.path}
                                            >
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.label}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        <SidebarGroup>
                            <SidebarGroupLabel>Settings</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {settingsItems.map((item) => (
                                        <SidebarMenuItem key={item.path}>
                                            <SidebarMenuButton
                                                onClick={() => router.push(item.path)}
                                                isActive={pathname === item.path}
                                            >
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.label}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter className="border-t p-4">
                        {user && (
                            <div className="px-3 py-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                    <User className="h-4 w-4" />
                                    <span className="font-medium truncate">{user.FullName}</span>
                                </div>
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="w-full justify-start"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </SidebarFooter>
                </Sidebar>

                <main className="flex-1 overflow-auto">
                    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="flex h-16 items-center gap-4 px-6">
                            <SidebarTrigger />
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold">My Dashboard</h1>
                            </div>
                            <ThemeToggle />
                        </div>
                    </header>

                    <div className="p-6">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
