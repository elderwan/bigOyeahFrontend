"use client";

import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Plus,
  QrCode,
  Star
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { labels } from "@/lib/labels";
import {
  preview_coach_listings,
  preview_courses,
  formatBookingDate
} from "@/lib/member-preview-data";

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

export function SuccessScreen({
  booking_date,
  start_time,
  navigate,
  course,
  coach,
  promptPayQr
}: {
  booking_date: string;
  start_time: string;
  navigate: (screen: string) => void;
  course: (typeof preview_courses)[number];
  coach: (typeof preview_coach_listings)[number];
  promptPayQr?: { order_id: number; payload: string; amount?: number } | null;
}) {
  return (
    <div className="content-wrap success-wrap">
      <div className="success-top">
        <span className="success-mark">
          <Check size={32} />
        </span>
        <p className="eyebrow">IT’S HAPPENING</p>
        <h1>You’re booked!</h1>
        <p>Your session reservation has been confirmed with your trainer.</p>
      </div>

      <div className="success-ticket">
        <div className="ticket-heading">
          <div>
            <span>YOUR SESSION</span>
            <h2>{course.course_name}</h2>
          </div>
          <Pill className="booking-status preview-pill">Confirmed</Pill>
        </div>

        <div className="ticket-coach">
          <Photo id={coach.ui.image} alt="" />
          <span>
            <b>{coach.display_name}</b>
            <small>Personal trainer · {labels.coach_level[coach.coach.coach_level]}</small>
          </span>
          <div className="stars">
            ★★★★★ <small>{coach.ui.avg_rating}</small>
          </div>
        </div>

        <div className="ticket-details">
          <div>
            <CalendarDays size={17} />
            <span>
              {formatBookingDate(booking_date)}
              <small>{course.default_duration} minutes · Chiang Mai</small>
            </span>
          </div>
          <div>
            <Clock3 size={17} />
            <span>
              {formatSqlTime(start_time)}
              <small>Arrive 10 minutes early</small>
            </span>
          </div>
          <div>
            <MapPin size={17} />
            <span>
              Nimman Fitness Club
              <small>Chiang Mai · 1.2 km away</small>
            </span>
          </div>
        </div>

        <div
          className="ticket-qr"
          style={{ flexDirection: "column", alignItems: "center", textAlign: "center", gap: "10px" }}
        >
          {promptPayQr ? (
            <div
              style={{
                background: "#ffffff",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                display: "inline-block",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
              }}
            >
              <QRCodeSVG value={promptPayQr.payload} size={150} />
            </div>
          ) : (
            <div className="fake-qr" aria-label="Illustrative check-in QR code">
              <QrCode size={76} strokeWidth={1.3} />
            </div>
          )}
          <span>
            <b>{promptPayQr ? `PromptPay Order #${promptPayQr.order_id}` : "Session check-in pass"}</b>
            <small>
              {promptPayQr
                ? `Amount: ฿${(promptPayQr.amount || 3400).toLocaleString()} · Scan with any Thai mobile banking app.`
                : "Present this pass when checking in at the front desk."}
            </small>
          </span>
        </div>

        <div className="ticket-actions">
          <button
            className="button button-primary"
            onClick={() => navigate("bookings")}
          >
            View my bookings <ArrowRight size={15} />
          </button>
          <button className="button button-outline" onClick={() => navigate("home")}>
            Back to home
          </button>
        </div>
      </div>

      <button className="text-link success-detail-link" onClick={() => navigate("profile")}>
        Add to calendar <Plus size={14} />
      </button>
    </div>
  );
}
