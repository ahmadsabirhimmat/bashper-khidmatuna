import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import {
  clearAuthSession,
  getAuthToken,
  getStoredUser,
  saveAuthSession,
} from "../utils/authStorage";

const AuthContext = createContext(undefined);

const readInitialSession = () => {
  const token = getAuthToken();
  const user = getStoredUser();
  if (token && user) {
    return { token, user };
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => readInitialSession());
  const [pendingOtp, setPendingOtp] = useState(null);

  const persistSession = useCallback((token, user) => {
    if (!token || !user) {
      return;
    }
    saveAuthSession(token, user);
    // Commit auth before OTP page navigates, so Home sees the session.
    flushSync(() => {
      setSession({ token, user });
      setPendingOtp(null);
    });
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setSession(null);
    setPendingOtp(null);
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user || null,
      token: session?.token || "",
      isAuthenticated: Boolean(session?.token),
      login: persistSession,
      logout,
      pendingOtp,
      setPendingOtp,
    }),
    [session, persistSession, logout, pendingOtp]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
