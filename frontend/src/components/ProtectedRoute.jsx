import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../context/store';
import { apiService } from '../services/apiService';

export default function ProtectedRoute({ children }) {
  const { user, isAuthenticated, setUser, logout } = useAuthStore();
  const location = useLocation();

  // If already authenticated with user in memory, no need to block UI with a loading spinner
  const token = localStorage.getItem('accessToken');
  const hasValidSession = isAuthenticated && !!user && !!token;
  const [isVerifying, setIsVerifying] = useState(!hasValidSession);
  const verifyingRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const storedToken = localStorage.getItem('accessToken');
      if (!storedToken) {
        if (isMounted) {
          logout();
          setIsVerifying(false);
        }
        return;
      }

      // Avoid duplicate concurrent calls
      if (verifyingRef.current) return;
      verifyingRef.current = true;

      try {
        const response = await apiService.getMe();
        if (!isMounted) return;

        if (response.data?.success && response.data?.user) {
          setUser(response.data.user);
        } else {
          logout();
        }
      } catch (error) {
        if (!isMounted) return;
        // Only invalidate session if the backend explicitly rejected credentials
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout();
        }
      } finally {
        verifyingRef.current = false;
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    };

    if (!token) {
      setIsVerifying(false);
      return;
    }

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [token, setUser, logout]);

  // Fast bail-out: If no token exists at all, redirect to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Only show the loading screen if we don't have an active authenticated user in state
  if (isVerifying && (!isAuthenticated || !user)) {
    return (
      <div className="min-h-screen bg-[#06141B] flex items-center justify-center p-6 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0F766E] to-[#57E5D2] flex items-center justify-center shadow-lg shadow-[#0F766E]/40 animate-pulse">
            <span className="font-black text-xl text-[#06141B]">AQI</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#57E5D2] font-semibold tracking-wide">
            <div className="w-2 h-2 rounded-full bg-[#57E5D2] animate-ping" />
            Authenticating session...
          </div>
        </div>
      </div>
    );
  }

  // Must have both store authentication and stored token
  const hasToken = !!localStorage.getItem('accessToken');
  if (!isAuthenticated || !hasToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
