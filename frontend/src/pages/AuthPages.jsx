import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { useAuthStore } from '../store';

function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
              <HiSparkles className="text-white text-xl" />
            </div>
            <span className="font-display font-bold text-2xl text-slate-800">Car<span className="text-blue-600">tify</span></span>
          </Link>
          <h1 className="text-2xl font-display font-bold text-slate-900 mt-4">{title}</h1>
          <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-card p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, isAuthenticated, loading, isSupabaseConfigured } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/';
  useEffect(() => { if (isAuthenticated) navigate(from, { replace: true }); }, [isAuthenticated, navigate, from]);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) navigate(from, { replace: true });
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue to Cartify">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Email Address</label>
          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-blue-400 focus:shadow-sm transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Password</label>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full pl-11 pr-11 py-3.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-blue-400 focus:shadow-sm transition-all"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-2xl hover:bg-blue-700 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</> : 'Sign In'}
        </button>

        {isSupabaseConfigured?.() && (
          <>
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400">Or continue with</span>
              </div>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={loginWithGoogle}
              className="w-full border border-slate-200 text-slate-700 font-semibold py-3.5 rounded-2xl hover:bg-slate-50 hover:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              <span>Continue with Google</span>
            </button>
          </>
        )}

        <div className="text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">Create one</Link>
        </div>
      </form>
    </AuthLayout>
  );
}

// ─── Register ─────────────────────────────────────────────────────────────────
export function RegisterPage() {
  const navigate = useNavigate();
  const { register, loginWithGoogle, isAuthenticated, loading, isSupabaseConfigured } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (isAuthenticated) navigate('/'); }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    await register(form.name, form.email, form.password);
  };

  return (
    <AuthLayout title="Create account" subtitle="Join Cartify to start shopping">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Full Name</label>
          <div className="relative">
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-blue-400 focus:shadow-sm transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Email Address</label>
          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-blue-400 focus:shadow-sm transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Password</label>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              required
              className="w-full pl-11 pr-11 py-3.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-blue-400 focus:shadow-sm transition-all"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Confirm Password</label>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              required
              className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-blue-400 focus:shadow-sm transition-all"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-2xl hover:bg-blue-700 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account...</> : 'Create Account'}
        </button>

        {isSupabaseConfigured?.() && (
          <>
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400">Or continue with</span>
              </div>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={loginWithGoogle}
              className="w-full border border-slate-200 text-slate-700 font-semibold py-3.5 rounded-2xl hover:bg-slate-50 hover:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              <span>Sign up with Google</span>
            </button>
          </>
        )}

        <div className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
