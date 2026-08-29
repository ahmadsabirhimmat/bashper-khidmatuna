import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { loginUser, verifyOtp, resendOtp } from '../api/auth';
import { subscribeToAuthReset } from '../api/http';
import { clearSession, persistSession, readSession } from '../utils/session';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => readSession());
  const [authError, setAuthError] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [pendingOtp, setPendingOtp] = useState(null);

  useEffect(() => subscribeToAuthReset(() => setSession(null)), []);

  const login = useCallback(async (credentials) => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const response = await loginUser(credentials);
      if (response?.requiresOtp) {
        const challenge = {
          email: response.email,
          purpose: response.purpose || 'login',
          message: response.message,
        };
        setPendingOtp(challenge);
        return { requiresOtp: true, ...challenge };
      }

      persistSession(response.token, response.user);
      setSession({ token: response.token, user: response.user });
      setPendingOtp(null);
      return response;
    } catch (error) {
      setAuthError(error.message || 'Unable to sign in');
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const completeOtp = useCallback(async ({ email, code, purpose }) => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const response = await verifyOtp({ email, code, purpose });
      if (response?.user?.role !== 'admin') {
        clearSession();
        flushSync(() => {
          setSession(null);
          setPendingOtp(null);
        });
        throw new Error('Admin credentials required. Non-admin accounts cannot access this panel.');
      }

      persistSession(response.token, response.user);
      // Commit auth state before the OTP page navigates, so ProtectedRoute sees the session.
      flushSync(() => {
        setSession({ token: response.token, user: response.user });
        setPendingOtp(null);
      });
      return response;
    } catch (error) {
      setAuthError(error.message || 'Unable to verify code');
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const resendPendingOtp = useCallback(async () => {
    if (!pendingOtp?.email || !pendingOtp?.purpose) {
      throw new Error('No pending verification found');
    }
    return resendOtp({ email: pendingOtp.email, purpose: pendingOtp.purpose });
  }, [pendingOtp]);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
    setPendingOtp(null);
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user || null,
      token: session?.token || '',
      role: session?.user?.role,
      isAuthenticated: Boolean(session?.token),
      login,
      completeOtp,
      resendPendingOtp,
      pendingOtp,
      setPendingOtp,
      logout,
      authError,
      isAuthenticating,
    }),
    [
      session,
      login,
      completeOtp,
      resendPendingOtp,
      pendingOtp,
      logout,
      authError,
      isAuthenticating,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
