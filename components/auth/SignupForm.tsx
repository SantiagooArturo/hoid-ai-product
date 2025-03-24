"use client"

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Rocket, Target, Zap, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [occupation, setOccupation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    if (!occupation) {
      alert("Please select your occupation!");
      return;
    }

    try {
      setIsLoading(true);
      await signUp(email, password, occupation);
      router.push('/');
    } catch (err) {
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row-reverse font-poppins">
      {/* Left side - Decorative */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-500 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center text-white">
          <h1 className="text-4xl font-bold mb-6 tracking-tight">Start Your Smart Study Journey</h1>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <Rocket className="w-6 h-6" />
              </div>
              <p className="text-lg font-light">Boost your academic performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <Target className="w-6 h-6" />
              </div>
              <p className="text-lg font-light">Focus on understanding, not note-taking</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <Zap className="w-6 h-6" />
              </div>
              <p className="text-lg font-light">Learn smarter, not harder</p>
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-fuchsia-400 rounded-full opacity-20"></div>
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-orange-400 rounded-full opacity-20"></div>
      </div>

      {/* Right side - Signup form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Create your account
            </h2>
            <p className="mt-2 text-sm font-light text-gray-600 dark:text-gray-400">
              Join thousands of students improving their study habits
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
                  autoComplete="new-password"
                  required
                  className="mt-1 font-light"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-1 font-light"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  What best describes you?
                </label>
                <Select required value={occupation} onValueChange={setOccupation}>
                  <SelectTrigger className="mt-1 w-full font-light">
                    <SelectValue placeholder="Select your occupation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="university_student">University Student</SelectItem>
                    <SelectItem value="high_school_student">High School Student</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="researcher">Researcher/Academic</SelectItem>
                    <SelectItem value="educator">Professor/Educator</SelectItem>
                    <SelectItem value="entrepreneur">Entrepreneur/Business Owner</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center font-medium">{error}</div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-500 hover:opacity-90 transition-opacity font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-light">
                Already have an account?{' '}
                <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                  Sign in
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 