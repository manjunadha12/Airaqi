import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import AirParticlesBackground from '../components/AirParticlesBackground';
import {
  KeyRound,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide your registered email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiService.forgotPassword(email.trim().toLowerCase());
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to process your request. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06141B] text-white flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans select-none">
      <AirParticlesBackground />
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/15 rounded-full blur-[140px]" />

      <div className="w-full max-w-md z-10 py-6">
        <div className="backdrop-blur-3xl bg-[#0b1b26]/90 border border-white/15 rounded-3xl p-7 sm:p-9 shadow-[0_25px_70px_rgba(0,0,0,0.85)] relative text-center">
          {/* Top Icon */}
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-cyan-500/30 border border-white/30">
            {submitted ? (
              <CheckCircle className="w-8 h-8 text-slate-950" />
            ) : (
              <KeyRound className="w-8 h-8 text-slate-950" />
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {submitted ? 'Check Your Inbox' : 'Reset Your Password'}
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
            {submitted
              ? `If an account exists for "${email}", password recovery instructions and a secure reset code have been dispatched.`
              : 'Enter the email address associated with your account, and we will send you a secure password reset link.'}
          </p>

          {/* Error Message */}
          {error && (
            <div className="mt-5 p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 backdrop-blur-xl animate-fadeIn text-left">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="mt-7 space-y-3">
              <button
                type="button"
                onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 hover:from-cyan-400 hover:to-teal-300 text-slate-950 rounded-2xl font-black text-sm tracking-wide shadow-[0_12px_30px_rgba(6,182,212,0.35)] hover:shadow-[0_16px_36px_rgba(6,182,212,0.5)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter Reset Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/15 text-slate-300 rounded-2xl font-semibold text-xs transition cursor-pointer"
              >
                Send to a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#06141B]/90 border border-white/15 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition font-medium"
                    placeholder="name@company.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 hover:from-cyan-400 hover:to-teal-300 text-slate-950 rounded-2xl font-black text-sm tracking-wide shadow-[0_12px_30px_rgba(6,182,212,0.35)] hover:shadow-[0_16px_36px_rgba(6,182,212,0.5)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    <span>Sending Recovery Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div className="mt-7 pt-5 border-t border-white/10 text-center">
            <Link
              to="/login"
              className="text-xs text-slate-400 hover:text-cyan-400 transition font-bold inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
