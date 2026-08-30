import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useAppContext } from "@/src/context/AppContext";
import {
  forgotPasswordRequest,
  resendOtpRequest,
  resetPasswordRequest,
  verifyOtpRequest,
} from "@/src/services/auth";
import PasswordInput from "@/src/components/PasswordInput";

type Step = "email" | "otp" | "password";

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const { t, colors } = useAppContext();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSendCode = async () => {
    setError("");
    setInfo("");
    if (!email.trim().includes("@")) {
      setError(t("emailPlaceholder"));
      return;
    }
    setLoading(true);
    try {
      const response = await forgotPasswordRequest({ email: email.trim().toLowerCase() });
      setEmail(response.email || email.trim().toLowerCase());
      setInfo(response.message || t("forgotSent"));
      setStep("otp");
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError("");
    setInfo("");
    if (!/^\d{6}$/.test(code.trim())) {
      setError(t("otpPlaceholder"));
      return;
    }
    setLoading(true);
    try {
      const response = await verifyOtpRequest({
        email,
        code: code.trim(),
        purpose: "reset",
      });
      if (!("resetToken" in response) || !response.resetToken) {
        throw new Error(t("forgotVerifyFailed"));
      }
      setResetToken(response.resetToken);
      setInfo(t("forgotCodeVerified"));
      setStep("password");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await resendOtpRequest({ email, purpose: "reset" });
      setInfo(t("otpSent"));
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setInfo("");
    if (password.length < 8) {
      setError(t("passwordPlaceholder"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("forgotPasswordMismatch"));
      return;
    }
    setLoading(true);
    try {
      const response = await resetPasswordRequest({
        email,
        resetToken,
        password,
      });
      setInfo(response.message || t("forgotSuccess"));
      setTimeout(() => {
        router.replace("/auth/login");
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {step === "email" && t("forgotTitle")}
        {step === "otp" && t("forgotOtpTitle")}
        {step === "password" && t("forgotNewPasswordTitle")}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {step === "email" && t("forgotSubtitle")}
        {step === "otp" && t("otpSubtitle")}
        {step === "password" && t("forgotNewPasswordSubtitle")}
      </Text>
      {step !== "email" && email ? (
        <Text style={[styles.email, { color: colors.primary }]}>{email}</Text>
      ) : null}

      {step === "email" ? (
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
          placeholder={t("emailPlaceholder")}
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      ) : null}

      {step === "otp" ? (
        <TextInput
          style={[
            styles.input,
            styles.codeInput,
            { backgroundColor: colors.inputBg, color: colors.text },
          ]}
          placeholder={t("otpPlaceholder")}
          placeholderTextColor={colors.textMuted}
          value={code}
          onChangeText={(value) => setCode(value.replace(/[^\d]/g, "").slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
        />
      ) : null}

      {step === "password" ? (
        <View>
          <PasswordInput
            placeholder={t("forgotNewPasswordPlaceholder")}
            value={password}
            onChangeText={setPassword}
          />
          <PasswordInput
            placeholder={t("forgotConfirmPasswordPlaceholder")}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>
      ) : null}

      {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}
      {info ? <Text style={[styles.infoText, { color: colors.success }]}>{info}</Text> : null}

      <Pressable
        style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
        onPress={
          step === "email" ? handleSendCode : step === "otp" ? handleVerifyCode : handleResetPassword
        }
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryText}>
            {step === "email" && t("forgotSendCode")}
            {step === "otp" && t("otpVerify")}
            {step === "password" && t("forgotUpdatePassword")}
          </Text>
        )}
      </Pressable>

      {step === "otp" ? (
        <Pressable style={styles.linkBtn} onPress={handleResend} disabled={loading}>
          <Text style={[styles.linkText, { color: colors.primary }]}>{t("otpResend")}</Text>
        </Pressable>
      ) : null}

      <Pressable style={styles.linkBtn} onPress={() => router.replace("/auth/login")}>
        <Text style={[styles.linkText, { color: colors.primary }]}>{t("forgotBackToLogin")}</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 20,
  },
  email: {
    fontWeight: "700",
    marginBottom: 16,
  },
  input: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  codeInput: {
    fontSize: 22,
    letterSpacing: 8,
    textAlign: "center",
    fontWeight: "700",
  },
  errorText: {
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "600",
  },
  infoText: {
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "600",
  },
  primaryBtn: {
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  linkBtn: {
    marginTop: 18,
    alignItems: "center",
  },
  linkText: {
    fontWeight: "600",
  },
});

export default ForgotPasswordScreen;
