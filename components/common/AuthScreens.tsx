"use client";

import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  ShieldCheck,
  UsersRound
} from "lucide-react";
import { DEFAULT_API_BASE_URL } from "@/lib/api-client";
import { DemoRole } from "@/lib/demo-auth";
import { Brand } from "./Brand";
import { ApiConnectionBadge } from "./ApiConnectionBadge";

type Navigate = (screen: string) => void;

export function SignInScreen({
  onSignIn,
  onNavigate
}: {
  onSignIn: (identifier: string, password: string, role: DemoRole) => Promise<void>;
  onNavigate: Navigate;
}) {
  const [role, setRole] = useState<DemoRole>("MEMBER");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const fillDemo = (demoRole: DemoRole) => {
    setRole(demoRole);
    setIdentifier(demoRole === "MEMBER" ? "alex.demo" : demoRole === "COACH" ? "tan.coach" : "admin.demo");
    setPassword("DemoPass123!");
    setError("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const trimmedId = identifier.trim();
    if (!trimmedId) {
      setError("Please enter your username or email address.");
      return;
    }
    if (trimmedId.length < 3) {
      setError("Username or email must be at least 3 characters.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setBusy(true);
    try {
      await onSignIn(trimmedId, password, role);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "We couldn’t sign you in. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-layout">
      <section className="auth-brand-panel">
        <button className="brand-button" onClick={() => onNavigate("welcome")}>
          <Brand />
        </button>
        <div className="auth-brand-copy">
          <span className="auth-coordinate">18° 47′ N · 98° 59′ E</span>
          <h1>A good place<br />to get stronger.</h1>
          <p>Find your coach, make a plan, and keep showing up at your own pace.</p>
        </div>
        <span className="auth-brand-foot">Made for Chiang Mai.</span>
      </section>
      <section className="auth-main">
        <div className="auth-card">
          <div className="auth-card-topline">
            <button className="back-link" onClick={() => onNavigate("welcome")}>
              <ArrowLeft size={15} /> Back to FitBooking
            </button>
            <ApiConnectionBadge />
          </div>
          <p className="eyebrow">YOUR TRAINING STARTS HERE</p>
          <h2>Welcome back.</h2>
          <p className="auth-intro">Sign in to pick up where you left off.</p>
          <div className="auth-role-tabs" aria-label="Choose account type">
            {(["MEMBER", "COACH", "ADMIN"] as const).map((item) => (
              <button
                type="button"
                className={role === item ? "selected" : ""}
                key={item}
                onClick={() => {
                  setRole(item);
                  setError("");
                }}
              >
                {item === "MEMBER" ? "Member" : item === "COACH" ? "Trainer" : "Admin"}
              </button>
            ))}
          </div>
          <form className="auth-form" onSubmit={submit}>
            <label className="settings-field" htmlFor="signin-identifier">
              {role === "ADMIN" ? "Admin username or email" : "Username or email"}
              <input
                id="signin-identifier"
                autoComplete="username"
                required
                value={identifier}
                onChange={(event) => {
                  setIdentifier(event.target.value);
                  setError("");
                }}
                placeholder={role === "ADMIN" ? "admin.demo" : role === "COACH" ? "tan.coach" : "alex.demo"}
              />
            </label>
            <label className="settings-field" htmlFor="signin-password">
              Password
              <input
                id="signin-password"
                autoComplete="current-password"
                type="password"
                required
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="Enter your password"
              />
            </label>
            <button
              className="text-link auth-forgot"
              type="button"
              onClick={() =>
                setError(
                  "Password recovery is managed by backend identity services. Contact your system admin."
                )
              }
            >
              Forgot password?
            </button>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button type="submit" className="button button-primary auth-submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"} <ArrowRight size={16} />
            </button>
          </form>
          <div className="auth-divider">
            <span>OR TRY A DEMO PROFILE</span>
          </div>
          <div className="auth-demo-list">
            <button type="button" onClick={() => fillDemo("MEMBER")}>
              <span className="demo-role-mark"><UsersRound size={15} /></span>
              <span><b>Member preview</b><small>alex.demo · DemoPass123!</small></span>
              <ChevronRight size={16} />
            </button>
            <button type="button" onClick={() => fillDemo("COACH")}>
              <span className="demo-role-mark"><Dumbbell size={15} /></span>
              <span><b>Trainer preview</b><small>tan.coach · DemoPass123!</small></span>
              <ChevronRight size={16} />
            </button>
            <button type="button" onClick={() => fillDemo("ADMIN")}>
              <span className="demo-role-mark"><ShieldCheck size={15} /></span>
              <span><b>Admin preview</b><small>admin.demo · DemoPass123!</small></span>
              <ChevronRight size={16} />
            </button>
          </div>
          <p className="auth-notice">
            Connected to FitBooking API (<code>{DEFAULT_API_BASE_URL}</code>).
          </p>
          <p className="auth-switch">
            New to FitBooking?{" "}
            <button className="text-link" onClick={() => onNavigate("signup")}>
              Create a member account
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}

export function SignUpScreen({
  onRegister,
  onNavigate
}: {
  onRegister: (details: {
    username: string;
    display_name: string;
    email: string;
    phone: string;
    gender: "MALE" | "FEMALE" | "OTHER" | null;
    birth_date: string | null;
    height_cm: number | null;
    weight_kg: number | null;
    fitness_goal: string | null;
    password: string;
  }) => Promise<void>;
  onNavigate: Navigate;
}) {
  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "" as "MALE" | "FEMALE" | "OTHER" | "",
    birth_date: "",
    height_cm: "",
    weight_kg: "",
    fitness_goal: ""
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const passwordMismatch = Boolean(
    formData.password &&
    formData.confirmPassword &&
    formData.password !== formData.confirmPassword
  );

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const username = formData.username.trim();
    if (username.length < 3 || username.length > 50) {
      setError("Username must be between 3 and 50 characters.");
      return;
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      setError("Username can only contain letters, numbers, underscores, dots, and hyphens.");
      return;
    }

    const displayName = formData.display_name.trim();
    if (!displayName || displayName.length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }

    const email = formData.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address (e.g. name@example.com).");
      return;
    }

    const phone = formData.phone.trim();
    if (!/^(\+?[0-9\s\-()]{8,20})$/.test(phone)) {
      setError("Please enter a valid phone number (at least 8 digits, e.g. +66812345678).");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("The passwords do not match. Please verify both password fields.");
      return;
    }

    let height: number | null = null;
    if (formData.height_cm) {
      const h = Number(formData.height_cm);
      if (!Number.isFinite(h) || h < 40 || h > 260) {
        setError("Height must be a valid number between 40 and 260 cm.");
        return;
      }
      height = h;
    }

    let weight: number | null = null;
    if (formData.weight_kg) {
      const w = Number(formData.weight_kg);
      if (!Number.isFinite(w) || w < 20 || w > 350) {
        setError("Weight must be a valid number between 20 and 350 kg.");
        return;
      }
      weight = w;
    }

    setBusy(true);
    try {
      await onRegister({
        username,
        display_name: displayName,
        email,
        phone,
        gender: formData.gender ? (formData.gender as "MALE" | "FEMALE" | "OTHER") : null,
        birth_date: formData.birth_date || null,
        height_cm: height,
        weight_kg: weight,
        fitness_goal: formData.fitness_goal.trim() || null,
        password: formData.password
      });
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Failed to create account. Please check your inputs.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-layout auth-signup-layout">
      <section className="auth-brand-panel">
        <button className="brand-button" onClick={() => onNavigate("welcome")}>
          <Brand />
        </button>
        <div className="auth-brand-copy">
          <span className="auth-coordinate">MADE FOR CHIANG MAI</span>
          <h1>Start where<br />you are.</h1>
          <p>Build a training routine that fits your goals and the life you already have.</p>
        </div>
        <span className="auth-brand-foot">Your city. Your pace.</span>
      </section>
      <section className="auth-main">
        <div className="auth-card auth-card-wide">
          <div className="auth-card-topline">
            <button className="back-link" onClick={() => onNavigate("signin")}>
              <ArrowLeft size={15} /> Back to sign in
            </button>
            <ApiConnectionBadge />
          </div>
          <p className="eyebrow">A FITBOOKING MEMBER ACCOUNT</p>
          <h2>Make room for progress.</h2>
          <p className="auth-intro">Register your official member profile to start booking verified coaches.</p>
          <form className="auth-form signup-form" onSubmit={submit}>
            <label className="settings-field">
              Username <span className="req-star">*</span>
              <input
                name="username"
                autoComplete="username"
                required
                minLength={3}
                maxLength={50}
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                placeholder="e.g. alex.morgan"
              />
            </label>
            <label className="settings-field">
              Full name <span className="req-star">*</span>
              <input
                name="display_name"
                autoComplete="name"
                required
                maxLength={100}
                value={formData.display_name}
                onChange={(e) => handleChange("display_name", e.target.value)}
                placeholder="e.g. Alex Morgan"
              />
            </label>
            <label className="settings-field">
              Email address <span className="req-star">*</span>
              <input
                name="email"
                autoComplete="email"
                type="email"
                required
                maxLength={100}
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="e.g. alex@example.com"
              />
            </label>
            <label className="settings-field">
              Phone number <span className="req-star">*</span>
              <input
                name="phone"
                autoComplete="tel"
                type="tel"
                required
                maxLength={20}
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="e.g. +66812345678"
              />
            </label>
            <label className="settings-field">
              Password <span className="req-star">*</span> (min 8 chars)
              <input
                name="password"
                autoComplete="new-password"
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="At least 8 characters"
              />
            </label>
            <label className="settings-field">
              Confirm password <span className="req-star">*</span>
              <input
                name="confirmPassword"
                autoComplete="new-password"
                type="password"
                required
                minLength={8}
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                placeholder="Repeat your password"
              />
              {passwordMismatch && <small className="field-error-text">Passwords do not match</small>}
            </label>
            <label className="settings-field">
              Gender
              <select name="gender" value={formData.gender} onChange={(e) => handleChange("gender", e.target.value)}>
                <option value="">Prefer not to say</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </label>
            <label className="settings-field">
              Date of birth
              <input name="birth_date" type="date" value={formData.birth_date} onChange={(e) => handleChange("birth_date", e.target.value)} />
            </label>
            <label className="settings-field">
              Height (cm)
              <input name="height_cm" type="number" min="40" max="260" step="0.1" value={formData.height_cm} onChange={(e) => handleChange("height_cm", e.target.value)} placeholder="e.g. 165.0" />
            </label>
            <label className="settings-field">
              Weight (kg)
              <input name="weight_kg" type="number" min="20" max="350" step="0.1" value={formData.weight_kg} onChange={(e) => handleChange("weight_kg", e.target.value)} placeholder="e.g. 58.0" />
            </label>
            <label className="settings-field signup-goal-field">
              Fitness goal
              <input name="fitness_goal" maxLength={200} value={formData.fitness_goal} onChange={(e) => handleChange("fitness_goal", e.target.value)} placeholder="What would you like to work toward? (e.g. Build strength & mobility)" />
            </label>
            <p className="form-role-note">
              <CheckCircle2 size={15} /> All accounts are registered with the MEMBER role. Profile updates directly sync with <code>/members/me</code>.
            </p>
            {error && <p className="form-error signup-error" role="alert">{error}</p>}
            <button className="button button-primary auth-submit signup-submit" type="submit" disabled={busy || passwordMismatch}>
              {busy ? "Registering account…" : "Create member account"} <ArrowRight size={16} />
            </button>
          </form>
          <p className="auth-notice">
            Connected to FitBooking API (<code>{DEFAULT_API_BASE_URL}</code>). When backend is live, accounts are stored directly in MySQL.
          </p>
        </div>
      </section>
    </main>
  );
}
