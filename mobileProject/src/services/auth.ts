import { apiRequest } from "@/src/services/api";
import type { AuthResponse } from "@/src/utils/types";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload extends LoginPayload {
  phoneNumber: string;
  fullName: string;
  organization?: string;
  role?: "provider" | "beneficiary";
}

export type OtpPurpose = "login" | "register" | "reset";

export interface OtpChallengeResponse {
  requiresOtp: true;
  purpose: OtpPurpose;
  email: string;
  message?: string;
}

export interface ResetOtpResponse {
  resetAllowed: true;
  resetToken: string;
  email: string;
  message?: string;
}

export const loginRequest = (payload: LoginPayload) =>
  apiRequest<AuthResponse | OtpChallengeResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const registerRequest = (payload: RegisterPayload) =>
  apiRequest<AuthResponse | OtpChallengeResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const verifyOtpRequest = (payload: {
  email: string;
  code: string;
  purpose: OtpPurpose;
}) =>
  apiRequest<AuthResponse | ResetOtpResponse>("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const resendOtpRequest = (payload: { email: string; purpose: OtpPurpose }) =>
  apiRequest<OtpChallengeResponse>("/api/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const forgotPasswordRequest = (payload: { email: string }) =>
  apiRequest<OtpChallengeResponse>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const resetPasswordRequest = (payload: {
  email: string;
  resetToken: string;
  password: string;
}) =>
  apiRequest<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const deleteAccountRequest = (token: string) =>
  apiRequest<void>("/api/auth/delete", { method: "DELETE" }, token);

export const fetchCurrentUser = (token: string) =>
  apiRequest<AuthResponse["user"]>("/api/auth/me", undefined, token);
