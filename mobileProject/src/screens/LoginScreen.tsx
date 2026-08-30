import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useAppContext } from "@/src/context/AppContext";
import PasswordInput from "@/src/components/PasswordInput";

const LoginScreen = () => {
  const router = useRouter();
  const { login, t, colors } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const result = await login(email.trim(), password);
      if (result.requiresOtp) {
        router.push("/auth/otp");
        return;
      }
      router.replace("/(tabs)/profile");
    } catch (error) {
      Alert.alert(t("login"), error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t("login")}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t("loginSubtitle")}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
        placeholder={t("emailPlaceholder")}
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <PasswordInput
        placeholder={t("passwordPlaceholder")}
        value={password}
        onChangeText={setPassword}
      />
      <Pressable
        style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>{t("submit")}</Text>}
      </Pressable>
      <Pressable style={styles.linkBtn} onPress={() => router.push("/auth/forgot-password")}>
        <Text style={[styles.linkText, { color: colors.primary }]}>{t("forgotTitle")}</Text>
      </Pressable>
      <Pressable style={styles.linkBtn} onPress={() => router.push("/auth/signup" as const)}>
        <Text style={[styles.linkText, { color: colors.primary }]}>{t("noAccount")}</Text>
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
    marginBottom: 24,
  },
  input: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
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
  },
  linkText: {
    fontWeight: "600",
  },
});

export default LoginScreen;
