"use client"

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, BrainCircuit, Sparkles, Loader2 } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await signIn(email, password);
      router.push('/');
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-poppins">
      {/* Left side - Decorative */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center text-white">
          <h1 className="text-4xl font-bold mb-6 tracking-tight">Welcome Back to Smart Learning</h1>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <BookOpen className="w-6 h-6" />
              </div>
              <p className="text-lg font-light">Record and analyze your lectures</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <p className="text-lg font-light">Get AI-powered study materials</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-lg font-light">Transform lectures into knowledge</p>
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-400 rounded-full opacity-20"></div>
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-pink-400 rounded-full opacity-20"></div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Welcome back!
            </h2>
            <p className="mt-2 text-sm font-light text-gray-600 dark:text-gray-400">
              Ready to continue your learning journey?
            </p>
          </div>

          <form className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 font-light"
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-1 font-light"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center font-medium">{error}</div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 transition-opacity font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-light">
                Don't have an account?{' '}
                <a href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                  Sign up for free
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 