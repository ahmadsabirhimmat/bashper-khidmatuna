import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAppContext } from "@/src/context/AppContext";

const DirectoryAuthGate = () => {
  const router = useRouter();
  const { t, colors } = useAppContext();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
        <Ionicons name="lock-closed-outline" size={22} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{t("directoryGuardTitle")}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {t("directoryGuardSubtitle")}
      </Text>
      <Pressable
        style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/auth/login")}
      >
        <Text style={styles.primaryText}>{t("login")}</Text>
      </Pressable>
      <Pressable
        style={[styles.secondaryBtn, { borderColor: colors.border }]}
        onPress={() => router.push("/auth/signup")}
      >
        <Text style={[styles.secondaryText, { color: colors.text }]}>{t("signup")}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    textAlign: "center",
    lineHeight: 21,
  },
  primaryBtn: {
    marginTop: 20,
    width: "100%",
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  secondaryBtn: {
    marginTop: 10,
    width: "100%",
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  secondaryText: {
    fontWeight: "700",
  },
});

export default DirectoryAuthGate;
