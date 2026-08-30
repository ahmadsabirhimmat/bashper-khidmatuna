import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "@/src/context/AppContext";
import type { AppColors } from "@/src/theme/colors";
import { DEVELOPER_CONTACT, PROVIDER_APP_URL } from "@/src/utils/constants";

const openUrl = (url: string) => {
  void Linking.openURL(url);
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
      <Text style={[styles.body, { color: colors.textSecondary }]}>{t("developerName")}</Text>

      <Pressable
        style={[styles.row, { borderColor: colors.border }]}
        onPress={() => openUrl(DEVELOPER_CONTACT.whatsappUrl)}
      >
        <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
        <View style={styles.copy}>
          <Text style={[styles.rowTitle, { color: colors.text }]}>{t("developerWhatsApp")}</Text>
          <Text style={[styles.rowHint, { color: colors.textSecondary }]}>
            {DEVELOPER_CONTACT.whatsappDisplay}
          </Text>
        </View>
      </Pressable>

      <Pressable
        style={[styles.row, { borderColor: colors.border }]}
        onPress={() => openUrl(`mailto:${DEVELOPER_CONTACT.email}`)}
      >
        <Ionicons name="mail-outline" size={20} color={colors.primary} />
        <View style={styles.copy}>
          <Text style={[styles.rowTitle, { color: colors.text }]}>{t("developerEmail")}</Text>
          <Text style={[styles.rowHint, { color: colors.textSecondary }]}>{DEVELOPER_CONTACT.email}</Text>
        </View>
      </Pressable>
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
