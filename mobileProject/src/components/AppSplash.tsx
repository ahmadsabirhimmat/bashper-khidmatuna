import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "@/src/context/AppContext";

const SPLASH_NAVY = "#0B254A";

interface AppSplashProps {
  onReady?: () => void;
}

const AppSplash = ({ onReady }: AppSplashProps) => {
  const { t } = useAppContext();

  return (
    <View style={styles.screen} onLayout={onReady}>
      <View style={styles.mark}>
        <Ionicons name="shield-checkmark" size={52} color="#FFFFFF" />
      </View>
      <Text style={styles.title}>{t("appName")}</Text>
      <Text style={styles.subtitle}>{t("tagline")}</Text>
      <ActivityIndicator color="#FFFFFF" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SPLASH_NAVY,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    zIndex: 50,
  },
  mark: {
    width: 96,
    height: 96,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    color: "rgba(255,255,255,0.78)",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  loader: {
    marginTop: 28,
  },
});

export default AppSplash;
export { SPLASH_NAVY };
