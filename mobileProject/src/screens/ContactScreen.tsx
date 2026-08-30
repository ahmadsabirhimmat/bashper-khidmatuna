import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DirectoryAuthGate from "@/src/components/DirectoryAuthGate";
import { useAppContext } from "@/src/context/AppContext";
import type { EmergencyContact } from "@/src/utils/types";
import { districtLabel, displayContactAltName, displayContactName, openDialer, openSMS, shareContact, resolveImageUrl } from "@/src/utils/helpers";

interface ContactScreenProps {
  contactId: string;
}

const ContactScreen = ({ contactId }: ContactScreenProps) => {
  const { getContact, t, toggleFavorite, favorites, colors, user, criticalContacts, language, copyNumber } = useAppContext();
  const [contact, setContact] = useState<EmergencyContact | null>(null);
  const [loading, setLoading] = useState(true);
  const isCritical = criticalContacts.some((item) => item.id === contactId);

  useEffect(() => {
    if (!user && !isCritical) {
      setLoading(false);
      setContact(null);
      return;
    }
    setLoading(true);
    getContact(contactId)
      .then(setContact)
      .finally(() => setLoading(false));
  }, [contactId, getContact, user, isCritical]);

  if (!user && !isCritical) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.background, padding: 20 }]}>
        <DirectoryAuthGate />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!contact) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.background }]}>
        <Text style={[styles.empty, { color: colors.textSecondary }]}>{t("searchEmpty")}</Text>
      </View>
    );
  }

  const isFavorite = favorites.some((fav) => fav.id === contact.id);
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
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          style={[styles.hero, { backgroundColor: colors.surfaceAlt }]}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.heroPlaceholder, { backgroundColor: colors.surfaceAlt }]}>
          <Ionicons name="image-outline" size={48} color={colors.textMuted} />
        </View>
      )}

      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {altName ? (
            <Text style={{ color: colors.textSecondary }}>{altName}</Text>
          ) : contact.organization && contact.organization !== contact.name ? (
            <Text style={{ color: colors.textSecondary }}>{contact.organization}</Text>
          ) : null}
        </View>
        <Pressable onPress={() => toggleFavorite(contact.id)} style={styles.favoriteBtn}>
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={26}
            color={isFavorite ? colors.danger : colors.textSecondary}
          />
        </Pressable>
      </View>

      <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
        <Pressable
          style={styles.infoRow}
          onLongPress={() => void copyNumber(contact.phoneNumber)}
          delayLongPress={350}
        >
          <Ionicons name="call" size={18} color={colors.primary} />
          <Text selectable={false} pointerEvents="none" style={[styles.infoValue, { color: colors.primary }]}>
            {contact.phoneNumber}
          </Text>
        </Pressable>
        {contact.altPhoneNumber ? (
          <Pressable
            style={styles.infoRow}
            onLongPress={() => void copyNumber(contact.altPhoneNumber!)}
            delayLongPress={350}
          >
            <Ionicons name="call-outline" size={18} color={colors.textMuted} />
            <Text selectable={false} pointerEvents="none" style={[styles.infoLabel, { color: colors.textSecondary }]}>
              {contact.altPhoneNumber}
            </Text>
          </Pressable>
        ) : null}
        {contact.location ? (
          <View style={styles.infoRow}>
            <Ionicons name="location" size={18} color="#EF6C00" />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{contact.location}</Text>
          </View>
        ) : null}
        {contact.district ? (
          <View style={styles.infoRow}>
            <Ionicons name="map" size={18} color="#00838F" />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              {districtLabel(contact.district, language)}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actionsRow}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t("contactActionsTitle")}</Text>
        <View style={styles.buttons}>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={() => openDialer(contact.phoneNumber)}
          >
            <Ionicons name="call" size={18} color="#FFFFFF" />
            <Text style={styles.primaryText}>{t("callNow")}</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: colors.surface }]}
            onPress={handleSms}
          >
            <Ionicons name="chatbox" size={18} color={colors.text} />
            <Text style={[styles.secondaryText, { color: colors.text }]}>{t("sendSms")}</Text>
          </Pressable>
          <Pressable onPress={() => shareContact(contact, language)}>
            <Ionicons name="share-social" size={22} color={colors.text} />
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 80,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    fontSize: 16,
  },
  hero: {
    width: "100%",
    height: 240,
    borderRadius: 20,
    marginBottom: 18,
  },
  heroPlaceholder: {
    width: "100%",
    height: 160,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  headerCopy: {
    flex: 1,
    paddingRight: 12,
  },
  favoriteBtn: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
  },
  infoCard: {
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  infoLabel: {
    fontWeight: "500",
  },
  actionsRow: {
    marginTop: 10,
  },
  sectionLabel: {
    marginBottom: 12,
    fontWeight: "600",
  },
  buttons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  secondaryText: {
    fontWeight: "700",
  },
});

export default ContactScreen;
