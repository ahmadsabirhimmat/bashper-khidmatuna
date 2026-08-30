import { useCallback } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import ContactCard from "@/src/components/ContactCard";
import { useAppContext } from "@/src/context/AppContext";
import { pullRefreshControl, usePullToRefresh } from "@/src/components/pullRefresh";

const FavoritesScreen = () => {
  const router = useRouter();
  const { favorites, user, t, toggleFavorite, colors, refreshFavorites } = useAppContext();
  const reloadFavorites = useCallback(() => refreshFavorites(), [refreshFavorites]);
  const { refreshing, onRefresh } = usePullToRefresh(reloadFavorites);
  const refreshControl = pullRefreshControl({
    refreshing,
    onRefresh,
    color: colors.primary,
  });

  if (!user) {
    return (
      <ScrollView
        contentContainerStyle={[styles.screen, styles.centered, { backgroundColor: colors.background }]}
        refreshControl={refreshControl}
      >
        <View style={[styles.guardCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.guardTitle, { color: colors.text }]}>{t("favoritesGuardTitle")}</Text>
          <Text style={[styles.guardSubtitle, { color: colors.textSecondary }]}>
            {t("favoritesGuardSubtitle")}
          </Text>
          <Pressable
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/auth/login" as const)}
          >
            <Text style={styles.primaryText}>{t("goToLogin")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  if (!favorites.length) {
    return (
      <ScrollView
        contentContainerStyle={[styles.screen, styles.centered, { backgroundColor: colors.background }]}
        refreshControl={refreshControl}
      >
        <Text style={[styles.title, { color: colors.text }]}>{t("favoritesTitle")}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t("favoritesEmpty")}</Text>
      </ScrollView>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t("favoritesTitle")}</Text>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={favorites}
        keyExtractor={(item) => item.id}
        refreshControl={refreshControl}
        renderItem={({ item }) => (
          <ContactCard contact={item} onFavoriteToggle={() => toggleFavorite(item.id)} isFavorite />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    textAlign: "center",
  },
  guardCard: {
    width: "100%",
    padding: 24,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  guardTitle: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  guardSubtitle: {
    marginTop: 10,
    textAlign: "center",
  },
  primaryBtn: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 12,
    paddingBottom: 80,
    flexGrow: 1,
  },
});

export default FavoritesScreen;
