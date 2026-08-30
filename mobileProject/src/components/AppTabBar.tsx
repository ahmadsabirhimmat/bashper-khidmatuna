import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/src/context/AppContext";

const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; idle: keyof typeof Ionicons.glyphMap }> = {
  home: { active: "home", idle: "home-outline" },
  search: { active: "search", idle: "search-outline" },
  favorites: { active: "heart", idle: "heart-outline" },
  profile: { active: "person", idle: "person-outline" },
};

const AppTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const { colors, themeMode } = useAppContext();
  const bottomPad = Math.max(insets.bottom, 10);

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          paddingBottom: bottomPad,
          shadowColor: themeMode === "dark" ? "#000000" : "#0B254A",
        },
      ]}
    >
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : typeof options.title === "string"
                ? options.title
                : route.name;
          const icons = TAB_ICONS[route.name] ?? { active: "ellipse", idle: "ellipse-outline" };
          const tint = focused ? colors.primary : colors.tabInactive;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              if (Platform.OS !== "web") {
                Haptics.selectionAsync().catch(() => undefined);
              }
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              onPress={onPress}
              style={styles.tab}
            >
              <View
                style={[
                  styles.iconWrap,
                  focused
                    ? { backgroundColor: colors.primarySoft }
                    : { backgroundColor: "transparent" },
                ]}
              >
                <Ionicons name={focused ? icons.active : icons.idle} size={22} color={tint} />
              </View>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                style={[
                  styles.label,
                  {
                    color: tint,
                    fontWeight: focused ? "800" : "600",
                  },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    paddingHorizontal: 8,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 18,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 2,
  },
  iconWrap: {
    width: 52,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.2,
    maxWidth: "100%",
    textAlign: "center",
  },
});

export default AppTabBar;
