import { Tabs } from "expo-router";
import AppTabBar from "@/src/components/AppTabBar";
import { useAppContext } from "@/src/context/AppContext";

const BottomTabNavigator = () => {
  const { t, colors } = useAppContext();

  return (
    <Tabs
      initialRouteName="home"
      tabBar={(props) => <AppTabBar {...props} />}
      sceneContainerStyle={{ backgroundColor: colors.background }}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: t("tabHome"), tabBarLabel: t("tabHome"), href: "/home" }}
      />
      <Tabs.Screen
        name="search"
        options={{ title: t("tabSearch"), tabBarLabel: t("tabSearch"), href: "/search" }}
      />
      <Tabs.Screen
        name="favorites"
        options={{ title: t("tabFavorites"), tabBarLabel: t("tabFavorites"), href: "/favorites" }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t("tabProfile"), tabBarLabel: t("tabProfile"), href: "/profile" }}
      />
    </Tabs>
  );
};

export default BottomTabNavigator;
