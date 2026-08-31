import { Linking, Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import type { DirectoryState, EmergencyContact, LanguageCode, LocalizedCopy } from "@/src/utils/types";
import { API_BASE_URL, CRITICAL_CONTACTS, DISTRICT_LABELS } from "@/src/utils/constants";

export const localize = (copy: LocalizedCopy | undefined, language: LanguageCode, fallback = "") => {
  if (!copy) {
    return fallback;
  }
  return copy[language] || copy.en || fallback;
};

export const districtLabel = (district: string | undefined, language: LanguageCode) => {
  if (!district) {
    return "";
  }
  return localize(DISTRICT_LABELS[district], language, district);
};

export const resolveImageUrl = (imageUrl?: string) => {
  if (!imageUrl) {
    return "";
  }
  const trimmed = imageUrl.trim();
  if (!trimmed) {
    return "";
  }
  if (/^data:/i.test(trimmed)) {
    return trimmed;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.pathname.startsWith("/uploads/")) {
        return `${API_BASE_URL}${parsed.pathname}`;
      }
    } catch {
      return trimmed;
    }
    return trimmed;
  }
  const pathname = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${API_BASE_URL}${pathname}`;
};

export const openDialer = async (phoneNumber: string) => {
  const telUrl = `tel:${phoneNumber}`;
  const supported = await Linking.canOpenURL(telUrl);
  if (supported) {
    await Linking.openURL(telUrl);
  }
};

export const openSMS = async (phoneNumber: string) => {
  const smsUrl = `sms:${phoneNumber}`;
  const supported = await Linking.canOpenURL(smsUrl);
  if (supported) {
    await Linking.openURL(smsUrl);
  } else {
    throw new Error("SMS_NOT_SUPPORTED");
  }
};

export const displayContactName = (contact: EmergencyContact, language: LanguageCode) => {
  const local = contact.nameLocal?.trim();
  if (local && language !== "en") {
    return local;
  }
  return contact.name;
};

export const displayContactAltName = (contact: EmergencyContact, language: LanguageCode) => {
  const local = contact.nameLocal?.trim();
  if (!local || local === contact.name) {
    return "";
  }
  return language === "en" ? local : contact.name;
};

export const formatContactCopy = (contact: EmergencyContact, language: LanguageCode = "en") => {
  const extra = contact.altPhoneNumber ? `\n${contact.altPhoneNumber}` : "";
  const district = contact.district ? `\n${districtLabel(contact.district, language)}` : "";
  const location = contact.location ? `\n${contact.location}` : "";
  const altName = displayContactAltName(contact, language);
  const title = displayContactName(contact, language);
  const names = altName ? `${title}\n${altName}` : title;
  return `${names}\n${contact.phoneNumber}${extra}${district}${location}`.trim();
};

export const copyPhoneNumber = async (phoneNumber: string) => {
  const value = phoneNumber.trim();
  if (!value) {
    return;
  }
  await Clipboard.setStringAsync(value);
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

export const shareContact = async (contact: EmergencyContact, language: LanguageCode = "en") => {
  await Share.share({ message: formatContactCopy(contact, language) });
};

export const filterContactsByQuery = (
  contacts: EmergencyContact[],
  query: string
): EmergencyContact[] => {
  if (!query.trim()) {
    return [];
  }
  const normalized = query.toLowerCase();
  return contacts.filter((contact) => {
    return (
      contact.name.toLowerCase().includes(normalized) ||
      (contact.nameLocal ?? "").toLowerCase().includes(normalized) ||
      contact.phoneNumber.includes(normalized) ||
      (contact.altPhoneNumber ?? "").includes(normalized) ||
      (contact.location ?? "").toLowerCase().includes(normalized) ||
      (contact.district ?? "").toLowerCase().includes(normalized) ||
      districtLabel(contact.district, "ps").toLowerCase().includes(normalized) ||
      districtLabel(contact.district, "dr").toLowerCase().includes(normalized)
    );
  });
};

export const filterContactsByDistrict = (
  contacts: EmergencyContact[],
  district?: string | null
): EmergencyContact[] => {
  if (!district) {
    return contacts;
  }
  const normalized = district.toLowerCase();
  return contacts.filter((contact) => {
    if (contact.isCritical) {
      return true;
    }
    const haystack = `${contact.district ?? ""} ${contact.location ?? ""}`.toLowerCase();
    return haystack.includes(normalized);
  });
};

export const sortContactsByLocation = (
  contacts: EmergencyContact[],
  userDistrict?: string | null
): EmergencyContact[] => {
  if (!userDistrict) {
    return contacts;
  }
  const normalizedDistrict = userDistrict.toLowerCase();
  return [...contacts].sort((a, b) => {
    const aMatch = (a.district ?? a.location ?? "").toLowerCase().includes(normalizedDistrict);
    const bMatch = (b.district ?? b.location ?? "").toLowerCase().includes(normalizedDistrict);
    if (a.isCritical !== b.isCritical) {
      return a.isCritical ? -1 : 1;
    }
    if (aMatch === bMatch) {
      return a.name.localeCompare(b.name);
    }
    return aMatch ? -1 : 1;
  });
};

export const uniqueContacts = (contacts: EmergencyContact[]): EmergencyContact[] => {
  const seen = new Set<string>();
  return contacts.filter((contact) => {
    if (seen.has(contact.id)) {
      return false;
    }
    seen.add(contact.id);
    return true;
  });
};

export const mergeCriticalIntoDirectory = (
  directory: DirectoryState,
  criticalList: EmergencyContact[] = CRITICAL_CONTACTS
): DirectoryState => {
  const next: DirectoryState = { ...directory };
  Object.keys(next).forEach((category) => {
    next[category] = (next[category] ?? [])
      .filter((contact) => contact.id !== "critical-fire-102")
      .map((contact) =>
        contact.id === "critical-ambulance-112" || (contact.category === "ambulance" && contact.phoneNumber === "112")
          ? { ...contact, id: "critical-ambulance-102", phoneNumber: "102" }
          : contact
      );
  });
  criticalList.forEach((contact) => {
    const existing = next[contact.category] ?? [];
    next[contact.category] = uniqueContacts([{ ...contact }, ...existing]);
  });
  return next;
};

export const safeJSONParse = <T>(value: string | null): T | null => {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export const isValidAfghanPhone = (value: string) =>
  /^(\+93|0)?[\d\s-]{8,15}$/.test(value.trim());
