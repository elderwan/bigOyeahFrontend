/**
 * FitBooking API Client
 *
 * Implements the official FitBooking Online API Reference:
 * - Base URL: http://localhost:8000/api/v1 (customizable via NEXT_PUBLIC_API_URL)
 * - JSON Common Envelope: { success, code, message, data, errors, meta, requestId, timestamp }
 * - Authentication: Bearer <access_token> stored under "fitbooking_access_token"
 * - Endpoints:
 *   1. POST  /auth/login     -> Sign in (username/email + password)
 *   2. POST  /auth/register  -> Sign up member account (HTTP 201)
 *   3. GET   /members/me     -> Read member profile & membership tier
 *   4. PATCH /members/me     -> Update member profile fields
 */

export const DEFAULT_API_BASE_URL = "http://localhost:8000/api/v1";
export const TOKEN_STORAGE_KEY = "fitbooking_access_token";

export function getApiBaseUrl(): string {
  if (typeof process !== "undefined") {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      const url = process.env.NEXT_PUBLIC_API_BASE_URL;
      return url.endsWith("/api/v1") ? url : `${url.replace(/\/+$/, "")}/api/v1`;
    }
  }
  return DEFAULT_API_BASE_URL;
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // Ignore storage issues in restricted environments
  }
}

export function clearAccessToken(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

export function generateRequestId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// -------------------------------------------------------------
// Envelope & Data Models
// -------------------------------------------------------------

export interface ApiEnvelope<T = any> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  errors?: any;
  meta?: any;
  requestId?: string;
  timestamp?: string;
}

export interface ApiUser {
  user_id: number;
  username: string;
  display_name: string;
  email: string;
  phone: string;
  role: "MEMBER" | "COACH" | "ADMIN";
  status: "ACTIVE" | "INACTIVE" | "PENDING" | string;
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: ApiUser;
}

export interface LoginRequest {
  username: string; // accepts account username or email
  password: string;
}

export interface MemberRegisterRequest {
  username: string;
  password: string;
  display_name: string;
  email: string;
  phone: string;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  birth_date?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  fitness_goal?: string | null;
}

export interface MemberProfileResponse {
  member_id: number;
  user_id: number;
  username: string;
  display_name: string;
  email: string;
  phone: string;
  level_id?: number;
  level_code?: string;
  level_name?: string;
  discount_rate?: number;
  total_spend?: number;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  birth_date: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  fitness_goal: string | null;
}

export interface MemberProfileUpdate {
  display_name?: string;
  email?: string;
  phone?: string;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  birth_date?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  fitness_goal?: string | null;
}

// -------------------------------------------------------------
// Custom API Error
// -------------------------------------------------------------

export class ApiError extends Error {
  status: number;
  code?: number;
  errors?: any;
  requestId?: string;
  isNetworkError: boolean;

  constructor(message: string, options: {
    status?: number;
    code?: number;
    errors?: any;
    requestId?: string;
    isNetworkError?: boolean;
  } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status || 500;
    this.code = options.code;
    this.errors = options.errors;
    this.requestId = options.requestId;
    this.isNetworkError = Boolean(options.isNetworkError);
  }
}

// -------------------------------------------------------------
// Request Dispatcher
// -------------------------------------------------------------

function formatValidationErrors(errors: any): string | null {
  if (!errors) return null;
  if (Array.isArray(errors)) {
    return errors.map((err) => {
      if (typeof err === "string") return err;
      if (err && typeof err === "object") {
        const field = Array.isArray(err.loc) ? err.loc[err.loc.length - 1] : err.field || "";
        const msg = err.msg || err.message || JSON.stringify(err);
        return field ? `${field}: ${msg}` : msg;
      }
      return String(err);
    }).join("; ");
  }
  if (typeof errors === "object") {
    return Object.entries(errors).map(([key, val]) => `${key}: ${val}`).join("; ");
  }
  return String(errors);
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { requiresAuth?: boolean; customToken?: string }
): Promise<ApiEnvelope<T>> {
  const baseUrl = getApiBaseUrl().replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${baseUrl}${normalizedPath}`;
  const requestId = generateRequestId();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Request-ID": requestId,
    ...(init?.headers as Record<string, string> || {})
  };

  if (init?.requiresAuth || init?.customToken || getAccessToken()) {
    const token = init?.customToken || getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers
    });
  } catch (netErr: any) {
    throw new ApiError(
      `Cannot connect to FitBooking backend at ${baseUrl}. Make sure your backend service is running.`,
      {
        status: 0,
        isNetworkError: true,
        requestId
      }
    );
  }

  let body: any = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      body = await response.json();
    } catch {
      body = null;
    }
  } else {
    try {
      const text = await response.text();
      body = { message: text };
    } catch {
      body = null;
    }
  }

  // Check envelope or status
  if (!response.ok || (body && body.success === false)) {
    const status = response.status;
    let message = body?.message || response.statusText || `Request failed with status ${status}`;
    const formattedValidation = formatValidationErrors(body?.errors || body?.detail);
    if (formattedValidation) {
      message = `${message} (${formattedValidation})`;
    }

    if (status === 401) {
      message = body?.message || "Invalid username or password. Please verify your credentials.";
    } else if (status === 409) {
      message = body?.message || "This account (username, email, or phone) is already registered.";
    } else if (status === 503) {
      message = body?.message || "Database is temporarily unavailable. Please try again shortly.";
    }

    throw new ApiError(message, {
      status,
      code: body?.code || status,
      errors: body?.errors || body?.detail,
      requestId: body?.requestId || requestId
    });
  }

  // If response has envelope format, return it
  if (body && typeof body === "object" && ("data" in body || "success" in body)) {
    return body as ApiEnvelope<T>;
  }

  // Wrap bare JSON in envelope
  return {
    success: true,
    code: response.status,
    message: "Success",
    data: body as T,
    requestId
  };
}

// -------------------------------------------------------------
// Endpoint API Methods
// -------------------------------------------------------------

/**
 * 1. Sign in: POST /auth/login
 */
export async function apiLogin(credentials: LoginRequest): Promise<AuthResponse> {
  const result = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      username: credentials.username.trim(),
      password: credentials.password
    })
  });
  if (result.data?.access_token) {
    setAccessToken(result.data.access_token);
  }
  return result.data;
}

/**
 * 2. Sign up: POST /auth/register
 */
export async function apiRegister(details: MemberRegisterRequest): Promise<AuthResponse> {
  const payload: MemberRegisterRequest = {
    username: details.username.trim(),
    password: details.password,
    display_name: details.display_name.trim(),
    email: details.email.trim().toLowerCase(),
    phone: details.phone.trim(),
    gender: details.gender || null,
    birth_date: details.birth_date || null,
    height_cm: details.height_cm ? Number(details.height_cm) : null,
    weight_kg: details.weight_kg ? Number(details.weight_kg) : null,
    fitness_goal: details.fitness_goal?.trim() || null
  };

  const result = await apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  if (result.data?.access_token) {
    setAccessToken(result.data.access_token);
  }
  return result.data;
}

/**
 * 3. Read member profile: GET /members/me
 */
export async function apiGetMemberProfile(): Promise<MemberProfileResponse> {
  const result = await apiFetch<MemberProfileResponse>("/members/me", {
    method: "GET",
    requiresAuth: true
  });
  return result.data;
}

/**
 * 4. Update member profile: PATCH /members/me
 */
export async function apiUpdateMemberProfile(changes: MemberProfileUpdate): Promise<MemberProfileResponse> {
  const payload: MemberProfileUpdate = {};
  if (changes.display_name !== undefined) payload.display_name = changes.display_name.trim();
  if (changes.email !== undefined) payload.email = changes.email.trim().toLowerCase();
  if (changes.phone !== undefined) payload.phone = changes.phone.trim();
  if (changes.gender !== undefined) payload.gender = changes.gender;
  if (changes.birth_date !== undefined) payload.birth_date = changes.birth_date;
  if (changes.height_cm !== undefined) payload.height_cm = changes.height_cm;
  if (changes.weight_kg !== undefined) payload.weight_kg = changes.weight_kg;
  if (changes.fitness_goal !== undefined) payload.fitness_goal = changes.fitness_goal?.trim() || null;

  const result = await apiFetch<MemberProfileResponse>("/members/me", {
    method: "PATCH",
    requiresAuth: true,
    body: JSON.stringify(payload)
  });
  return result.data;
}

/**
 * Health check probe to determine if backend is online
 */
export async function apiCheckHealth(): Promise<{ online: boolean; baseUrl: string; error?: string }> {
  const baseUrl = getApiBaseUrl().replace(/\/+$/, "");
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    // Ping base url or swagger or login endpoint
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: "OPTIONS",
      signal: controller.signal
    }).catch(() => null);
    clearTimeout(timeout);
    return { online: response !== null, baseUrl };
  } catch (err: any) {
    return { online: false, baseUrl, error: err.message };
  }
}
