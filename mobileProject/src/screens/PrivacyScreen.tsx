import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useAppContext } from "@/src/context/AppContext";
import { fetchPolicy, fetchTerms, type PrivacyPolicy } from "@/src/services/api";
import { pullRefreshControl, usePullToRefresh } from "@/src/components/pullRefresh";
import { localize } from "@/src/utils/helpers";
import type { LocalizedCopy } from "@/src/utils/types";

const asCopy = (value?: Partial<LocalizedCopy>): LocalizedCopy | undefined => {
  if (!value) return undefined;
  return {
    en: value.en || "",
    ps: value.ps || "",
    dr: value.dr || "",
  };
};

type LegalKind = "privacy" | "terms";

const LEGAL_KEYS: Record<
  LegalKind,
  {
    fetch: () => Promise<PrivacyPolicy>;
    title: "privacyTitle" | "termsTitle";
    loading: "privacyLoading" | "termsLoading";
    error: "privacyError" | "termsError";
    empty: "privacyEmpty" | "termsEmpty";
  }
> = {
  privacy: {
    fetch: fetchPolicy,
    title: "privacyTitle",
    loading: "privacyLoading",
    error: "privacyError",
    empty: "privacyEmpty",
  },
  terms: {
    fetch: fetchTerms,
    title: "termsTitle",
    loading: "termsLoading",
    error: "termsError",
    empty: "termsEmpty",
  },
};

const PrivacyScreen = ({ kind = "privacy" }: { kind?: LegalKind }) => {
  const router = useRouter();
  const { t, colors, language } = useAppContext();
  const keys = LEGAL_KEYS[kind];
  const [policy, setPolicy] = useState<PrivacyPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPolicy = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await keys.fetch();
      setPolicy(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t(keys.error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPolicy();
  }, [kind]);

  const reloadPolicy = useCallback(() => {
    void loadPolicy();
  }, [kind]);
  const { refreshing, onRefresh } = usePullToRefresh(reloadPolicy);

  const title = localize(asCopy(policy?.title), language, t(keys.title));
  const subtitle = localize(asCopy(policy?.subtitle), language, "");
  const sections = Array.isArray(policy?.sections) ? policy.sections : [];
  const updatedAt = policy?.updatedAt
    ? new Intl.DateTimeFormat(language === "dr" ? "fa-AF" : language === "ps" ? "ps-AF" : "en-GB", {
        dateStyle: "medium",
      }).format(new Date(policy.updatedAt))
    : "";

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
        <Text style={[styles.brand, { color: colors.primary }]}>{t("privacyLegal")}</Text>
        <Text style={[styles.title, { color: colors.heroText }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.tagline, { color: colors.heroMuted }]}>{subtitle}</Text>
        ) : null}
        {updatedAt ? (
          <Text style={[styles.updated, { color: colors.heroMuted }]}>
            {t("privacyUpdated")}: {updatedAt}
          </Text>
        ) : null}
      </View>

      {loading ? (
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.body, { color: colors.textSecondary, marginTop: 12 }]}>
            {t(keys.loading)}
          </Text>
        </View>
      ) : null}

      {error ? (
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
        </View>
      ) : null}

      {!loading && !error
        ? sections.length
          ? sections.map((section, index) => {
              const heading = localize(asCopy(section.heading), language, "");
              const body = localize(asCopy(section.body), language, "");
              if (!heading && !body) return null;
              return (
                <View key={`${heading}-${index}`} style={[styles.section, { backgroundColor: colors.surface }]}>
                  {heading ? (
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{heading}</Text>
                  ) : null}
                  {body ? <Text style={[styles.body, { color: colors.textSecondary }]}>{body}</Text> : null}
                </View>
              );
            })
          : (
              <View style={[styles.section, { backgroundColor: colors.surface }]}>
                <Text style={[styles.body, { color: colors.textSecondary }]}>{t(keys.empty)}</Text>
              </View>
            )
        : null}

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
  updated: {
    marginTop: 12,
    fontWeight: "600",
    fontSize: 12,
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
  error: {
    marginTop: 8,
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

export default PrivacyScreen;
