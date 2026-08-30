import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAppContext } from "@/src/context/AppContext";
import { fetchAboutOverview, type AboutOverview } from "@/src/services/api";
import { pullRefreshControl, usePullToRefresh } from "@/src/components/pullRefresh";

const AboutScreen = () => {
  const router = useRouter();
  const { t, colors } = useAppContext();
  const [about, setAbout] = useState<AboutOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAbout = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAboutOverview();
      setAbout(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load about info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAbout();
  }, []);

  const reloadAbout = useCallback(() => loadAbout(), []);
  const { refreshing, onRefresh } = usePullToRefresh(reloadAbout);

  const rows = [
    { label: t("aboutServices"), value: about?.totals?.approved, icon: "checkmark-circle-outline" as const },
    { label: t("aboutHospitals"), value: about?.totals?.hospitals, icon: "medkit-outline" as const },
    { label: t("aboutPharmacies"), value: about?.totals?.pharmacies, icon: "flask-outline" as const },
    { label: t("aboutFieldUnits"), value: about?.totals?.fieldUnits, icon: "car-outline" as const },
    { label: t("aboutDistricts"), value: about?.coverage?.districtsCovered, icon: "map-outline" as const },
    { label: t("aboutCritical"), value: about?.totals?.criticalLines, icon: "flash-outline" as const },
  ];

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={pullRefreshControl({
        refreshing,
        onRefresh,
        color: colors.primary,
      })}
    >
      <View style={[styles.hero, { backgroundColor: colors.hero }]}>
        <Text style={[styles.brand, { color: colors.primary }]}>{t("appName")}</Text>
        <Text style={[styles.title, { color: colors.heroText }]}>{t("aboutTitle")}</Text>
        <Text style={[styles.tagline, { color: colors.heroMuted }]}>{t("tagline")}</Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("aboutMissionTitle")}</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>{t("aboutMissionBody")}</Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("aboutCoverageTitle")}</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>{t("aboutCoverageBody")}</Text>
        {about?.coverage?.province ? (
          <Text style={[styles.province, { color: colors.primary }]}>
            {about.coverage.province}
            {about.coverage.totalDistricts
              ? ` · ${about.coverage.districtsCovered ?? 0}/${about.coverage.totalDistricts}`
              : ""}
          </Text>
        ) : null}
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("aboutStatsTitle")}</Text>
        {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} /> : null}
        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        {!loading && !error ? (
          <View style={styles.grid}>
            {rows.map((row) => (
              <View
                key={row.label}
                style={[styles.gridItem, { backgroundColor: colors.primarySoft }]}
              >
                <Ionicons name={row.icon} size={20} color={colors.primary} />
                <Text style={[styles.gridValue, { color: colors.text }]}>{row.value ?? "—"}</Text>
                <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>{row.label}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <Pressable
        style={[styles.backBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
        onPress={() => router.back()}
      >
        <Text style={[styles.backText, { color: colors.text }]}>{t("aboutBack")}</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  brand: {
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 8,
  },
  tagline: {
    marginTop: 8,
    lineHeight: 22,
  },
  section: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 22,
    padding: 18,
  },
  sectionTitle: {
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 8,
  },
  body: {
    lineHeight: 22,
  },
  province: {
    marginTop: 12,
    fontWeight: "700",
  },
  error: {
    marginTop: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  gridItem: {
    width: "47%",
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  gridValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  gridLabel: {
    fontWeight: "600",
    fontSize: 12,
  },
  backBtn: {
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  backText: {
    fontWeight: "700",
  },
});

export default AboutScreen;
