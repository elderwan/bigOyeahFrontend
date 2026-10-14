"use client";

import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Plus,
  Star
} from "lucide-react";
import { PublicDemoAccount } from "@/lib/demo-auth";
import { labels } from "@/lib/labels";
import { ReviewCoach } from "@/lib/database";
import {
  MemberPreviewBooking,
  formatBookingDate,
  dateNow
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

const bookingStatusClasses: Record<string, string> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "cancelled"
};

type ReviewFields = Pick<
  ReviewCoach,
  "rating_professional" | "rating_communication" | "rating_punctuality" | "rating_effectiveness" | "comment"
>;

function ReviewForm({
  item,
  onSubmit
}: {
  item: MemberPreviewBooking;
  onSubmit: (item: MemberPreviewBooking, reviewFields: ReviewFields) => void;
}) {
  const [rating_professional, setRatingProfessional] = useState(0);
  const [rating_communication, setRatingCommunication] = useState(0);
  const [rating_punctuality, setRatingPunctuality] = useState(0);
  const [rating_effectiveness, setRatingEffectiveness] = useState(0);
  const [comment, setComment] = useState("");

  const ratings = [
    ["rating_professional", "Professionalism", rating_professional, setRatingProfessional],
    ["rating_communication", "Communication", rating_communication, setRatingCommunication],
    ["rating_punctuality", "Punctuality", rating_punctuality, setRatingPunctuality],
    ["rating_effectiveness", "Effectiveness", rating_effectiveness, setRatingEffectiveness]
  ] as const;

  const avg_rating = (rating_professional + rating_communication + rating_punctuality + rating_effectiveness) / 4;
  const canSubmit = ratings.every(([, , value]) => value > 0);

  return (
    <form
      className="booking-review-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) return;
        onSubmit(item, {
          rating_professional,
          rating_communication,
          rating_punctuality,
          rating_effectiveness,
          comment: comment.trim() || null
        });
      }}
    >
      <h3>Share your session review</h3>
      {ratings.map(([field, label, value, setValue]) => (
        <div className="review-rating-row" key={field}>
          <span>{label}</span>
          <div role="group" aria-label={label}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`${label}: ${star} star`}
                onClick={() => setValue(star)}
              >
                <Star size={17} fill={value >= star ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="review-average-preview">
        <span>Average rating preview</span>
        <b>{canSubmit ? avg_rating.toFixed(2) : "Rate all four categories"}</b>
      </div>
      <label className="review-comment-block">
        Comment (optional)
        <textarea
          name="comment"
          value={comment}
          maxLength={1000}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Share anything helpful with your coach."
        />
        <span>{comment.length} / 1000</span>
      </label>
      <button className="button button-primary" type="submit" disabled={!canSubmit}>
        Submit review
      </button>
    </form>
  );
}

function WrittenReview({ review_coach }: { review_coach: ReviewCoach }) {
  return (
    <div className="booking-written-review">
      <div>
        <Star size={15} fill="currentColor" />
        <b>{review_coach.avg_rating.toFixed(2)}</b>
        <span>Average rating</span>
      </div>
      <p>{review_coach.comment || "No written comment."}</p>
      <small>
        {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
          new Date(review_coach.created_at.replace(" ", "T"))
        )}
      </small>
    </div>
  );
}

export function BookingsScreen({
  tab,
  setTab,
  navigate,
  account,
  previewBookings = [],
  onOpenBooking,
  onSubmitReview
}: {
  tab: string;
  setTab: (value: string) => void;
  navigate: (screen: string) => void;
  account?: PublicDemoAccount | null;
  previewBookings?: MemberPreviewBooking[];
  onOpenBooking: (item: MemberPreviewBooking) => void;
  onSubmitReview: (item: MemberPreviewBooking, reviewFields: ReviewFields) => void;
}) {
  const [reviewDraft, setReviewDraft] = useState<{ booking_id: number; location: "past" | "reviews" } | null>(null);
  const today = dateNow();

  // Bind to current account member_id if authenticated
  const currentMemberId = account?.member_id;
  const memberBookings = currentMemberId
    ? previewBookings.filter(({ booking }) => booking.member_id === currentMemberId)
    : previewBookings;

  const upcoming = memberBookings
    .filter(({ booking }) => ["PENDING", "CONFIRMED"].includes(booking.status) && booking.booking_date >= today)
    .sort((a, b) => `${a.booking.booking_date} ${a.booking.start_time}`.localeCompare(`${b.booking.booking_date} ${b.booking.start_time}`));

  const past = memberBookings
    .filter(({ booking }) => ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(booking.status) || booking.booking_date < today)
    .sort((a, b) => `${b.booking.booking_date} ${b.booking.start_time}`.localeCompare(`${a.booking.booking_date} ${a.booking.start_time}`));

  const visible = tab === "Upcoming" ? upcoming : past;

  const renderBooking = (item: MemberPreviewBooking) => {
    const { booking, course } = item;
    const isReviewing = reviewDraft?.booking_id === booking.booking_id && reviewDraft.location === "past";
    const amount = item.orders[0]?.final_amount ?? booking.price;
    const place =
      booking.service_mode === "GYM"
        ? item.gym?.gym_name || "Gym"
        : booking.service_address || labels.district[booking.service_district || "NIMMAN"];

    return (
      <article className="booking-history-card booking-history-sql-card" key={booking.booking_id}>
        <button
          className="booking-card-open"
          onClick={() => onOpenBooking(item)}
          aria-label={`View details for ${course.course_name}`}
        >
          <span className={`history-status-dot ${bookingStatusClasses[booking.status] || "pending"}`} />
          <Photo id={item.ui?.coach_image || "photo-1583454110551-21f2fa2afe61"} alt="" />
          <span className="history-main">
            <span className={`booking-status ${bookingStatusClasses[booking.status] || "pending"}`}>
              {labels.booking_status[booking.status] || booking.status}
            </span>
            <b>{course.course_name}</b>
            <span>
              {formatBookingDate(booking.booking_date)} · {formatSqlTime(booking.start_time)}
            </span>
            <small>
              {item.display_name} · {place}
            </small>
          </span>
          <span className="history-card-end">
            <b>฿{amount.toLocaleString()}</b>
            <ChevronRight size={18} />
          </span>
        </button>

        {booking.status === "PENDING" && (
          <button className="button button-outline booking-card-pay" onClick={() => onOpenBooking(item)}>
            View payment details
          </button>
        )}
        {booking.status === "COMPLETED" && !item.review_coach && !isReviewing && (
          <button
            className="button button-outline booking-card-review"
            onClick={() => setReviewDraft({ booking_id: booking.booking_id, location: "past" })}
          >
            <Star size={14} /> Leave review
          </button>
        )}
        {isReviewing && (
          <ReviewForm
            item={item}
            onSubmit={(review_item, reviewFields) => {
              onSubmitReview(review_item, reviewFields);
              setReviewDraft(null);
            }}
          />
        )}
        {booking.status === "COMPLETED" && item.review_coach && (
          <WrittenReview review_coach={item.review_coach} />
        )}
      </article>
    );
  };

  const awaitingReview = past.filter(({ booking, review_coach }) => booking.status === "COMPLETED" && !review_coach);
  const writtenReviews = past.filter(({ booking, review_coach }) => booking.status === "COMPLETED" && review_coach);

  return (
    <div className="content-wrap narrow-wrap">
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR TRAINING, YOUR TIME</p>
          <h1>My bookings</h1>
          <p className="page-detail">Every session is another step toward feeling good.</p>
        </div>
        <button className="button button-primary" onClick={() => navigate("explore")}>
          <Plus size={16} /> Book a session
        </button>
      </div>

      <div className="booking-tabs">
        {["Upcoming", "Past"].map((item) => (
          <button
            key={item}
            className={tab === item ? "active" : ""}
            onClick={() => setTab(item)}
          >
            {item}
            <span>{item === "Upcoming" ? upcoming.length : past.length}</span>
          </button>
        ))}
      </div>

      <div className="booking-history-list">
        {visible.length ? (
          visible.map(renderBooking)
        ) : (
          <div className="empty-state" style={{ padding: "48px 16px", textAlign: "center" }}>
            <CalendarDays size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <h3>{tab === "Upcoming" ? "Nothing booked just yet" : "No past sessions found"}</h3>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "16px" }}>
              {tab === "Upcoming"
                ? "Find a certified Chiang Mai coach and schedule your first workout."
                : "Completed and cancelled sessions stay available here."}
            </p>
            <button className="button button-primary" onClick={() => navigate("explore")}>
              Find a coach <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

      {past.length > 0 && (
        <section className="booking-reviews-section">
          <div className="section-title">
            <div>
              <h2>Session reviews</h2>
              <p>Share feedback or revisit what you’ve written.</p>
            </div>
          </div>
          <div className="booking-review-list">
            {awaitingReview.map((item) => (
              <article className="booking-review-row" key={item.booking.booking_id}>
                <span>
                  <b>{item.course.course_name}</b>
                  <small>
                    {item.display_name} · {formatBookingDate(item.booking.booking_date)}
                  </small>
                </span>
                {reviewDraft?.booking_id === item.booking.booking_id && reviewDraft.location === "reviews" ? (
                  <ReviewForm
                    item={item}
                    onSubmit={(review_item, reviewFields) => {
                      onSubmitReview(review_item, reviewFields);
                      setReviewDraft(null);
                    }}
                  />
                ) : (
                  <button
                    className="text-link"
                    onClick={() => setReviewDraft({ booking_id: item.booking.booking_id, location: "reviews" })}
                  >
                    <Star size={14} /> Leave review
                  </button>
                )}
              </article>
            ))}
            {writtenReviews.map((item) => (
              <article className="booking-review-row" key={item.booking.booking_id}>
                <span>
                  <b>{item.course.course_name}</b>
                  <small>
                    {item.display_name} · {formatBookingDate(item.booking.booking_date)}
                  </small>
                </span>
                {item.review_coach && <WrittenReview review_coach={item.review_coach} />}
              </article>
            ))}
            {!awaitingReview.length && !writtenReviews.length && (
              <div className="booking-review-empty">
                Completed sessions eligible for review will appear here.
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
