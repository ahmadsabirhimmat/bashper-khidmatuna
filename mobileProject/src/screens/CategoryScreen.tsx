import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import DirectoryAuthGate from "@/src/components/DirectoryAuthGate";
import ContactCard from "@/src/components/ContactCard";
import { useAppContext } from "@/src/context/AppContext";
import { KANDAHAR_DISTRICTS } from "@/src/utils/constants";
import { localize, districtLabel } from "@/src/utils/helpers";
import type { EmergencyContact } from "@/src/utils/types";
import { pullRefreshControl, usePullToRefresh } from "@/src/components/pullRefresh";

interface CategoryScreenProps {
  categoryId: string;
}

const CategoryScreen = ({ categoryId }: CategoryScreenProps) => {
  const {
    loadContacts,
    categories,
    t,
    toggleFavorite,
    favorites,
    isSyncing,
    language,
    selectedDistrict,
    setSelectedDistrict,
    userDistrict,
    requestLocation,
    colors,
    user,
  } = useAppContext();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  const currentCategory = categories.find((category) => category.slug === categoryId);

  const fetchContacts = useCallback(
    async (force = false) => {
      const data = await loadContacts(categoryId, force);
      setContacts(data);
    },
    [categoryId, loadContacts]
  );
  const reloadCategory = useCallback(() => fetchContacts(true), [fetchContacts]);
  const { refreshing, onRefresh } = usePullToRefresh(reloadCategory);

  useEffect(() => {
    if (!user) {
      return;
    }
    fetchContacts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, selectedDistrict, user, userDistrict]);

  if (!user) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: colors.background, padding: 20 }]}>
        <DirectoryAuthGate />
      </View>
    );
  }

  if (!contacts.length && isSyncing) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={[styles.loaderText, { color: colors.textSecondary }]}>{t("loading")}</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={[styles.list, { backgroundColor: colors.background }]}
      data={contacts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ContactCard
          contact={item}
          onFavoriteToggle={() => toggleFavorite(item.id)}
          isFavorite={favorites.some((fav) => fav.id === item.id)}
        />
      )}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {localize(currentCategory?.title, language)}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {localize(currentCategory?.description, language)}
          </Text>
          {userDistrict ? (
            <Text style={[styles.nearYou, { color: colors.primary }]}>
              {t("nearYou")}: {userDistrict}
            </Text>
          ) : (
            <Pressable onPress={() => void requestLocation()}>
              <Text style={[styles.nearYou, { color: colors.primary }]}>{t("useMyLocation")}</Text>
            </Pressable>
          )}
          <Text style={[styles.filterLabel, { color: colors.text }]}>{t("filterByDistrict")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            <Pressable
              style={[
                styles.chip,
                {
                  borderColor: !selectedDistrict ? colors.primary : colors.border,
                  backgroundColor: !selectedDistrict ? colors.primary : colors.surface,
                },
              ]}
              onPress={() => setSelectedDistrict(null)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: !selectedDistrict ? "#FFFFFF" : colors.text },
                ]}
              >
                {t("allDistricts")}
              </Text>
            </Pressable>
            {KANDAHAR_DISTRICTS.map((district) => {
              const active = selectedDistrict === district;
              return (
                <Pressable
                  key={district}
                  style={[
                    styles.chip,
                    {
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.primary : colors.surface,
                    },
                  ]}
                  onPress={() => setSelectedDistrict(active ? null : district)}
                >
                  <Text style={[styles.chipText, { color: active ? "#FFFFFF" : colors.text }]}>
                    {districtLabel(district, language)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      }
      refreshControl={pullRefreshControl({
        refreshing,
        onRefresh,
        color: colors.primary,
      })}
      ListEmptyComponent={
        !isSyncing ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{t("searchEmpty")}</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {t("pullToRefresh")}
            </Text>
          </View>
        ) : null
      }
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 20,
    paddingBottom: 80,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  nearYou: {
    marginTop: 10,
    fontWeight: "600",
  },
  filterLabel: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "700",
  },
  chips: {
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    fontWeight: "600",
    fontSize: 13,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    marginTop: 8,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptySubtitle: {
    marginTop: 8,
  },
});

export default CategoryScreen;
