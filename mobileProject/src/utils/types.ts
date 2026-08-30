export type LanguageCode = "en" | "ps" | "dr";

export interface LocalizedCopy {
  en: string;
  ps: string;
  dr: string;
}

export interface ServiceCategory {
  id: string;
  slug: string;
  icon: string;
  color: string;
  accent: string;
  gradient: [string, string];
  sticker: LocalizedCopy;
  title: LocalizedCopy;
  description: LocalizedCopy;
}

export interface EmergencyContact {
  id: string;
  name: string;
  nameLocal?: string;
  organization?: string;
  phoneNumber: string;
  category: string;
  location: string;
  district?: string;
  imageUrl?: string;
  description?: string;
  altPhoneNumber?: string;
  availability?: string;
  latitude?: number;
  longitude?: number;
  supportSms?: boolean;
  isCritical?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  phoneNumber?: string;
  fullName?: string;
  organization?: string;
  role?: "admin" | "provider" | "beneficiary";
  status?: "pending" | "active" | "suspended";
  emailVerified?: boolean;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface DirectoryState {
  [category: string]: EmergencyContact[];
}

export const LANGUAGE_CYCLE: LanguageCode[] = ["en", "ps", "dr"];

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: "English",
  ps: "پښتو",
  dr: "دری",
};
