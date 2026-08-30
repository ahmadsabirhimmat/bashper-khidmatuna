import "@/global.css";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { AppProvider, useAppContext } from "@/src/context/AppContext";
import AppNavigator from "@/src/navigation/AppNavigator";
import AppSplash, { SPLASH_NAVY } from "@/src/components/AppSplash";
import CopyToast from "@/src/components/CopyToast";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const MIN_SPLASH_MS = 1200;

const RootShell = () => {
  const { colors, themeMode, isReady } = useAppContext();
  const insets = useSafeAreaInsets();
  const [showSplash, setShowSplash] = useState(true);
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const remaining = Math.max(0, MIN_SPLASH_MS - (Date.now() - mountedAt.current));
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => undefined);
      setShowSplash(false);
    }, remaining);

    return () => clearTimeout(timer);
  }, [isReady]);

  useEffect(() => {
    const failsafe = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => undefined);
      setShowSplash(false);
    }, 4000);
    return () => clearTimeout(failsafe);
  }, []);

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: showSplash ? SPLASH_NAVY : colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      <StatusBar style={showSplash || themeMode === "dark" ? "light" : "dark"} />
      <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <AppNavigator />
        {showSplash ? null : <CopyToast />}
      </View>
      {showSplash ? (
        <AppSplash onReady={() => SplashScreen.hideAsync().catch(() => undefined)} />
      ) : null}
    </View>
  );
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <RootShell />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});
