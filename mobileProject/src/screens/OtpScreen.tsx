import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppContext } from "@/src/context/AppContext";
import { resendOtpRequest, type OtpPurpose } from "@/src/services/auth";

const firstParam = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return String(value[0] || "");
  }
  return String(value || "");
};

const decodeMaybe = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const OtpScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string | string[]; purpose?: string | string[] }>();
  const { verifyEmailOtp, pendingOtp, user, t, colors } = useAppContext();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const email = useMemo(() => {
    if (pendingOtp?.email) {
      return pendingOtp.email.trim().toLowerCase();
    }
    return decodeMaybe(firstParam(params.email)).trim().toLowerCase();
  }, [pendingOtp?.email, params.email]);

  const purpose = useMemo<OtpPurpose>(() => {
    if (pendingOtp?.purpose === "register" || pendingOtp?.purpose === "login") {
      return pendingOtp.purpose;
    }
    return firstParam(params.purpose) === "register" ? "register" : "login";
  }, [pendingOtp?.purpose, params.purpose]);

  useEffect(() => {
    if (user) {
      router.replace("/(tabs)/profile");
    }
  }, [user, router]);

  const handleVerify = async () => {
    setError("");
    setInfo("");

    if (!email) {
      setError("Missing email for verification. Go back and sign up again.");
      return;
    }
    if (!/^\d{6}$/.test(code.trim())) {
      setError(t("otpPlaceholder"));
      return;
    }

    setLoading(true);
    try {
      await verifyEmailOtp({ email, code: code.trim(), purpose });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Missing email for verification. Go back and sign up again.");
      return;
    }
    setError("");
    setInfo("");
    try {
      setResending(true);
      await resendOtpRequest({ email, purpose });
      setInfo(t("otpSent"));
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setResending(false);
    }
  };

  if (user) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: colors.text }]}>{t("otpTitle")}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t("otpSubtitle")}</Text>
      {email ? <Text style={[styles.email, { color: colors.primary }]}>{email}</Text> : null}

      <TextInput
        style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
        placeholder={t("otpPlaceholder")}
        placeholderTextColor={colors.textMuted}
        value={code}
        onChangeText={(value) => {
          setCode(value.replace(/[^\d]/g, "").slice(0, 6));
          if (error) {
            setError("");
          }
        }}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
      />

      {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}
      {info ? <Text style={[styles.infoText, { color: colors.success }]}>{info}</Text> : null}

      <Pressable
        style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryText}>{t("otpVerify")}</Text>
        )}
      </Pressable>

      <Pressable style={styles.linkBtn} onPress={handleResend} disabled={resending || loading}>
        {resending ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text style={[styles.linkText, { color: colors.primary }]}>{t("otpResend")}</Text>
        )}
      </Pressable>

      <View style={styles.footer}>
        <Pressable onPress={() => router.back()} disabled={loading}>
          <Text style={[styles.backText, { color: colors.textSecondary }]}>{t("retry")}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 12,
  },
  email: {
    fontWeight: "700",
    marginBottom: 20,
  },
  input: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
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
    marginTop: 12,
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  linkBtn: {
    marginTop: 18,
    alignItems: "center",
    minHeight: 24,
  },
  linkText: {
    fontWeight: "600",
  },
  footer: {
    marginTop: 28,
    alignItems: "center",
  },
  backText: {
    fontWeight: "600",
  },
});

export default OtpScreen;
