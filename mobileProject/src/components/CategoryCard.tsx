import { ComponentProps, memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ServiceCategory } from "@/src/utils/types";
import { useAppContext } from "@/src/context/AppContext";
import { localize } from "@/src/utils/helpers";

interface CategoryCardProps {
  category: ServiceCategory;
  onPress: () => void;
}

const CategoryCard = ({ category, onPress }: CategoryCardProps) => {
  const { language } = useAppContext();
  const iconName = category.icon as ComponentProps<typeof Ionicons>["name"];
  const accentTint = `${category.accent}26`;
  return (
    <Pressable style={[styles.card, { backgroundColor: category.color }]} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <Ionicons name={iconName} size={26} color="#FFFFFF" />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{localize(category.title, language)}</Text>
          <Text numberOfLines={2} style={styles.subtitle}>
            {localize(category.description, language)}
          </Text>
        </View>
        {category.sticker ? (
          <View style={[styles.sticker, { borderColor: category.accent, backgroundColor: accentTint }]}>
            <Text style={[styles.stickerText, { color: category.accent }]}>
              {localize(category.sticker, language)}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    width: "100%",
    shadowColor: "#001133",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  copy: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginTop: 6,
  },
  sticker: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  stickerText: {
    fontSize: 12,
    fontWeight: "700",
  },
});

export default memo(CategoryCard);
