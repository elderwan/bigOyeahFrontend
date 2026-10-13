"use client";

import {
  CalendarDays, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock3
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookableStart, dateLabelForMonth, dateNow,
  getBookableStarts, getPreviewMonthAvailability, getPreviewScheduleSlots,
  monthDate, preview_member_bookings
} from "@/lib/member-preview-data";

type BookingFields = {
  booking_date: string;
  start_time: string;
};

function weekdayShort(day: number): string {
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][day];
}

function timeGroup(start_time: string): "Morning" | "Afternoon" | "Evening" {
  const [hour, minute] = start_time.split(":").map(Number);
  const minutes = hour * 60 + minute;
  if (minutes < 12 * 60) return "Morning";
  if (minutes < 17 * 60) return "Afternoon";
  return "Evening";
}

function formatTime(start_time: string): string {
  const [hour, minute] = start_time.split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  return `${String(hour % 12 || 12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
}

export function MemberBookingPicker({
  coach_id,
  course_id,
  booking_date,
  start_time,
  onChange
}: {
  coach_id: number;
  course_id: number;
  booking_date: string;
  start_time: string;
  onChange: (fields: Partial<BookingFields>) => void;
}) {
  const [today, setToday] = useState("");
  const [activeMonth, setActiveMonth] = useState("");
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showPreviewNotice, setShowPreviewNotice] = useState(true);

  useEffect(() => {
    const todayDate = dateNow();
    setToday(todayDate);
    setActiveMonth(todayDate.slice(0, 7));
  }, []);

  const slots = useMemo(
    () => today ? getPreviewScheduleSlots(today, 60, coach_id) : [],
    [coach_id, today]
  );
  const monthAvailability = useMemo(
    () => today ? getPreviewMonthAvailability(course_id, today, coach_id) : new Map(),
    [coach_id, course_id, today]
  );
  const availableMonths = useMemo(
    () => Array.from(monthAvailability.keys()).sort(),
    [monthAvailability]
  );
  const availableDates = useMemo(
    () => monthAvailability.get(activeMonth) || new Map<string, BookableStart[]>(),
    [activeMonth, monthAvailability]
  );
  const calendarDays = useMemo(() => {
    if (!activeMonth) return [];
    const first = monthDate(activeMonth);
    const firstDay = (first.getDay() + 6) % 7;
    const year = first.getFullYear();
    const month = first.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return [
      ...Array.from({ length: firstDay }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1)
    ];
  }, [activeMonth]);
  const selectedStarts = booking_date ? getBookableStarts(booking_date, course_id, slots, new Date(), coach_id) : [];
  const chosen = selectedStarts.find((item) => item.start_time === start_time);
  const hasExistingBooking = preview_member_bookings.some(({ booking }) =>
    booking.member_id === 1 && booking.coach_id === coach_id &&
    ["PENDING", "CONFIRMED"].includes(booking.status) && booking.booking_date === booking_date
  );
  const groupedTimes = ["Morning", "Afternoon", "Evening"].map((group) => ({
    group,
    options: selectedStarts.filter((item) => timeGroup(item.start_time) === group)
  }));

  const selectDate = (date: string) => {
    const starts = availableDates.get(date);
    if (!starts?.length) return;
    onChange({ booking_date: date, start_time: starts[0].start_time });
  };

  const changeMonth = (month: string) => {
    if (!availableMonths.includes(month)) return;
    setActiveMonth(month);
    setShowMonthPicker(false);
    const dates = monthAvailability.get(month);
    const firstDate = dates?.keys().next().value as string | undefined;
    if (firstDate) selectDateForMonth(firstDate, dates);
  };

  const selectDateForMonth = useCallback((date: string, dates?: Map<string, BookableStart[]>) => {
    const starts = dates?.get(date);
    if (!starts?.length) return;
    onChange({ booking_date: date, start_time: starts[0].start_time });
  }, [onChange]);

  useEffect(() => {
    if (!activeMonth || !availableDates.size) return;
    if (!booking_date || !availableDates.has(booking_date)) {
      const firstDate = availableDates.keys().next().value as string | undefined;
      if (firstDate) selectDateForMonth(firstDate, availableDates);
    }
  }, [activeMonth, availableDates, booking_date, course_id, coach_id, selectDateForMonth]);

  const goToAdjacentMonth = (direction: -1 | 1) => {
    const index = availableMonths.indexOf(activeMonth);
    const next = availableMonths[index + direction];
    if (next) changeMonth(next);
  };

  if (!today || !activeMonth) {
    return <section className="form-section booking-picker-loading" aria-label="Loading schedule">
      <CalendarDays size={17} /><span>Preparing trainer availability…</span>
    </section>;
  }

  return <div className="booking-picker-stack">
    {showPreviewNotice && <div className="booking-preview-note"><span><CheckCircle2 size={15} /> Sample trainer schedule · Chiang Mai time</span><button aria-label="Dismiss preview notice" onClick={() => setShowPreviewNotice(false)}>×</button><small>Availability is generated locally for this UI preview; it is not live.</small></div>}
    <section className="form-section booking-calendar-section">
      <div className="booking-picker-heading">
        <span className="booking-picker-icon"><CalendarDays size={17} /></span>
        <div><h2>Choose a day</h2><p>Dates with available times are highlighted.</p></div>
        <span className="booking-range-label">Next 60 days</span>
      </div>
      <div className="booking-calendar-toolbar">
        <button className="booking-month-label" aria-expanded={showMonthPicker} onClick={() => setShowMonthPicker((open) => !open)}>{dateLabelForMonth(activeMonth)} <ChevronDown size={14} /></button>
        <div className="booking-calendar-arrows">
          <button aria-label="Previous available month" disabled={availableMonths.indexOf(activeMonth) <= 0} onClick={() => goToAdjacentMonth(-1)}><ChevronLeft size={16} /></button>
          <button aria-label="Next available month" disabled={availableMonths.indexOf(activeMonth) >= availableMonths.length - 1} onClick={() => goToAdjacentMonth(1)}><ChevronRight size={16} /></button>
        </div>
      </div>
      {showMonthPicker && <div className="booking-month-menu" role="group" aria-label="Months with available sessions">{availableMonths.map((month) => <button key={month} className={month === activeMonth ? "selected" : ""} onClick={() => changeMonth(month)}>{dateLabelForMonth(month)}</button>)}</div>}
      <div className="booking-calendar-grid" role="grid" aria-label={dateLabelForMonth(activeMonth)}>
        {Array.from({ length: 7 }, (_, index) => <span className="booking-calendar-weekday" key={`weekday-${index}`}>{weekdayShort(index)}</span>)}
        {calendarDays.map((day, index) => {
          if (!day) return <span className="booking-calendar-blank" key={`blank-${index}`} />;
          const date = `${activeMonth}-${String(day).padStart(2, "0")}`;
          const isAvailable = availableDates.has(date);
          const selected = booking_date === date;
          return <button
            key={date}
            className={`booking-calendar-day ${isAvailable ? "has-availability" : "is-disabled"} ${selected ? "selected" : ""}`}
            disabled={!isAvailable}
            aria-label={`${date}${isAvailable ? ", available" : ", unavailable"}`}
            aria-pressed={selected}
            onClick={() => selectDate(date)}
          >
            <span>{day}</span>{isAvailable && <i />}
          </button>;
        })}
      </div>
      <div className="booking-calendar-legend"><span><i /> Available</span><span><i /> Selected</span><span><i /> Unavailable</span></div>
    </section>
    <section className="form-section booking-time-section">
      <div className="booking-picker-heading">
        <span className="booking-picker-icon"><Clock3 size={17} /></span>
        <div><h2>Choose a time</h2><p>{booking_date ? new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date(`${booking_date}T12:00:00`)) : "Select an available day first"}</p></div>
        {chosen && <span className="booking-duration-label">{chosen.duration_minutes} min session</span>}
      </div>
      {!booking_date && <div className="booking-picker-empty"><CalendarDays size={18} /><span>Select a highlighted date to see available sessions.</span></div>}
      {booking_date && selectedStarts.length === 0 && <div className="booking-picker-empty"><Clock3 size={18} /><span>No times are available for this day and course. Choose another date.</span></div>}
      {booking_date && hasExistingBooking && <p className="booking-conflict-note" role="status">Some start times are unavailable because they overlap your existing pending or confirmed session.</p>}
      {booking_date && selectedStarts.length > 0 && <div className="booking-time-groups">
        {groupedTimes.filter(({ options }) => options.length > 0).map(({ group, options }) => <section className="booking-time-group" key={group}><h3>{group}</h3><div className="booking-time-grid">{options.map((option) => <button key={option.start_time} className={`booking-time-option ${start_time === option.start_time ? "selected" : ""}`} aria-pressed={start_time === option.start_time} onClick={() => onChange({ start_time: option.start_time })}><b>{formatTime(option.start_time)}</b><span>{formatTime(option.start_time)} – {formatTime(option.end_time)}</span></button>)}</div></section>)}
      </div>}
      {chosen && <p className="booking-time-help">Times are local to Chiang Mai (GMT+7). End time excludes the trainer’s break.</p>}
    </section>
  </div>;
}
