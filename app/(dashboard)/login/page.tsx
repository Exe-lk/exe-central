'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials. Please try again.');
        setIsLoading(false);
        return;
      }

      // On success, navigate to dashboard home
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC] dark:bg-[#0B0C0E]">
      <div className="w-full max-w-md bg-white dark:bg-[#14161A] border border-[#616E7C]/20 dark:border-[#3A3E46] rounded-xl shadow-lg overflow-hidden transition-colors duration-200">
        
        {/* Card Header */}
        <div className="p-8 pb-6 text-left">
          <h1 className="text-2xl font-bold text-[#1F2933] dark:text-white tracking-tight">
            EXE.LK
          </h1>
          <p className="text-sm font-medium text-[#616E7C] dark:text-[#E5E7EB]/70 mt-1">
            Centralized Management System
          </p>
        </div>

        {/* Full-width horizontal divider line */}
        <div className="w-full border-b border-[#616E7C]/20 dark:border-[#3A3E46]" />

        {/* Form Body */}
        <div className="p-8 pt-6">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-xs font-bold uppercase tracking-wider text-[#1F2933] dark:text-[#E5E7EB] mb-2"
              >
                EMAIL ADDRESS
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@exe.lk"
                className="w-full h-11 px-4 text-sm bg-[#F8FAFC] dark:bg-[#0B0C0E] border border-[#616E7C]/20 dark:border-[#3A3E46] rounded-lg text-[#1F2933] dark:text-white placeholder:text-[#616E7C]/50 dark:placeholder:text-[#E5E7EB]/30 focus:outline-none focus:border-[#2A5CAA] dark:focus:border-[#5B8DD9] transition-colors"
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label 
                  htmlFor="password" 
                  className="block text-xs font-bold uppercase tracking-wider text-[#1F2933] dark:text-[#E5E7EB]"
                >
                  PASSWORD
                </label>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  className="text-xs font-semibold text-[#2A5CAA] dark:text-[#5B8DD9] hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-4 pr-11 text-sm bg-[#F8FAFC] dark:bg-[#0B0C0E] border border-[#616E7C]/20 dark:border-[#3A3E46] rounded-lg text-[#1F2933] dark:text-white placeholder:text-[#616E7C]/50 dark:placeholder:text-[#E5E7EB]/30 focus:outline-none focus:border-[#2A5CAA] dark:focus:border-[#5B8DD9] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#616E7C] dark:text-[#E5E7EB]/70 hover:text-[#1F2933] dark:hover:text-white focus:outline-none p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <FiEyeOff className="w-5 h-5" />
                  ) : (
                    <FiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 mt-2 bg-[#2A5CAA] hover:bg-[#2A5CAA]/90 dark:bg-[#5B8DD9] dark:hover:bg-[#5B8DD9]/90 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>Logging in...</span>
              ) : (
                <>
                  <span>Log In</span>
                  <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
