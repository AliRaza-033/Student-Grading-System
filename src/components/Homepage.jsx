'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { GraduationCap, BookOpen, Award, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">

      {/* Animated Orbs */}
      <motion.div
        className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl"
        animate={{ y: [0, 40, 0], x: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-1/4 -right-40 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl"
        animate={{ y: [0, -30, 0], x: [0, -40, 0] }}
        transition={{ duration: 14, repeat: Infinity }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-semibold">
              Student Grading System
            </span>
          </div>
          <Link href="/login">
            <Button className="bg-white text-black">Login</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 container mx-auto px-6 py-32 text-center"
      >
        <h1 className="text-6xl font-extrabold mb-6">
          Intelligent Academic <br />
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Grading Platform
          </span>
        </h1>

        <p className="max-w-3xl mx-auto text-lg text-gray-300 mb-12">
          Manage students, courses, assessments, grades, and final results
          with clarity and precision.
        </p>

        <Link href="/login">
          <Button
            size="lg"
            className="px-14 py-7 bg-gradient-to-r from-blue-500 to-purple-500"
          >
            Enter Dashboard
          </Button>
        </Link>
      </motion.section>

      {/* Features */}
      <section className="relative z-10 container mx-auto px-6 pb-24 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Feature icon={<GraduationCap />} title="Students" />
        <Feature icon={<BookOpen />} title="Courses" />
        <Feature icon={<Award />} title="Grading" />
        <Feature icon={<Users />} title="Roles" />
      </section>

      <footer className="relative z-10 border-t border-white/10 py-6 text-center text-sm text-gray-400">
        © 2025 Student Grading System
      </footer>
    </div>
  );
}

/* Small component */
function Feature({ icon, title }) {
  return (
    <motion.div whileHover={{ y: -6 }}>
      <Card className="bg-white/5 border border-white/10 backdrop-blur">
        <CardHeader>
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4">
            {icon}
          </div>
          <CardTitle className="text-white">{title}</CardTitle>
          <CardDescription className="text-gray-300">
            Manage {title.toLowerCase()} efficiently.
          </CardDescription>
        </CardHeader>
      </Card>
    </motion.div>
  );
}
