"use client";

import { useState } from "react";
import {
  ArrowRight,
  Award,
  Check,
  CircleHelp,
  CreditCard,
  LogOut,
  MoreHorizontal,
  ShieldCheck,
  Trophy,
  UserRound,
  Wallet
} from "lucide-react";
import { PublicDemoAccount } from "@/lib/demo-auth";
import { labels } from "@/lib/labels";
import { MemberPackage } from "@/lib/database";
import { MemberPreviewBooking, getMembershipTierInfo } from "@/lib/member-preview-data";

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`pill ${className}`}>{children}</span>;
}

function PrimaryButton({
  children,
  onClick,
  disabled = false,
  className = ""
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      className={`button button-primary ${className}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
}

function PageHeading({
  eyebrow,
  title,
  detail
}: {
  eyebrow?: string;
  title: string;
  detail?: string;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {detail && <p className="page-detail">{detail}</p>}
      </div>
    </div>
  );
}

export function ProfileScreen({
  tab,
  setTab,
  notify,
  account,
  onSignOut,
  onSave,
  navigate,
  previewBookings = [],
  memberPackages = [],
  memberPackagesLoading = false,
  memberPackagesError = ""
}: {
  tab: string;
  setTab: (value: string) => void;
  notify: (message: string) => void;
  account: PublicDemoAccount;
  onSignOut: () => void;
  onSave: (fields: Partial<PublicDemoAccount>) => Promise<void>;
  navigate: (screen: string) => void;
  previewBookings?: MemberPreviewBooking[];
  memberPackages?: MemberPackage[];
  memberPackagesLoading?: boolean;
  memberPackagesError?: string;
}) {
  const [displayName, setDisplayName] = useState(account.display_name);
  const [email, setEmail] = useState(account.email);
  const [phone, setPhone] = useState(account.phone || "");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER" | "">(account.gender || "");
  const [birthDate, setBirthDate] = useState(account.birth_date || "");
  const [heightCm, setHeightCm] = useState(account.height_cm ? String(account.height_cm) : "");
  const [weightKg, setWeightKg] = useState(account.weight_kg ? String(account.weight_kg) : "");
  const [fitnessGoal, setFitnessGoal] = useState(account.fitness_goal || "");

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Notifications tab removed per user request
  const tabs = ["Personal information", "Membership", "Payment methods", "Payment history", "Help & support"];

  const handleSavePersonal = async () => {
    setFormError("");
    if (!displayName.trim()) {
      setFormError("Full name is required.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("A valid email address is required.");
      return;
    }
    if (!phone.trim()) {
      setFormError("Phone number is required.");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        display_name: displayName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        gender: gender ? (gender as "MALE" | "FEMALE" | "OTHER") : null,
        birth_date: birthDate || null,
        height_cm: heightCm ? Number(heightCm) : null,
        weight_kg: weightKg ? Number(weightKg) : null,
        fitness_goal: fitnessGoal.trim() || null
      });
      notify("Profile updated successfully.");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const tierInfo = getMembershipTierInfo(account.total_spend, account.level_code);

  const paymentOrders = previewBookings
    .filter((b) => b.orders && b.orders.length > 0)
    .flatMap((b) => b.orders.map((o) => ({ order: o, booking: b })));
  const activePackages = memberPackages.filter((item) => item.status === "ACTIVE");

  return (
    <div className="content-wrap narrow-wrap">
      <PageHeading
        eyebrow="A LITTLE MORE ABOUT YOU"
        title="Your profile"
        detail="Keep your details and preferences up to date."
      />
      <section className="profile-summary-card">
        <div className="member-avatar large">{account.display_name.slice(0, 1).toUpperCase()}</div>
        <div>
          <h2>{account.display_name}</h2>
          <span className="profile-email">{account.email}</span>
          <Pill className={tierInfo.tierCode === "BRONZE" ? "bronze-pill" : "gold-pill"}>
            <Award size={12} /> {tierInfo.tier.toUpperCase()}
          </Pill>
        </div>
        <button className="text-link" onClick={() => setTab("Personal information")}>
          Edit profile <ArrowRight size={14} />
        </button>
      </section>

      <div className="profile-settings-layout">
        <nav className="settings-menu">
          {tabs.map((item, index) => {
            const icons = [UserRound, Award, CreditCard, Wallet, CircleHelp];
            const Icon = icons[index];
            return (
              <button
                key={item}
                className={tab === item ? "active" : ""}
                onClick={() => setTab(item)}
              >
                <Icon size={17} />
                {item}
              </button>
            );
          })}
          <button className="settings-signout" onClick={onSignOut}>
            <LogOut size={17} /> Sign out
          </button>
        </nav>

        <section className="settings-detail-panel">
          <div className="section-title">
            <div>
              <h2>{tab}</h2>
              <p>Manage your FitBooking preferences.</p>
            </div>
            <button className="icon-button" aria-label="More settings">
              <MoreHorizontal size={19} />
            </button>
          </div>

          {tab === "Personal information" && (
            <div className="settings-form">
              <label className="settings-field">
                Username (read-only)
                <input value={account.username} readOnly disabled className="input-readonly" />
                <small className="field-hint">The username is permanent and cannot be modified.</small>
              </label>
              <div className="admin-form-grid">
                <label className="settings-field">
                  Full name <span className="req-star">*</span>
                  <input
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      setFormError("");
                    }}
                    maxLength={100}
                  />
                </label>
                <label className="settings-field">
                  Email address <span className="req-star">*</span>
                  <input
                    value={email}
                    type="email"
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFormError("");
                    }}
                    maxLength={100}
                  />
                </label>
              </div>
              <div className="admin-form-grid">
                <label className="settings-field">
                  Phone number <span className="req-star">*</span>
                  <input
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setFormError("");
                    }}
                    maxLength={20}
                  />
                </label>
                <label className="settings-field">
                  Gender
                  <select
                    value={gender}
                    onChange={(e) => {
                      setGender(e.target.value as any);
                      setFormError("");
                    }}
                  >
                    <option value="">Prefer not to say</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </label>
              </div>
              <div className="admin-form-grid">
                <label className="settings-field">
                  Date of birth
                  <input
                    value={birthDate}
                    type="date"
                    onChange={(e) => {
                      setBirthDate(e.target.value);
                      setFormError("");
                    }}
                  />
                </label>
                <label className="settings-field">
                  Height (cm)
                  <input
                    value={heightCm}
                    type="number"
                    min="40"
                    max="260"
                    step="0.1"
                    placeholder="e.g. 165.0"
                    onChange={(e) => {
                      setHeightCm(e.target.value);
                      setFormError("");
                    }}
                  />
                </label>
              </div>
              <div className="admin-form-grid">
                <label className="settings-field">
                  Weight (kg)
                  <input
                    value={weightKg}
                    type="number"
                    min="20"
                    max="350"
                    step="0.1"
                    placeholder="e.g. 58.0"
                    onChange={(e) => {
                      setWeightKg(e.target.value);
                      setFormError("");
                    }}
                  />
                </label>
                <label className="settings-field">
                  Fitness goal
                  <input
                    value={fitnessGoal}
                    maxLength={200}
                    placeholder="What are you working toward?"
                    onChange={(e) => {
                      setFitnessGoal(e.target.value);
                      setFormError("");
                    }}
                  />
                </label>
              </div>
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <PrimaryButton onClick={handleSavePersonal} disabled={saving}>
                {saving ? "Saving changes…" : "Save changes"} <Check size={15} />
              </PrimaryButton>
            </div>
          )}

          {tab === "Membership" && (
            <>
              <div className="setting-membership">
                <span className="membership-medal">
                  <Trophy size={22} />
                </span>
                <div>
                  <Pill className={tierInfo.tierCode === "BRONZE" ? "bronze-pill" : "gold-pill"}>
                    {tierInfo.tierCode} MEMBER
                  </Pill>
                  <h3>{tierInfo.tier}</h3>
                  <p>
                    {tierInfo.discountRate * 100}% off sessions · ฿{(Number(account.total_spend) || 0).toLocaleString()} spent to date
                  </p>
                  <div className="membership-track">
                    <i style={{ width: `${tierInfo.percent}%` }} />
                  </div>
                  <small>
                    {tierInfo.nextTierText} · Tier discount applied automatically on booking checkout
                  </small>
                  <button
                    className="text-link"
                    onClick={() => navigate("packages")}
                    style={{ marginTop: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    View membership benefits <ArrowRight size={14} />
                  </button>
                </div>
              </div>
              <section className="profile-package-balances">
                <h3>Active session packages</h3>
                {memberPackagesLoading ? (
                  <p>Loading package balances…</p>
                ) : memberPackagesError ? (
                  <p role="alert">{memberPackagesError}</p>
                ) : activePackages.length ? (
                  activePackages.map((item) => (
                    <div key={item.package_id}>
                      <span>
                        <b>#{item.package_id} · {labels.package_type[item.package_type]}</b>
                        <small>
                          {item.remaining_sessions} of {item.total_sessions} sessions remaining
                        </small>
                      </span>
                      <strong>฿{Number(item.price).toLocaleString()}</strong>
                    </div>
                  ))
                ) : (
                  <p>No active session packages.</p>
                )}
              </section>
            </>
          )}

          {tab === "Payment methods" && (
            <div className="payment-simulation-card">
              <span className="payment-simulation-icon"><ShieldCheck size={17} /></span>
              <span>
                <b>No payment method is needed</b>
                <small>This demo only uses simulated payments and does not collect card or bank details.</small>
              </span>
              <Pill>Demo only</Pill>
            </div>
          )}

          {tab === "Payment history" && (
            <div>
              {paymentOrders.length > 0 ? (
                <div className="payment-history-list">
                  {paymentOrders.map(({ order, booking }) => (
                    <div key={order.order_id}>
                      <span>
                        <b>{booking.course.course_name}</b>
                        <small>
                          {order.payment_time || order.created_at || booking.booking.booking_date} ·{" "}
                          {order.payment_method
                            ? labels.payment_method[order.payment_method]
                            : order.payment_status === "PAID"
                            ? "Simulated payment"
                            : "No payment method"}{" "}
                          · {labels.payment_status[order.payment_status]}
                        </small>
                      </span>
                      <strong>฿{Number(order.final_amount ?? booking.booking.price).toLocaleString()}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" style={{ padding: "40px 16px", textAlign: "center" }}>
                  <Wallet size={32} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
                  <h3>No payment history yet</h3>
                  <p style={{ color: "#64748b", fontSize: "13px" }}>
                    Your simulated session receipts and package purchases will be listed here after checkout.
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === "Help & support" && (
            <div className="help-panel">
              <span className="help-round">
                <CircleHelp size={20} />
              </span>
              <h3>We’re here to help.</h3>
              <p>
                Questions about your session, coach, or membership? Our Chiang Mai support team is
                happy to help.
              </p>
              <button
                className="button button-outline"
                onClick={() => notify("Support chat opened in this preview.")}
              >
                Start a conversation <ArrowRight size={14} />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
