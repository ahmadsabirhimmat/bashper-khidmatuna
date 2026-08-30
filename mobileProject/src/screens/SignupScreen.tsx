import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useAppContext } from "@/src/context/AppContext";
import { isValidAfghanPhone } from "@/src/utils/helpers";
import PasswordInput from "@/src/components/PasswordInput";

const SignupScreen = () => {
  const router = useRouter();
  const { register, t, colors } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      Alert.alert(t("signup"), t("namePlaceholder"));
      return;
    }
    if (!email.trim().includes("@")) {
      Alert.alert(t("signup"), t("emailPlaceholder"));
      return;
    }
    if (!isValidAfghanPhone(phoneNumber)) {
      Alert.alert(t("signup"), t("phonePlaceholder"));
      return;
    }
    if (password.length < 8) {
      Alert.alert(t("signup"), t("passwordPlaceholder"));
      return;
    }
    try {
      setLoading(true);
      const result = await register({
        email: email.trim(),
        password,
        phoneNumber: phoneNumber.trim(),
        fullName: fullName.trim(),
        role: "beneficiary",
      });
      if (result.requiresOtp) {
        router.push("/auth/otp");
        return;
      }
      router.replace("/(tabs)/profile");
    } catch (error) {
      Alert.alert(t("signup"), error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t("signup")}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t("signupSubtitle")}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
        placeholder={t("namePlaceholder")}
        placeholderTextColor={colors.textMuted}
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
        placeholder={t("emailPlaceholder")}
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
        placeholder={t("phonePlaceholder")}
        placeholderTextColor={colors.textMuted}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
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
      <Pressable style={styles.linkBtn} onPress={() => router.push("/privacy")}>
        <Text style={[styles.linkText, { color: colors.primary }]}>{t("privacyAccept")}</Text>
      </Pressable>
      <Pressable style={styles.linkBtn} onPress={() => router.push("/auth/login" as const)}>
        <Text style={[styles.linkText, { color: colors.primary }]}>{t("alreadyAccount")}</Text>
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

export default SignupScreen;
