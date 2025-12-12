import * as React from 'react';
import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';

// Actual Login API Call
// Live Server Path: https://prospine.in/admin/mobile/api/login.php
const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://prospine.in/admin/mobile/api';

const LoginScreen: React.FC = () => {
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Login failed');
      }

      // Success!
      login({
        id: data.data.user.employee_id,
        name: data.data.user.full_name,
        email: data.data.user.email,
        role: data.data.user.role_name,
        token: data.data.token,
        photo: data.data.user.photo_path
      } as any);

    } catch (err: any) {
      console.error('Login Error:', err);
      setError(err.message || 'Unable to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header Section (Logo) */}
      <div className="flex-none pt-12 pb-8 flex flex-col items-center">
        <img
          src="/logo.png"
          alt="ProSpine"
          className="w-40 h-40 object-contain mb-4"
        />
        <h2 className="text-2xl font-normal text-gray-900">Sign in</h2>
        <p className="text-sm text-gray-500 mt-1">to continue to ProSpine</p>
      </div>

      {/* Login Form */}
      <div className="flex-1 px-8 md:px-12 w-full max-w-md mx-auto">
        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Email Input */}
          <div className="relative group">
            <input
              type="text"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="peer w-full px-4 py-3.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 placeholder-transparent bg-white transition-all"
              placeholder="Email or Username"
            />
            <label
              htmlFor="email"
              className="absolute left-3.5 -top-2.5 bg-white px-1 text-xs text-teal-600 transition-all 
                         peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 
                         peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-teal-600"
            >
              Email or Username
            </label>
          </div>

          {/* Password Input */}
          <div className="relative group">
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer w-full px-4 py-3.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 placeholder-transparent bg-white transition-all"
              placeholder="Password"
            />
            <label
              htmlFor="password"
              className="absolute left-3.5 -top-2.5 bg-white px-1 text-xs text-teal-600 transition-all 
                         peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 
                         peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-teal-600"
            >
              Password
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-fadeIn">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between text-sm">
            <a href="#" className="font-medium text-teal-600 hover:text-teal-500">
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="flex-none pb-8 text-center text-xs text-gray-400">
        <p>&copy; 2025 ProSpine Clinics. All rights reserved.</p>
      </div>
    </div>
  );
};

export default LoginScreen;
