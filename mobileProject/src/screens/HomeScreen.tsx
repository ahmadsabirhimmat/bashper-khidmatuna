import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Header from "@/src/components/Header";
import CategoryCard from "@/src/components/CategoryCard";
import SearchBar from "@/src/components/SearchBar";
import { useAppContext } from "@/src/context/AppContext";
import DirectoryAuthGate from "@/src/components/DirectoryAuthGate";
import { openDialer } from "@/src/utils/helpers";
import { pullRefreshControl, usePullToRefresh } from "@/src/components/pullRefresh";

const HomeScreen = () => {
  const router = useRouter();
  const { categories, t, criticalContacts, colors, user, refreshApp, copyNumber } = useAppContext();
  const [query, setQuery] = useState("");
  const reloadHome = useCallback(() => refreshApp(), [refreshApp]);
  const { refreshing, onRefresh } = usePullToRefresh(reloadHome);

  const navigateToSearch = () => {
    router.push({ pathname: "/search", params: query ? { q: query } : undefined });
  };

  const navigateToCategory = (slug: string) => {
    router.push(`/category/${slug}` as const);
  };

  const navigateToFavorites = () => {
    router.push("/favorites" as const);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={pullRefreshControl({
        refreshing,
        onRefresh,
        color: colors.primary,
      })}
    >
      <Header />
      {user ? (
        <SearchBar
          placeholder={t("searchPlaceholder")}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={navigateToSearch}
          onFocus={() => router.push("/search" as const)}
        />
      ) : null}

      <View style={[styles.highlightCard, { backgroundColor: colors.hero }]}>
        <Text style={[styles.highlightTitle, { color: colors.heroText }]}>{t("offlineReadyTitle")}</Text>
        <Text style={[styles.highlightSubtitle, { color: colors.heroMuted }]}>
          {t("offlineReadySubtitle")}
        </Text>
        <View style={styles.criticalList}>
          {criticalContacts.map((contact) => (
            <Pressable
              key={contact.id}
              style={[styles.criticalRow, { backgroundColor: colors.overlay }]}
              onPress={() => openDialer(contact.phoneNumber)}
              onLongPress={() => void copyNumber(contact.phoneNumber)}
              delayLongPress={350}
            >
              <View style={styles.criticalCopy}>
                <Text style={[styles.criticalName, { color: colors.heroText }]}>{contact.name}</Text>
                <Text selectable={false} pointerEvents="none" style={styles.criticalPhone}>
                  {contact.phoneNumber}
                </Text>
              </View>
              <Text style={styles.criticalBadge}>{t("criticalBadge")}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.highlightActions}>
          <Pressable
            style={styles.primaryCta}
            onPress={() => (user ? navigateToSearch() : router.push("/auth/login"))}
          >
            <Text style={[styles.primaryCtaText, { color: colors.heroText }]}>
              {user ? t("viewDirectory") : t("login")}
            </Text>
          </Pressable>
          <Pressable
            style={styles.secondaryCta}
            onPress={() => (user ? navigateToFavorites() : router.push("/auth/signup"))}
          >
            <Text style={[styles.secondaryCtaText, { color: colors.heroText }]}>
              {user ? t("favoritesTitle") : t("signup")}
            </Text>
          </Pressable>
        </View>
      </View>

      {user ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("categoriesTitle")}</Text>
          </View>
          <View style={styles.list}>
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onPress={() => navigateToCategory(category.slug)}
              />
            ))}
          </View>
        </>
      ) : (
        <View style={styles.gateWrap}>
          <DirectoryAuthGate />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 80,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  list: {
    marginTop: 8,
  },
  gateWrap: {
    marginTop: 24,
  },
  highlightCard: {
    borderRadius: 20,
    padding: 18,
    marginTop: 24,
  },
  highlightTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  highlightSubtitle: {
    marginTop: 6,
    lineHeight: 20,
  },
  criticalList: {
    marginTop: 14,
    gap: 8,
  },
  criticalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  criticalCopy: {
    flex: 1,
    paddingRight: 8,
  },
  criticalName: {
    fontWeight: "600",
  },
  criticalPhone: {
    color: "#FFB59A",
    marginTop: 2,
    fontWeight: "700",
  },
  criticalBadge: {
    color: "#FF5C39",
    fontWeight: "800",
    fontSize: 11,
    textTransform: "uppercase",
  },
  highlightActions: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },
  primaryCta: {
    backgroundColor: "#FF5C39",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
  },
  primaryCtaText: {
    fontWeight: "700",
  },
  secondaryCta: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  secondaryCtaText: {
    fontWeight: "600",
  },
});

export default HomeScreen;
