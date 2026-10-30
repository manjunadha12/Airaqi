import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { apiService } from '../services/apiService';
import AirParticlesBackground from '../components/AirParticlesBackground';
import {
  MailCheck,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Mail,
  KeyRound,
} from 'lucide-react';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tokenParam = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';
  const isRegisteredParam = searchParams.get('registered') === 'true';

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [statusMessage, setStatusMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  // If token is present in URL, verify automatically on load
  useEffect(() => {
    if (tokenParam) {
      verifyWithToken(tokenParam);
    }
  }, [tokenParam]);

  // Handle cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const verifyWithToken = async (token) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.verifyEmail({ token });
      if (response.data.success) {
        setIsVerified(true);
        setStatusMessage('Your email address has been successfully verified!');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Verification token is invalid or has expired. Please enter your email to request a new code.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }
    if (!email.trim()) {
      setError('Please provide the email address associated with your account.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.verifyEmail({
        otp: otp.trim(),
        email: email.trim().toLowerCase(),
      });

      if (response.data.success) {
        setIsVerified(true);
        setStatusMessage('Your email address has been successfully verified!');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Invalid or expired verification code. Please request a new one.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError('Please enter your email address to receive a verification code.');
      return;
    }

    setResending(true);
    setError(null);

    try {
      const response = await apiService.resendVerification(email.trim().toLowerCase());
      if (response.data.success) {
        setStatusMessage('A new verification code and link has been sent to your email.');
        setResendCooldown(60); // 60s cooldown
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification message.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06141B] text-white flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans select-none">
      <AirParticlesBackground />
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/15 rounded-full blur-[140px]" />

      <div className="w-full max-w-md z-10 py-6">
        <div className="backdrop-blur-3xl bg-[#0b1b26]/90 border border-white/15 rounded-3xl p-7 sm:p-9 shadow-[0_25px_70px_rgba(0,0,0,0.85)] text-center relative">
          {/* Top Icon */}
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-cyan-500/30 border border-white/30">
            {isVerified ? (
              <CheckCircle className="w-8 h-8 text-slate-950" />
            ) : (
              <MailCheck className="w-8 h-8 text-slate-950" />
            )}
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isVerified
              ? 'Account Verified!'
              : isRegisteredParam
              ? 'Verify Your Account'
              : 'Email Verification'}
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
            {isVerified
              ? 'Your email address is now verified. You have full access to real-time AQI monitoring and predictions.'
              : isRegisteredParam
              ? `We have sent a verification link and 6-digit code to ${
                  email ? `"${email}"` : 'your email address'
                }. Please enter it below to activate your account.`
              : 'Enter your 6-digit verification code below or click the link received in your email.'}
          </p>

          {/* Status Message */}
          {statusMessage && (
            <div className="mt-5 p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 backdrop-blur-xl animate-fadeIn text-left">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-5 p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 backdrop-blur-xl animate-fadeIn text-left">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Area */}
          {isVerified ? (
            <div className="mt-7">
              <Link
                to="/login"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 hover:from-cyan-400 hover:to-teal-300 text-slate-950 rounded-2xl font-black text-sm tracking-wide shadow-[0_12px_30px_rgba(6,182,212,0.35)] hover:shadow-[0_16px_36px_rgba(6,182,212,0.5)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleOtpSubmit} className="mt-6 space-y-4 text-left">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-[#06141B]/90 border border-white/15 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition font-medium"
                    placeholder="Enter your registered email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-3 bg-[#06141B]/90 border border-white/15 rounded-2xl text-center font-mono font-bold tracking-[6px] text-lg text-cyan-400 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition"
                    placeholder="123456"
                    required
                  />
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 hover:from-cyan-400 hover:to-teal-300 text-slate-950 rounded-2xl font-black text-sm tracking-wide shadow-[0_12px_30px_rgba(6,182,212,0.35)] hover:shadow-[0_16px_36px_rgba(6,182,212,0.5)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Resend Verification Action */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                <span>Didn't receive the email?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || resendCooldown > 0}
                  className="text-cyan-400 font-bold hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : resending
                    ? 'Sending...'
                    : 'Resend Code'}
                </button>
              </div>
            </form>
          )}

          {/* Back to Login Link */}
          <div className="mt-7 pt-5 border-t border-white/10 text-center">
            <Link
              to="/login"
              className="text-xs text-slate-400 hover:text-cyan-400 transition font-bold inline-flex items-center gap-1.5"
            >
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
