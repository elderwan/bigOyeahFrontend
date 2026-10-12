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
}

export type PublicDemoAccount = Omit<DemoAccount, "password_hash">;

export const DEMO_ACCOUNTS_KEY = "fitbooking.demo.accounts.v1";
export const DEMO_SESSION_KEY = "fitbooking.demo.session.v1";
export const DEMO_MESSAGES_KEY = "fitbooking.demo.messages.v1";

const seededCredentials = [
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

async function derivePasswordHash(password: string, salt: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error("This browser cannot securely prepare a local demo password. Use a current browser on localhost or HTTPS.");
  }
  const key = await globalThis.crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await globalThis.crypto.subtle.deriveBits({
    name: "PBKDF2",
    salt: new TextEncoder().encode(salt),
    iterations: PASSWORD_HASH_ITERATIONS,
    hash: "SHA-256"
  }, key, 256);
  const digest = Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `pbkdf2-sha256$${PASSWORD_HASH_ITERATIONS}$${salt}$${digest}`;
}

async function hashPassword(password: string): Promise<string> {
  const salt = Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return derivePasswordHash(password, salt);
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [, iterations, salt, expected] = storedHash.split("$");
  if (iterations !== String(PASSWORD_HASH_ITERATIONS) || !salt || !expected) return false;
  const actual = await derivePasswordHash(password, salt);
  return actual.split("$")[3] === expected;
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
}

export async function registerDemoMember(
  input: Omit<DemoAccount, "user_id" | "role" | "status" | "password_hash" | "coach_no"> & { password: string }
): Promise<PublicDemoAccount> {
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

export function updateDemoMember(
  userId: number,
  changes: Partial<Pick<PublicDemoAccount, "display_name" | "email" | "phone" | "birth_date" | "gender" | "height_cm" | "weight_kg" | "fitness_goal">>
): PublicDemoAccount {
  const accounts = safeReadAccounts();
  const index = accounts.findIndex((account) => account.user_id === userId);
  if (index < 0) throw new Error("This local member profile was not found. Sign in again and retry.");
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
