import { memo } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { EmergencyContact } from "@/src/utils/types";
import { localize, openDialer, openSMS, shareContact, districtLabel, displayContactName, displayContactAltName, resolveImageUrl } from "@/src/utils/helpers";
import { useAppContext } from "@/src/context/AppContext";

interface ContactCardProps {
  contact: EmergencyContact;
  onPress?: () => void;
  onFavoriteToggle?: () => void;
  isFavorite?: boolean;
}

const ContactCard = ({ contact, onPress, onFavoriteToggle, isFavorite }: ContactCardProps) => {
  const { t, categories, language, colors, copyNumber } = useAppContext();

  const categoryMeta = categories.find((c) => c.slug === contact.category);
  const categoryLabel = localize(categoryMeta?.title, language, contact.category);
  const title = displayContactName(contact, language);
  const altName = displayContactAltName(contact, language);

  const photoUrl = resolveImageUrl(contact.imageUrl);

  const handleSms = async () => {
    try {
      await openSMS(contact.phoneNumber);
    } catch {
      Alert.alert(t("sendSms"), t("smsUnavailable"));
    }
  };

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={onPress}
    >
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          style={[styles.cover, { backgroundColor: colors.surfaceAlt }]}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.coverPlaceholder, { backgroundColor: colors.surfaceAlt }]}>
          <Ionicons name="image-outline" size={36} color={colors.textMuted} />
        </View>
      )}

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {altName ? (
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{altName}</Text>
            ) : null}
            {contact.district || contact.location ? (
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {[districtLabel(contact.district, language), contact.location].filter(Boolean).join(" • ")}
              </Text>
            ) : null}
            {contact.category ? (
              <Text style={[styles.meta, { color: colors.textSecondary }]}>{categoryLabel}</Text>
            ) : null}
            {contact.isCritical ? (
              <Text style={[styles.critical, { color: colors.danger }]}>{t("criticalBadge")}</Text>
            ) : null}
          </View>
          {onFavoriteToggle ? (
            <Pressable
              style={[styles.iconButton, { backgroundColor: colors.chipBg }]}
              onPress={onFavoriteToggle}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={22}
                color={isFavorite ? colors.danger : colors.textMuted}
              />
            </Pressable>
          ) : null}
        </View>

        {contact.availability ? (
          <View style={styles.metaRow}>
            <Ionicons name="time" size={18} color={colors.textMuted} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{contact.availability}</Text>
          </View>
        ) : null}

        {contact.description ? (
          <View style={styles.metaRow}>
            <Ionicons name="information-circle" size={18} color={colors.textMuted} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{contact.description}</Text>
          </View>
        ) : null}

        <Pressable
          style={styles.contactRow}
          onPress={onPress}
          onLongPress={() => void copyNumber(contact.phoneNumber)}
          delayLongPress={350}
        >
          <Ionicons name="call" size={18} color={colors.primary} />
          <Text selectable={false} pointerEvents="none" style={[styles.phone, { color: colors.primary }]}>
            {contact.phoneNumber}
          </Text>
        </Pressable>

        {contact.altPhoneNumber ? (
          <Pressable
            style={styles.contactRow}
            onPress={onPress}
            onLongPress={() => void copyNumber(contact.altPhoneNumber!)}
            delayLongPress={350}
          >
            <Ionicons name="call-outline" size={18} color={colors.textMuted} />
            <Text selectable={false} pointerEvents="none" style={[styles.altPhone, { color: colors.textSecondary }]}>
              {contact.altPhoneNumber}
            </Text>
          </Pressable>
        ) : null}

        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={() => openDialer(contact.phoneNumber)}
          >
            <Ionicons name="call" color="#FFFFFF" size={18} />
            <Text style={styles.primaryText}>{t("callNow")}</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: colors.chipBg }]}
            onPress={handleSms}
          >
            <Ionicons name="chatbox" color={colors.text} size={18} />
            <Text style={[styles.secondaryText, { color: colors.text }]}>{t("sendSms")}</Text>
          </Pressable>
          <Pressable
            style={[styles.iconButton, { backgroundColor: colors.chipBg }]}
            onPress={() => shareContact(contact, language)}
          >
            <Ionicons name="share-social" size={20} color={colors.text} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    marginVertical: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cover: {
    width: "100%",
    height: 180,
  },
  coverPlaceholder: {
    width: "100%",
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    padding: 18,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerText: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 4,
  },
  meta: {
    marginTop: 4,
    fontWeight: "600",
  },
  critical: {
    marginTop: 6,
    fontWeight: "800",
    fontSize: 12,
    textTransform: "uppercase",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  phone: {
    fontSize: 16,
    fontWeight: "600",
  },
  altPhone: {
    fontSize: 15,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  secondaryText: {
    fontWeight: "600",
  },
  iconButton: {
    padding: 8,
    borderRadius: 999,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  metaText: {
    lineHeight: 20,
    flex: 1,
  },
});

export default memo(ContactCard);
