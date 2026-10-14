"use client";

import { useState } from "react";
import {
  CalendarDays,
  CalendarX,
  Check,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Plus,
  RefreshCw,
  Star
} from "lucide-react";
import { PublicDemoAccount } from "@/lib/demo-auth";
import { apiGenerateCoachSchedule, getAccessToken } from "@/lib/api-client";
import { CoachBlockScheduleModal } from "./CoachBlockScheduleModal";
import { CoachReviewModal } from "./CoachReviewModal";

interface DemoSession {
  booking_id: number;
  member: string;
  initials: string;
  course: string;
  time: string;
  length: string;
  location: string;
  status: string;
}

const initialDemoSessions: DemoSession[] = [
  { booking_id: 1, member: "Alex Morgan", initials: "AM", course: "Strength & Conditioning", time: "09:10 AM", length: "60 min", location: "Nimman Fitness Club", status: "COMPLETED" },
  { booking_id: 2, member: "Nattakarn S.", initials: "NS", course: "Strength & Conditioning", time: "11:30 AM", length: "60 min", location: "Nimman Fitness Club", status: "COMPLETED" },
  { booking_id: 3, member: "Mali P.", initials: "MP", course: "Mobility & Flexibility", time: "02:00 PM", length: "60 min", location: "Old City Studio", status: "CONFIRMED" },
  { booking_id: 4, member: "Krit S.", initials: "KS", course: "Strength Foundations", time: "04:30 PM", length: "50 min", location: "Central Fitness", status: "PENDING" }
];

export function TrainerSchedule({ account }: { account?: PublicDemoAccount }) {
  const [day, setDay] = useState("Tue, Apr 16");
  const [sessions, setSessions] = useState<DemoSession[]>(initialDemoSessions);
  const [selectedSession, setSelectedSession] = useState("");
  const [scheduleNotice, setScheduleNotice] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<DemoSession | null>(null);

  const days = ["Mon, Apr 15", "Tue, Apr 16", "Wed, Apr 17", "Thu, Apr 18", "Fri, Apr 19"];
  const coachId = account?.coach_id || 1;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      if (getAccessToken()) {
        const res = await apiGenerateCoachSchedule(coachId, "2026-11-30");
        setScheduleNotice(`Dynamic schedule generated in table ${res?.table_name || `coach_schedule_${coachId}`} until 2026-11-30.`);
      } else {
        setScheduleNotice("Schedule generated locally.");
      }
    } catch (err: any) {
      setScheduleNotice(`Generate schedule: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleComplete = (bookingId: number) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.booking_id === bookingId
          ? { ...s, status: s.status === "COMPLETED" ? "CONFIRMED" : "COMPLETED" }
          : s
      )
    );
  };

  return (
    <div className="workspace-content">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">YOUR WORK WEEK · COACH #{coachId}</p>
          <h1>Schedule</h1>
          <p>Sessions stay clear, so you can give each member your attention.</p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button className="button button-outline" disabled={isGenerating} onClick={handleGenerate}>
            <RefreshCw size={14} /> {isGenerating ? "Generating..." : "Generate schedule"}
          </button>
          <button className="button button-outline" onClick={() => setIsBlockModalOpen(true)}>
            <CalendarX size={14} /> 请假 / 锁定时段
          </button>
          <button className="button button-primary" onClick={() => setSelectedSession(selectedSession ? "" : "Availability")}>
            <Plus size={15} /> Add availability
          </button>
        </div>
      </div>

      {scheduleNotice && (
        <div className="workspace-notice" role="status">
          {scheduleNotice}
          <button onClick={() => setScheduleNotice("")}>Dismiss</button>
        </div>
      )}

      <div className="trainer-calendar-toolbar">
        <div className="trainer-day-tabs">
          {days.map((item) => (
            <button
              key={item}
              className={day === item ? "active" : ""}
              onClick={() => setDay(item)}
            >
              <small>{item.split(",")[0]}</small>
              <b>{item.split(" ")[2]}</b>
            </button>
          ))}
        </div>
        <span>
          <MapPin size={15} /> Chiang Mai time · GMT+7
        </span>
      </div>

      {selectedSession === "Availability" && (
        <div className="availability-editor">
          <div>
            <b>Availability preview (10-minute grid)</b>
            <small>Choose a slot to mark your calendar as open.</small>
          </div>
          {["08:00 AM", "10:00 AM", "01:00 PM", "03:00 PM"].map((time) => (
            <button
              key={time}
              onClick={(event) => {
                event.currentTarget.classList.toggle("selected");
              }}
            >
              {time}
            </button>
          ))}
        </div>
      )}

      <section className="workspace-panel schedule-panel">
        <div className="section-title">
          <div>
            <h2>{day}</h2>
            <p>{day === "Tue, Apr 16" ? "Four sessions planned" : "Sample schedule · adjust your day"}</p>
          </div>
          <span className="pill">10-minute grid enabled</span>
        </div>

        <div className="trainer-session-list">
          {sessions.map((session) => {
            const isDone = session.status === "COMPLETED";
            return (
              <article
                key={session.booking_id}
                className={`trainer-session-row ${isDone ? "is-complete" : ""}`}
              >
                <div className="session-time-block">
                  <b>{session.time}</b>
                  <span>{session.length}</span>
                </div>
                <i className="session-time-line" />
                <span className="trainer-member-avatar">{session.initials}</span>
                <div className="trainer-session-copy">
                  <b>{session.member}</b>
                  <span>{session.course}</span>
                  <small>
                    <MapPin size={12} /> {session.location}
                  </small>
                </div>
                <span className={`booking-status ${isDone ? "completed" : session.status.toLowerCase()}`}>
                  {isDone ? "Completed" : session.status}
                </span>

                {isDone && (
                  <button
                    className="button button-outline"
                    style={{ fontSize: "12px", padding: "4px 8px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                    onClick={() => setReviewTarget(session)}
                    title="课后评价学员"
                  >
                    <Star size={13} fill="#eab308" color="#eab308" /> 评价学员
                  </button>
                )}

                <button
                  className="icon-button"
                  onClick={() => setSelectedSession(session.member)}
                  aria-label={`View ${session.member} details`}
                >
                  <ChevronRight size={17} />
                </button>

                <button
                  className="session-complete-button"
                  onClick={() => handleToggleComplete(session.booking_id)}
                  aria-label={isDone ? "Undo completion" : "Mark session complete"}
                >
                  {isDone ? <CheckCircle2 size={17} /> : <Check size={17} />}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {selectedSession && selectedSession !== "Availability" && (
        <div className="workspace-detail-panel">
          <div className="section-title">
            <div>
              <h2>Session notes</h2>
              <p>{selectedSession} · member details</p>
            </div>
            <button className="text-link" onClick={() => setSelectedSession("")}>
              Close
            </button>
          </div>
          <p>Review the member’s focus before the session. Managed under coach #{coachId}.</p>
          <button className="button button-outline" onClick={() => setSelectedSession("")}>
            Done
          </button>
        </div>
      )}

      <CoachBlockScheduleModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onSuccess={(msg) => setScheduleNotice(msg)}
      />

      {reviewTarget && (
        <CoachReviewModal
          isOpen={Boolean(reviewTarget)}
          onClose={() => setReviewTarget(null)}
          bookingId={reviewTarget.booking_id}
          memberName={reviewTarget.member}
          courseName={reviewTarget.course}
          onSuccess={(msg) => setScheduleNotice(msg)}
        />
      )}
    </div>
  );
}

export function TrainerSessionRows({ compact = false }: { compact?: boolean }) {
  const list = compact ? initialDemoSessions.slice(0, 3) : initialDemoSessions;
  return (
    <div className="trainer-session-list">
      {list.map((session) => (
        <article key={session.booking_id} className="trainer-session-row">
          <div className="session-time-block">
            <b>{session.time}</b>
            <span>{session.length}</span>
          </div>
          <i className="session-time-line" />
          <span className="trainer-member-avatar">{session.initials}</span>
          <div className="trainer-session-copy">
            <b>{session.member}</b>
            <span>{session.course}</span>
            <small><MapPin size={12} /> {session.location}</small>
          </div>
          <span className={`booking-status ${session.status.toLowerCase()}`}>
            {session.status}
          </span>
        </article>
      ))}
    </div>
  );
}
