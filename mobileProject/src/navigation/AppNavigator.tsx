import { Stack } from "expo-router";
import { useAppContext } from "@/src/context/AppContext";

const AppNavigator = () => {
  const { t, colors, themeMode } = useAppContext();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "700", color: colors.text },
        contentStyle: { backgroundColor: colors.background },
        headerShadowVisible: themeMode === "light",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="category/[type]" options={{ title: t("categoriesTitle") }} />
      <Stack.Screen name="contact/[id]" options={{ title: t("contactDetails") }} />
      <Stack.Screen
        name="auth/login"
        options={{ title: t("login"), presentation: "modal", headerTitleAlign: "center" }}
      />
      <Stack.Screen
        name="auth/signup"
        options={{ title: t("signup"), presentation: "modal", headerTitleAlign: "center" }}
      />
      <Stack.Screen
        name="auth/otp"
        options={{ title: t("otpTitle"), presentation: "modal", headerTitleAlign: "center" }}
      />
      <Stack.Screen
        name="auth/forgot-password"
        options={{ title: t("forgotTitle"), presentation: "modal", headerTitleAlign: "center" }}
      />
      <Stack.Screen
        name="about"
        options={{ title: t("aboutTitle"), headerTitleAlign: "center" }}
      />
      <Stack.Screen
        name="privacy"
        options={{ title: t("privacyTitle"), headerTitleAlign: "center" }}
      />
    </Stack>
  );
};

export default AppNavigator;
