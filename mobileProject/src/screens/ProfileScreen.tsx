import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { LANGUAGE_CYCLE, LANGUAGE_LABELS, type LanguageCode } from "@/src/utils/types";
import { DeveloperContactPanel, ProviderPortalPanel } from "@/src/components/DeveloperContactCard";
import { pullRefreshControl, usePullToRefresh } from "@/src/components/pullRefresh";

const LANGUAGE_OPTIONS: Record<
  LanguageCode,
  { code: string; native: string; english: string }
> = {
  en: { code: "EN", native: "English", english: "English" },
  ps: { code: "PS", native: "پښتو", english: "Pashto" },
  dr: { code: "DR", native: "دری", english: "Dari" },
};

const initialsFrom = (name?: string, email?: string) => {
  const source = (name || email || "BK").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
};

const ProfileScreen = () => {
  const router = useRouter();
  const {
    user,
    language,
    setLanguageCode,
    t,
    logout,
    deleteAccount,
    themeMode,
    setThemeMode,
    colors,
    refreshApp,
  } = useAppContext();
  const [about, setAbout] = useState<AboutOverview | null>(null);
  const [aboutLoading, setAboutLoading] = useState(true);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [contactTab, setContactTab] = useState<"provider" | "developer" | null>(null);

  const loadAbout = async () => {
    setAboutLoading(true);
    try {
      const data = await fetchAboutOverview();
      setAbout(data);
    } catch {
      setAbout(null);
    } finally {
      setAboutLoading(false);
    }
  };

  useEffect(() => {
    void loadAbout();
  }, []);

  const reloadProfile = useCallback(
    () => Promise.all([refreshApp(), loadAbout()]),
    [refreshApp]
  );
  const { refreshing, onRefresh } = usePullToRefresh(reloadProfile);

  const displayName = user?.fullName || user?.email || t("guestTitle");
  const initials = useMemo(
    () => initialsFrom(user?.fullName, user?.email),
    [user?.fullName, user?.email]
  );

  const handleDelete = () => {
    Alert.alert(t("deleteAccount"), t("deleteAccountWarning"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("deleteAccount"),
        style: "destructive",
        onPress: () => {
          void deleteAccount();
        },
      },
    ]);
  };

  const stats = [
    {
      key: "services",
      label: t("aboutServices"),
      value: about?.totals?.approved ?? "—",
      icon: "checkmark-circle-outline" as const,
    },
    {
      key: "districts",
      label: t("aboutDistricts"),
      value: about?.coverage?.districtsCovered ?? "—",
      icon: "map-outline" as const,
    },
    {
      key: "critical",
      label: t("aboutCritical"),
      value: about?.totals?.criticalLines ?? "—",
      icon: "flash-outline" as const,
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={pullRefreshControl({
        refreshing,
        onRefresh,
        color: colors.primary,
      })}
    >
      <View style={[styles.hero, { backgroundColor: colors.hero }]}>
        <View style={styles.avatar}>
          <Text style={[styles.avatarText, { color: colors.heroText }]}>{initials}</Text>
        </View>
        <Text style={[styles.heroName, { color: colors.heroText }]}>{displayName}</Text>
        <Text style={[styles.heroMeta, { color: colors.heroMuted }]}>
          {user ? t("signedInAs") : t("loginSubtitle")}
        </Text>
        {user?.email ? (
          <Text style={[styles.heroEmail, { color: colors.heroMuted }]}>{user.email}</Text>
        ) : null}
      </View>

      {!user ? (
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Pressable
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/auth/login")}
          >
            <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
            <Text style={styles.primaryText}>{t("login")}</Text>
          </Pressable>
          <Pressable
            style={[styles.secondaryBtn, { borderColor: colors.border }]}
            onPress={() => router.push("/auth/signup")}
          >
            <Text style={[styles.secondaryText, { color: colors.text }]}>{t("signup")}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("accountSection")}</Text>
          <View style={styles.infoBlock}>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={18} color={colors.primary} />
              <View style={styles.infoCopy}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  {t("emailLabel")}
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{user.email}</Text>
              </View>
            </View>
            {user.phoneNumber ? (
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={18} color={colors.primary} />
                <View style={styles.infoCopy}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    {t("phoneLabel")}
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{user.phoneNumber}</Text>
                </View>
              </View>
            ) : null}
            {user.fullName ? (
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={18} color={colors.primary} />
                <View style={styles.infoCopy}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    {t("nameLabel")}
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{user.fullName}</Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      )}

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("preferencesSection")}</Text>

        <Pressable
          style={[
            styles.prefRow,
            {
              borderColor: colors.border,
              backgroundColor: colors.surfaceAlt,
              borderBottomLeftRadius: languageOpen ? 0 : 16,
              borderBottomRightRadius: languageOpen ? 0 : 16,
              borderBottomWidth: languageOpen ? 0 : 1,
            },
          ]}
          onPress={() => setLanguageOpen((open) => !open)}
        >
          <View style={styles.prefCopy}>
            <Ionicons name="language-outline" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.prefTitle, { color: colors.text }]}>{t("languagePreferences")}</Text>
              <Text style={[styles.prefHint, { color: colors.textSecondary }]}>
                {LANGUAGE_LABELS[language]}
              </Text>
            </View>
          </View>
          <Ionicons
            name={languageOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.textSecondary}
          />
        </Pressable>

        {languageOpen ? (
          <View
            style={[
              styles.langPanel,
              { borderColor: colors.border, backgroundColor: colors.surfaceAlt },
            ]}
          >
            {LANGUAGE_CYCLE.map((code: LanguageCode, index: number) => {
              const active = language === code;
              const option = LANGUAGE_OPTIONS[code];
              return (
                <Pressable
                  key={code}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  style={[
                    styles.langOption,
                    index < LANGUAGE_CYCLE.length - 1
                      ? { borderBottomWidth: 1, borderBottomColor: colors.border }
                      : null,
                    active ? { backgroundColor: colors.primarySoft } : null,
                  ]}
                  onPress={() => setLanguageCode(code)}
                >
                  <View
                    style={[
                      styles.langCodeBadge,
                      {
                        backgroundColor: active ? colors.primary : colors.chipBg,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.langCodeText,
                        { color: active ? "#FFFFFF" : colors.textSecondary },
                      ]}
                    >
                      {option.code}
                    </Text>
                  </View>
                  <View style={styles.langCopy}>
                    <Text style={[styles.langNative, { color: colors.text }]}>
                      {option.native}
                    </Text>
                    <Text style={[styles.langEnglish, { color: colors.textSecondary }]}>
                      {option.english}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.langCheck,
                      {
                        borderColor: active ? colors.primary : colors.border,
                        backgroundColor: active ? colors.primary : "transparent",
                      },
                    ]}
                  >
                    {active ? (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <Text style={[styles.themeLabel, { color: colors.text }]}>{t("themeSection")}</Text>
        <Text style={[styles.prefHint, { color: colors.textSecondary, marginBottom: 10 }]}>
          {t("themeHint")}
        </Text>
        <View style={styles.themeRow}>
          <Pressable
            style={[
              styles.themeBtn,
              {
                borderColor: themeMode === "light" ? colors.primary : colors.border,
                backgroundColor: themeMode === "light" ? colors.primarySoft : colors.chipBg,
              },
            ]}
            onPress={() => setThemeMode("light")}
          >
            <Ionicons
              name="sunny-outline"
              size={18}
              color={themeMode === "light" ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.themeBtnText,
                { color: themeMode === "light" ? colors.primary : colors.text },
              ]}
            >
              {t("themeLight")}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.themeBtn,
              {
                borderColor: themeMode === "dark" ? colors.primary : colors.border,
                backgroundColor: themeMode === "dark" ? colors.primarySoft : colors.chipBg,
              },
            ]}
            onPress={() => setThemeMode("dark")}
          >
            <Ionicons
              name="moon-outline"
              size={18}
              color={themeMode === "dark" ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.themeBtnText,
                { color: themeMode === "dark" ? colors.primary : colors.text },
              ]}
            >
              {t("themeDark")}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
            {t("aboutTitle")}
          </Text>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
        </View>
        <Text style={[styles.aboutLead, { color: colors.text }]}>{t("aboutMissionTitle")}</Text>
        <Text style={[styles.aboutBody, { color: colors.textSecondary }]}>{t("aboutMissionBody")}</Text>
        <Text style={[styles.aboutLead, styles.aboutLeadSpaced, { color: colors.text }]}>
          {t("aboutCoverageTitle")}
        </Text>
        <Text style={[styles.aboutBody, { color: colors.textSecondary }]}>{t("aboutCoverageBody")}</Text>

        <Text style={[styles.aboutLead, styles.aboutLeadSpaced, { color: colors.text }]}>
          {t("aboutStatsTitle")}
        </Text>
        {aboutLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />
        ) : (
          <View style={styles.statsRow}>
            {stats.map((item) => (
              <View
                key={item.key}
                style={[styles.statItem, { backgroundColor: colors.primarySoft }]}
              >
                <Ionicons name={item.icon} size={18} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.text }]}>{String(item.value)}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        )}

        <Pressable
          style={[styles.linkRow, { borderTopColor: colors.border }]}
          onPress={() => router.push("/about")}
        >
          <View style={styles.linkStart}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.linkText, { color: colors.primary }]}>{t("aboutOpenFull")}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </Pressable>
        <Pressable
          style={[styles.linkRow, { borderTopColor: colors.border }]}
          onPress={() => router.push("/privacy")}
        >
          <View style={styles.linkStart}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
            <Text style={[styles.linkText, { color: colors.primary }]}>{t("privacyOpen")}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </Pressable>
        <Pressable
          style={[styles.linkRow, { borderTopColor: colors.border }]}
          onPress={() => router.push("/terms")}
        >
          <View style={styles.linkStart}>
            <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            <Text style={[styles.linkText, { color: colors.primary }]}>{t("termsOpen")}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </Pressable>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={[styles.contactTabs, { backgroundColor: colors.chipBg, borderColor: colors.border }]}>
          <Pressable
            style={[
              styles.contactTab,
              contactTab === "provider" ? { backgroundColor: colors.primary } : null,
            ]}
            onPress={() => setContactTab((current) => (current === "provider" ? null : "provider"))}
          >
            <Ionicons
              name="briefcase-outline"
              size={16}
              color={contactTab === "provider" ? "#FFFFFF" : colors.primary}
            />
            <Text
              style={[
                styles.contactTabText,
                { color: contactTab === "provider" ? "#FFFFFF" : colors.text },
              ]}
            >
              {t("providerTab")}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.contactTab,
              contactTab === "developer" ? { backgroundColor: colors.primary } : null,
            ]}
            onPress={() => setContactTab((current) => (current === "developer" ? null : "developer"))}
          >
            <Ionicons
              name="person-circle-outline"
              size={16}
              color={contactTab === "developer" ? "#FFFFFF" : colors.primary}
            />
            <Text
              style={[
                styles.contactTabText,
                { color: contactTab === "developer" ? "#FFFFFF" : colors.text },
              ]}
            >
              {t("developerTab")}
            </Text>
          </Pressable>
        </View>
        {contactTab ? (
          <View style={styles.contactTabBody}>
            {contactTab === "provider" ? (
              <ProviderPortalPanel colors={colors} />
            ) : (
              <DeveloperContactPanel colors={colors} />
            )}
          </View>
        ) : (
          <Text style={[styles.contactTabHint, { color: colors.textSecondary }]}>
            {t("contactTabsHint")}
          </Text>
        )}
      </View>

      {user ? (
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Pressable
            style={[styles.secondaryBtn, { borderColor: colors.border }]}
            onPress={() => void logout()}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.text} />
            <Text style={[styles.secondaryText, { color: colors.text }]}>{t("logout")}</Text>
          </Pressable>
          <Pressable
            style={[
              styles.secondaryBtn,
              { borderColor: colors.dangerSoft, backgroundColor: colors.dangerSoft },
            ]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
            <Text style={[styles.secondaryText, { color: colors.danger }]}>{t("deleteAccount")}</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 100,
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: "center",
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.45)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: "800",
  },
  heroName: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  heroMeta: {
    marginTop: 6,
    textAlign: "center",
  },
  heroEmail: {
    marginTop: 4,
    fontWeight: "600",
  },
  section: {
    marginTop: 18,
    marginHorizontal: 16,
    borderRadius: 22,
    padding: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  contactTabs: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  contactTab: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  contactTabText: {
    fontWeight: "800",
    fontSize: 13,
  },
  contactTabHint: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 20,
  },
  contactTabBody: {
    marginTop: 14,
  },
  infoBlock: {
    gap: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoCopy: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  prefRow: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  prefCopy: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  prefTitle: {
    fontWeight: "700",
    fontSize: 15,
  },
  prefHint: {
    marginTop: 2,
    fontSize: 13,
  },
  langPanel: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: "hidden",
  },
  langOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  langCodeBadge: {
    minWidth: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  langCodeText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  langCopy: {
    flex: 1,
  },
  langNative: {
    fontSize: 16,
    fontWeight: "800",
  },
  langEnglish: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
  },
  langCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  themeLabel: {
    marginTop: 18,
    fontWeight: "800",
    fontSize: 15,
  },
  themeRow: {
    flexDirection: "row",
    gap: 10,
  },
  themeBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  themeBtnText: {
    fontWeight: "700",
  },
  aboutLead: {
    fontWeight: "800",
    fontSize: 14,
  },
  aboutLeadSpaced: {
    marginTop: 14,
  },
  aboutBody: {
    lineHeight: 21,
    marginTop: 6,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  statItem: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontWeight: "800",
    fontSize: 16,
  },
  statLabel: {
    fontSize: 11,
    textAlign: "center",
    fontWeight: "600",
  },
  linkRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  linkStart: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  linkText: {
    flex: 1,
    fontWeight: "700",
  },
  primaryBtn: {
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  secondaryBtn: {
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 1,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  secondaryText: {
    fontWeight: "700",
  },
});

export default ProfileScreen;
