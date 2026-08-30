import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import SearchBar from "@/src/components/SearchBar";
import ContactCard from "@/src/components/ContactCard";
import DirectoryAuthGate from "@/src/components/DirectoryAuthGate";
import { useAppContext } from "@/src/context/AppContext";
import { pullRefreshControl, usePullToRefresh } from "@/src/components/pullRefresh";

const SearchScreen = () => {
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(params.q ?? "");
  const { searchResults, performSearch, t, searchLoading, favorites, toggleFavorite, colors, refreshApp, user } =
    useAppContext();
  const reloadSearch = useCallback(() => {
    if (query.trim().length >= 2) {
      return performSearch(query);
    }
    return refreshApp();
  }, [performSearch, query, refreshApp]);
  const { refreshing, onRefresh } = usePullToRefresh(reloadSearch);

  useEffect(() => {
    if (query.trim().length < 2) {
      performSearch("");
      return;
    }
    const delay = setTimeout(() => {
      performSearch(query);
    }, 300);
    return () => clearTimeout(delay);
  }, [performSearch, query]);

  if (!user) {
    return (
      <View style={[styles.container, styles.gateScreen, { backgroundColor: colors.background }]}>
        <DirectoryAuthGate />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        refreshControl={pullRefreshControl({
          refreshing,
          onRefresh,
          color: colors.primary,
        })}
        ListHeaderComponent={
          <View>
            <Text style={[styles.title, { color: colors.text }]}>{t("searchHeading")}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t("searchHint")}</Text>
            <SearchBar
              style={styles.searchBar}
              value={query}
              placeholder={t("searchPlaceholder")}
              onChangeText={setQuery}
              onClear={() => setQuery("")}
            />
            {searchLoading && query.length >= 2 ? (
              <View style={styles.loader}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : null}
            {!searchLoading && query.length >= 2 && !searchResults.length ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>{t("searchEmpty")}</Text>
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <ContactCard
            contact={item}
            onFavoriteToggle={() => toggleFavorite(item.id)}
            isFavorite={favorites.some((fav) => fav.id === item.id)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  gateScreen: {
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 4,
  },
  searchBar: {
    marginTop: 20,
  },
  loader: {
    marginTop: 30,
    alignItems: "center",
  },
  emptyState: {
    marginTop: 40,
    alignItems: "center",
  },
  emptyTitle: {
    fontWeight: "600",
  },
  list: {
    paddingBottom: 80,
    flexGrow: 1,
  },
});

export default SearchScreen;
