import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { useAuthStore } from '../context/store';
import { GOOGLE_CLIENT_ID } from '../config/api';
import AirParticlesBackground from '../components/AirParticlesBackground';
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Check,
  Sparkles,
  Activity,
  Globe,
  Radio,
  FileText,
  Info,
  KeyRound,
  RotateCcw,
} from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const prefill = location.state || {};
  const [formData, setFormData] = useState({
    firstName: prefill.firstName || '',
    lastName: prefill.lastName || '',
    username: '',
    email: prefill.email || '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [termsModal, setTermsModal] = useState(false);
  const [googleSetupModal, setGoogleSetupModal] = useState(false);
  const googleBtnRef = useRef(null);

  const [step, setStep] = useState('register'); // 'register' | 'otp'
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Handle resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || typeof window === 'undefined') return;

    const scriptId = 'google-identity-services-script';
    let script = document.getElementById(scriptId);

    const initGsi = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        setGoogleInitialized(true);

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            text: 'signup_with',
            shape: 'rectangular',
            width: 360,
            logo_alignment: 'left',
          });
        }
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGsi;
      document.body.appendChild(script);
    } else if (window.google?.accounts?.id) {
      initGsi();
    }
  }, []);

  const handleGoogleCredentialResponse = async (response) => {
    if (!response?.credential) return;

    setGoogleLoading(true);
    setError(null);
    try {
      const res = await apiService.googleAuth(response.credential, 'register', true);
      if (res.data?.success) {
        login(res.data.user, res.data.accessToken, res.data.refreshToken, res.data.sessionId);
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Google registration failed. Please try again or register with email.'
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleClick = () => {
    if (!GOOGLE_CLIENT_ID) {
      setGoogleSetupModal(true);
      return;
    }

    if (window.google?.accounts?.id) {
      setGoogleLoading(true);
      window.google.accounts.id.prompt((notification) => {
        if (
          notification.isNotDisplayed() ||
          notification.isSkippedMoment() ||
          notification.isDismissedMoment()
        ) {
          setGoogleLoading(false);
        }
      });
    } else {
      setGoogleSetupModal(true);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError(null);
  };

  const isPasswordMinLength = formData.password.length >= 8;
  const doPasswordsMatch =
    formData.password && formData.password === formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Please provide your first and last name.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!isPasswordMinLength) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!doPasswordsMatch) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (!formData.agreeTerms) {
      setError('You must accept the Terms of Service to register.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        username: formData.username.trim() || undefined,
        phone: formData.phone.trim() || undefined,
      };

      const res = await apiService.register(payload);

      if (res.data?.success) {
        setRegisteredEmail(formData.email.trim());
        setStep('otp');
        setResendCooldown(60);
      }
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.errors && Array.isArray(errData.errors)) {
        setError(errData.errors.map((e) => e.msg).join(' • '));
      } else {
        setError(
          errData?.message || 'Registration failed. Please review your details.'
        );
      }
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

    setOtpLoading(true);
    setError(null);

    try {
      const response = await apiService.verifyEmail({
        otp: otp.trim(),
        email: registeredEmail.toLowerCase().trim(),
      });

      if (response.data?.success) {
        if (response.data.accessToken && response.data.user) {
          login(response.data.user, response.data.accessToken, response.data.refreshToken, response.data.sessionId);
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/login', {
            state: { message: 'Email verified successfully! Please sign in.' },
          });
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Invalid or expired verification code. Please request a new one.'
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError(null);

    try {
      const response = await apiService.resendVerification(registeredEmail);
      if (response.data?.success) {
        setResendCooldown(60);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to resend code. Please try again shortly.'
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06141B] text-white flex items-center justify-center p-3 sm:p-5 lg:p-7 relative overflow-hidden font-sans select-none">
      {/* Dynamic Ambient Atmospheric Glows */}
      <AirParticlesBackground />
      <div className="pointer-events-none absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/15 rounded-full blur-[140px]" />

      {/* Main Split-Screen Container */}
      <div className="w-full max-w-7xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch min-h-[640px]">
        {/* Left Hero Visual Showcase Panel */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-3xl overflow-hidden relative p-7 sm:p-10 shadow-[0_25px_70px_rgba(0,0,0,0.85)] border border-white/15 min-h-[520px]">
          {/* High-Resolution Atmospheric Backdrop Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
            style={{ backgroundImage: `url('/images/atmosphere-mountain.jpg')` }}
          />

          {/* Cinematic Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#06141B] via-[#06141B]/55 to-[#06141B]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06141B]/80 via-transparent to-[#06141B]/60" />

          {/* Top Row: Brand & Live Indicator */}
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 border border-white/30">
                <span className="font-black text-xl text-slate-950 tracking-tighter">AQI</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-xl tracking-tight text-white drop-shadow">AQI Index</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-400/30 backdrop-blur-md">
                    Global Network
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-semibold tracking-wide drop-shadow-sm">
                  Continuous Environmental Telemetry
                </p>
              </div>
            </div>

            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/70 border border-white/15 backdrop-blur-xl shadow-lg">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[11px] font-mono font-bold text-slate-200">Sensor Mesh Active</span>
            </div>
          </div>

          {/* Center Content: Headline & Network Stats */}
          <div className="relative z-10 my-8 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-bold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Join Over 12,500+ Active Environmental Analysts</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-md">
                Join the Real-Time <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300">
                  Environmental Network.
                </span>
              </h1>
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-lg font-medium drop-shadow-sm">
                Unlock instant access to sub-minute particulate sensor streams, 24-hour mathematical pollution forecasts, and audit-grade metropolitan compliance reports.
              </p>
            </div>

            {/* Platform Capability Pillar Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/75 border border-white/20 backdrop-blur-2xl shadow-2xl space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-400">Enterprise Atmospheric Stack</span>
                <span className="text-[10px] font-mono text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">v4.2 Certified</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <Globe className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">450+ Ground Sensors</p>
                    <p className="text-[10px] text-slate-400">CPCB & WAQI live ingest</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Activity className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">Neural Forecasting</p>
                    <p className="text-[10px] text-slate-400">24-hour cycle wave curve</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Radio className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">Dynamic Island Alerts</p>
                    <p className="text-[10px] text-slate-400">Instant threshold warning</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">Regulatory Audits</p>
                    <p className="text-[10px] text-slate-400">One-click PDF/CSV reports</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Trust & Standards */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> ISO 14001 Environmental Standard Compliant
            </span>
            <span className="font-mono text-[10px] uppercase text-cyan-400 font-bold">Free Analyst Tier</span>
          </div>
        </div>

        {/* Right Authentication Form Panel */}
        <div className="lg:col-span-6 flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-lg mx-auto backdrop-blur-3xl bg-[#0b1b26]/90 border border-white/15 rounded-3xl p-7 sm:p-9 shadow-[0_25px_70px_rgba(0,0,0,0.85)] relative transition-all">
            {/* Header */}
            <div className="mb-5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider mb-2">
                <span>Free Analyst Registration</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Create Your AQI Account
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 font-medium">
                Join the real-time environmental monitoring & predictive network.
              </p>
            </div>

            {/* Error / Alert Feedback */}
            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 backdrop-blur-xl animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <p className="font-semibold">{error}</p>
              </div>
            )}

            {step === 'otp' ? (
              <form onSubmit={handleOtpSubmit} className="space-y-4 animate-fadeIn">
                <div className="text-center py-2">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-teal-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-500/10">
                    <KeyRound className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Verify Your Email</h3>
                  <p className="text-slate-400 text-xs mt-1.5 max-w-sm mx-auto leading-relaxed">
                    We've sent a 6-digit verification code to{' '}
                    <span className="text-cyan-400 font-bold">{registeredEmail}</span>. Enter it below to activate your account.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider text-center">
                    6-Digit Security Code
                  </label>
                  <div className="relative max-w-xs mx-auto">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full py-3 px-4 text-center tracking-[0.5em] text-2xl font-black bg-[#06141B]/90 border border-cyan-400/40 rounded-2xl text-cyan-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition"
                      placeholder="••••••"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={otpLoading || otp.length < 6}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-[#06141B] font-black text-sm tracking-wide transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {otpLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#06141B] border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Activate Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || resending}
                    className="text-cyan-400 hover:text-cyan-300 font-medium transition disabled:text-slate-500 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                    <span>{resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('register');
                      setError(null);
                    }}
                    className="text-slate-400 hover:text-white font-medium transition cursor-pointer"
                  >
                    Edit details
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Google Sign-Up Container */}
                <div className="w-full flex flex-col items-center mb-5">
              <div
                ref={googleBtnRef}
                id="googleSignUpButton"
                className={`w-full flex justify-center min-h-[44px] overflow-hidden rounded-2xl ${
                  googleInitialized ? 'block' : 'hidden'
                }`}
              />
              {!googleInitialized && (
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={googleLoading || loading}
                  className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-[#06141B] font-bold text-sm flex items-center justify-center gap-3 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
                >
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{googleLoading ? 'Connecting to Google...' : 'Sign up with Google'}</span>
                </button>
              )}

              {/* Divider */}
              <div className="relative my-4 w-full text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <span className="relative px-3 bg-[#0b1b26] text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  Or register with email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Name Fields (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-[#06141B]/90 border border-white/15 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition font-medium"
                      placeholder="First Name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-[#06141B]/90 border border-white/15 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition font-medium"
                      placeholder="Last Name"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-[#06141B]/90 border border-white/15 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition font-medium"
                      placeholder="name@company.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Username (Optional)
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-[#06141B]/90 border border-white/15 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition font-medium"
                    placeholder="e.g. john_doe"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#06141B]/90 border border-white/15 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition font-medium"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-9 pr-9 py-2.5 bg-[#06141B]/90 border border-white/15 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition font-medium"
                      placeholder="Min. 8 characters"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-9 pr-9 py-2.5 bg-[#06141B]/90 border border-white/15 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition font-medium"
                      placeholder="Repeat password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Validation Badges */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                <span className={`inline-flex items-center gap-1 font-medium ${isPasswordMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <Check className={`w-3.5 h-3.5 ${isPasswordMinLength ? 'text-emerald-400' : 'opacity-40'}`} />
                  At least 8 characters
                </span>
                <span className={`inline-flex items-center gap-1 font-medium ${doPasswordsMatch ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <Check className={`w-3.5 h-3.5 ${doPasswordsMatch ? 'text-emerald-400' : 'opacity-40'}`} />
                  Passwords match
                </span>
              </div>

              {/* Terms of Service Checkbox */}
              <div className="pt-1.5">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-400 mt-0.5 cursor-pointer"
                    required
                  />
                  <span className="text-xs text-slate-300 leading-relaxed font-medium">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setTermsModal(true)}
                      className="text-cyan-400 underline hover:text-cyan-300 font-semibold"
                    >
                      Terms of Service & Environmental Data Policy
                    </button>
                  </span>
                </label>
              </div>

              {/* Register Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 hover:from-cyan-400 hover:to-teal-300 text-slate-950 rounded-2xl font-black text-sm tracking-wide shadow-[0_12px_30px_rgba(6,182,212,0.35)] hover:shadow-[0_16px_36px_rgba(6,182,212,0.5)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}

            {/* Footer Navigation */}
            <div className="mt-5 pt-4 border-t border-white/10 text-center">
              <p className="text-xs text-slate-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-cyan-400 font-bold hover:underline hover:text-cyan-300 transition ml-1"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms of Service Modal */}
      {termsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0e1f2b] border border-cyan-400/30 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative text-left">
            <h3 className="text-lg font-bold text-white mb-3">Terms of Service & Environmental Privacy</h3>
            <div className="max-h-60 overflow-y-auto text-xs text-slate-300 space-y-2.5 pr-2">
              <p>
                1. <strong>Platform Access</strong>: AQI Index provides real-time air quality index information, pollution forecasts, and environmental analytics for educational and operational monitoring.
              </p>
              <p>
                2. <strong>Account Security</strong>: You are responsible for safeguarding your login credentials. We hash passwords using industry-standard bcrypt encryption.
              </p>
              <p>
                3. <strong>Email Verification</strong>: Accounts must verify their email address via SMTP verification tokens to activate notification alerts and access protected forecasting tools.
              </p>
              <p>
                4. <strong>Data Privacy</strong>: We do not sell your personal data. Personal sensor telemetry is protected under organization-level role access control.
              </p>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setTermsModal(false)}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Setup Guidance Modal */}
      {googleSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0e1f2b] border border-cyan-400/30 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-cyan-950/70 text-cyan-400 border border-cyan-400/30">
                <Info className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Google OAuth Configuration</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              The Google OAuth 2.0 Client ID has not been linked to a live Google Cloud Console project yet. To activate Google Sign-In:
            </p>
            <div className="p-3 bg-[#06141B] rounded-xl border border-white/10 font-mono text-[11px] text-slate-300 space-y-1.5 mb-4 select-text">
              <div className="text-slate-400"># In backend/.env and frontend/.env:</div>
              <div className="text-cyan-300">GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com</div>
              <div className="text-cyan-300">REACT_APP_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com</div>
            </div>
            <p className="text-[11px] text-slate-400 mb-5 leading-normal">
              In Google Cloud Console, add <span className="text-white font-mono">http://localhost:3000</span> as an Authorized JavaScript Origin and Authorized Redirect URI.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setGoogleSetupModal(false)}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
