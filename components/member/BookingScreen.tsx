"use client";

import { useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  Dumbbell,
  House,
  MapPin,
  ShieldCheck,
  Star
} from "lucide-react";
import {
  formatBookingDate,
  preview_coach_courses,
  preview_coach_listings,
  preview_courses
} from "@/lib/member-preview-data";
import { labels } from "@/lib/labels";
import type { MembershipLevel } from "@/lib/database";
import { MemberBookingPicker } from "@/components/member-booking-picker";

function formatSqlTime(start_time: string): string {
  if (!start_time) return "";
  const parts = start_time.split(":");
  const hour = Number(parts[0] || 0);
  const minute = Number(parts[1] || 0);
  return `${String(hour % 12 || 12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}

function addMinutesToSqlTime(start_time: string, minutesToAdd: number): string {
  if (!start_time) return "";
  const parts = start_time.split(":");
  const hour = Number(parts[0] || 0);
  const minute = Number(parts[1] || 0);
  const total = hour * 60 + minute + minutesToAdd;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

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

function PrimaryButton({
  children,
  onClick,
  disabled
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button className="button button-primary" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function BookingScreen({
  coach_id,
  course_id,
  booking_date,
  setBookingDate,
  start_time,
  setStartTime,
  bookingSelectionValid,
  setBookingSelectionValid,
  service_mode,
  setMode,
  district,
  setDistrict,
  navigate,
  coach,
  course,
  membership_level
}: {
  coach_id: number;
  course_id: number;
  booking_date: string;
  setBookingDate: (value: string) => void;
  start_time: string;
  setStartTime: (value: string) => void;
  bookingSelectionValid: boolean;
  setBookingSelectionValid: (value: boolean) => void;
  service_mode: "GYM" | "HOME";
  setMode: (value: "GYM" | "HOME") => void;
  district: string;
  setDistrict: (value: string) => void;
  navigate: (screen: string) => void;
  coach: (typeof preview_coach_listings)[number];
  course: (typeof preview_courses)[number];
  membership_level: MembershipLevel;
}) {
  const coach_course = preview_coach_courses.find(
    (item) => item.coach_id === coach_id && item.course_id === course_id
  );
  const supportsGym =
    coach.coach.service_mode !== "HOME" &&
    coach.coach_service.gym_id === coach.gym.gym_id &&
    coach.gym.is_active === 1;
  const supportsHome =
    coach.coach.service_mode !== "GYM" && coach.coach_service.is_home_service === 1;
  const districts = coach.coach_service.service_area
    ? [coach.coach_service.service_area]
    : (Object.keys(labels.district) as (keyof typeof labels.district)[]);
  const validPlace =
    service_mode === "GYM"
      ? supportsGym
      : supportsHome && districts.includes(district as keyof typeof labels.district);
  const validCourse =
    course.is_active === 1 &&
    coach_course?.is_active === 1 &&
    coach_course.coach_id === coach_id &&
    coach_course.course_id === course_id;
  const canContinue = bookingSelectionValid && validCourse && validPlace;

  useEffect(() => {
    if (service_mode === "GYM" && !supportsGym && supportsHome) {
      setMode("HOME");
      if (coach.coach_service.service_area) setDistrict(coach.coach_service.service_area);
    } else if (service_mode === "HOME" && !supportsHome && supportsGym) {
      setMode("GYM");
    }
  }, [coach.coach_service.service_area, service_mode, setDistrict, setMode, supportsGym, supportsHome]);

  useEffect(() => {
    if (supportsHome && coach.coach_service.service_area && district !== coach.coach_service.service_area) {
      setDistrict(coach.coach_service.service_area);
    }
  }, [coach.coach_service.service_area, district, setDistrict, supportsHome]);

  const validationMessage =
    !booking_date || !start_time || !bookingSelectionValid
      ? "Choose an available day and start time to continue."
      : !validCourse
      ? "This course is not currently offered by the selected trainer."
      : !validPlace
      ? "Choose a service option supported by this trainer."
      : "";

  return (
    <div className="content-wrap narrow-wrap">
      <button className="back-link" onClick={() => navigate("courses")}>
        <ArrowLeft size={16} /> Back to sessions
      </button>
      <PageHeading
        eyebrow="BOOK A SESSION"
        title="Make some time for you."
        detail="Choose when and where you’d like to train."
      />
      <div className="booking-layout">
        <div className="booking-options">
          <section className="booking-course-summary">
            <Photo id={coach.ui.image} alt="" />
            <span>
              <small>TRAIN WITH</small>
              <b>{coach.display_name}</b>
              <span>
                {course.course_name} · {course.default_duration} minutes
              </span>
            </span>
            <Pill>{labels.coach_level[coach.coach.coach_level]}</Pill>
          </section>
          <MemberBookingPicker
            coach_id={coach_id}
            course_id={course_id}
            booking_date={booking_date}
            start_time={start_time}
            break_interval={coach.coach.break_interval}
            onChange={(fields) => {
              if ("booking_date" in fields) setBookingDate(fields.booking_date || "");
              if ("start_time" in fields) setStartTime(fields.start_time || "");
            }}
            onValidationChange={setBookingSelectionValid}
          />
          <section className="form-section">
            <div className="form-section-title">
              <span className="step-number">3</span>
              <div>
                <h2>Choose a place</h2>
                <p>Train where it works for you.</p>
              </div>
            </div>
            <div className="mode-toggle">
              <button
                type="button"
                className={service_mode === "GYM" ? "selected" : ""}
                aria-pressed={service_mode === "GYM"}
                disabled={!supportsGym}
                onClick={() => setMode("GYM")}
              >
                <Dumbbell size={16} /> Gym
              </button>
              <button
                type="button"
                className={service_mode === "HOME" ? "selected" : ""}
                aria-pressed={service_mode === "HOME"}
                disabled={!supportsHome}
                onClick={() => setMode("HOME")}
              >
                <House size={16} /> At home
              </button>
            </div>
            {service_mode === "GYM" ? (
              <div className="location-select">
                <MapPin size={16} />
                <span>
                  <b>{coach.gym.gym_name}</b>
                  <small>
                    {labels.district[coach.gym.district]} · {coach.gym.address}
                  </small>
                </span>
              </div>
            ) : (
              <div className="select-field">
                <label htmlFor="district">Your neighborhood</label>
                <select
                  id="district"
                  value={district}
                  onChange={(event) => setDistrict(event.target.value)}
                >
                  {districts.map((area) => (
                    <option key={String(area)} value={String(area)}>
                      {labels.district[area as keyof typeof labels.district] || String(area)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </section>
        </div>
        <aside className="booking-summary">
          <p className="eyebrow">YOUR SESSION</p>
          <div className="summary-coach">
            <Photo id={coach.ui.image} alt="" />
            <span>
              <b>{coach.display_name}</b>
              <small>{course.course_name}</small>
              <small>
                <Star size={12} fill="currentColor" /> {coach.ui.avg_rating} ·{" "}
                {coach.ui.review_count} reviews
              </small>
            </span>
          </div>
          <div className="summary-divider" />
          <div className="summary-line">
            <span>
              <CalendarDays size={15} />{" "}
              {booking_date ? formatBookingDate(booking_date) : "Choose a date"}
            </span>
          </div>
          <div className="summary-line">
            <span>
              <Clock3 size={15} />{" "}
              {start_time
                ? `${formatSqlTime(start_time)} – ${formatSqlTime(
                    addMinutesToSqlTime(start_time, course.default_duration)
                  )}`
                : "Choose a time"}
            </span>
          </div>
          <div className="summary-line">
            <span>
              <MapPin size={15} />{" "}
              {service_mode === "GYM"
                ? coach.gym.gym_name
                : `At home · ${labels.district[district as keyof typeof labels.district] || district}`}
            </span>
          </div>
          <div className="summary-divider" />
          <div className="summary-line">
            <span>{course.default_duration} min session</span>
            <b>฿{(coach_course?.price_per_session || 0).toLocaleString()}</b>
          </div>
          <div className="summary-line subdued">
            <span>Trainer buffer · {coach.coach.break_interval} min</span>
            <b>{course.default_duration + coach.coach.break_interval} min reserved</b>
          </div>
          <div className="summary-line subdued">
            <span>
              {membership_level.level_name} · {membership_level.discount_rate * 100}%
            </span>
            <b>
              −฿{Math.round(
                (coach_course?.price_per_session || 0) * membership_level.discount_rate
              ).toLocaleString()}
            </b>
          </div>
          <div className="summary-total">
            <span>Final amount</span>
            <b>
              ฿{Math.round(
                (coach_course?.price_per_session || 0) * (1 - membership_level.discount_rate)
              ).toLocaleString()}
            </b>
          </div>
          <PrimaryButton disabled={!canContinue} onClick={() => navigate("checkout")}>
            Continue to checkout <ArrowRight size={16} />
          </PrimaryButton>
          {!canContinue && (
            <p className="booking-validation-note" role="status">
              {validationMessage}
            </p>
          )}
          <p className="secure-note">
            <ShieldCheck size={13} /> Preview only · no booking or charge is created.
          </p>
        </aside>
      </div>
    </div>
  );
}
