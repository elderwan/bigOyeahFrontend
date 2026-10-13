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
export const API_URL_STORAGE_KEY = "fitbooking_custom_api_url";

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    try {
      const custom = window.localStorage.getItem(API_URL_STORAGE_KEY);
      if (custom && custom.trim()) return custom.trim();
    } catch {
      // ignore
    }
  }
  if (typeof process !== "undefined") {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      const url = process.env.NEXT_PUBLIC_API_BASE_URL;
      return url.endsWith("/api/v1") ? url : `${url.replace(/\/+$/, "")}/api/v1`;
    }
  }
  return DEFAULT_API_BASE_URL;
}

export function setCustomApiUrl(url: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!url) {
      window.localStorage.removeItem(API_URL_STORAGE_KEY);
    } else {
      window.localStorage.setItem(API_URL_STORAGE_KEY, url);
    }
  } catch {
    // ignore
  }
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
    const response = await fetch(`${baseUrl}/health`, {
      method: "GET",
      signal: controller.signal
    }).catch(() => null);
    clearTimeout(timeout);
    return { online: response !== null, baseUrl };
  } catch (err: any) {
    return { online: false, baseUrl, error: err.message };
  }
}

/**
 * Format API duration string (e.g. PT9H10M, PT8H) or time (09:10:00) into HH:MM
 */
export function formatApiTime(timeStr: string | null | undefined): string {
  if (!timeStr) return "";
  if (timeStr.startsWith("PT")) {
    const hoursMatch = timeStr.match(/(\d+)H/);
    const minutesMatch = timeStr.match(/(\d+)M/);
    const h = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const m = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  }
  return timeStr;
}

// -------------------------------------------------------------
// Member Endpoints
// -------------------------------------------------------------

export async function apiGetMemberDashboard(): Promise<any> {
  const res = await apiFetch<any>("/members/me/dashboard", { requiresAuth: true });
  return res.data;
}

export async function apiGetMemberBookings(): Promise<any[]> {
  const res = await apiFetch<any[]>("/members/me/bookings", { requiresAuth: true });
  return res.data || [];
}

export async function apiGetMemberBookingDetail(bookingId: number): Promise<any> {
  const res = await apiFetch<any>(`/members/me/bookings/${bookingId}`, { requiresAuth: true });
  return res.data;
}

export async function apiCancelBooking(bookingId: number, cancelReason?: string): Promise<any> {
  const res = await apiFetch<any>(`/members/me/bookings/${bookingId}/cancel`, {
    method: "POST",
    requiresAuth: true,
    body: JSON.stringify({ cancel_reason: cancelReason || "Cancelled by member" })
  });
  return res.data;
}

export async function apiGetMemberPackages(): Promise<any[]> {
  const res = await apiFetch<any[]>("/members/me/packages", { requiresAuth: true });
  return res.data || [];
}

export async function apiPurchasePackage(payload: { package_type: string; gym_id?: number }): Promise<any> {
  const res = await apiFetch<any>("/members/me/packages/purchase", {
    method: "POST",
    requiresAuth: true,
    body: JSON.stringify(payload)
  });
  return res.data;
}

export async function apiGetMemberProgress(): Promise<any> {
  const res = await apiFetch<any>("/members/me/progress", { requiresAuth: true });
  return res.data;
}

export async function apiUpdateMemberProgress(payload: any): Promise<any> {
  const res = await apiFetch<any>("/members/me/progress", {
    method: "PUT",
    requiresAuth: true,
    body: JSON.stringify(payload)
  });
  return res.data;
}

export async function apiGetMemberPaymentHistory(): Promise<any[]> {
  const res = await apiFetch<any[]>("/members/me/payment-history", { requiresAuth: true });
  return res.data || [];
}

export async function apiGetMemberPaymentMethods(): Promise<any[]> {
  const res = await apiFetch<any[]>("/members/me/payment-methods", { requiresAuth: true });
  return res.data || [];
}

export async function apiAddPaymentMethod(payload: {
  provider: string;
  card_token: string;
  last4: string;
  card_brand: string;
  exp_month: number;
  exp_year: number;
  is_default?: boolean;
}): Promise<any> {
  const res = await apiFetch<any>("/members/me/payment-methods", {
    method: "POST",
    requiresAuth: true,
    body: JSON.stringify(payload)
  });
  return res.data;
}

export async function apiDeletePaymentMethod(id: number): Promise<void> {
  await apiFetch<void>(`/members/me/payment-methods/${id}`, {
    method: "DELETE",
    requiresAuth: true
  });
}

export async function apiGetMemberMessages(otherUserId?: number): Promise<any[]> {
  const query = otherUserId ? `?other_user_id=${otherUserId}` : "";
  const res = await apiFetch<any[]>(`/members/me/messages${query}`, { requiresAuth: true });
  return res.data || [];
}

export async function apiSendMessage(payload: { receiver_id: number; content: string }): Promise<any> {
  const res = await apiFetch<any>("/members/me/messages", {
    method: "POST",
    requiresAuth: true,
    body: JSON.stringify(payload)
  });
  return res.data;
}

export async function apiCreateBooking(payload: {
  coach_id: number;
  course_id: number;
  gym_id?: number | null;
  package_id?: number | null;
  booking_date: string;
  start_time: string;
  duration_minutes: number;
  break_minutes: number;
  service_mode: "GYM" | "HOME";
  service_district?: string | null;
  service_address?: string | null;
  price: number;
}): Promise<any> {
  const res = await apiFetch<any>("/bookings", {
    method: "POST",
    requiresAuth: true,
    body: JSON.stringify(payload)
  });
  return res.data;
}

export async function apiCreateReview(payload: {
  booking_id: number;
  rating_professional: number;
  rating_communication: number;
  rating_punctuality: number;
  rating_effectiveness: number;
  comment?: string;
}): Promise<any> {
  const res = await apiFetch<any>("/members/me/reviews", {
    method: "POST",
    requiresAuth: true,
    body: JSON.stringify(payload)
  });
  return res.data;
}

// -------------------------------------------------------------
// Catalog Endpoints
// -------------------------------------------------------------

export async function apiGetGyms(): Promise<any[]> {
  const res = await apiFetch<any[]>("/gyms");
  return res.data || [];
}

export async function apiGetCourses(): Promise<any[]> {
  const res = await apiFetch<any[]>("/courses");
  return res.data || [];
}

export async function apiGetPackagesCatalog(): Promise<any[]> {
  const res = await apiFetch<any[]>("/packages");
  return res.data || [];
}

export async function apiGetCoaches(params?: {
  search?: string;
  district?: string;
  course_id?: number;
  service_mode?: string;
  page?: number;
  page_size?: number;
}): Promise<any> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.append("search", params.search);
  if (params?.district) searchParams.append("district", params.district);
  if (params?.course_id) searchParams.append("course_id", String(params.course_id));
  if (params?.service_mode) searchParams.append("service_mode", params.service_mode);
  if (params?.page) searchParams.append("page", String(params.page));
  if (params?.page_size) searchParams.append("page_size", String(params.page_size));

  const query = searchParams.toString();
  const res = await apiFetch<any>(`/coaches${query ? `?${query}` : ""}`);
  return res.data;
}

export async function apiGetCoachProfile(coachId: number): Promise<any> {
  const res = await apiFetch<any>(`/coaches/${coachId}/profile`);
  return res.data;
}

export async function apiGetCoachScheduleSlots(coachId: number, startAt: string, endAt: string): Promise<any[]> {
  const params = new URLSearchParams({ start_at: startAt, end_at: endAt });
  const res = await apiFetch<any[]>(`/coaches/${coachId}/schedule/slots?${params}`);
  return res.data || [];
}

// -------------------------------------------------------------
// Coach Endpoints
// -------------------------------------------------------------

export async function apiUpdateCoachProfile(payload: {
  display_name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  service_mode?: string;
  break_interval?: number;
}): Promise<any> {
  const res = await apiFetch<any>("/coaches/me", {
    method: "PATCH",
    requiresAuth: true,
    body: JSON.stringify(payload)
  });
  return res.data;
}

// -------------------------------------------------------------
// Admin Endpoints
// -------------------------------------------------------------

export async function apiGetAdminDashboard(days: number = 30): Promise<any> {
  const res = await apiFetch<any>(`/admin/dashboard?days=${days}`, { requiresAuth: true });
  return res.data;
}

export async function apiGetAdminAuditLog(limit: number = 50): Promise<any[]> {
  const res = await apiFetch<any[]>(`/admin/audit-log?limit=${limit}`, { requiresAuth: true });
  return res.data || [];
}

export async function apiGetAdminMembers(params?: {
  search?: string;
  status?: string;
  level_code?: string;
  page?: number;
  page_size?: number;
}): Promise<any> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.append("search", params.search);
  if (params?.status) searchParams.append("status", params.status);
  if (params?.level_code) searchParams.append("level_code", params.level_code);
  if (params?.page) searchParams.append("page", String(params.page));
  if (params?.page_size) searchParams.append("page_size", String(params.page_size));

  const query = searchParams.toString();
  const res = await apiFetch<any>(`/admin/members${query ? `?${query}` : ""}`, { requiresAuth: true });
  return res.data;
}

export async function apiUpdateMemberStatus(userId: number, status: "ACTIVE" | "DISABLED"): Promise<any> {
  const res = await apiFetch<any>(`/admin/members/${userId}/status`, {
    method: "PATCH",
    requiresAuth: true,
    body: JSON.stringify({ status })
  });
  return res.data;
}

export async function apiGetAdminCoaches(params?: {
  search?: string;
  status?: string;
  coach_level?: string;
  page?: number;
  page_size?: number;
}): Promise<any> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.append("search", params.search);
  if (params?.status) searchParams.append("status", params.status);
  if (params?.coach_level) searchParams.append("coach_level", params.coach_level);
  if (params?.page) searchParams.append("page", String(params.page));
  if (params?.page_size) searchParams.append("page_size", String(params.page_size));

  const query = searchParams.toString();
  const res = await apiFetch<any>(`/admin/coaches${query ? `?${query}` : ""}`, { requiresAuth: true });
  return res.data;
}

export async function apiUpdateCoachStatus(coachId: number, status: "ACTIVE" | "ON_LEAVE" | "RESIGNED"): Promise<any> {
  const res = await apiFetch<any>(`/admin/coaches/${coachId}/status`, {
    method: "PATCH",
    requiresAuth: true,
    body: JSON.stringify({ status })
  });
  return res.data;
}

export async function apiGetAdminBookings(params?: {
  status?: string;
  coach_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}): Promise<any> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append("status", params.status);
  if (params?.coach_id) searchParams.append("coach_id", String(params.coach_id));
  if (params?.date_from) searchParams.append("date_from", params.date_from);
  if (params?.date_to) searchParams.append("date_to", params.date_to);
  if (params?.page) searchParams.append("page", String(params.page));
  if (params?.page_size) searchParams.append("page_size", String(params.page_size));

  const query = searchParams.toString();
  const res = await apiFetch<any>(`/admin/bookings${query ? `?${query}` : ""}`, { requiresAuth: true });
  return res.data;
}

export async function apiGetAdminKpi(year?: number, month?: number): Promise<any> {
  const searchParams = new URLSearchParams();
  if (year) searchParams.append("year", String(year));
  if (month) searchParams.append("month", String(month));
  const query = searchParams.toString();
  const res = await apiFetch<any>(`/admin/kpi${query ? `?${query}` : ""}`, { requiresAuth: true });
  return res.data;
}

export async function apiUpdateKpiRule(
  coachLevel: string,
  payload: { min_monthly_hours: number; min_avg_rating: number; min_retention_rate: number }
): Promise<any> {
  const res = await apiFetch<any>(`/admin/kpi/rules/${coachLevel}`, {
    method: "PUT",
    requiresAuth: true,
    body: JSON.stringify(payload)
  });
  return res.data;
}

export async function apiGetAdminRevenue(days: number = 30): Promise<any> {
  const res = await apiFetch<any>(`/admin/revenue?days=${days}`, { requiresAuth: true });
  return res.data;
}

export async function apiUpdateLocationStatus(gymId: number, isActive: number | boolean): Promise<any> {
  const res = await apiFetch<any>(`/admin/locations/${gymId}/status`, {
    method: "PATCH",
    requiresAuth: true,
    body: JSON.stringify({ is_active: typeof isActive === "boolean" ? (isActive ? 1 : 0) : isActive })
  });
  return res.data;
}

export async function apiUpdateCourseStatus(courseId: number, isActive: number | boolean): Promise<any> {
  const res = await apiFetch<any>(`/admin/courses/${courseId}/status`, {
    method: "PATCH",
    requiresAuth: true,
    body: JSON.stringify({ is_active: typeof isActive === "boolean" ? (isActive ? 1 : 0) : isActive })
  });
  return res.data;
}

export async function apiUpdatePackageStatus(packageType: string, isActive: number | boolean): Promise<any> {
  const encoded = encodeURIComponent(packageType);
  const res = await apiFetch<any>(`/admin/packages/${encoded}/status`, {
    method: "PATCH",
    requiresAuth: true,
    body: JSON.stringify({ is_active: typeof isActive === "boolean" ? (isActive ? 1 : 0) : isActive })
  });
  return res.data;
}

