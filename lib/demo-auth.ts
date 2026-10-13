import {
  apiLogin,
  apiRegister,
  apiGetMemberProfile,
  apiUpdateMemberProfile,
  setAccessToken,
  clearAccessToken,
  getAccessToken,
  ApiError
} from "./api-client";

export type DemoRole = "MEMBER" | "COACH" | "ADMIN";

export interface DemoAccount {
  user_id: number;
  username: string;
  display_name: string;
  email: string;
  phone: string;
  role: DemoRole;
  status: "ACTIVE";
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  birth_date: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  fitness_goal: string | null;
  coach_no?: string;
  password_hash: string;
  // Live API Profile fields
  member_id?: number;
  level_id?: number;
  level_code?: string;
  level_name?: string;
  discount_rate?: number;
  total_spend?: number;
  is_live_backend?: boolean;
}

export type PublicDemoAccount = Omit<DemoAccount, "password_hash">;

export const DEMO_ACCOUNTS_KEY = "fitbooking.demo.accounts.v1";
export const DEMO_SESSION_KEY = "fitbooking.demo.session.v1";
export const DEMO_MESSAGES_KEY = "fitbooking.demo.messages.v1";

const seededCredentials = [
  {
    username: "alex.demo",
    display_name: "Alex Morgan",
    email: "alex.demo@example.com",
    phone: "+66812345678",
    role: "MEMBER",
    password: "DemoPass123!",
    gender: "MALE",
    birth_date: "1996-06-14",
    height_cm: 175,
    weight_kg: 68,
    fitness_goal: "Build muscle and improve strength"
  },
  {
    username: "tan.coach",
    display_name: "Tan Chaiyaporn",
    email: "tan.coach@example.com",
    phone: "+66812345680",
    role: "COACH",
    coach_no: "1001",
    password: "DemoPass123!",
    gender: "MALE",
    birth_date: "1990-05-18",
    height_cm: 178,
    weight_kg: 76,
    fitness_goal: null
  },
  {
    username: "admin.demo",
    display_name: "FitBooking Admin",
    email: "admin.demo@example.com",
    phone: "+66812345682",
    role: "ADMIN",
    password: "DemoPass123!",
    gender: null,
    birth_date: null,
    height_cm: null,
    weight_kg: null,
    fitness_goal: null
  },
  // Legacy aliases
  {
    username: "alex",
    display_name: "Alex Morgan",
    email: "alex.morgan@example.com",
    phone: "+66812345678",
    role: "MEMBER",
    password: "FitBooking123!",
    gender: "OTHER",
    birth_date: "1996-06-14",
    height_cm: 172,
    weight_kg: 68,
    fitness_goal: "Build strength and move with more confidence"
  },
  {
    username: "coach.tan",
    display_name: "Tan Chaiyaporn",
    email: "tan@fitbooking.local",
    phone: "+66823456789",
    role: "COACH",
    coach_no: "1001",
    password: "Coach@123",
    gender: "MALE",
    birth_date: "1990-05-18",
    height_cm: 178,
    weight_kg: 76,
    fitness_goal: null
  },
  {
    username: "FB-ADMIN-001",
    display_name: "FitBooking Admin",
    email: "admin@fitbooking.local",
    phone: "+66834567890",
    role: "ADMIN",
    password: "Admin@123",
    gender: null,
    birth_date: null,
    height_cm: null,
    weight_kg: null,
    fitness_goal: null
  }
] as const;
const PASSWORD_HASH_ITERATIONS = 120_000;

function safeReadAccounts(): DemoAccount[] {
  try {
    const raw = window.localStorage.getItem(DEMO_ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is DemoAccount =>
      typeof entry === "object" &&
      entry !== null &&
      typeof (entry as DemoAccount).username === "string" &&
      typeof (entry as DemoAccount).password_hash === "string" &&
      ["MEMBER", "COACH", "ADMIN"].includes((entry as DemoAccount).role)
    );
  } catch {
    throw new Error("Saved demo profiles could not be read. Clear this site's local storage and try again.");
  }
}

function toPublicAccount(account: DemoAccount): PublicDemoAccount {
  const { password_hash: _passwordHash, ...publicAccount } = account;
  return publicAccount;
}

function generateSalt(length = 16): string {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.getRandomValues) {
    try {
      return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(length)), (byte) => byte.toString(16).padStart(2, "0")).join("");
    } catch {
      // Fallback below
    }
  }
  return Array.from({ length }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")).join("");
}

function sha256Sync(input: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  const utf8 = unescape(encodeURIComponent(input));
  const bytes: number[] = [];
  for (let i = 0; i < utf8.length; i++) bytes.push(utf8.charCodeAt(i));
  const byteLen = bytes.length;
  bytes.push(0x80);
  while ((bytes.length % 64) !== 56) bytes.push(0);
  const bitLenHi = Math.floor((byteLen * 8) / 0x100000000);
  const bitLenLo = (byteLen * 8) & 0xffffffff;
  bytes.push((bitLenHi >>> 24) & 0xff, (bitLenHi >>> 16) & 0xff, (bitLenHi >>> 8) & 0xff, bitLenHi & 0xff);
  bytes.push((bitLenLo >>> 24) & 0xff, (bitLenLo >>> 16) & 0xff, (bitLenLo >>> 8) & 0xff, bitLenLo & 0xff);

  for (let offset = 0; offset < bytes.length; offset += 64) {
    const w = new Int32Array(64);
    for (let i = 0; i < 16; i++) {
      const idx = offset + i * 4;
      w[i] = (bytes[idx] << 24) | (bytes[idx + 1] << 16) | (bytes[idx + 2] << 8) | bytes[idx + 3];
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ ((~e) & g);
      const temp1 = (h + S1 + ch + k[i] + w[i]) | 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + temp1) | 0; d = c; c = b; b = a; a = (temp1 + temp2) | 0;
    }
    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
  }
  return [h0, h1, h2, h3, h4, h5, h6, h7].map((v) => (v >>> 0).toString(16).padStart(8, "0")).join("");
}

async function derivePasswordHash(password: string, salt: string): Promise<string> {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.subtle) {
    try {
      const key = await globalThis.crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
      const bits = await globalThis.crypto.subtle.deriveBits({
        name: "PBKDF2",
        salt: new TextEncoder().encode(salt),
        iterations: PASSWORD_HASH_ITERATIONS,
        hash: "SHA-256"
      }, key, 256);
      const digest = Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, "0")).join("");
      return `pbkdf2-sha256$${PASSWORD_HASH_ITERATIONS}$${salt}$${digest}`;
    } catch {
      // Fall through to fallback
    }
  }
  const digest = sha256Sync(`${salt}:${password}`);
  return `sha256$1$${salt}$${digest}`;
}

async function hashPassword(password: string): Promise<string> {
  const salt = generateSalt(16);
  return derivePasswordHash(password, salt);
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split("$");
  if (parts.length < 4) return false;
  const [algo, iterations, salt, expected] = parts;

  if (algo === "sha256") {
    const actual = sha256Sync(`${salt}:${password}`);
    return actual === expected;
  }

  if (algo === "pbkdf2-sha256") {
    if (typeof globalThis !== "undefined" && globalThis.crypto?.subtle) {
      try {
        const actual = await derivePasswordHash(password, salt);
        return actual.split("$")[3] === expected;
      } catch {
        // Fall through
      }
    }
    const seed = seededCredentials.find((s) => s.password === password);
    if (seed && salt === `fitbooking-demo:${seed.username}`) {
      return true;
    }
  }

  return false;
}

export function readDemoSession(): PublicDemoAccount | null {
  try {
    const raw = window.localStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const account = parsed as PublicDemoAccount;
    if (
      typeof account.user_id !== "number" ||
      typeof account.display_name !== "string" ||
      typeof account.email !== "string" ||
      !["MEMBER", "COACH", "ADMIN"].includes(account.role)
    ) {
      window.localStorage.removeItem(DEMO_SESSION_KEY);
      return null;
    }
    return account;
  } catch {
    throw new Error("Your saved local demo session could not be read. Clear this site's local storage and sign in again.");
  }
}

export function saveDemoSession(account: PublicDemoAccount): void {
  window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(account));
}

export function clearDemoSession(): void {
  window.localStorage.removeItem(DEMO_SESSION_KEY);
  clearAccessToken();
}

export async function registerDemoMember(
  input: Omit<DemoAccount, "user_id" | "role" | "status" | "password_hash" | "coach_no"> & { password: string }
): Promise<PublicDemoAccount> {
  // 1. Attempt to register via live FitBooking API (POST /auth/register)
  try {
    const authData = await apiRegister({
      username: input.username,
      password: input.password,
      display_name: input.display_name,
      email: input.email,
      phone: input.phone,
      gender: input.gender,
      birth_date: input.birth_date,
      height_cm: input.height_cm,
      weight_kg: input.weight_kg,
      fitness_goal: input.fitness_goal
    });

    if (authData?.user) {
      let liveProfile: Partial<PublicDemoAccount> = {};
      try {
        const profile = await apiGetMemberProfile();
        if (profile) {
          liveProfile = {
            member_id: profile.member_id,
            level_id: profile.level_id,
            level_code: profile.level_code,
            level_name: profile.level_name,
            discount_rate: profile.discount_rate,
            total_spend: profile.total_spend
          };
        }
      } catch {
        // Profile enrichment optional
      }

      const liveAccount: PublicDemoAccount = {
        user_id: authData.user.user_id,
        username: authData.user.username,
        display_name: authData.user.display_name,
        email: authData.user.email,
        phone: authData.user.phone,
        role: "MEMBER",
        status: "ACTIVE",
        gender: input.gender,
        birth_date: input.birth_date,
        height_cm: input.height_cm,
        weight_kg: input.weight_kg,
        fitness_goal: input.fitness_goal,
        ...liveProfile,
        is_live_backend: true
      };

      saveDemoSession(liveAccount);
      return liveAccount;
    }
  } catch (err: any) {
    if (err instanceof ApiError && !err.isNetworkError) {
      throw err;
    }
  }

  // 2. Fallback to local demo accounts
  const accounts = safeReadAccounts();
  const username = input.username.trim();
  const email = input.email.trim().toLowerCase();
  if (!username || !input.display_name.trim() || !email || !input.phone.trim()) {
    throw new Error("Enter a username, full name, email, and phone number.");
  }
  if (seededCredentials.some((account) =>
    account.username.toLowerCase() === username.toLowerCase() ||
    account.email.toLowerCase() === email
  )) {
    throw new Error("That username or email is reserved for a FitBooking demo profile.");
  }
  if (accounts.some((account) => account.username.toLowerCase() === username.toLowerCase())) {
    throw new Error("That username is already registered in this browser.");
  }
  if (accounts.some((account) => account.email.toLowerCase() === email)) {
    throw new Error("That email is already registered in this browser.");
  }
  const password_hash = await hashPassword(input.password);
  const account: DemoAccount = {
    user_id: Date.now(),
    username,
    display_name: input.display_name.trim(),
    email,
    phone: input.phone.trim(),
    role: "MEMBER",
    status: "ACTIVE",
    gender: input.gender,
    birth_date: input.birth_date,
    height_cm: input.height_cm,
    weight_kg: input.weight_kg,
    fitness_goal: input.fitness_goal?.trim() || null,
    password_hash
  };
  window.localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
  return toPublicAccount(account);
}

export async function signInDemoUser(
  identifier: string,
  password: string,
  role: DemoRole
): Promise<PublicDemoAccount> {
  // 1. Attempt to authenticate via live FitBooking API (POST /auth/login)
  try {
    const authData = await apiLogin({
      username: identifier,
      password
    });

    if (authData?.user) {
      if (role && authData.user.role !== role) {
        throw new Error(`This account role is "${authData.user.role}", but you selected "${role}".`);
      }

      let liveProfile: Partial<PublicDemoAccount> = {};
      if (authData.user.role === "MEMBER") {
        try {
          const profile = await apiGetMemberProfile();
          if (profile) {
            liveProfile = {
              member_id: profile.member_id,
              gender: profile.gender,
              birth_date: profile.birth_date,
              height_cm: profile.height_cm,
              weight_kg: profile.weight_kg,
              fitness_goal: profile.fitness_goal,
              level_id: profile.level_id,
              level_code: profile.level_code,
              level_name: profile.level_name,
              discount_rate: profile.discount_rate,
              total_spend: profile.total_spend
            };
          }
        } catch {
          // Profile enrichment optional
        }
      }

      const liveAccount: PublicDemoAccount = {
        user_id: authData.user.user_id,
        username: authData.user.username,
        display_name: authData.user.display_name,
        email: authData.user.email,
        phone: authData.user.phone,
        role: authData.user.role,
        status: "ACTIVE",
        gender: liveProfile.gender ?? null,
        birth_date: liveProfile.birth_date ?? null,
        height_cm: liveProfile.height_cm ?? null,
        weight_kg: liveProfile.weight_kg ?? null,
        fitness_goal: liveProfile.fitness_goal ?? null,
        ...liveProfile,
        is_live_backend: true
      };

      saveDemoSession(liveAccount);
      return liveAccount;
    }
  } catch (err: any) {
    if (err instanceof ApiError && !err.isNetworkError) {
      throw err;
    }
  }

  // 2. Fallback to local demo accounts
  const accounts = safeReadAccounts();
  const normalizedIdentifier = identifier.trim().toLowerCase();
  const matchesIdentifier = (entry: { username: string; email: string; role: string }) =>
    entry.role === role &&
    (entry.username.toLowerCase() === normalizedIdentifier || entry.email.toLowerCase() === normalizedIdentifier);
  const seedIndex = seededCredentials.findIndex(matchesIdentifier);
  const registeredMatch = accounts.find(matchesIdentifier);
  let match: DemoAccount | undefined = registeredMatch || (seedIndex < 0 ? undefined : (() => {
    const entry = seededCredentials[seedIndex];
    return {
      user_id: seedIndex + 1,
      username: entry.username,
      display_name: entry.display_name,
      email: entry.email,
      phone: entry.phone,
      role: entry.role,
      status: "ACTIVE" as const,
      gender: entry.gender,
      birth_date: entry.birth_date,
      height_cm: entry.height_cm,
      weight_kg: entry.weight_kg,
      fitness_goal: entry.fitness_goal,
      ...("coach_no" in entry ? { coach_no: entry.coach_no } : {}),
      password_hash: ""
    } satisfies DemoAccount;
  })());
  const validPassword = match
    ? seedIndex >= 0 && match.password_hash === ""
      ? password === seededCredentials[seedIndex].password
      : await verifyPassword(password, match.password_hash)
    : false;
  if (!match || !validPassword) {
    throw new Error("The ID, password, or account type doesn’t match. Check your details and try again.");
  }
  if (seedIndex >= 0 && match.password_hash === "") {
    match.password_hash = await derivePasswordHash(password, `fitbooking-demo:${seededCredentials[seedIndex].username}`);
  }
  if (!accounts.some((account) => account.user_id === match.user_id)) {
    window.localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify([...accounts, match]));
  }
  return toPublicAccount(match);
}

export function getLocalAccounts(): PublicDemoAccount[] {
  return safeReadAccounts().map(toPublicAccount);
}

export async function updateDemoMember(
  userId: number,
  changes: Partial<Pick<PublicDemoAccount, "display_name" | "email" | "phone" | "birth_date" | "gender" | "height_cm" | "weight_kg" | "fitness_goal">>
): Promise<PublicDemoAccount> {
  const token = getAccessToken();
  if (token) {
    try {
      const updatedProfile = await apiUpdateMemberProfile(changes);
      const current = readDemoSession();
      if (current) {
        const next: PublicDemoAccount = {
          ...current,
          display_name: updatedProfile.display_name || current.display_name,
          email: updatedProfile.email || current.email,
          phone: updatedProfile.phone || current.phone,
          gender: updatedProfile.gender !== undefined ? updatedProfile.gender : current.gender,
          birth_date: updatedProfile.birth_date !== undefined ? updatedProfile.birth_date : current.birth_date,
          height_cm: updatedProfile.height_cm !== undefined ? updatedProfile.height_cm : current.height_cm,
          weight_kg: updatedProfile.weight_kg !== undefined ? updatedProfile.weight_kg : current.weight_kg,
          fitness_goal: updatedProfile.fitness_goal !== undefined ? updatedProfile.fitness_goal : current.fitness_goal,
          level_id: updatedProfile.level_id ?? current.level_id,
          level_code: updatedProfile.level_code ?? current.level_code,
          level_name: updatedProfile.level_name ?? current.level_name,
          discount_rate: updatedProfile.discount_rate ?? current.discount_rate,
          total_spend: updatedProfile.total_spend ?? current.total_spend,
          is_live_backend: true
        };
        saveDemoSession(next);
        return next;
      }
    } catch (err: any) {
      if (err instanceof ApiError && !err.isNetworkError) {
        throw err;
      }
    }
  }

  const accounts = safeReadAccounts();
  const index = accounts.findIndex((account) => account.user_id === userId);
  if (index < 0) {
    const current = readDemoSession();
    if (current && current.user_id === userId) {
      const next = { ...current, ...changes };
      saveDemoSession(next);
      return next;
    }
    throw new Error("This local member profile was not found. Sign in again and retry.");
  }
  const updated: DemoAccount = { ...accounts[index], ...changes };
  updated.display_name = updated.display_name.trim();
  updated.email = updated.email.trim().toLowerCase();
  updated.phone = updated.phone.trim();
  if (!updated.display_name || !updated.email || !updated.phone) {
    throw new Error("Full name, email address, and phone number are required.");
  }
  if (accounts.some((account, currentIndex) =>
    currentIndex !== index && account.email.toLowerCase() === updated.email
  )) {
    throw new Error("That email address is already used by another local profile.");
  }
  const next = [...accounts];
  next[index] = updated;
  window.localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(next));
  return toPublicAccount(updated);
}
