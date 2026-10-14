"use client";

import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  MoreHorizontal,
  Plus,
  Target
} from "lucide-react";
import {
  dateNow,
  dateOffset,
  formatBookingDate,
  weekdayForDate,
  type MemberPreviewBooking
} from "@/lib/member-preview-data";
import { labels } from "@/lib/labels";
import type { PublicDemoAccount } from "@/lib/demo-auth";

function formatSqlTime(start_time: string): string {
  if (!start_time) return "";
  const parts = start_time.split(":");
  const hour = Number(parts[0] || 0);
  const minute = Number(parts[1] || 0);
  return `${String(hour % 12 || 12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`pill ${className}`}>{children}</span>;
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

export function ProgressScreen({
  tab,
  setTab,
  navigate,
  account,
  previewBookings,
  onOpenBooking
}: {
  tab: string;
  setTab: (value: string) => void;
  navigate: (screen: string) => void;
  account: PublicDemoAccount;
  previewBookings: MemberPreviewBooking[];
  onOpenBooking: (item: MemberPreviewBooking) => void;
}) {
  const [goalDone, setGoalDone] = useState(false);
  const [weekAnchor, setWeekAnchor] = useState(dateNow());
  const [planDate, setPlanDate] = useState(dateNow());
  const monday = dateOffset(weekAnchor, 1 - weekdayForDate(weekAnchor));
  const weekDates = Array.from({ length: 7 }, (_, index) => dateOffset(monday, index));
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  const currentMemberId = account.member_id || 1;

  const completedThisWeek = previewBookings.filter(
    ({ booking }) =>
      booking.member_id === currentMemberId &&
      booking.status === "COMPLETED" &&
      booking.booking_date >= weekStart &&
      booking.booking_date <= weekEnd
  );

  const planBookings = previewBookings
    .filter(
      ({ booking }) =>
        booking.member_id === currentMemberId &&
        ["PENDING", "CONFIRMED"].includes(booking.status) &&
        booking.booking_date >= dateNow() &&
        booking.booking_date <= dateOffset(dateNow(), 30)
    )
    .sort((left, right) =>
      `${left.booking.booking_date} ${left.booking.start_time}`.localeCompare(
        `${right.booking.booking_date} ${right.booking.start_time}`
      )
    );

  const firstWeekday = weekdayForDate(dateNow()) - 1;
  const planDays = Array.from({ length: Math.ceil((firstWeekday + 31) / 7) * 7 }, (_, index) => {
    const planDateValue = dateOffset(dateNow(), index - firstWeekday);
    return planDateValue >= dateNow() && planDateValue <= dateOffset(dateNow(), 30)
      ? planDateValue
      : "";
  });

  const planAgenda = planBookings.filter(({ booking }) => booking.booking_date === planDate);
  const timeRows = Array.from({ length: 16 }, (_, index) => index + 6);
  const weekLabel = `${formatBookingDate(weekStart)} – ${formatBookingDate(weekEnd)}`;

  return (
    <div className="content-wrap narrow-wrap">
      <PageHeading
        eyebrow="SMALL STEPS, BIG FEELING"
        title="Look how far you’ve come."
        detail="Your effort, your pace, your progress."
      />
      <div className="progress-member-strip">
        <div className="member-avatar large">
          {(account.display_name || "M").slice(0, 1).toUpperCase()}
        </div>
        <span>
          <b>{account.display_name}</b>
          <small>
            <Pill className="gold-pill">
              <Award size={12} /> Member
            </Pill>
          </small>
        </span>
        <span className="progress-updated">Updated today</span>
      </div>
      <div className="progress-tabs">
        {["Overview", "Metrics", "Goals"].map((item) => (
          <button
            key={item}
            className={tab === item ? "active" : ""}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <>
          <section className="metric-section">
            <div className="section-title">
              <div>
                <h2>Your body, your baseline</h2>
                <p>Last updated after your check-in.</p>
              </div>
              <button className="text-link" onClick={() => setTab("Metrics")}>
                View all <ArrowRight size={14} />
              </button>
            </div>
            <div className="body-metric-grid">
              <div>
                <span>Weight</span>
                <b>
                  {account.weight_kg ? Number(account.weight_kg).toFixed(1) : "68"}{" "}
                  <small>kg</small>
                </b>
                <small>−1.2 kg this month</small>
              </div>
              <div>
                <span>Body fat</span>
                <b>
                  12<small>%</small>
                </b>
                <small>Steady this month</small>
              </div>
              <div>
                <span>BMI</span>
                <b>
                  {account.height_cm && account.weight_kg
                    ? (
                        Number(account.weight_kg) /
                        Math.pow(Number(account.height_cm) / 100, 2)
                      ).toFixed(1)
                    : "22.1"}
                </b>
                <small>Healthy range</small>
              </div>
            </div>
          </section>

          <section className="metric-section">
            <div className="section-title">
              <div>
                <h2>Weekly activity</h2>
                <p>Completed training by day and hour.</p>
              </div>
              <Pill>{completedThisWeek.length} completed sessions</Pill>
            </div>
            <div className="progress-week-toolbar">
              <button
                className="icon-button"
                aria-label="Previous week"
                onClick={() => setWeekAnchor(dateOffset(weekAnchor, -7))}
              >
                <ChevronLeft size={18} />
              </button>
              <b>{weekLabel}</b>
              <button
                className="icon-button"
                aria-label="Next week"
                onClick={() => setWeekAnchor(dateOffset(weekAnchor, 7))}
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <div
              className="progress-week-grid"
              role="table"
              aria-label="Weekly completed session timetable"
            >
              <div className="progress-week-head" role="row">
                <span role="columnheader">Time</span>
                {weekDates.map((day) => (
                  <span role="columnheader" key={day}>
                    {new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
                      new Date(`${day}T12:00:00`)
                    )}
                    <small>{Number(day.slice(-2))}</small>
                  </span>
                ))}
              </div>
              {timeRows.map((hour) => (
                <div className="progress-week-row" role="row" key={hour}>
                  <span className="progress-week-hour" role="rowheader">
                    {String(hour).padStart(2, "0")}:00
                  </span>
                  {weekDates.map((day) => {
                    const sessions = completedThisWeek.filter(
                      ({ booking }) =>
                        booking.booking_date === day &&
                        Number(booking.start_time.slice(0, 2)) === hour
                    );
                    return (
                      <div className="progress-week-cell" role="cell" key={`${day}-${hour}`}>
                        {sessions.map((item) => (
                          <button
                            className="progress-timetable-session"
                            key={item.booking.booking_id}
                            onClick={() => onOpenBooking(item)}
                          >
                            <b>
                              {formatSqlTime(item.booking.start_time)}–
                              {formatSqlTime(item.booking.end_time)}
                            </b>
                            <span>{item.course.course_name}</span>
                            <small>{item.display_name}</small>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            {!completedThisWeek.length && (
              <p className="progress-grid-empty">No completed sessions in this week yet.</p>
            )}
          </section>

          <section className="metric-section my-plan-section">
            <div className="section-title">
              <div>
                <h2>My plan</h2>
                <p>Upcoming bookings for the next 30 days.</p>
              </div>
              <Pill>{planBookings.length} sessions</Pill>
            </div>
            <div className="my-plan-calendar">
              <div className="my-plan-weekdays">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="my-plan-days">
                {planDays.map((day, index) => {
                  const sessionCount = day
                    ? planBookings.filter(({ booking }) => booking.booking_date === day).length
                    : 0;
                  return day ? (
                    <button
                      className={`my-plan-day ${day === planDate ? "selected" : ""} ${
                        sessionCount ? "has-plan-session" : ""
                      }`}
                      key={day}
                      onClick={() => setPlanDate(day)}
                      aria-pressed={day === planDate}
                    >
                      <span>{Number(day.slice(-2))}</span>
                      {sessionCount > 0 && <i aria-label={`${sessionCount} sessions`} />}
                    </button>
                  ) : (
                    <span className="my-plan-day-empty" key={`blank-${index}`} />
                  );
                })}
              </div>
            </div>
            <div className="my-plan-agenda">
              <h3>{formatBookingDate(planDate)}</h3>
              {planAgenda.length ? (
                planAgenda.map((item) => {
                  const amount = item.orders[0]?.final_amount ?? item.booking.price;
                  const place =
                    item.booking.service_mode === "GYM"
                      ? `${item.gym?.gym_name || "Gym"} · ${
                          item.gym ? labels.district[item.gym.district] : ""
                        }`
                      : `${item.booking.service_address || "Home service"} · ${
                          labels.district[item.booking.service_district || "NIMMAN"]
                        }`;
                  return (
                    <button
                      className="my-plan-session"
                      key={item.booking.booking_id}
                      onClick={() => onOpenBooking(item)}
                    >
                      <span className="my-plan-session-time">
                        {formatSqlTime(item.booking.start_time)} –{" "}
                        {formatSqlTime(item.booking.end_time)}
                      </span>
                      <span>
                        <b>{item.course.course_name}</b>
                        <small>
                          {item.display_name} · {place}
                        </small>
                        <small>
                          {item.booking.duration_minutes} min ·{" "}
                          {labels.service_mode[item.booking.service_mode]} ·{" "}
                          {labels.booking_status[item.booking.status]} ·{" "}
                          {item.booking.package_id
                            ? `Package #${item.booking.package_id}`
                            : "Single session"}
                        </small>
                      </span>
                      <strong>
                        ฿{item.booking.price.toLocaleString()} · ฿{amount.toLocaleString()} total
                      </strong>
                      <ChevronRight size={17} />
                    </button>
                  );
                })
              ) : (
                <div className="my-plan-empty">
                  No sessions planned for this day. Choose another date or book a session.
                </div>
              )}
            </div>
          </section>

          <section className="metric-section">
            <div className="section-title">
              <div>
                <h2>Training goals</h2>
                <p>Keep your next step in sight.</p>
              </div>
              <button className="text-link" onClick={() => setTab("Goals")}>
                All goals <ArrowRight size={14} />
              </button>
            </div>
            <div className="goal-card">
              <span className="goal-icon">
                <Target size={20} />
              </span>
              <div>
                <b>{account.fitness_goal || "Build muscle"}</b>
                <p>Personal training plan</p>
                <div className="goal-progress">
                  <i style={{ width: goalDone ? "100%" : "30%" }} />
                </div>
                <small>
                  {goalDone ? "Goal complete · nice work!" : "Active goal"} <b>{goalDone ? "100%" : "30%"}</b>
                </small>
              </div>
              <button
                className="icon-button"
                onClick={() => setGoalDone(!goalDone)}
                aria-label={goalDone ? "Reset goal" : "Complete goal"}
              >
                {goalDone ? <CheckCircle2 size={18} /> : <ChevronRight size={18} />}
              </button>
            </div>
          </section>
        </>
      )}

      {tab === "Metrics" && (
        <section className="metric-section">
          <div className="section-title">
            <div>
              <h2>Body metrics</h2>
              <p>Your latest check-in compared with last month.</p>
            </div>
            <Pill>Current</Pill>
          </div>
          <div className="body-metric-grid metrics-detail">
            {[
              ["Weight", `${account.weight_kg ? Number(account.weight_kg).toFixed(1) : "68"} kg`, "Recorded weight"],
              ["Height", `${account.height_cm ? Number(account.height_cm).toFixed(0) : "175"} cm`, "Recorded height"],
              [
                "BMI",
                account.height_cm && account.weight_kg
                  ? (
                      Number(account.weight_kg) /
                      Math.pow(Number(account.height_cm) / 100, 2)
                    ).toFixed(1)
                  : "22.1",
                "Healthy range"
              ],
              ["Active Sessions", `${planBookings.length}`, "Planned bookings"],
              ["Completed", `${completedThisWeek.length}`, "This week"],
              ["Goal", account.fitness_goal || "General Fitness", "Personal target"]
            ].map(([name, value, note]) => (
              <div key={name}>
                <span>{name}</span>
                <b>{value}</b>
                <small>{note}</small>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "Goals" && (
        <section className="metric-section">
          <div className="section-title">
            <div>
              <h2>Your training goals</h2>
              <p>Progress that’s yours to define.</p>
            </div>
            <button className="text-link" onClick={() => navigate("profile")}>
              <Plus size={15} /> Add a goal
            </button>
          </div>
          {[
            [account.fitness_goal || "Build muscle", "Active training target", "60%"],
            ["Move more each week", "Consistency focus", "50%"],
            ["Feel more flexible", "Recovery & Mobility", "40%"]
          ].map(([goal, sub, percent]) => (
            <div className="goal-card goal-card-spaced" key={goal}>
              <span className="goal-icon">
                <Target size={20} />
              </span>
              <div>
                <b>{goal}</b>
                <p>{sub}</p>
                <div className="goal-progress">
                  <i style={{ width: percent }} />
                </div>
                <small>{percent} progress</small>
              </div>
              <button
                className="icon-button"
                onClick={() => setGoalDone(!goalDone)}
              >
                <MoreHorizontal size={18} />
              </button>
            </div>
          ))}
        </section>
      )}

      <div className="training-areas">
        <p className="eyebrow">TRAINING FOCUS</p>
        <div className="tag-row">
          {["Strength", "HIIT", "Mobility", "Yoga"].map((area) => (
            <Pill key={area}>
              <Dumbbell size={13} /> {area}
            </Pill>
          ))}
        </div>
      </div>
    </div>
  );
}
