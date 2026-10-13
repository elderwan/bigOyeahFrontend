"use client";

import {
  CalendarDays, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock3
} from "lucide-react";
import { PointerEvent as ReactPointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookableStart, dateLabelForMonth, dateNow, formatBookingDate,
  getPreviewMonthAvailability, monthDate, preview_member_bookings
} from "@/lib/member-preview-data";

type BookingFields = {
  booking_date: string;
  start_time: string;
};

type TimePeriod = "ALL" | "MORNING" | "AFTERNOON" | "EVENING";
const WHEEL_ROW_HEIGHT = 44;
const WHEEL_LOOP_COUNT = 5;
const WHEEL_MIDDLE_COPY = Math.floor(WHEEL_LOOP_COUNT / 2);
const timePeriods: { id: TimePeriod; label: string }[] = [
  { id: "ALL", label: "All available times" },
  { id: "MORNING", label: "Morning" },
  { id: "AFTERNOON", label: "Afternoon" },
  { id: "EVENING", label: "Evening" }
];

function weekdayShort(day: number): string {
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][day];
}

function timeGroup(start_time: string): Exclude<TimePeriod, "ALL"> {
  const [hour, minute] = start_time.split(":").map(Number);
  const minutes = hour * 60 + minute;
  if (minutes < 12 * 60) return "MORNING";
  if (minutes < 17 * 60) return "AFTERNOON";
  return "EVENING";
}

function formatTime(start_time: string): string {
  const [hour, minute] = start_time.split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  return `${String(hour % 12 || 12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
}

function WheelColumn({
  id,
  label,
  resetKey,
  values,
  selectedIndex,
  onSelect,
  readOnly = false
}: {
  id: string;
  label: string;
  resetKey: string;
  values: string[];
  selectedIndex: number;
  onSelect?: (index: number) => void;
  readOnly?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStart = useRef<{ y: number; scrollTop: number } | null>(null);
  const suppressClick = useRef(false);
  const previousList = useRef({ resetKey: "", length: -1 });
  const [absoluteSelectedIndex, setAbsoluteSelectedIndex] = useState(
    WHEEL_MIDDLE_COPY * values.length + Math.max(0, selectedIndex)
  );
  const loopValues = useMemo(
    () => values.length ? Array.from({ length: WHEEL_LOOP_COUNT }, () => values).flat() : [],
    [values]
  );

  useEffect(() => {
    const element = scrollRef.current;
    if (!element || selectedIndex < 0) return;
    const currentIndex = Math.round(element.scrollTop / WHEEL_ROW_HEIGHT);
    const listChanged = previousList.current.resetKey !== resetKey ||
      previousList.current.length !== values.length;
    let targetIndex = currentIndex;
    if (listChanged) {
      targetIndex = WHEEL_MIDDLE_COPY * values.length + selectedIndex;
      previousList.current = { resetKey, length: values.length };
      setAbsoluteSelectedIndex(targetIndex);
    } else if (currentIndex % values.length !== selectedIndex) {
      const group = Math.floor(currentIndex / values.length);
      const candidates = [group - 1, group, group + 1]
        .map((copy) => copy * values.length + selectedIndex)
        .filter((index) => index >= 0 && index < loopValues.length);
      targetIndex = candidates.sort((left, right) =>
        Math.abs(left - currentIndex) - Math.abs(right - currentIndex)
      )[0] ?? WHEEL_MIDDLE_COPY * values.length + selectedIndex;
      setAbsoluteSelectedIndex(targetIndex);
    }
    const target = targetIndex * WHEEL_ROW_HEIGHT;
    if (Math.abs(element.scrollTop - target) > 2) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      element.scrollTo({ top: target, behavior: reduceMotion ? "auto" : "smooth" });
    }
  }, [loopValues.length, resetKey, selectedIndex, values.length]);

  useEffect(() => () => {
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
  }, []);

  const commitNearestOption = useCallback(() => {
    const element = scrollRef.current;
    if (!element || readOnly || !onSelect || values.length === 0) return;
    let absoluteIndex = Math.max(0, Math.min(loopValues.length - 1, Math.round(element.scrollTop / WHEEL_ROW_HEIGHT)));
    const index = absoluteIndex % values.length;
    if (absoluteIndex < values.length || absoluteIndex >= values.length * (WHEEL_LOOP_COUNT - 1)) {
      absoluteIndex = WHEEL_MIDDLE_COPY * values.length + index;
      element.scrollTo({ top: absoluteIndex * WHEEL_ROW_HEIGHT, behavior: "auto" });
    }
    setAbsoluteSelectedIndex(absoluteIndex);
    onSelect(index);
  }, [loopValues.length, onSelect, readOnly, values.length]);

  const handleScroll = () => {
    if (readOnly || !onSelect) return;
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(commitNearestOption, 90);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onSelect || readOnly || values.length === 0) return;
    let nextIndex: number;
    if (event.key === "ArrowDown") nextIndex = (selectedIndex + 1) % values.length;
    else if (event.key === "ArrowUp") nextIndex = (selectedIndex - 1 + values.length) % values.length;
    else if (event.key === "PageDown") nextIndex = (selectedIndex + 5) % values.length;
    else if (event.key === "PageUp") nextIndex = (selectedIndex - 5 + values.length) % values.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = values.length - 1;
    else return;
    event.preventDefault();
    onSelect(Math.max(0, Math.min(values.length - 1, nextIndex)));
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (readOnly || event.pointerType !== "mouse" || event.button !== 0) return;
    dragStart.current = { y: event.clientY, scrollTop: event.currentTarget.scrollTop };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragStart.current || readOnly) return;
    const distance = event.clientY - dragStart.current.y;
    if (Math.abs(distance) > 4) suppressClick.current = true;
    event.currentTarget.scrollTop = dragStart.current.scrollTop - distance;
  };

  const handlePointerUp = () => {
    dragStart.current = null;
    if (suppressClick.current) {
      window.setTimeout(() => { suppressClick.current = false; }, 0);
    }
  };

  return (
    <section className={`time-wheel-column ${readOnly ? "time-wheel-readonly" : ""}`}>
      <h3>{label}</h3>
      <div className="time-wheel-surface">
        <div
          ref={scrollRef}
          className="time-wheel-scroll"
          role="listbox"
          aria-label={label}
          aria-readonly={readOnly || undefined}
          aria-activedescendant={selectedIndex >= 0 ? `${id}-option-${absoluteSelectedIndex}` : undefined}
          tabIndex={readOnly || values.length === 0 ? -1 : 0}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="time-wheel-options">
            {values.length === 0
              ? <div className="time-wheel-empty">{readOnly ? "Select a start time" : "No available times"}</div>
              : loopValues.map((value, absoluteIndex) => (
                <div
                  id={`${id}-option-${absoluteIndex}`}
                  className={`time-wheel-option ${absoluteIndex === absoluteSelectedIndex ? "selected" : ""}`}
                  key={`${id}-${absoluteIndex}`}
                  role="option"
                  aria-hidden={absoluteIndex !== absoluteSelectedIndex}
                  aria-selected={absoluteIndex === absoluteSelectedIndex}
                  aria-posinset={absoluteIndex % values.length + 1}
                  aria-setsize={values.length}
                  onClick={() => {
                    if (suppressClick.current) {
                      suppressClick.current = false;
                      return;
                    }
                    if (!readOnly) {
                      setAbsoluteSelectedIndex(absoluteIndex);
                      onSelect?.(absoluteIndex % values.length);
                    }
                  }}
                >
                  {value}
                </div>
              ))}
          </div>
        </div>
        <div className="time-wheel-selection" aria-hidden="true" />
        <div className="time-wheel-edge-fade" aria-hidden="true" />
      </div>
    </section>
  );
}

export function MemberBookingPicker({
  coach_id,
  course_id,
  booking_date,
  start_time,
  break_interval,
  onChange,
  onValidationChange
}: {
  coach_id: number;
  course_id: number;
  booking_date: string;
  start_time: string;
  break_interval: number;
  onChange: (fields: Partial<BookingFields>) => void;
  onValidationChange: (isValid: boolean) => void;
}) {
  const [today, setToday] = useState("");
  const [activeMonth, setActiveMonth] = useState("");
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showPreviewNotice, setShowPreviewNotice] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("ALL");

  useEffect(() => {
    const todayDate = dateNow();
    setToday(todayDate);
    setActiveMonth(todayDate.slice(0, 7));
  }, []);

  const monthAvailability = useMemo(
    () => today ? getPreviewMonthAvailability(course_id, today, coach_id) : new Map<string, Map<string, BookableStart[]>>(),
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
  const availableStarts = booking_date ? availableDates.get(booking_date) || [] : [];
  const filteredStarts = availableStarts.filter((item) =>
    timePeriod === "ALL" || timeGroup(item.start_time) === timePeriod
  );
  const selectedIndex = filteredStarts.findIndex((item) => item.start_time === start_time);
  const chosen = selectedIndex >= 0 ? filteredStarts[selectedIndex] : undefined;
  const endTimes = filteredStarts.map((item) => formatTime(item.end_time));
  const hasExistingBooking = preview_member_bookings.some(({ booking }) =>
    booking.member_id === 1 && booking.coach_id === coach_id &&
    ["PENDING", "CONFIRMED"].includes(booking.status) && booking.booking_date === booking_date
  );

  const selectDate = (date: string) => {
    const starts = availableDates.get(date);
    if (!starts?.length) return;
    setTimePeriod("ALL");
    onChange({ booking_date: date, start_time: starts[0].start_time });
  };

  const selectStart = (index: number) => {
    const item = filteredStarts[index];
    if (!item) return;
    onChange({ booking_date, start_time: item.start_time });
  };

  const selectDateForMonth = useCallback((date: string, dates: Map<string, BookableStart[]>) => {
    const starts = dates.get(date);
    if (!starts?.length) return;
    setTimePeriod("ALL");
    onChange({ booking_date: date, start_time: starts[0].start_time });
  }, [onChange]);

  useEffect(() => {
    if (!today || !activeMonth) return;
    if (availableMonths.length === 0) {
      if (booking_date || start_time) onChange({ booking_date: "", start_time: "" });
      return;
    }
    if (!availableDates.size || !booking_date || !availableDates.has(booking_date)) {
      const firstDate = availableDates.keys().next().value as string | undefined;
      if (firstDate) selectDateForMonth(firstDate, availableDates);
      return;
    }
    const currentTimeIsAvailable = filteredStarts.some((item) => item.start_time === start_time);
    if (!currentTimeIsAvailable) {
      onChange({ booking_date, start_time: filteredStarts[0]?.start_time || "" });
    }
  }, [
    activeMonth, availableDates, availableMonths.length, booking_date, filteredStarts,
    onChange, selectDateForMonth, start_time, today
  ]);

  useEffect(() => {
    onValidationChange(Boolean(chosen && booking_date && start_time === chosen.start_time));
  }, [booking_date, chosen, onValidationChange, start_time]);

  const changePeriod = (period: TimePeriod) => {
    setTimePeriod(period);
    const next = availableStarts.filter((item) =>
      period === "ALL" || timeGroup(item.start_time) === period
    );
    if (!next.some((item) => item.start_time === start_time)) {
      onChange({ booking_date, start_time: next[0]?.start_time || "" });
    }
  };

  const changeMonth = (month: string) => {
    if (!availableMonths.includes(month)) return;
    setActiveMonth(month);
    setShowMonthPicker(false);
    const dates = monthAvailability.get(month);
    const firstDate = dates?.keys().next().value as string | undefined;
    if (firstDate && dates) selectDateForMonth(firstDate, dates);
  };

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

  return (
    <div className="booking-picker-stack">
      {showPreviewNotice && (
        <div className="booking-preview-note">
          <span><CheckCircle2 size={15} /> Sample trainer schedule · Chiang Mai time</span>
          <button aria-label="Dismiss preview notice" onClick={() => setShowPreviewNotice(false)}>×</button>
          <small>Availability is generated locally for this UI preview; it is not live.</small>
        </div>
      )}
      <section className="form-section booking-calendar-section">
        <div className="booking-picker-heading">
          <span className="booking-picker-icon"><CalendarDays size={17} /></span>
          <div><h2>Choose a day</h2><p>Dates with available times are highlighted.</p></div>
          <span className="booking-range-label">Next 60 days</span>
        </div>
        <div className="booking-calendar-toolbar">
          <button className="booking-month-label" aria-expanded={showMonthPicker} onClick={() => setShowMonthPicker((open) => !open)}>
            {dateLabelForMonth(activeMonth)} <ChevronDown size={14} />
          </button>
          <div className="booking-calendar-arrows">
            <button aria-label="Previous available month" disabled={availableMonths.indexOf(activeMonth) <= 0} onClick={() => goToAdjacentMonth(-1)}><ChevronLeft size={16} /></button>
            <button aria-label="Next available month" disabled={availableMonths.indexOf(activeMonth) >= availableMonths.length - 1} onClick={() => goToAdjacentMonth(1)}><ChevronRight size={16} /></button>
          </div>
        </div>
        {showMonthPicker && (
          <div className="booking-month-menu" role="group" aria-label="Months with available sessions">
            {availableMonths.map((month) => (
              <button key={month} className={month === activeMonth ? "selected" : ""} onClick={() => changeMonth(month)}>
                {dateLabelForMonth(month)}
              </button>
            ))}
          </div>
        )}
        <div className="booking-calendar-grid" role="grid" aria-label={dateLabelForMonth(activeMonth)}>
          {Array.from({ length: 7 }, (_, index) => <span className="booking-calendar-weekday" key={`weekday-${index}`}>{weekdayShort(index)}</span>)}
          {calendarDays.map((day, index) => {
            if (!day) return <span className="booking-calendar-blank" key={`blank-${index}`} />;
            const date = `${activeMonth}-${String(day).padStart(2, "0")}`;
            const isAvailable = availableDates.has(date);
            const selected = booking_date === date;
            return (
              <button
                key={date}
                className={`booking-calendar-day ${isAvailable ? "has-availability" : "is-disabled"} ${selected ? "selected" : ""}`}
                disabled={!isAvailable}
                aria-label={`${formatBookingDate(date)}${isAvailable ? ", available" : ", unavailable"}`}
                aria-pressed={selected}
                onClick={() => selectDate(date)}
              >
                <span>{day}</span>{isAvailable && <i />}
              </button>
            );
          })}
        </div>
        <div className="booking-calendar-legend"><span><i /> Available</span><span><i /> Selected</span><span><i /> Unavailable</span></div>
      </section>

      <section className="form-section booking-time-section">
        <div className="booking-picker-heading">
          <span className="booking-picker-icon"><Clock3 size={17} /></span>
          <div><h2>Choose a time</h2><p>{booking_date ? formatBookingDate(booking_date) : "Select an available day first"}</p></div>
          <span className="booking-duration-label">{chosen ? `${chosen.duration_minutes} min session` : "Local time · GMT+7"}</span>
        </div>

        <div className="time-period-filter" role="group" aria-label="Filter available times">
          {timePeriods.map((period) => (
            <button
              key={period.id}
              type="button"
              className={timePeriod === period.id ? "selected" : ""}
              aria-pressed={timePeriod === period.id}
              onClick={() => changePeriod(period.id)}
            >
              {period.label}
            </button>
          ))}
        </div>

        {booking_date && hasExistingBooking && (
          <p className="booking-conflict-note" role="status">
            Existing pending or confirmed sessions block overlapping training and buffer times.
          </p>
        )}

        {filteredStarts.length > 0 ? (
          <>
            <div className="time-wheel-pair">
              <WheelColumn
                id="start-time"
                label="Start time"
                resetKey={`${coach_id}:${course_id}:${booking_date}:${timePeriod}:start`}
                values={filteredStarts.map((item) => formatTime(item.start_time))}
                selectedIndex={selectedIndex}
                onSelect={selectStart}
              />
              <span className="time-wheel-separator" aria-hidden="true">to</span>
              <WheelColumn
                id="end-time"
                label="End time"
                resetKey={`${coach_id}:${course_id}:${booking_date}:${timePeriod}:end`}
                values={endTimes}
                selectedIndex={selectedIndex}
                readOnly
              />
            </div>
            {chosen && (
              <div className="booking-reservation-summary" aria-live="polite">
                <div><span>Session duration</span><b>{chosen.duration_minutes} min</b></div>
                <div><span>Trainer buffer</span><b>{break_interval} min</b></div>
                <div><span>Total reserved</span><b>{chosen.duration_minutes + break_interval} min</b></div>
              </div>
            )}
            <p className="booking-time-help">
              The end time is calculated from the course duration. The buffer is reserved after your session.
            </p>
          </>
        ) : (
          <div className="booking-picker-empty" role="status">
            <Clock3 size={18} />
            <span>
              {booking_date
                ? `No ${timePeriod === "ALL" ? "" : `${timePeriod.toLowerCase()} `}sessions are available on ${formatBookingDate(booking_date)}. Choose another day or time of day.`
                : "Select a highlighted day to see available sessions."}
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
