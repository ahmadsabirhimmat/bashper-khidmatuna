import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { useAppContext } from "@/src/context/AppContext";

const Header = () => {
  const { t, isOffline, lastSyncedAt, colors } = useAppContext();

  const formattedSync = useMemo(() => {
    if (!lastSyncedAt) {
      return t("loading");
    }
    return new Date(lastSyncedAt).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }, [lastSyncedAt, t]);

  return (
    <View style={styles.container}>
      <View style={styles.textColumn}>
        <Text style={[styles.title, { color: colors.text }]}>{t("appName")}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t("tagline")}</Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: isOffline ? colors.danger : colors.success },
          ]}
        >
          <Ionicons name={isOffline ? "cloud-offline" : "shield-checkmark"} size={16} color="#FFFFFF" />
          <Text style={styles.badgeText}>
            {isOffline ? t("offlineBadge") : `${t("lastSync")}: ${formattedSync}`}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  textColumn: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 12,
    gap: 6,
  },
  badgeText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default Header;
