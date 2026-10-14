"use client";

import {
  Activity,
  ArrowRight,
  Award,
  CalendarDays,
  ChevronRight,
  Clock3,
  Flame,
  MapPin,
  Sparkles,
  Star,
  Trophy
} from "lucide-react";
import { PublicDemoAccount } from "@/lib/demo-auth";
import {
  MemberPreviewBooking,
  formatBookingDate,
  dateNow,
  getMembershipTierInfo
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

const featuredCoaches = [
  { name: "Tan Chaiyaporn", short: "Coach Tan", title: "Strength & Conditioning", rating: "4.9", reviews: 128, area: "Nimman", price: 800, level: "ADVANCED", image: "photo-1583454110551-21f2fa2afe61" },
  { name: "May Suthida", short: "Coach May", title: "Mobility & Wellness", rating: "4.8", reviews: 96, area: "Old City", price: 750, level: "INTERMEDIATE", image: "photo-1544367567-0f2fcb009e0b" },
  { name: "Jeff Nopparat", short: "Coach Jeff", title: "Functional Fitness", rating: "4.9", reviews: 84, area: "Central", price: 900, level: "MASTER", image: "photo-1500648767791-00dcc994a43e" }
];

export function HomeScreen({
  navigate,
  notify,
  account,
  previewBookings = []
}: {
  navigate: (screen: string) => void;
  notify: (message: string) => void;
  account: PublicDemoAccount;
  previewBookings?: MemberPreviewBooking[];
}) {
  const tierInfo = getMembershipTierInfo(account.total_spend, account.level_code);

  const completedCount = previewBookings.filter((b) => b.booking.status === "COMPLETED").length;
  const weeklyGoal = 4;
  const weekPct = Math.min(100, Math.round((completedCount / weeklyGoal) * 100));

  const nextSession = previewBookings.find(
    (b) => ["CONFIRMED", "PENDING"].includes(b.booking.status) && b.booking.booking_date >= dateNow()
  );

  return (
    <div className="content-wrap">
      <div className="home-greeting">
        <div>
          <p className="eyebrow">Your FitBooking home</p>
          <h1>
            Welcome, {account.display_name.split(" ")[0]} <span className="sun-emoji">☀</span>
          </h1>
          <p className="page-detail">A little progress adds up. You’re doing great.</p>
        </div>
        <Pill className={tierInfo.tierCode === "BRONZE" ? "bronze-pill" : "gold-pill"}>
          <Award size={14} /> {tierInfo.tier} Member
        </Pill>
      </div>

      <section className="week-banner">
        <div className="week-progress-copy">
          <span className="week-overline">YOUR WEEK</span>
          <strong>
            {completedCount}
            <span>/{weeklyGoal}</span>
          </strong>
          <span>workouts done</span>
          <button onClick={() => navigate("progress")}>
            See your progress <ArrowRight size={14} />
          </button>
        </div>
        <div className="week-progress-ring">
          <div>
            <b>{weekPct}%</b>
            <span>weekly goal</span>
          </div>
        </div>
        <div className="week-mini-stats">
          <div>
            <span className="mini-stat-icon coral">
              <Flame size={16} />
            </span>
            <span>
              <b>{completedCount * 420}</b>
              <small>Calories</small>
            </span>
          </div>
          <div>
            <span className="mini-stat-icon blue">
              <Activity size={16} />
            </span>
            <span>
              <b>{completedCount * 50} min</b>
              <small>Active time</small>
            </span>
          </div>
          <div>
            <span className="mini-stat-icon lime">
              <Sparkles size={15} />
            </span>
            <span>
              <b>{completedCount > 0 ? `${completedCount} days` : "0 days"}</b>
              <small>Streak</small>
            </span>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-title">
          <div>
            <h2>Your next session</h2>
            <p>A good day to get stronger.</p>
          </div>
          <button className="text-link" onClick={() => navigate("bookings")}>
            All bookings <ArrowRight size={15} />
          </button>
        </div>

        {nextSession ? (
          <button className="next-session-card" onClick={() => navigate("bookings")}>
            <Photo id={nextSession.ui?.coach_image || featuredCoaches[0].image} alt="" />
            <span className="next-session-info">
              <span className="next-session-time">
                <CalendarDays size={14} /> {formatBookingDate(nextSession.booking.booking_date)} · {formatSqlTime(nextSession.booking.start_time)}
              </span>
              <strong>{nextSession.course.course_name}</strong>
              <span>
                {nextSession.display_name} · {nextSession.gym?.gym_name || "Nimman Fitness Club"}
              </span>
              <span className="session-facts">
                <span><Clock3 size={13} /> {nextSession.booking.duration_minutes || 60} min</span>
                <span><MapPin size={13} /> Chiang Mai</span>
              </span>
            </span>
            <span className="next-session-arrow">
              <ChevronRight size={19} />
            </span>
          </button>
        ) : (
          <div
            className="next-session-card"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "default"
            }}
          >
            <div>
              <strong style={{ fontSize: "16px", color: "#0f172a" }}>
                No upcoming sessions scheduled
              </strong>
              <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>
                Ready to move? Book your next one-on-one session with a verified coach.
              </p>
            </div>
            <button
              className="button button-primary"
              onClick={() => navigate("explore")}
              style={{ whiteSpace: "nowrap" }}
            >
              Find a coach <ArrowRight size={14} />
            </button>
          </div>
        )}
      </section>

      <section className="section-block">
        <div className="section-title">
          <div>
            <h2>Good people to train with</h2>
            <p>Recommended coaches near you</p>
          </div>
          <button className="text-link" onClick={() => navigate("explore")}>
            See all <ArrowRight size={15} />
          </button>
        </div>
        <div className="coach-grid coach-grid-3">
          {featuredCoaches.map((coach) => (
            <article key={coach.name} className="coach-card" onClick={() => navigate("coach")}>
              <Photo id={coach.image} alt="" />
              <div className="coach-card-body">
                <div className="coach-card-header">
                  <div>
                    <h3>{coach.name}</h3>
                    <p>{coach.title}</p>
                  </div>
                  <span className="coach-rating">
                    <Star size={13} fill="currentColor" /> {coach.rating}
                  </span>
                </div>
                <div className="coach-card-footer">
                  <span><MapPin size={13} /> {coach.area}</span>
                  <strong>฿{coach.price} / session</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-bottom-grid">
        <div className="home-promo">
          <div>
            <Pill className="pill-glass">
              <Sparkles size={12} /> MEMBER BENEFIT
            </Pill>
            <h2>
              More sessions.<br />
              More of what moves you.
            </h2>
            <button className="button button-light" onClick={() => navigate("packages")}>
              Find your package <ArrowRight size={15} />
            </button>
          </div>
          <div className="promo-sun" />
        </div>

        <div className="small-membership-card">
          <div className="membership-medal">
            <Trophy size={20} />
          </div>
          <div>
            <span>Your membership</span>
            <h3>{tierInfo.tier} Member</h3>
            <p>{tierInfo.nextTierText}</p>
            <div className="membership-track">
              <i style={{ width: `${tierInfo.percent}%` }} />
            </div>
          </div>
          <button
            className="icon-button"
            onClick={() => navigate("packages")}
            aria-label="View membership"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}
