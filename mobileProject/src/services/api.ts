import { API_BASE_URL } from "@/src/utils/constants";
import type { EmergencyContact, LocalizedCopy, ServiceCategory } from "@/src/utils/types";

interface ApiError {
  message?: string;
  code?: string;
  errors?: Array<{ msg?: string; message?: string }>;
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

let csrfToken = "";
let csrfInFlight: Promise<string> | null = null;

const resolveUrl = (path: string) => `${API_BASE_URL}${path}`;

const isSafeMethod = (method?: string) =>
  SAFE_METHODS.has(String(method || "GET").toUpperCase());

const needsCsrf = (path: string, method?: string) => {
  if (isSafeMethod(method) || path === "/api/csrf-token" || path === "/health") {
    return false;
  }
  return true;
};

const fetchCsrfToken = async (): Promise<string> => {
  if (csrfInFlight) {
    return csrfInFlight;
  }
  csrfInFlight = apiRequest<{ csrfToken: string }>("/api/csrf-token")
    .then((data) => {
      if (!data?.csrfToken) {
        throw new Error("Unable to start a secure session.");
      }
      csrfToken = data.csrfToken;
      return csrfToken;
    })
    .finally(() => {
      csrfInFlight = null;
    });
  return csrfInFlight;
};

const ensureCsrfToken = async (path: string, method?: string): Promise<string> => {
  if (!needsCsrf(path, method)) {
    return "";
  }
  if (!csrfToken) {
    await fetchCsrfToken();
  }
  return csrfToken;
};

const clearCsrfToken = () => {
  csrfToken = "";
};

const buildHeaders = (token?: string, hasBody?: boolean) => {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

type ApiRequestOptions = RequestInit & { _csrfRetry?: boolean };

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
  token?: string
): Promise<T> {
  const url = resolveUrl(path);
  const controller = new AbortController();
  const isAuthPath = path.startsWith("/api/auth/");
  const timeoutMs = isAuthPath ? 45000 : 60000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const { _csrfRetry, ...fetchOptions } = options;
  const csrf = await ensureCsrfToken(path, fetchOptions.method);

  let response: Response;
  try {
    response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        ...buildHeaders(token, Boolean(fetchOptions.body)),
        ...(csrf ? { "X-CSRF-Token": csrf } : {}),
        ...(fetchOptions.headers ?? {}),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out. Check your connection and try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let payload: ApiError | null = null;
    let message = `Request failed with status ${response.status}`;
    try {
      payload = (await response.json()) as ApiError;
      if (payload.message) {
        message = payload.message;
      } else if (Array.isArray(payload.errors) && payload.errors.length > 0) {
        message = payload.errors
          .map((item) => item.msg || item.message)
          .filter(Boolean)
          .join(", ");
      }
    } catch {
      // no-op: keep default message
    }

    if (response.status === 403 && payload?.code === "CSRF" && !_csrfRetry) {
      clearCsrfToken();
      return apiRequest<T>(path, { ...fetchOptions, _csrfRetry: true }, token);
    }

    const error = new Error(message || `Request failed with status ${response.status}`) as Error & {
      status?: number;
    };
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const fetchCategories = (token?: string) =>
  apiRequest<ServiceCategory[]>("/api/directory/categories", undefined, token);

export const fetchContactsByCategory = (
  category: string,
  token?: string,
  district?: string
) => {
  const params = new URLSearchParams({ category });
  if (district) {
    params.set("district", district);
  }
  return apiRequest<EmergencyContact[]>(
    `/api/directory/contacts?${params.toString()}`,
    undefined,
    token
  );
};

export const fetchContactById = (id: string, token?: string) =>
  apiRequest<EmergencyContact>(`/api/directory/contacts/${id}`, undefined, token);

export const searchContactsRemote = (query: string, token?: string, district?: string) => {
  const params = new URLSearchParams({ search: query });
  if (district) {
    params.set("district", district);
  }
  return apiRequest<EmergencyContact[]>(
    `/api/directory/contacts?${params.toString()}`,
    undefined,
    token
  );
};

export const fetchDistricts = (token?: string) =>
  apiRequest<string[]>("/api/directory/districts", undefined, token);

export interface AboutOverview {
  generatedAt?: string;
  coverage?: {
    province?: string;
    districtsCovered?: number;
    totalDistricts?: number;
  };
  totals?: {
    approved?: number;
    hospitals?: number;
    pharmacies?: number;
    clinics?: number;
    ngos?: number;
    fieldUnits?: number;
    criticalLines?: number;
  };
}

export const fetchAboutOverview = (token?: string) =>
  apiRequest<AboutOverview>("/api/directory/about", undefined, token);

export interface PolicySection {
  heading?: Partial<LocalizedCopy>;
  body?: Partial<LocalizedCopy>;
}

export interface PrivacyPolicy {
  id?: string;
  title?: Partial<LocalizedCopy>;
  subtitle?: Partial<LocalizedCopy>;
  sections?: PolicySection[];
  updatedAt?: string;
}

export const fetchPolicy = () => apiRequest<PrivacyPolicy>("/api/policy");

export const fetchTerms = () => apiRequest<PrivacyPolicy>("/api/policy/terms");

export const fetchCriticalContacts = () =>
  apiRequest<EmergencyContact[]>("/api/directory/critical");
