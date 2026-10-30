import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { apiService } from '../services/apiService';
import AirParticlesBackground from '../components/AirParticlesBackground';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Mail,
  Check,
} from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tokenParam = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [token, setToken] = useState(tokenParam);
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const isMinLength = password.length >= 8;
  const doMatch = password && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isMinLength) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (!doMatch) {
      setError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    if (!token && !otp) {
      setError('Please provide the reset token or 6-digit code received in your email.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        password,
        ...(token ? { token } : { otp: otp.trim(), email: email.trim().toLowerCase() }),
      };

      const response = await apiService.resetPassword(payload);

      if (response.data.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to reset password. The reset link or code may have expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06141B] text-white flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      <AirParticlesBackground />

      <div className="w-full max-w-md z-10 py-6">
        <div className="backdrop-blur-2xl bg-[#11212D]/85 border border-white/15 rounded-3xl p-7 sm:p-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] text-center relative">
          {/* Top Icon */}
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#0F766E] to-[#57E5D2] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#0F766E]/40 border border-[#57E5D2]/30">
            {success ? (
              <CheckCircle className="w-8 h-8 text-[#06141B]" />
            ) : (
              <Lock className="w-8 h-8 text-[#06141B]" />
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {success ? 'Password Reset Complete' : 'Set New Password'}
          </h1>

          <p className="text-gray-400 text-xs sm:text-sm mt-2 leading-relaxed">
            {success
              ? 'Your password has been securely updated. You can now log in using your new credentials.'
              : 'Choose a strong, secure password with at least 8 characters for your account.'}
          </p>

          {/* Feedback */}
          {error && (
            <div className="mt-5 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 backdrop-blur-xl animate-fadeIn text-left">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="mt-7">
              <Link
                to="/login"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#0F766E] to-[#0d9488] hover:from-[#115e59] hover:to-[#0F766E] text-white rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-[#0F766E]/30 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
              {/* If no token in URL, prompt for email and OTP */}
              {!token && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#06141B]/80 border border-white/15 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#57E5D2]/50 focus:border-[#57E5D2] transition"
                        placeholder="name@company.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      6-Digit Security Code
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#06141B]/80 border border-white/15 rounded-xl font-mono text-center tracking-[4px] text-sm text-[#57E5D2] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#57E5D2]/50 focus:border-[#57E5D2] transition font-bold"
                        placeholder="123456"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-[#06141B]/80 border border-white/15 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#57E5D2]/50 focus:border-[#57E5D2] transition font-medium"
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-[#06141B]/80 border border-white/15 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#57E5D2]/50 focus:border-[#57E5D2] transition font-medium"
                    placeholder="Re-enter new password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Requirement Checkpoints */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 pt-0.5">
                <span className={`inline-flex items-center gap-1 ${isMinLength ? 'text-emerald-400' : 'text-gray-400'}`}>
                  <Check className={`w-3.5 h-3.5 ${isMinLength ? 'text-emerald-400' : 'opacity-40'}`} />
                  8+ characters
                </span>
                <span className={`inline-flex items-center gap-1 ${doMatch ? 'text-emerald-400' : 'text-gray-400'}`}>
                  <Check className={`w-3.5 h-3.5 ${doMatch ? 'text-emerald-400' : 'opacity-40'}`} />
                  Passwords match
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#0F766E] to-[#0d9488] hover:from-[#115e59] hover:to-[#0F766E] text-white rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-[#0F766E]/30 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Back to Login Link */}
          <div className="mt-7 pt-5 border-t border-white/10 text-center">
            <Link
              to="/login"
              className="text-xs text-gray-400 hover:text-[#57E5D2] transition font-medium inline-flex items-center gap-1.5"
            >
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
