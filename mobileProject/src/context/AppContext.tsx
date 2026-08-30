import {
    fetchCategories,
    fetchContactById,
    fetchContactsByCategory,
    fetchCriticalContacts,
    searchContactsRemote,
} from "@/src/services/api";
import { deleteAccountRequest, fetchCurrentUser, loginRequest, registerRequest, verifyOtpRequest, type OtpPurpose } from "@/src/services/auth";
import {
  API_BASE_URL,
  CATEGORY_DEFINITIONS,
  CRITICAL_CONTACTS,
  STORAGE_KEYS,
  translations,
  type TranslationKey,
} from "@/src/utils/constants";
import {
    filterContactsByDistrict,
    filterContactsByQuery,
    mergeCriticalIntoDirectory,
    safeJSONParse,
    sortContactsByLocation,
    uniqueContacts,
} from "@/src/utils/helpers";
import type {
    DirectoryState,
    EmergencyContact,
    LanguageCode,
    ServiceCategory,
    UserProfile,
} from "@/src/utils/types";
import { LANGUAGE_CYCLE } from "@/src/utils/types";
import { getColors, type AppColors, type ThemeMode } from "@/src/theme/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { copyPhoneNumber } from "@/src/utils/helpers";
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";

interface AppContextValue {
  language: LanguageCode;
  toggleLanguage: () => void;
  setLanguageCode: (code: LanguageCode) => void;
  t: (key: TranslationKey, fallback?: string) => string;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  colors: AppColors;
  isReady: boolean;
  categories: ServiceCategory[];
  contactsByCategory: DirectoryState;
  isSyncing: boolean;
  isOffline: boolean;
  lastSyncedAt: number | null;
  favorites: EmergencyContact[];
  user: UserProfile | null;
  userDistrict: string | null;
  selectedDistrict: string | null;
  setSelectedDistrict: (district: string | null) => void;
  searchResults: EmergencyContact[];
  searchLoading: boolean;
  criticalContacts: EmergencyContact[];
  loadContacts: (categoryId: string, force?: boolean) => Promise<EmergencyContact[]>;
  getContact: (contactId: string) => Promise<EmergencyContact | null>;
  performSearch: (query: string) => Promise<void>;
  login: (
    email: string,
    password: string
  ) => Promise<{ requiresOtp: true; email: string; purpose: OtpPurpose } | { requiresOtp: false }>;
  register: (payload: {
    email: string;
    password: string;
    phoneNumber: string;
    fullName: string;
    organization?: string;
    role?: "provider" | "beneficiary";
  }) => Promise<{ requiresOtp: true; email: string; purpose: OtpPurpose } | { requiresOtp: false }>;
  verifyEmailOtp: (payload: {
    email: string;
    code: string;
    purpose: OtpPurpose;
  }) => Promise<void>;
  pendingOtp: { email: string; purpose: OtpPurpose } | null;
  setPendingOtp: (value: { email: string; purpose: OtpPurpose } | null) => void;
  logout: () => Promise<void>;
  toggleFavorite: (contactId: string) => Promise<void>;
  refreshFavorites: () => Promise<void>;
  refreshApp: () => Promise<void>;
  requestLocation: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  toastMessage: string | null;
  showToast: (message: string) => void;
  copyNumber: (phoneNumber: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const seedCriticalDirectory = (): DirectoryState => {
  const seeded: DirectoryState = {};
  CRITICAL_CONTACTS.forEach((contact) => {
    const list = seeded[contact.category] ?? [];
    seeded[contact.category] = [...list, { ...contact }];
  });
  return seeded;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [themeMode, setThemeModeState] = useState<ThemeMode>("light");
  const [categories, setCategories] = useState<ServiceCategory[]>(CATEGORY_DEFINITIONS);
  const [contactsByCategory, setContactsByCategory] = useState<DirectoryState>(seedCriticalDirectory);
  const [favorites, setFavorites] = useState<EmergencyContact[]>([]);
  const [searchResults, setSearchResults] = useState<EmergencyContact[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [userDistrict, setUserDistrict] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrictState] = useState<string | null>(null);
  const [pendingOtp, setPendingOtp] = useState<{ email: string; purpose: OtpPurpose } | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [criticalLines, setCriticalLines] = useState<EmergencyContact[]>(CRITICAL_CONTACTS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = useCallback(
    (key: TranslationKey, fallback?: string) => translations[key]?.[language] ?? fallback ?? key,
    [language]
  );

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    toastTimer.current = setTimeout(() => setToastMessage(null), 2200);
  }, []);

  const copyNumber = useCallback(
    async (phoneNumber: string) => {
      const value = phoneNumber.trim();
      if (!value) {
        return;
      }
      try {
        await copyPhoneNumber(value);
        showToast(`${t("numberCopied")}\n${value}`);
      } catch {
        showToast(t("retry"));
      }
    },
    [showToast, t]
  );

  const persistLanguage = useCallback(async (value: LanguageCode) => {
    setLanguage(value);
    await AsyncStorage.setItem(STORAGE_KEYS.language, value);
  }, []);

  const setLanguageCode = useCallback(
    (code: LanguageCode) => {
      persistLanguage(code).catch(() => undefined);
    },
    [persistLanguage]
  );

  const toggleLanguage = useCallback(() => {
    const index = LANGUAGE_CYCLE.indexOf(language);
    const next = LANGUAGE_CYCLE[(index + 1) % LANGUAGE_CYCLE.length];
    persistLanguage(next).catch(() => undefined);
  }, [language, persistLanguage]);

  const colors = useMemo(() => getColors(themeMode), [themeMode]);

  const persistTheme = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem(STORAGE_KEYS.theme, mode);
  }, []);

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      persistTheme(mode).catch(() => undefined);
    },
    [persistTheme]
  );

  const toggleTheme = useCallback(() => {
    persistTheme(themeMode === "light" ? "dark" : "light").catch(() => undefined);
  }, [persistTheme, themeMode]);

  const setSelectedDistrict = useCallback(async (district: string | null) => {
    setSelectedDistrictState(district);
    if (district) {
      await AsyncStorage.setItem(STORAGE_KEYS.districtFilter, district);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.districtFilter);
    }
  }, []);

  const hydrate = useCallback(async () => {
    const keys = [
      STORAGE_KEYS.language,
      STORAGE_KEYS.contacts,
      STORAGE_KEYS.token,
      STORAGE_KEYS.user,
      STORAGE_KEYS.favorites,
      STORAGE_KEYS.lastSync,
      STORAGE_KEYS.districtFilter,
      STORAGE_KEYS.theme,
      STORAGE_KEYS.criticalContacts,
      STORAGE_KEYS.apiBase,
    ];

    const storedEntries = await AsyncStorage.multiGet(keys);
    const dictionary = Object.fromEntries(storedEntries);

    const storedApiBase = dictionary[STORAGE_KEYS.apiBase];
    const apiChanged = Boolean(storedApiBase && storedApiBase !== API_BASE_URL);
    if (apiChanged) {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.token,
        STORAGE_KEYS.user,
        STORAGE_KEYS.contacts,
        STORAGE_KEYS.favorites,
        STORAGE_KEYS.lastSync,
      ]);
      dictionary[STORAGE_KEYS.token] = null;
      dictionary[STORAGE_KEYS.user] = null;
      dictionary[STORAGE_KEYS.contacts] = null;
      dictionary[STORAGE_KEYS.favorites] = null;
      dictionary[STORAGE_KEYS.lastSync] = null;
    }
    await AsyncStorage.setItem(STORAGE_KEYS.apiBase, API_BASE_URL);

    const savedLanguage = dictionary[STORAGE_KEYS.language];
    if (savedLanguage === "en" || savedLanguage === "ps" || savedLanguage === "dr") {
      setLanguage(savedLanguage);
    }

    const savedTheme = dictionary[STORAGE_KEYS.theme];
    if (savedTheme === "light" || savedTheme === "dark") {
      setThemeModeState(savedTheme);
    }

    const savedToken = dictionary[STORAGE_KEYS.token];
    const savedUser = safeJSONParse<UserProfile>(dictionary[STORAGE_KEYS.user] ?? null);
    if (savedToken) {
      try {
        const liveUser = await fetchCurrentUser(savedToken);
        setToken(savedToken);
        setUser(liveUser ?? savedUser);
      } catch (error) {
        const status = (error as { status?: number })?.status;
        if (status === 401) {
          await AsyncStorage.multiRemove([STORAGE_KEYS.token, STORAGE_KEYS.user]);
        } else {
          setToken(savedToken);
          if (savedUser) {
            setUser(savedUser);
          }
        }
      }
    }

    const savedCritical = safeJSONParse<EmergencyContact[]>(
      dictionary[STORAGE_KEYS.criticalContacts] ?? null
    );
    if (savedCritical?.length) {
      setCriticalLines(savedCritical);
    }

    const cachedContacts = safeJSONParse<DirectoryState>(dictionary[STORAGE_KEYS.contacts] ?? null);
    if (cachedContacts && savedToken) {
      setContactsByCategory(
        mergeCriticalIntoDirectory(cachedContacts, savedCritical?.length ? savedCritical : CRITICAL_CONTACTS)
      );
    } else {
      setContactsByCategory(seedCriticalDirectory());
    }

    const savedFavorites = safeJSONParse<EmergencyContact[]>(dictionary[STORAGE_KEYS.favorites] ?? null);
    if (savedFavorites) {
      setFavorites(savedFavorites);
    }

    const storedSync = dictionary[STORAGE_KEYS.lastSync];
    if (storedSync) {
      setLastSyncedAt(Number(storedSync));
    }

    const savedDistrict = dictionary[STORAGE_KEYS.districtFilter];
    if (savedDistrict) {
      setSelectedDistrictState(savedDistrict);
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    if (!token) {
      setCategories(CATEGORY_DEFINITIONS);
      return;
    }
    try {
      const remote = await fetchCategories(token ?? undefined);
      if (remote && remote.length) {
        setCategories(remote);
      }
      setIsOffline(false);
    } catch {
      setIsOffline(true);
      setCategories(CATEGORY_DEFINITIONS);
    }
  }, [token]);

  const persistContacts = useCallback(async (data: DirectoryState) => {
    await AsyncStorage.setItem(STORAGE_KEYS.contacts, JSON.stringify(data));
    const timestamp = Date.now();
    setLastSyncedAt(timestamp);
    await AsyncStorage.setItem(STORAGE_KEYS.lastSync, `${timestamp}`);
  }, []);

  const loadContacts = useCallback(
    async (categoryId: string, force = false) => {
      const applyFilters = (list: EmergencyContact[]) => {
        const districtScoped = filterContactsByDistrict(list, selectedDistrict);
        return sortContactsByLocation(districtScoped, userDistrict);
      };

      const cached = contactsByCategory[categoryId];
      if (!token) {
        return applyFilters(criticalLines.filter((c) => c.category === categoryId));
      }
      if (cached && !force) {
        return applyFilters(cached);
      }

      setIsSyncing(true);
      try {
        const remote = await fetchContactsByCategory(
          categoryId,
          token ?? undefined,
          selectedDistrict ?? undefined
        );
        const merged = uniqueContacts([
          ...criticalLines.filter((c) => c.category === categoryId),
          ...remote,
        ]);
        const updated = { ...contactsByCategory, [categoryId]: merged };
        setContactsByCategory(updated);
        await persistContacts(updated);
        setIsOffline(false);
        return applyFilters(merged);
      } catch {
        setIsOffline(true);
        const fallback = uniqueContacts([
          ...criticalLines.filter((c) => c.category === categoryId),
          ...(cached ?? []),
        ]);
        return applyFilters(fallback);
      } finally {
        setIsSyncing(false);
      }
    },
    [contactsByCategory, persistContacts, selectedDistrict, token, userDistrict, criticalLines]
  );

  const getContact = useCallback(
    async (contactId: string) => {
      const critical = criticalLines.find((contact) => contact.id === contactId);
      if (critical) {
        return { ...critical };
      }
      const cached = Object.values(contactsByCategory)
        .flat()
        .find((contact) => contact.id === contactId);
      if (cached) {
        return cached;
      }
      const favoriteMatch = favorites.find((contact) => contact.id === contactId);
      if (favoriteMatch) {
        return favoriteMatch;
      }
      if (!token) {
        return null;
      }
      try {
        return await fetchContactById(contactId, token);
      } catch {
        return null;
      }
    },
    [contactsByCategory, favorites, token, criticalLines]
  );

  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }
      if (!token) {
        setSearchResults([]);
        return;
      }
      setSearchLoading(true);
      try {
        const remote = await searchContactsRemote(
          query,
          token ?? undefined,
          selectedDistrict ?? undefined
        );
        const remoteFiltered = filterContactsByDistrict(
          filterContactsByQuery(remote, query),
          selectedDistrict
        );
        if (remoteFiltered.length) {
          setSearchResults(remoteFiltered);
        } else {
          const cached = Object.values(contactsByCategory).flat();
          const critical = [...criticalLines];
          setSearchResults(
            filterContactsByDistrict(
              filterContactsByQuery(uniqueContacts([...critical, ...cached]), query),
              selectedDistrict
            )
          );
        }
        setIsOffline(false);
      } catch {
        setIsOffline(true);
        const cached = Object.values(contactsByCategory).flat();
        const critical = [...criticalLines];
        setSearchResults(
          filterContactsByDistrict(
            filterContactsByQuery(uniqueContacts([...critical, ...cached]), query),
            selectedDistrict
          )
        );
      } finally {
        setSearchLoading(false);
      }
    },
    [contactsByCategory, selectedDistrict, token, criticalLines]
  );

  const refreshCritical = useCallback(async () => {
    try {
      const remote = await fetchCriticalContacts();
      if (remote?.length) {
        const mapped = remote.map((item) => ({ ...item, isCritical: true as const }));
        setCriticalLines(mapped);
        await AsyncStorage.setItem(STORAGE_KEYS.criticalContacts, JSON.stringify(mapped));
      }
    } catch {
      // Keep bundled or previously cached lines.
    }
  }, []);

  const refreshFavorites = useCallback(async () => {
    const stored = safeJSONParse<EmergencyContact[]>(
      await AsyncStorage.getItem(STORAGE_KEYS.favorites)
    );
    setFavorites(stored ?? []);
  }, []);

  const refreshApp = useCallback(async () => {
    await Promise.all([refreshCategories(), refreshFavorites(), refreshCritical()]);
  }, [refreshCategories, refreshFavorites, refreshCritical]);

  const persistAuthState = useCallback(async (authToken: string, profile: UserProfile) => {
    setToken(authToken);
    setUser(profile);
    // Persist off the critical path so OTP/login navigation feels instant.
    void AsyncStorage.multiSet([
      [STORAGE_KEYS.token, authToken],
      [STORAGE_KEYS.user, JSON.stringify(profile)],
    ]).catch(() => undefined);
    void fetchCategories(authToken)
      .then((remote) => {
        if (remote && remote.length) {
          setCategories(remote);
        }
      })
      .catch(() => undefined);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await loginRequest({ email, password });
      if ("requiresOtp" in response && response.requiresOtp) {
        const challenge = {
          requiresOtp: true as const,
          email: response.email,
          purpose: response.purpose,
        };
        setPendingOtp({ email: challenge.email, purpose: challenge.purpose });
        return challenge;
      }
      await persistAuthState(response.token, response.user);
      void refreshFavorites();
      return { requiresOtp: false as const };
    },
    [persistAuthState, refreshFavorites]
  );

  const register = useCallback(
    async (payload: {
      email: string;
      password: string;
      phoneNumber: string;
      fullName: string;
      organization?: string;
      role?: "provider" | "beneficiary";
    }) => {
      const response = await registerRequest(payload);
      if ("requiresOtp" in response && response.requiresOtp) {
        const challenge = {
          requiresOtp: true as const,
          email: response.email,
          purpose: response.purpose,
        };
        setPendingOtp({ email: challenge.email, purpose: challenge.purpose });
        return challenge;
      }
      await persistAuthState(response.token, response.user);
      void refreshFavorites();
      return { requiresOtp: false as const };
    },
    [persistAuthState, refreshFavorites]
  );

  const verifyEmailOtp = useCallback(
    async (payload: { email: string; code: string; purpose: OtpPurpose }) => {
      const response = await verifyOtpRequest(payload);
      if (!("token" in response) || !response.token || !("user" in response) || !response.user) {
        throw new Error("Unable to complete sign-in verification");
      }
      setPendingOtp(null);
      await persistAuthState(response.token, response.user);
      void refreshFavorites();
    },
    [persistAuthState, refreshFavorites]
  );

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    setFavorites([]);
    setSearchResults([]);
    setContactsByCategory(seedCriticalDirectory());
    setCategories(CATEGORY_DEFINITIONS);
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.token,
      STORAGE_KEYS.user,
      STORAGE_KEYS.favorites,
      STORAGE_KEYS.contacts,
    ]);
  }, []);

  const toggleFavorite = useCallback(
    async (contactId: string) => {
      if (!user) {
        Alert.alert(t("login"), t("favoritesGuardSubtitle"));
        return;
      }
      const exists = favorites.some((contact) => contact.id === contactId);
      let updated: EmergencyContact[] = [];
      if (exists) {
        updated = favorites.filter((contact) => contact.id !== contactId);
      } else {
        const contact = await getContact(contactId);
        if (!contact) {
          Alert.alert(t("retry"), t("searchEmpty"));
          return;
        }
        updated = uniqueContacts([...favorites, contact]);
      }
      setFavorites(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(updated));
    },
    [favorites, getContact, t, user]
  );

  const requestLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync(position.coords);
      const district = address[0]?.district ?? address[0]?.city ?? address[0]?.region ?? null;
      if (district) {
        setUserDistrict(district);
      }
    } catch {
      // ignore location failures
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const boot = async () => {
      try {
        await hydrate();
      } catch {
        // Keep bundled contacts if storage is unavailable.
      } finally {
        if (mounted) {
          setIsReady(true);
        }
      }
      if (!mounted) {
        return;
      }
      try {
        const remote = await fetchCriticalContacts();
        if (mounted && remote?.length) {
          const mapped = remote.map((item) => ({ ...item, isCritical: true as const }));
          setCriticalLines(mapped);
          await AsyncStorage.setItem(STORAGE_KEYS.criticalContacts, JSON.stringify(mapped));
        }
      } catch {
        // Keep bundled or previously cached lines.
      }
    };
    void boot();
    const failsafe = setTimeout(() => {
      if (mounted) {
        setIsReady(true);
      }
    }, 2000);
    return () => {
      mounted = false;
      clearTimeout(failsafe);
    };
    // Boot once. hydrate is stable enough for first paint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void refreshCategories();
  }, [refreshCategories]);

  const deleteAccount = useCallback(async () => {
    if (!token) {
      return;
    }
    await deleteAccountRequest(token);
    await logout();
  }, [logout, token]);

  const criticalContacts = criticalLines;

  const contextValue = useMemo<AppContextValue>(
    () => ({
      language,
      toggleLanguage,
      setLanguageCode,
      t,
      themeMode,
      setThemeMode,
      toggleTheme,
      colors,
      isReady,
      categories,
      contactsByCategory,
      isSyncing,
      isOffline,
      lastSyncedAt,
      favorites,
      user,
      userDistrict,
      selectedDistrict,
      setSelectedDistrict,
      searchResults,
      searchLoading,
      criticalContacts,
      loadContacts,
      getContact,
      performSearch,
      login,
      register,
      verifyEmailOtp,
      pendingOtp,
      setPendingOtp,
      logout,
      toggleFavorite,
      refreshFavorites,
      refreshApp,
      requestLocation,
      deleteAccount,
      toastMessage,
      showToast,
      copyNumber,
    }),
    [
      categories,
      contactsByCategory,
      criticalContacts,
      favorites,
      getContact,
      isOffline,
      isSyncing,
      language,
      lastSyncedAt,
      loadContacts,
      login,
      logout,
      pendingOtp,
      setPendingOtp,
      performSearch,
      refreshFavorites,
      refreshApp,
      register,
      verifyEmailOtp,
      requestLocation,
      deleteAccount,
      searchLoading,
      searchResults,
      selectedDistrict,
      setSelectedDistrict,
      setLanguageCode,
      t,
      themeMode,
      setThemeMode,
      toggleTheme,
      colors,
      isReady,
      toggleFavorite,
      toggleLanguage,
      user,
      userDistrict,
      toastMessage,
      showToast,
      copyNumber,
    ]
  );

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};
