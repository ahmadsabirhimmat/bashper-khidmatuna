import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "@/src/context/AppContext";
import type { AppColors } from "@/src/theme/colors";
import { DEVELOPER_CONTACT, PROVIDER_APP_URL } from "@/src/utils/constants";

const openUrl = (url: string) => {
  void Linking.openURL(url);
};

export const ProviderPortalPanel = ({ colors }: { colors: AppColors }) => {
  const { t } = useAppContext();

  return (
    <View>
      <Text style={[styles.body, { color: colors.textSecondary }]}>{t("providerPortalBody")}</Text>
      <Pressable
        style={[styles.row, { borderColor: colors.border }]}
        onPress={() => openUrl(PROVIDER_APP_URL)}
      >
        <Ionicons name="briefcase-outline" size={20} color={colors.primary} />
        <View style={styles.copy}>
          <Text style={[styles.rowTitle, { color: colors.primary }]}>{t("providerPortalOpen")}</Text>
          <Text style={[styles.rowHint, { color: colors.textSecondary }]}>{PROVIDER_APP_URL}</Text>
        </View>
        <Ionicons name="open-outline" size={18} color={colors.primary} />
      </Pressable>
    </View>
  );
};

export const DeveloperContactPanel = ({ colors }: { colors: AppColors }) => {
  const { t } = useAppContext();

  return (
    <View>
      <Text style={[styles.body, { color: colors.textSecondary }]}>{t("developerName")}</Text>
      <Pressable
        style={[styles.row, { borderColor: colors.border }]}
        onPress={() => openUrl(DEVELOPER_CONTACT.portfolioUrl)}
      >
        <Ionicons name="globe-outline" size={20} color={colors.primary} />
        <View style={styles.copy}>
          <Text style={[styles.rowTitle, { color: colors.primary }]}>{t("developerPortfolioOpen")}</Text>
          <Text style={[styles.rowHint, { color: colors.textSecondary }]}>
            {DEVELOPER_CONTACT.portfolioUrl.replace(/^https:\/\//, "")}
          </Text>
        </View>
        <Ionicons name="open-outline" size={18} color={colors.primary} />
      </Pressable>
    </View>
  );
};

export const DeveloperContactCard = ({
  showProviderLink = false,
  colors,
}: {
  showProviderLink?: boolean;
  colors: AppColors;
}) => {
  const { t } = useAppContext();

  return (
    <View style={[styles.section, { backgroundColor: colors.surface }]}>
      {showProviderLink ? (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("providerPortalTitle")}</Text>
          <ProviderPortalPanel colors={colors} />
        </>
      ) : null}
      <Text
        style={[
          styles.sectionTitle,
          { color: colors.text, marginTop: showProviderLink ? 18 : 0 },
        ]}
      >
        {t("developerTitle")}
      </Text>
      <DeveloperContactPanel colors={colors} />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 22,
    padding: 18,
  },
  sectionTitle: {
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 6,
  },
  body: {
    lineHeight: 21,
    marginBottom: 10,
  },
  row: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontWeight: "700",
  },
  rowHint: {
    marginTop: 2,
    fontSize: 13,
  },
});
