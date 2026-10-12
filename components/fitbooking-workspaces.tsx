"use client";

import {
  Activity, ArrowLeft, ArrowRight, Award, CalendarDays, Check, CheckCircle2,
  ChevronDown, ChevronRight, Clock3, Dumbbell, LogOut, MapPin, MessageCircle,
  Plus, Search, Send, ShieldCheck, Star, UsersRound, Wallet, type LucideIcon
} from "lucide-react";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import {
  DEMO_MESSAGES_KEY, DemoRole, PublicDemoAccount
} from "@/lib/demo-auth";

type Screen = (screen: string) => void;

export function SignInScreen({
  onSignIn,
  onNavigate
}: {
  onSignIn: (identifier: string, password: string, role: DemoRole) => Promise<void>;
  onNavigate: Screen;
}) {
  const [role, setRole] = useState<DemoRole>("MEMBER");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const fillDemo = (demoRole: DemoRole) => {
    setRole(demoRole);
    setIdentifier(demoRole === "MEMBER" ? "alex" : demoRole === "COACH" ? "coach.tan" : "FB-ADMIN-001");
    setPassword(demoRole === "MEMBER" ? "FitBooking123!" : demoRole === "COACH" ? "Coach@123" : "Admin@123");
    setError("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await onSignIn(identifier, password, role);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "We couldn’t sign you in. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return <main className="auth-layout">
    <section className="auth-brand-panel">
      <button className="brand-button" onClick={() => onNavigate("welcome")}><Brand /></button>
      <div className="auth-brand-copy">
        <span className="auth-coordinate">18° 47′ N · 98° 59′ E</span>
        <h1>A good place<br />to get stronger.</h1>
        <p>Find your coach, make a plan, and keep showing up at your own pace.</p>
      </div>
      <span className="auth-brand-foot">Made for Chiang Mai.</span>
    </section>
    <section className="auth-main">
      <div className="auth-card">
        <button className="back-link" onClick={() => onNavigate("welcome")}><ArrowLeft size={15} /> Back to FitBooking</button>
        <p className="eyebrow">YOUR TRAINING STARTS HERE</p>
        <h2>Welcome back.</h2>
        <p className="auth-intro">Sign in to pick up where you left off.</p>
        <div className="auth-role-tabs" aria-label="Choose account type">
          {(["MEMBER", "COACH", "ADMIN"] as const).map((item) =>
            <button type="button" className={role === item ? "selected" : ""} key={item} onClick={() => { setRole(item); setError(""); }}>
              {item === "MEMBER" ? "Member" : item === "COACH" ? "Trainer" : "Admin"}
            </button>
          )}
        </div>
        <form className="auth-form" onSubmit={submit}>
          <label className="settings-field" htmlFor="signin-identifier">{role === "ADMIN" ? "Admin ID or email" : "Username or email"}
            <input id="signin-identifier" autoComplete="username" required value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder={role === "ADMIN" ? "FB-ADMIN-001" : "Your username or email"} />
          </label>
          <label className="settings-field" htmlFor="signin-password">Password
            <input id="signin-password" autoComplete="current-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" />
          </label>
          <button className="text-link auth-forgot" type="button" onClick={() => setError("Password recovery needs a real account service; no email or API is connected in this frontend preview.")}>Forgot password?</button>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" className="button button-primary auth-submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"} <ArrowRight size={16} /></button>
        </form>
        <div className="auth-divider"><span>OR TRY A DEMO PROFILE</span></div>
        <div className="auth-demo-list">
          <button type="button" onClick={() => fillDemo("MEMBER")}><span className="demo-role-mark"><UsersRound size={15} /></span><span><b>Member preview</b><small>alex · FitBooking123!</small></span><ChevronRight size={16} /></button>
          <button type="button" onClick={() => fillDemo("COACH")}><span className="demo-role-mark"><Dumbbell size={15} /></span><span><b>Trainer preview</b><small>coach.tan · Coach@123</small></span><ChevronRight size={16} /></button>
          <button type="button" onClick={() => fillDemo("ADMIN")}><span className="demo-role-mark"><ShieldCheck size={15} /></span><span><b>Admin preview</b><small>FB-ADMIN-001 · Admin@123</small></span><ChevronRight size={16} /></button>
        </div>
        <p className="auth-notice">Preview only: these accounts and profiles stay in this browser. This is not production authentication and does not secure server data.</p>
        <p className="auth-switch">New to FitBooking? <button className="text-link" onClick={() => onNavigate("signup")}>Create a member account</button></p>
      </div>
    </section>
  </main>;
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
  onNavigate: Screen;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    if (password !== String(form.get("confirmPassword") || "")) {
      setError("The passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const numberValue = (key: string) => {
        const value = Number(form.get(key));
        return Number.isFinite(value) && value > 0 ? value : null;
      };
      const genderValue = String(form.get("gender") || "");
      await onRegister({
        username: String(form.get("username") || ""),
        display_name: String(form.get("display_name") || ""),
        email: String(form.get("email") || ""),
        phone: String(form.get("phone") || ""),
        gender: ["MALE", "FEMALE", "OTHER"].includes(genderValue) ? genderValue as "MALE" | "FEMALE" | "OTHER" : null,
        birth_date: String(form.get("birth_date") || "") || null,
        height_cm: numberValue("height_cm"),
        weight_kg: numberValue("weight_kg"),
        fitness_goal: String(form.get("fitness_goal") || "") || null,
        password
      });
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "We couldn’t create this local demo profile.");
    } finally {
      setBusy(false);
    }
  };

  return <main className="auth-layout auth-signup-layout">
    <section className="auth-brand-panel">
      <button className="brand-button" onClick={() => onNavigate("welcome")}><Brand /></button>
      <div className="auth-brand-copy"><span className="auth-coordinate">MADE FOR CHIANG MAI</span><h1>Start where<br />you are.</h1><p>Build a training routine that fits your goals and the life you already have.</p></div>
      <span className="auth-brand-foot">Your city. Your pace.</span>
    </section>
    <section className="auth-main">
      <div className="auth-card auth-card-wide">
        <button className="back-link" onClick={() => onNavigate("signin")}><ArrowLeft size={15} /> Back to sign in</button>
        <p className="eyebrow">A FITBOOKING MEMBER ACCOUNT</p><h2>Make room for progress.</h2>
        <p className="auth-intro">Your profile is saved only in this browser for the frontend preview.</p>
        <form className="auth-form signup-form" onSubmit={submit}>
          <label className="settings-field">Username<input name="username" autoComplete="username" required minLength={3} maxLength={50} /></label>
          <label className="settings-field">Full name<input name="display_name" autoComplete="name" required maxLength={100} /></label>
          <label className="settings-field">Email address<input name="email" autoComplete="email" type="email" required maxLength={100} /></label>
          <label className="settings-field">Phone number<input name="phone" autoComplete="tel" type="tel" required maxLength={20} /></label>
          <label className="settings-field">Password<input name="password" autoComplete="new-password" type="password" required minLength={8} /></label>
          <label className="settings-field">Confirm password<input name="confirmPassword" autoComplete="new-password" type="password" required minLength={8} /></label>
          <label className="settings-field">Gender<select name="gender" defaultValue=""><option value="">Prefer not to say</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select></label>
          <label className="settings-field">Date of birth<input name="birth_date" type="date" /></label>
          <label className="settings-field">Height (cm)<input name="height_cm" type="number" min="1" max="300" step="0.1" /></label>
          <label className="settings-field">Weight (kg)<input name="weight_kg" type="number" min="1" max="500" step="0.1" /></label>
          <label className="settings-field signup-goal-field">Fitness goal<input name="fitness_goal" maxLength={200} placeholder="What would you like to work toward?" /></label>
          <p className="form-role-note"><CheckCircle2 size={15} /> New sign-ups create member profiles. Trainer and admin access is restricted to demo accounts.</p>
          {error && <p className="form-error signup-error" role="alert">{error}</p>}
          <button className="button button-primary auth-submit signup-submit" type="submit" disabled={busy}>{busy ? "Creating profile…" : "Create member account"} <ArrowRight size={16} /></button>
        </form>
        <p className="auth-notice">Demo only. No API, email verification, or production account security is connected.</p>
      </div>
    </section>
  </main>;
}

function Brand() {
  return <span className="brand"><Image className="brand-logo" src="/fitbooking-kettlebell.png" width={34} height={30} alt="" /><span>FitBooking<span className="brand-period">.</span></span></span>;
}

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`pill ${className}`}>{children}</span>;
}

export function RoleWorkspace({
  role,
  screen,
  account,
  navigate,
  onSignOut
}: {
  role: "COACH" | "ADMIN";
  screen: string;
  account: PublicDemoAccount;
  navigate: Screen;
  onSignOut: () => void;
}) {
  return role === "COACH"
    ? <TrainerWorkspace screen={screen === "trainerMessages" ? "messages" : screen} account={account} navigate={navigate} onSignOut={onSignOut} />
    : <AdminWorkspace screen={screen} account={account} navigate={navigate} onSignOut={onSignOut} />;
}

function WorkspaceHeader({ name, role, onSignOut }: { name: string; role: string; onSignOut: () => void }) {
  return <header className="workspace-topbar"><Brand /><div className="workspace-user"><span className="workspace-user-avatar">{name.slice(0, 1).toUpperCase()}</span><span><b>{name}</b><small>{role}</small></span><button className="button button-outline" onClick={onSignOut}><LogOut size={15} /> Sign out</button></div></header>;
}

const trainerNav = [
  ["trainerHome", "Overview", Activity],
  ["trainerSchedule", "Schedule", CalendarDays],
  ["trainerMessages", "Messages", MessageCircle],
  ["trainerClients", "Clients", UsersRound],
  ["trainerProgress", "Progress", Award]
] as const;

function TrainerWorkspace({ screen, account, navigate, onSignOut }: { screen: string; account: PublicDemoAccount; navigate: Screen; onSignOut: () => void }) {
  return <main className="workspace-shell">
    <WorkspaceHeader name={account.display_name} role="Verified trainer" onSignOut={onSignOut} />
    <div className="workspace-body">
      <aside className="workspace-sidebar"><p className="workspace-sidebar-label">TRAINER SPACE</p>{trainerNav.map(([key, label, Icon]) => <button key={key} className={screen === key || (key === "trainerMessages" && screen === "messages") ? "active" : ""} onClick={() => navigate(key)}><Icon size={17} />{label}{key === "trainerMessages" && <i>2</i>}</button>)}<p className="workspace-sidebar-note">Schedule and messages here are saved as a local preview.</p></aside>
      <section className="workspace-main">
        {screen === "trainerHome" && <TrainerOverview account={account} navigate={navigate} />}
        {screen === "trainerSchedule" && <TrainerSchedule />}
        {screen === "messages" && <Conversation account={account} role="COACH" />}
        {screen === "trainerClients" && <TrainerClients />}
        {screen === "trainerProgress" && <TrainerProgress />}
      </section>
    </div>
    <WorkspaceMobileNav items={trainerNav} active={screen === "messages" ? "trainerMessages" : screen} navigate={navigate} />
  </main>;
}

function TrainerOverview({ account, navigate }: { account: PublicDemoAccount; navigate: Screen }) {
  return <div className="workspace-content"><div className="workspace-heading"><div><p className="eyebrow">TUESDAY · CHIANG MAI</p><h1>Good morning, {account.display_name.split(" ")[0]}.</h1><p>Your day, your people, and the progress you’re building together.</p></div><button className="button button-primary" onClick={() => navigate("trainerSchedule")}><CalendarDays size={16} /> View schedule</button></div>
    <div className="workspace-stat-row">{[["Sessions today", "4", "2 more to go", CalendarDays], ["Active members", "18", "3 new this month", UsersRound], ["Hours coached", "26.5", "This week", Clock3]].map(([label, value, note, Icon]) => <article className="workspace-stat" key={label as string}><span className="workspace-stat-icon"><Icon size={18} /></span><small>{label as string}</small><b>{value as string}</b><span>{note as string}</span></article>)}</div>
    <div className="workspace-columns"><section className="workspace-panel"><div className="section-title"><div><h2>Up next</h2><p>Your Tuesday training schedule</p></div><button className="text-link" onClick={() => navigate("trainerSchedule")}>Full schedule <ArrowRight size={14} /></button></div><TrainerSessionRows compact /></section>
      <section className="workspace-panel"><div className="section-title"><div><h2>Member check-in</h2><p>Last note from your clients</p></div><MessageCircle size={18} /></div><div className="trainer-note"><span className="member-avatar">NT</span><div><b>Nattakarn S.</b><p>“I’m ready to work on my deadlift form today.”</p><small>Strength & Conditioning · 9:10 AM</small></div></div><button className="button button-outline workspace-full-button" onClick={() => navigate("messages")}>Open messages <ArrowRight size={14} /></button></section></div>
    <section className="workspace-panel workspace-week-panel"><div className="section-title"><div><h2>This week at a glance</h2><p>Keep the rhythm steady, not rushed.</p></div><span className="pill">12 of 16 sessions</span></div><div className="trainer-week-bars">{[["Mon", 55], ["Tue", 83], ["Wed", 42], ["Thu", 68], ["Fri", 49], ["Sat", 92], ["Sun", 22]].map(([day, height]) => <div key={day as string}><span>{height}%</span><i style={{ height: `${height}%` }} /><small>{day}</small></div>)}</div></section>
  </div>;
}

const demoSessions = [
  { member: "Nattakarn S.", initials: "NS", course: "Strength & Conditioning", time: "09:10 AM", length: "60 min", location: "Nimman Fitness Club", status: "Confirmed" },
  { member: "Mali P.", initials: "MP", course: "Mobility & Flexibility", time: "11:30 AM", length: "60 min", location: "Old City Studio", status: "Confirmed" },
  { member: "Krit S.", initials: "KS", course: "Strength Foundations", time: "02:00 PM", length: "45 min", location: "Central Fitness", status: "Pending" },
  { member: "Pimchanok R.", initials: "PR", course: "One-to-one HIIT", time: "04:30 PM", length: "45 min", location: "At home · Nimman", status: "Confirmed" }
];

function TrainerSchedule() {
  const [day, setDay] = useState("Tue, Apr 16");
  const [completed, setCompleted] = useState<string[]>([]);
  const [selectedSession, setSelectedSession] = useState("");
  const days = ["Mon, Apr 15", "Tue, Apr 16", "Wed, Apr 17", "Thu, Apr 18", "Fri, Apr 19"];
  return <div className="workspace-content"><div className="workspace-heading"><div><p className="eyebrow">YOUR WORK WEEK</p><h1>Schedule</h1><p>Sessions stay clear, so you can give each member your attention.</p></div><button className="button button-primary" onClick={() => setSelectedSession(selectedSession ? "" : "Availability") }><Plus size={15} /> Add availability</button></div>
    <div className="trainer-calendar-toolbar"><div className="trainer-day-tabs">{days.map((item) => <button key={item} className={day === item ? "active" : ""} onClick={() => setDay(item)}><small>{item.split(",")[0]}</small><b>{item.split(" ")[2]}</b></button>)}</div><span><MapPin size={15} /> Chiang Mai time · GMT+7</span></div>
    {selectedSession === "Availability" && <div className="availability-editor"><div><b>Availability preview</b><small>Choose a demo slot to mark your calendar as open.</small></div>{["08:00 AM", "10:00 AM", "01:00 PM", "03:00 PM"].map((time) => <button key={time} onClick={(event) => { event.currentTarget.classList.toggle("selected"); }}>{time}</button>)}</div>}
    <section className="workspace-panel schedule-panel"><div className="section-title"><div><h2>{day}</h2><p>{day === "Tue, Apr 16" ? "Four sessions planned" : "Sample schedule · adjust your day"}</p></div><span className="pill">Local preview</span></div><TrainerSessionRows completed={completed} onToggleComplete={(member) => setCompleted((current) => current.includes(member) ? current.filter((item) => item !== member) : [...current, member])} onDetails={setSelectedSession} /></section>
    {selectedSession && selectedSession !== "Availability" && <div className="workspace-detail-panel"><div className="section-title"><div><h2>Session notes</h2><p>{selectedSession} · member details in this preview</p></div><button className="text-link" onClick={() => setSelectedSession("")}>Close</button></div><p>Review the member’s focus before the session. This area is local demo content only; it does not update any booking record.</p><button className="button button-outline" onClick={() => setSelectedSession("")}>Done</button></div>}
  </div>;
}

function TrainerSessionRows({ compact = false, completed = [], onToggleComplete, onDetails }: { compact?: boolean; completed?: string[]; onToggleComplete?: (member: string) => void; onDetails?: (member: string) => void }) {
  return <div className="trainer-session-list">{(compact ? demoSessions.slice(0, 3) : demoSessions).map((session) => {
    const done = completed.includes(session.member);
    return <article key={session.member} className={`trainer-session-row ${done ? "is-complete" : ""}`}><div className="session-time-block"><b>{session.time}</b><span>{session.length}</span></div><i className="session-time-line" /><span className="trainer-member-avatar">{session.initials}</span><div className="trainer-session-copy"><b>{session.member}</b><span>{session.course}</span><small><MapPin size={12} /> {session.location}</small></div><span className={`booking-status ${done ? "completed" : session.status.toLowerCase()}`}>{done ? "Completed" : session.status}</span>{onDetails && <button className="icon-button" onClick={() => onDetails(session.member)} aria-label={`View ${session.member} details`}><ChevronRight size={17} /></button>}{onToggleComplete && <button className="session-complete-button" onClick={() => onToggleComplete(session.member)} aria-label={done ? "Undo completion" : "Mark session complete"}>{done ? <CheckCircle2 size={17} /> : <Check size={17} />}</button>}</article>;
  })}</div>;
}

function TrainerClients() {
  const [query, setQuery] = useState("");
  const [activeMember, setActiveMember] = useState("");
  const clients = [
    ["Nattakarn S.", "Strength & Conditioning", "12 sessions", "photo-1534528741775-53994a69daeb"],
    ["Mali P.", "Mobility & Flexibility", "8 sessions", "photo-1544005313-94ddf0286df2"],
    ["Krit S.", "Strength Foundations", "5 sessions", "photo-1500648767791-00dcc994a43e"]
  ];
  const visible = clients.filter(([name, course]) => `${name} ${course}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="workspace-content"><div className="workspace-heading"><div><p className="eyebrow">PEOPLE YOU TRAIN WITH</p><h1>Your members</h1><p>Keep every plan personal and easy to follow.</p></div><span className="pill"><UsersRound size={14} /> 18 active members</span></div><label className="search-bar trainer-client-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search members or training type" /></label><div className="workspace-panel trainer-clients-panel">{visible.map(([name, course, sessions, image]) => <article className="trainer-client-row" key={name}><span className="trainer-client-photo" aria-hidden="true" style={{ backgroundImage: `url("https://images.unsplash.com/${image}?auto=format&fit=crop&w=100&q=80")` }} /><span><b>{name}</b><small>{course}</small></span><span>{sessions}</span><button className="button button-outline" onClick={() => setActiveMember(activeMember === name ? "" : name)}>Member notes</button><button className="icon-button" onClick={() => setActiveMember(activeMember === name ? "" : name)} aria-label={`View ${name}`}><ChevronRight size={17} /></button>{activeMember === name && <p className="client-demo-note">Training focus: steady strength progress, good movement quality, and a plan that fits their week. Demo note only.</p>}</article>)}{!visible.length && <div className="empty-state"><UsersRound size={23} /><h3>No members match</h3><p>Try a different name or training type.</p></div>}</div></div>;
}

function TrainerProgress() {
  const [period, setPeriod] = useState("This week");
  return <div className="workspace-content"><div className="workspace-heading"><div><p className="eyebrow">YOUR PRACTICE</p><h1>Coaching progress</h1><p>A read on how your training time is taking shape.</p></div><select className="workspace-select" value={period} onChange={(event) => setPeriod(event.target.value)}><option>This week</option><option>This month</option><option>This year</option></select></div><div className="workspace-stat-row">{[["Completed sessions", "12", "of 16 planned", CheckCircle2], ["Member rating", "4.9", "from 128 notes", Star], ["Coaching hours", "26.5", period, Clock3]].map(([label, value, note, Icon]) => <article className="workspace-stat" key={label as string}><span className="workspace-stat-icon"><Icon size={18} /></span><small>{label as string}</small><b>{value as string}</b><span>{note as string}</span></article>)}</div><div className="workspace-panel"><div className="section-title"><div><h2>Member momentum</h2><p>Sample progress summaries, not live health data.</p></div><Activity size={17} /></div>{[["Nattakarn S.", "Strength", "7 / 10 sessions", 72], ["Mali P.", "Mobility", "5 / 8 sessions", 63], ["Krit S.", "Foundations", "3 / 6 sessions", 50]].map(([name, focus, count, percent]) => <div className="member-progress-row" key={name as string}><span className="trainer-member-avatar">{String(name).slice(0, 2).toUpperCase()}</span><span><b>{name as string}</b><small>{focus as string} · {count as string}</small></span><div className="goal-progress"><i style={{ width: `${percent}%` }} /></div><b>{percent}%</b></div>)}</div></div>;
}

interface DemoMessage {
  sender: "MEMBER" | "COACH";
  author: string;
  text: string;
  created_at: string;
}

function Conversation({ account, role }: { account: PublicDemoAccount; role: "MEMBER" | "COACH" }) {
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DEMO_MESSAGES_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) {
        setMessages(parsed.filter((item): item is DemoMessage =>
          typeof item === "object" && item !== null &&
          typeof (item as DemoMessage).text === "string" &&
          ["MEMBER", "COACH"].includes((item as DemoMessage).sender)
        ));
      } else {
        setMessages([{
          sender: role === "MEMBER" ? "COACH" : "MEMBER",
          author: role === "MEMBER" ? "Coach Tan" : "Alex Morgan",
          text: "Looking forward to our next session. Is there anything you’d like to focus on?",
          created_at: new Date().toISOString()
        }]);
      }
    } catch {
      setError("Saved demo messages could not be read. Clear this site's local storage to reset the preview chat.");
    }
  }, [role]);

  const send = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const next = [...messages, { sender: role, author: account.display_name, text, created_at: new Date().toISOString() } as DemoMessage];
    try {
      window.localStorage.setItem(DEMO_MESSAGES_KEY, JSON.stringify(next));
      setMessages(next);
      setDraft("");
      setError("");
    } catch {
      setError("This message could not be saved in the browser. Check your storage settings and try again.");
    }
  };

  return <div className="workspace-content message-page"><div className="workspace-heading"><div><p className="eyebrow">ONE-TO-ONE SUPPORT</p><h1>Messages</h1><p>Keep the conversation going between sessions.</p></div><span className="pill"><span className="availability-dot" /> Demo conversation</span></div><section className="workspace-panel conversation-panel"><header><span className="trainer-member-avatar">{role === "MEMBER" ? "TT" : "AM"}</span><span><b>{role === "MEMBER" ? "Coach Tan" : "Alex Morgan"}</b><small>{role === "MEMBER" ? "Strength & Conditioning" : "Member · Gold"}</small></span><span className="conversation-online">Local preview</span></header><div className="conversation-messages" aria-live="polite">{messages.map((message, index) => <div key={`${message.created_at}-${index}`} className={`message-row ${message.sender === role ? "message-own" : ""}`}><span className="message-bubble"><small>{message.author}</small><span>{message.text}</span><time>{new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time></span></div>)}{!messages.length && <div className="empty-state"><MessageCircle size={24} /><h3>Start a conversation</h3><p>Send your trainer a note about your next session.</p></div>}</div><form className="conversation-compose" onSubmit={send}><label className="sr-only" htmlFor="demo-message">Message</label><input id="demo-message" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={500} placeholder="Write a message…" /><button className="button button-primary" type="submit" disabled={!draft.trim()}><Send size={15} /> Send</button></form>{error && <p className="form-error" role="alert">{error}</p>}<p className="auth-notice">Preview chat only. Messages are saved to this browser and are visible to any demo profile on this device.</p></section></div>;
}

export function MemberMessages({ account }: { account: PublicDemoAccount }) {
  return <Conversation account={account} role="MEMBER" />;
}

const packageDetails = {
  "5+1": { label: "5+1 Sessions", price: "฿3,400", each: "฿680 / paid session", saving: "Save 5%", sessions: 6, details: ["5 paid sessions + 1 bonus session", "Choose your own verified coach", "Valid for 180 days", "Reschedule according to booking terms"] },
  "10+3": { label: "10+3 Sessions", price: "฿8,970", each: "฿690 / session", saving: "Save 14%", sessions: 13, details: ["10 paid sessions + 3 bonus sessions", "Choose your own verified coach", "Valid for 180 days", "Best for building a steady routine"] },
  "20+7": { label: "20+7 Sessions", price: "฿17,550", each: "฿650 / session", saving: "Save 20%", sessions: 27, details: ["20 paid sessions + 7 bonus sessions", "Choose your own verified coach", "Valid for 180 days", "Lowest price per session"] }
} as const;

export function PackageDetailScreen({ selected, onBack, onChoose }: { selected: string; onBack: () => void; onChoose: (packageName: string) => void }) {
  const plan = packageDetails[selected as keyof typeof packageDetails] || packageDetails["10+3"];
  return <div className="content-wrap narrow-wrap package-detail-wrap"><button className="back-link" onClick={onBack}><ArrowLeft size={15} /> Back to packages</button><section className="package-detail-hero"><div><span className="package-detail-mark"><Dumbbell size={20} /></span><p className="eyebrow">YOUR NEXT TRAINING CHAPTER</p><h1>{plan.label}</h1><p>More time with a coach you trust, and a plan that has room to work.</p><span className="pill savings-pill">{plan.saving}</span></div><div className="package-detail-price"><b>{plan.price}</b><span>{plan.each}</span><small>Local preview · no payment</small></div></section><div className="package-detail-grid"><section className="workspace-panel"><div className="section-title"><div><h2>What’s included</h2><p>Clear details before you choose.</p></div><CheckCircle2 size={19} /></div>{plan.details.map((detail) => <div className="package-detail-included" key={detail}><span><Check size={14} /></span>{detail}</div>)}</section><aside className="package-detail-aside"><p className="eyebrow">A GOOD FIT IF</p><h2>You want a routine that has room to grow.</h2><p>Use your sessions one at a time, at your pace. Choose your coach and training focus during booking.</p><div className="package-detail-count"><Dumbbell size={17} /><span><b>{plan.sessions} sessions</b><small>One-to-one coaching</small></span></div><button className="button button-primary" onClick={() => onChoose(selected)}>Choose this package <ArrowRight size={15} /></button></aside></div><section className="package-compare"><div className="section-title"><div><h2>Compare packages</h2><p>Pick the amount of coaching that feels right.</p></div></div><div className="package-compare-options">{Object.entries(packageDetails).map(([name, option]) => <button className={name === selected ? "selected" : ""} key={name} onClick={() => onChoose(name)}><span><b>{option.label}</b><small>{option.each}</small></span><strong>{option.price}</strong><span>{name === selected ? "Selected" : "View details"} <ChevronRight size={14} /></span></button>)}</div></section><p className="auth-notice">Package details and prices are sample interface content. No order or payment is created.</p></div>;
}

const adminNav = [
  ["admin", "Overview", Activity], ["adminBookings", "Bookings", CalendarDays], ["adminMembers", "Members", UsersRound],
  ["adminTrainers", "Trainers", Dumbbell], ["adminPackages", "Packages", Wallet], ["adminReports", "Reports", Award], ["adminSettings", "Settings", ShieldCheck]
] as const;

function AdminWorkspace({ screen, account, navigate, onSignOut }: { screen: string; account: PublicDemoAccount; navigate: Screen; onSignOut: () => void }) {
  const activeSection = adminNav.find(([key]) => key === screen)?.[1] || "Overview";
  const [active, setActive] = useState(activeSection);
  useEffect(() => setActive(activeSection), [activeSection]);
  return <main className="workspace-shell admin-workspace">
    <WorkspaceHeader name={account.display_name} role="Administrator" onSignOut={onSignOut} />
    <div className="workspace-body"><aside className="workspace-sidebar"><p className="workspace-sidebar-label">MANAGEMENT</p>{adminNav.map(([key, item, Icon]) => <button key={key} className={active === item ? "active" : ""} onClick={() => { setActive(item); navigate(key); }}><Icon size={17} />{item}</button>)}<p className="workspace-sidebar-note">Workflow controls are interactive local previews only.</p></aside>
      <AdminContent active={active} />
    </div>
    <WorkspaceMobileNav items={adminNav} active={screen} navigate={navigate} />
  </main>;
}

function AdminContent({ active }: { active: string }) {
  const [status, setStatus] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const members = [["Alex Morgan", "alex.morgan@example.com", "Gold member", "Active"], ["Nattakarn S.", "nattakarn@example.com", "Silver member", "Active"], ["Mali P.", "mali@example.com", "Member", "Active"], ["Krit S.", "krit@example.com", "Member", "Pending"]];
  const rows = active === "Members" ? members : active === "Trainers" ? [["Tan Chaiyaporn", "tan@fitbooking.local", "Strength · 4.9 ★", "Active"], ["May Suthida", "may@fitbooking.local", "Mobility · 4.8 ★", "Active"], ["Jeff Nopparat", "jeff@fitbooking.local", "Functional · 4.9 ★", "Pending"]] : [["Nattakarn S. · Coach Tan", "Strength & Conditioning · Apr 16", "฿800", "Confirmed"], ["Mali P. · Coach May", "Mobility · Apr 18", "฿750", "Pending"], ["Krit S. · Coach Jeff", "HIIT · Apr 20", "฿750", "Confirmed"]];
  const visibleRows = rows.filter((row) => row.join(" ").toLowerCase().includes(query.toLowerCase()));
  const heading = active === "Overview" ? "The whole operation, at a glance." : `${active} management`;
  return <section className="workspace-main admin-main-workspace"><div className="workspace-content"><div className="workspace-heading"><div><p className="eyebrow">FITBOOKING MANAGEMENT</p><h1>{heading}</h1><p>Keep each part of the Chiang Mai training community moving.</p></div><button className="button button-primary" onClick={() => setNotice(`${active === "Overview" ? "New workflow" : `Add ${active.toLowerCase()}`} form opened in this demo.`)}><Plus size={15} /> {active === "Overview" ? "Add trainer" : `Add ${active === "Members" ? "member" : active === "Trainers" ? "trainer" : active === "Packages" ? "package" : "workflow"}`}</button></div>
    {notice && <div className="workspace-notice" role="status">{notice}<button onClick={() => setNotice("")}>Dismiss</button></div>}
    {active === "Overview" && <><div className="workspace-stat-row admin-overview-stats">{[["Active members", "1,248", "+12 this month", UsersRound], ["Verified trainers", "48", "3 need review", Dumbbell], ["Bookings today", "36", "8 pending", CalendarDays], ["Package sales", "฿186.4K", "This month", Wallet]].map(([label, value, note, Icon]) => <article className="workspace-stat" key={label as string}><span className="workspace-stat-icon"><Icon size={18} /></span><small>{label as string}</small><b>{value as string}</b><span>{note as string}</span></article>)}</div><div className="workspace-columns"><section className="workspace-panel"><div className="section-title"><div><h2>Needs attention</h2><p>Workflow items ready for review</p></div><span className="pill">4 open</span></div>{[["Coach verification", "Ploy Rattanakorn · documents to review", "Review"], ["Booking request", "Krit S. · Apr 20 at 10:30 AM", "Confirm"], ["Member profile", "Complete account contact details", "Open"]].map(([label, detail, action]) => <div className="admin-task-row" key={label}><span className="admin-task-icon"><Clock3 size={15} /></span><span><b>{label}</b><small>{detail}</small></span><button className="button button-outline" onClick={() => setNotice(`${label}: ${action.toLowerCase()} preview opened.`)}>{action}</button></div>)}</section><section className="workspace-panel"><div className="section-title"><div><h2>Recent activity</h2><p>Across the FitBooking community</p></div><Activity size={18} /></div>{[["New booking", "Strength & Conditioning · Coach Tan", "2m"], ["Trainer joined", "Ploy R. · Verification pending", "18m"], ["Package selected", "13-session plan · Alex Morgan", "42m"]].map(([title, detail, time]) => <div className="admin-activity-row" key={title}><CheckCircle2 size={16} /><span><b>{title}</b><small>{detail}</small></span><time>{time}</time></div>)}</section></div><section className="workspace-panel workflow-panel"><div className="section-title"><div><h2>Workflow shortcuts</h2><p>Move directly to the work queue you need.</p></div></div><div className="admin-shortcut-grid">{adminNav.slice(1, 6).map(([key, label, Icon]) => <button key={key} onClick={() => setNotice(`${label} management opened.`)}><Icon size={19} /><b>{label}</b><small>Review records and update demo status</small><ChevronRight size={15} /></button>)}</div></section></>}
    {active === "Bookings" && <><AdminFilters query={query} setQuery={setQuery} placeholder="Search member, trainer, or session" /><AdminTable rows={visibleRows} action={(id, current) => { const next = current === "Confirmed" ? "Completed" : "Confirmed"; setStatus((value) => ({ ...value, [id]: next })); }} status={status} /></>}
    {active === "Members" && <><AdminFilters query={query} setQuery={setQuery} placeholder="Search name, email, or membership" /><AdminTable rows={visibleRows} action={(id, current) => setStatus((value) => ({ ...value, [id]: current === "Active" ? "Paused" : "Active" }))} status={status} /></>}
    {active === "Trainers" && <><AdminFilters query={query} setQuery={setQuery} placeholder="Search trainer, email, or specialty" /><AdminTable rows={visibleRows} action={(id, current) => setStatus((value) => ({ ...value, [id]: current === "Active" ? "Pending" : "Active" }))} status={status} /></>}
    {active === "Packages" && <section className="workspace-panel"><div className="section-title"><div><h2>Member packages</h2><p>Configure the demo catalog and review active selections.</p></div><button className="button button-outline" onClick={() => setNotice("Package editor opened in this demo.")}><Plus size={14} /> New package</button></div>{[["5-session pack", "฿3,400", "180 days", "Available"], ["13-session pack", "฿8,970", "180 days", "Available"], ["27-session pack", "฿17,550", "180 days", "Available"]].map(([name, price, validity, current]) => <div className="admin-task-row" key={name}><span className="admin-task-icon"><Wallet size={16} /></span><span><b>{name}</b><small>{price} · {validity}</small></span><Pill>{status[name] || current}</Pill><button className="button button-outline" onClick={() => setStatus((value) => ({ ...value, [name]: (value[name] || current) === "Available" ? "Paused" : "Available" }))}>{(status[name] || current) === "Available" ? "Pause" : "Activate"}</button></div>)}</section>}
    {active === "Reports" && <div className="workspace-columns"><section className="workspace-panel"><div className="section-title"><div><h2>Bookings over time</h2><p>Sample weekly session volume.</p></div><select className="workspace-select"><option>Last 7 days</option><option>Last 30 days</option></select></div><div className="trainer-week-bars admin-report-bars">{[["M", 35], ["T", 68], ["W", 49], ["T", 77], ["F", 58], ["S", 92], ["S", 25]].map(([day, height], index) => <div key={`${day}-${index}`}><span>{height}%</span><i style={{ height: `${height}%` }} /><small>{day}</small></div>)}</div></section><section className="workspace-panel"><h2>Platform health</h2><div className="admin-activity-row"><CheckCircle2 size={17} /><span><b>Bookings confirmed</b><small>86% of requests</small></span></div><div className="admin-activity-row"><Star size={17} /><span><b>Average trainer rating</b><small>4.8 / 5.0</small></span></div></section></div>}
    {active === "Settings" && <section className="workspace-panel"><div className="section-title"><div><h2>Platform settings</h2><p>Controls shown here are local demo preferences.</p></div><ShieldCheck size={18} /></div>{[["Trainer verification review", "Admin approval required"], ["Member booking reminders", "Send 24 hours before a session"], ["Package catalogue", "Active member packages"]].map(([label, detail]) => <div className="notification-setting" key={label}><div><b>{label}</b><p>{detail}</p></div><button className={`toggle-switch ${(status[label] || "on") === "on" ? "on" : ""}`} aria-label={`Toggle ${label}`} aria-pressed={(status[label] || "on") === "on"} onClick={() => setStatus((value) => ({ ...value, [label]: (value[label] || "on") === "on" ? "off" : "on" }))}><i /></button></div>)}</section>}
    </div></section>;
}

function AdminFilters({ query, setQuery, placeholder }: { query: string; setQuery: (value: string) => void; placeholder: string }) {
  return <div className="admin-filter-row"><label className="search-bar"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} /></label><select className="workspace-select"><option>All statuses</option><option>Active</option><option>Pending</option><option>Confirmed</option></select><button className="button button-outline"><ChevronDown size={14} /> Filters</button></div>;
}

function AdminTable({ rows, action, status }: { rows: string[][]; action: (id: string, current: string) => void; status: Record<string, string> }) {
  return <div className="workspace-panel admin-table-wrap"><table className="admin-table"><thead><tr><th>{rows[0]?.[0]?.includes("@") ? "Account" : "Member / session"}</th><th>Details</th><th>Status</th><th>Action</th></tr></thead><tbody>{rows.map(([name, detail, extra, current]) => <tr key={name}><td><b>{name}</b></td><td>{detail}{extra ? ` · ${extra}` : ""}</td><td><span className={`booking-status ${(status[name] || current).toLowerCase()}`}>{status[name] || current}</span></td><td><button className="button button-outline" onClick={() => action(name, status[name] || current)}>{(status[name] || current) === "Confirmed" ? "Complete" : (status[name] || current) === "Active" ? "Pause" : "Activate"}</button></td></tr>)}</tbody></table>{!rows.length && <div className="empty-state"><Search size={23} /><h3>No records found</h3><p>Try clearing your search and checking again.</p></div>}<p className="auth-notice">Any status changes are temporary browser-only previews.</p></div>;
}

function WorkspaceMobileNav({ items, active, navigate }: { items: readonly (readonly [string, string, LucideIcon])[]; active: string; navigate: Screen }) {
  return <nav className="workspace-mobile-nav" aria-label="Workspace navigation">{items.map(([key, label, Icon]) => <button key={key} className={active === key ? "active" : ""} onClick={() => navigate(key)}><Icon size={18} /><span>{label}</span></button>)}</nav>;
}
