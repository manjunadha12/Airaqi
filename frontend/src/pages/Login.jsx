import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { useAuthStore } from '../context/store';
import { GOOGLE_CLIENT_ID } from '../config/api';
import AirParticlesBackground from '../components/AirParticlesBackground';
import {
  Activity,
  Wind,
  TrendingUp,
  Bell,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Info,
  CheckCircle2,
  Radio,
  MapPin,
  Compass,
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuthStore();

  const [formData, setFormData] = useState({
    identifier: localStorage.getItem('aqi_remember_email') || '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(
    !!localStorage.getItem('aqi_remember_email')
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [googleSetupModal, setGoogleSetupModal] = useState(false);
  const [googlePromptModal, setGooglePromptModal] = useState(false);
  const [googlePromptUser, setGooglePromptUser] = useState(null);
  const [createGoogleLoading, setCreateGoogleLoading] = useState(false);
  const [livePreview, setLivePreview] = useState(null);
  const [liveLoading, setLiveLoading] = useState(true);
  const googleBtnRef = useRef(null);

  // If already authenticated and token exists, redirect
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (isAuthenticated && token) {
      const destination =
        location.state?.from?.pathname && location.state.from.pathname !== '/login'
          ? location.state.from.pathname
          : '/dashboard';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Load live AQI preview from real API
  useEffect(() => {
    let isMounted = true;
    const fetchLivePreview = async () => {
      try {
        const response = await apiService.getCurrentAQI({ city: 'Delhi' });
        if (isMounted && response.data?.success && response.data?.data) {
          setLivePreview(response.data.data);
        }
      } catch (e) {
        // Fallback gracefully if API not ready
      } finally {
        if (isMounted) setLiveLoading(false);
      }
    };
    fetchLivePreview();
    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize Google Identity Services
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || typeof window === 'undefined') {
      return;
    }

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
            text: 'continue_with',
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
      // Login mode only: fails with accountNotFound if no account exists yet
      const res = await apiService.googleAuth(response.credential, 'login', false);
      if (res.data?.success) {
        login(res.data.user, res.data.accessToken, res.data.refreshToken, res.data.sessionId);
        const destination =
          location.state?.from?.pathname && location.state.from.pathname !== '/login'
            ? location.state.from.pathname
            : '/dashboard';
        navigate(destination, { replace: true });
      }
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.accountNotFound) {
        // Account not found: trigger next-step creation prompt modal
        setGooglePromptUser(errData.googleUser || { credential: response.credential });
        setGooglePromptModal(true);
      } else {
        setError(
          errData?.message ||
            'Google authentication failed. Please try again.'
        );
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleConfirmCreateGoogleAccount = async () => {
    if (!googlePromptUser?.credential) return;
    setCreateGoogleLoading(true);
    try {
      const res = await apiService.googleAuth(googlePromptUser.credential, 'register', true);
      if (res.data?.success) {
        setGooglePromptModal(false);
        login(res.data.user, res.data.accessToken, res.data.refreshToken, res.data.sessionId);
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to create account with Google. Please try regular registration.'
      );
      setGooglePromptModal(false);
    } finally {
      setCreateGoogleLoading(false);
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setUnverifiedEmail(null);

    if (!formData.identifier.trim()) {
      setError('Please enter your email, username, or phone number.');
      return;
    }
    if (!formData.password) {
      setError('Please enter your account password.');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.login(
        formData.identifier.trim(),
        formData.password
      );

      if (response.data.success) {
        if (rememberMe) {
          localStorage.setItem('aqi_remember_email', formData.identifier.trim());
        } else {
          localStorage.removeItem('aqi_remember_email');
        }

        login(
          response.data.user,
          response.data.accessToken,
          response.data.refreshToken,
          response.data.sessionId
        );
        const destination =
          location.state?.from?.pathname && location.state.from.pathname !== '/login'
            ? location.state.from.pathname
            : '/dashboard';
        navigate(destination, { replace: true });
      }
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.requiresVerification) {
        setUnverifiedEmail(errData.email || formData.identifier);
        setError(errData.message || 'Please verify your email before logging in.');
      } else if (errData?.errors && Array.isArray(errData.errors)) {
        setError(errData.errors.map((e) => e.msg).join(' • '));
      } else {
        setError(
          errData?.message || 'Login failed. Please check your credentials.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const aqiValue = livePreview?.aqi?.value ?? 52;
  const aqiCategory = livePreview?.aqi?.category || 'satisfactory';
  const aqiCity = livePreview?.location?.city || 'Delhi';

  return (
    <div className="min-h-screen bg-[#06141B] text-white flex items-center justify-center p-3 sm:p-5 lg:p-7 relative overflow-hidden font-sans select-none">
      {/* Dynamic Ambient Atmospheric Glows */}
      <AirParticlesBackground />
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/15 rounded-full blur-[140px]" />

      {/* Main Split-Screen Container */}
      <div className="w-full max-w-7xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch min-h-[640px]">
        {/* Left Hero Visual Showcase Panel */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl overflow-hidden relative p-7 sm:p-10 shadow-[0_25px_70px_rgba(0,0,0,0.85)] border border-white/15 min-h-[520px]">
          {/* High-Resolution Atmospheric Backdrop Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
            style={{ backgroundImage: `url('/images/atmosphere-clean-air.jpg')` }}
          />

          {/* Cinematic Dark Gradient & Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#06141B] via-[#06141B]/55 to-[#06141B]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06141B]/80 via-transparent to-[#06141B]/60" />

          {/* Top Row: Brand & Live Monitoring Pill */}
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 border border-white/30">
                <span className="font-black text-xl text-slate-950 tracking-tighter">AQI</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-xl tracking-tight text-white drop-shadow">AQI Index</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-400/30 backdrop-blur-md">
                    Neural Cloud
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-semibold tracking-wide drop-shadow-sm">
                  Environmental Intelligence & Forecasting
                </p>
              </div>
            </div>

            {/* Live Sensor Network Pill */}
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/70 border border-white/15 backdrop-blur-xl shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono font-bold text-slate-200">50+ Indian Hubs Live</span>
            </div>
          </div>

          {/* Center Content: Headline & Atmospheric Preview */}
          <div className="relative z-10 my-8 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-bold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>24-Hour Horizon Predictive Models</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-md">
                Breathe Smarter. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300">
                  Live Healthier.
                </span>
              </h1>
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-lg font-medium drop-shadow-sm">
                Continuous distributed atmospheric monitoring, deep particulate analysis, and neural pollution forecasting calibrated for smart cities and health-conscious organizations.
              </p>
            </div>

            {/* Floating Live Telemetry HUD Widget */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/75 border border-white/20 backdrop-blur-2xl shadow-2xl transition hover:border-cyan-400/40">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-[#06141B] border border-cyan-400/50 flex flex-col items-center justify-center shadow-inner">
                      <span className="font-mono text-2xl font-black text-cyan-300 leading-none">
                        {liveLoading ? '...' : aqiValue}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">AQI</span>
                    </div>
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        {aqiCity} Central Corridors
                      </span>
                      <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 uppercase">
                        {aqiCategory.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 font-mono">
                      PM2.5: <span className="text-white font-bold">{livePreview?.pollutants?.pm2_5 || 28}</span> µg/m³ • PM10: <span className="text-white font-bold">{livePreview?.pollutants?.pm10 || 55}</span> µg/m³
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Feed Verification</span>
                  <span className="text-xs text-cyan-400 font-black flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> CPCB v4.2 & WAQI
                  </span>
                </div>
              </div>
            </div>

            {/* Feature Micro-Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/10 backdrop-blur-md">
                <Activity className="w-4 h-4 text-cyan-400 mb-1" />
                <h5 className="text-[11px] font-bold text-white">Live Ground Telemetry</h5>
                <p className="text-[10px] text-slate-400">Sub-minute sensor sync</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/10 backdrop-blur-md">
                <TrendingUp className="w-4 h-4 text-teal-400 mb-1" />
                <h5 className="text-[11px] font-bold text-white">Neural Forecasts</h5>
                <p className="text-[10px] text-slate-400">Multi-horizon curve</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/10 backdrop-blur-md">
                <Bell className="w-4 h-4 text-amber-400 mb-1" />
                <h5 className="text-[11px] font-bold text-white">Dynamic Island</h5>
                <p className="text-[10px] text-slate-400">Instant spike warnings</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/10 backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" />
                <h5 className="text-[11px] font-bold text-white">ISO Calibrated</h5>
                <p className="text-[10px] text-slate-400">Audit-ready reporting</p>
              </div>
            </div>
          </div>

          {/* Bottom Row: Quote & Credibility */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span className="italic">"Clean air is the foundation of cognitive clarity and human vitality."</span>
            <span className="font-mono text-[10px] uppercase text-cyan-400 font-bold">Encrypted Telemetry Hub</span>
          </div>
        </div>

        {/* Right Authentication Form Panel */}
        <div className="lg:col-span-5 flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-md mx-auto backdrop-blur-3xl bg-[#0b1b26]/90 border border-white/15 rounded-3xl p-7 sm:p-9 shadow-[0_25px_70px_rgba(0,0,0,0.85)] relative transition-all">
            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider mb-2">
                <span>Secure Authorization</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Welcome Back
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 font-medium">
                Sign in to your account to monitor air quality and view atmospheric predictions.
              </p>
            </div>

            {/* Error / Alert Feedback */}
            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 backdrop-blur-xl animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{error}</p>
                  {unverifiedEmail && (
                    <Link
                      to={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
                      className="inline-flex items-center gap-1 text-cyan-400 font-bold underline hover:text-white mt-1.5 text-xs"
                    >
                      Verify your account now <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Google Authentication Container */}
            <div className="w-full flex flex-col items-center">
              <div
                ref={googleBtnRef}
                id="googleSignInButton"
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
                  <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <span className="relative px-3 bg-[#0b1b26] text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                Or continue with email
              </span>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email, Username, or Phone
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-[#06141B]/90 border border-white/15 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition font-medium"
                    placeholder="name@company.com or username"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold hover:underline transition"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-3 bg-[#06141B]/90 border border-white/15 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition font-medium"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-400 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-xs text-slate-300 font-medium">Remember my identifier on this device</span>
                </label>
              </div>

              {/* Submit Button with Radiant Glow */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 hover:from-cyan-400 hover:to-teal-300 text-slate-950 rounded-2xl font-black text-sm tracking-wide shadow-[0_12px_30px_rgba(6,182,212,0.35)] hover:shadow-[0_16px_36px_rgba(6,182,212,0.5)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer / Create Account */}
            <div className="mt-6 pt-5 border-t border-white/10 text-center">
              <p className="text-xs text-slate-400">
                Don't have an AQI Index account?{' '}
                <Link
                  to="/register"
                  className="text-cyan-400 font-bold hover:underline hover:text-cyan-300 transition ml-1"
                >
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

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

      {/* Account Not Found -> Next Step Creation Prompt Modal */}
      {googlePromptModal && googlePromptUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b1b26] border border-cyan-400/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_25px_70px_rgba(0,0,0,0.85)] relative text-left">
            {/* Top Badge & User Details */}
            <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-white/10">
              {googlePromptUser.picture ? (
                <img
                  src={googlePromptUser.picture}
                  alt="Google Profile"
                  className="w-12 h-12 rounded-2xl border-2 border-cyan-400/50 shadow-md object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-slate-950 font-black text-lg flex-shrink-0">
                  {googlePromptUser.firstName?.charAt(0) || 'G'}
                </div>
              )}
              <div className="overflow-hidden">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-400/30">
                  Google Account Verified
                </span>
                <h4 className="font-bold text-sm text-white truncate mt-1">
                  {googlePromptUser.firstName} {googlePromptUser.lastName}
                </h4>
                <p className="text-xs text-slate-400 truncate">{googlePromptUser.email}</p>
              </div>
            </div>

            {/* Prompt Explanation */}
            <h3 className="text-lg font-black text-white tracking-tight mb-2">
              No Account Found
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6 font-medium">
              We couldn't find an existing AQI Index account linked to{' '}
              <strong className="text-white font-mono">{googlePromptUser.email}</strong>.
              Would you like to create your new analyst account as the next step?
            </p>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleConfirmCreateGoogleAccount}
                disabled={createGoogleLoading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 hover:from-cyan-400 hover:to-teal-300 text-slate-950 rounded-2xl font-black text-sm tracking-wide shadow-[0_12px_30px_rgba(6,182,212,0.35)] hover:shadow-[0_16px_36px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {createGoogleLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account & Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setGooglePromptModal(false);
                  navigate('/register', {
                    state: {
                      email: googlePromptUser.email,
                      firstName: googlePromptUser.firstName,
                      lastName: googlePromptUser.lastName,
                    },
                  });
                }}
                className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl font-semibold text-xs transition cursor-pointer text-center"
              >
                Customize details on signup page &rarr;
              </button>

              <button
                type="button"
                onClick={() => setGooglePromptModal(false)}
                className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-300 transition cursor-pointer"
              >
                Cancel / Try another account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
