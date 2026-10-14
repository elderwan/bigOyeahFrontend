"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CalendarDays,
  ChevronRight,
  CircleHelp,
  MapPin,
  ShieldCheck,
  Star,
  Trophy
} from "lucide-react";
import { PackageType, PaymentMethod, ServiceMode, MembershipLevel } from "@/lib/database";
import { labels } from "@/lib/labels";
import {
  MemberPreviewBooking,
  preview_coach_courses,
  preview_coach_listings,
  preview_courses,
  formatBookingDate,
  preview_membership_levels
} from "@/lib/member-preview-data";
import {
  apiCreateBooking,
  apiPurchasePackage,
  apiGetOrderPromptPayQr,
  getAccessToken
} from "@/lib/api-client";

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`pill ${className}`}>{children}</span>;
}

function Photo({ id, alt = "" }: { id: string; alt?: string }) {
  return (
    <span
      className="coach-photo"
      aria-hidden="true"
      style={{
        backgroundImage: `url("https://images.unsplash.com/${id}?auto=format&fit=crop&w=480&q=80")`
      }}
    />
  );
}

function formatSqlTime(start_time: string): string {
  if (!start_time) return "";
  const parts = start_time.split(":");
  const hour = Number(parts[0] || 0);
  const minute = Number(parts[1] || 0);
  return `${String(hour % 12 || 12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}

export function CheckoutScreen({
  booking_date,
  start_time,
  service_mode,
  package_type,
  setPackageChoice,
  membership_level,
  setLevelId,
  payment_method,
  setPaymentMethod,
  navigate,
  course,
  coach,
  onBookingSuccess
}: {
  booking_date: string;
  start_time: string;
  service_mode: "GYM" | "HOME";
  package_type: PackageType | null;
  setPackageChoice: (value: PackageType | null) => void;
  membership_level: MembershipLevel;
  setLevelId: (value: number) => void;
  payment_method: PaymentMethod;
  setPaymentMethod: (value: PaymentMethod) => void;
  navigate: (screen: string) => void;
  course: (typeof preview_courses)[number];
  coach: (typeof preview_coach_listings)[number];
  onBookingSuccess?: (qr: { order_id: number; payload: string; amount?: number } | null) => void;
}) {
  const coach_course =
    preview_coach_courses.find(
      (item) => item.coach_id === coach.coach.coach_id && item.course_id === course.course_id
    ) || coach.coach_course;

  const methods: { name: string; value: PaymentMethod; detail: string; icon: string }[] = [
    { name: "PromptPay", value: "PROMPTPAY", detail: "Scan to pay with any Thai bank", icon: "◉" },
    { name: "Credit / Debit Card", value: "CARD", detail: "Visa, Mastercard", icon: "▣" },
    { name: "Cash", value: "CASH", detail: "Pay in person at gym", icon: "฿" },
    { name: "Package credit", value: "PACKAGE_CREDIT", detail: "Use a remaining session", icon: "◉" }
  ];

  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      if (getAccessToken()) {
        if (package_type) {
          try {
            const pkgRes = await apiPurchasePackage({ package_type, payment_method });
            if (pkgRes?.order_id && payment_method === "PROMPTPAY") {
              try {
                const qrRes = await apiGetOrderPromptPayQr(pkgRes.order_id);
                if (qrRes?.promptpay_payload || qrRes?.qr_data) {
                  onBookingSuccess?.({
                    order_id: pkgRes.order_id,
                    payload: qrRes.promptpay_payload || qrRes.qr_data,
                    amount: qrRes.amount
                  });
                }
              } catch (qrErr: any) {
                console.warn("PromptPay QR fetch error:", qrErr.message);
              }
            }
          } catch (e: any) {
            console.warn("Purchase package error:", e.message);
          }
        }

        const dur = course.default_duration || 60;
        const roundedDur = Math.max(10, Math.round(dur / 10) * 10);
        let sTime = start_time || "09:00";
        const [sh, sm] = sTime.split(":").map(Number);
        const alignedSm = Math.min(50, Math.round((sm || 0) / 10) * 10);
        sTime = `${String(sh || 9).padStart(2, "0")}:${String(alignedSm).padStart(2, "0")}`;

        // Omit price so backend calculates discount and final amount automatically!
        await apiCreateBooking({
          coach_id: coach.coach.coach_id,
          course_id: course.course_id,
          gym_id: service_mode === "GYM" ? coach.gym.gym_id : null,
          booking_date: booking_date || "2026-04-20",
          start_time: sTime,
          duration_minutes: roundedDur,
          break_minutes: 10,
          service_mode,
          service_district: service_mode === "HOME" ? coach.coach_service.service_area || "NIMMAN" : null,
          service_address: service_mode === "HOME" ? "Chiang Mai" : null
        });
      }
    } catch (err: any) {
      console.warn("Backend booking create:", err.message);
    } finally {
      setConfirming(false);
      navigate("success");
    }
  };

  return (
    <div className="content-wrap narrow-wrap">
      <button className="back-link" onClick={() => navigate("booking")}>
        <ArrowLeft size={16} /> Back to time selection
      </button>
      <div className="page-heading">
        <div>
          <p className="eyebrow">ONE LAST STEP</p>
          <h1>Your time is waiting.</h1>
          <p className="page-detail">Review your session and choose how you’d like to pay.</p>
        </div>
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          <section className="checkout-card">
            <div className="summary-coach">
              <Photo id={coach.ui.image} alt="" />
              <span>
                <b>{coach.display_name}</b>
                <small>{course.course_name}</small>
                <small>
                  <Star size={12} fill="currentColor" /> {coach.ui.avg_rating} · ฿{coach_course.price_per_session}
                </small>
              </span>
              <Pill className="verified-pill">
                <ShieldCheck size={13} /> Verified
              </Pill>
            </div>
            <div className="checkout-detail-row">
              <span>
                <CalendarDays size={15} /> {formatBookingDate(booking_date)} · {formatSqlTime(start_time)}
              </span>
              <span>
                <MapPin size={15} /> {service_mode === "GYM" ? "Nimman Gym" : "At home"}
              </span>
            </div>
          </section>

          {package_type === null && (
            <section className="checkout-card">
              <div className="section-title">
                <div>
                  <h2>Member discount</h2>
                  <p>Your membership makes every session go further.</p>
                </div>
                <Pill className="gold-pill">
                  <Award size={13} /> Member
                </Pill>
              </div>
              <div className="membership-choice-row">
                <span className="membership-medal">
                  <Trophy size={18} />
                </span>
                <span>
                  <b>{membership_level.level_name}</b>
                  <small>{membership_level.discount_rate * 100}% off this session</small>
                </span>
                <strong>− ฿{Math.round(coach_course.price_per_session * membership_level.discount_rate)}</strong>
              </div>
              <div className="tier-selector">
                {preview_membership_levels.map((item) => (
                  <button
                    key={item.level_id}
                    className={`tier-option ${membership_level.level_id === item.level_id ? "selected" : ""}`}
                    onClick={() => setLevelId(item.level_id)}
                  >
                    {item.level_name.replace(" Member", "")}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="checkout-card">
            <div className="section-title">
              <div>
                <h2>Session package</h2>
                <p>Package types follow the FitBooking plan options.</p>
              </div>
              <button className="text-link" onClick={() => navigate("packages")}>
                Compare plans <ArrowRight size={14} />
              </button>
            </div>
            <div className="package-choices">
              {(
                [
                  { name: "Single session", type: null, price: "฿720", detail: "Flexible, one at a time" },
                  { name: "5+1 Sessions", type: "5+1", price: "฿3,400", detail: "5 paid + 1 bonus · 180-day validity" },
                  { name: "10+3 Sessions", type: "10+3", price: "฿8,970", detail: "10 paid + 3 bonus · Best value" },
                  { name: "20+7 Sessions", type: "20+7", price: "฿17,550", detail: "20 paid + 7 bonus · 180-day validity" }
                ] as { name: string; type: PackageType | null; price: string; detail: string }[]
              ).map(({ name, type, price, detail }) => (
                <button
                  key={type || "single-session"}
                  className={`package-choice ${package_type === type ? "selected" : ""}`}
                  onClick={() => setPackageChoice(type)}
                >
                  <span className="radio-dot" />
                  <span>
                    <b>{name}</b>
                    <small>{detail}</small>
                  </span>
                  <strong>{price}</strong>
                </button>
              ))}
            </div>
          </section>

          <section className="checkout-card">
            <div className="section-title">
              <div>
                <h2>Payment method</h2>
                <p>Choose how you’d like to complete your order.</p>
              </div>
            </div>
            <div className="payment-method-list">
              {methods.map((method) => (
                <button
                  key={method.value}
                  className={`payment-option ${payment_method === method.value ? "selected" : ""}`}
                  onClick={() => setPaymentMethod(method.value)}
                >
                  <span className="radio-dot" />
                  <span className="payment-method-icon">{method.icon}</span>
                  <span>
                    <b>{method.name}</b>
                    <small>{method.detail}</small>
                  </span>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="checkout-total-card">
          <p className="eyebrow">ORDER SUMMARY</p>
          <div className="summary-line">
            <span>{course.course_name}</span>
            <b>฿{coach_course.price_per_session}</b>
          </div>
          {package_type === null ? (
            <div className="summary-line subdued">
              <span>
                {membership_level.level_name} · {membership_level.discount_rate * 100}%
              </span>
              <b>−฿{Math.round(coach_course.price_per_session * membership_level.discount_rate)}</b>
            </div>
          ) : (
            <div className="summary-line subdued">
              <span>{labels.package_type[package_type]} package</span>
              <b>No membership discount</b>
            </div>
          )}
          <div className="summary-divider" />
          <div className="summary-total">
            <span>Total due today</span>
            <b>
              {package_type === null
                ? `฿${Math.round(coach_course.price_per_session * (1 - membership_level.discount_rate))}`
                : package_type === "5+1"
                ? "฿3,400"
                : package_type === "20+7"
                ? "฿17,550"
                : "฿8,970"}
            </b>
          </div>
          <button
            className="button button-primary"
            onClick={handleConfirm}
            disabled={confirming}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {confirming ? "Confirming..." : "Confirm booking"} <ArrowRight size={16} />
          </button>
          <p className="secure-note">
            <ShieldCheck size={13} /> Secure booking with Chiang Mai verified coaches
          </p>
          <button className="text-link checkout-help" onClick={() => navigate("profile")}>
            <CircleHelp size={14} /> Need a hand?
          </button>
        </aside>
      </div>
    </div>
  );
}
