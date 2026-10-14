"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Star,
  X
} from "lucide-react";
import { labels } from "@/lib/labels";
import { ReviewCoach } from "@/lib/database";
import {
  MemberPreviewBooking,
  formatBookingDate,
  toBusinessDateTime
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

export function BookingDetailScreen({
  item,
  onBack,
  onPayNow,
  onSubmitReview,
  onCancel
}: {
  item: MemberPreviewBooking;
  onBack: () => void;
  onPayNow: () => void;
  onSubmitReview: (item: MemberPreviewBooking, reviewFields: ReviewFields) => void;
  onCancel: (item: MemberPreviewBooking, cancel_reason: string) => void;
}) {
  const { booking } = item;
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (booking.status !== "PENDING" || !booking.expires_at) return;
    const update = () =>
      setRemainingSeconds(
        Math.max(0, Math.floor((new Date(booking.expires_at as string).getTime() - Date.now()) / 1000))
      );
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [booking.expires_at, booking.status]);

  const order = item.orders[0];
  const discount = order?.discount || 0;
  const final_amount = order?.final_amount ?? Math.max(0, booking.price - discount);
  const placeText =
    booking.service_mode === "GYM"
      ? `${item.gym?.gym_name || "Gym"} · ${item.gym?.address || ""} · ${item.gym ? labels.district[item.gym.district] : ""}`
      : `${booking.service_address || "Home service"} · ${labels.district[booking.service_district || "NIMMAN"]}`;
  const formattedRemaining =
    remainingSeconds === null
      ? ""
      : `${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, "0")}`;

  return (
    <div className="content-wrap narrow-wrap booking-detail-wrap">
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={16} /> Back to sessions
      </button>

      <section className="booking-detail-header">
        <Photo id={item.ui?.coach_image || "photo-1583454110551-21f2fa2afe61"} alt="" />
        <div>
          <span className="eyebrow">YOUR TRAINING SESSION</span>
          <h1>{item.display_name}</h1>
          <div>
            <Pill>{labels.coach_level[item.coach.coach_level]}</Pill>
            <span className={`booking-status ${bookingStatusClasses[booking.status]}`}>
              {labels.booking_status[booking.status] || booking.status}
            </span>
          </div>
        </div>
      </section>

      <div className="booking-detail-grid">
        <section className="booking-detail-card">
          <h2>Session</h2>
          <dl>
            <div>
              <dt>Course</dt>
              <dd>{item.course.course_name}</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>{formatBookingDate(booking.booking_date)}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>
                {formatSqlTime(booking.start_time)} – {formatSqlTime(booking.end_time)}
              </dd>
            </div>
            <div>
              <dt>Duration</dt>
              <dd>{booking.duration_minutes} minutes</dd>
            </div>
            <div>
              <dt>Break</dt>
              <dd>{booking.break_minutes} minutes</dd>
            </div>
            <div>
              <dt>Service mode</dt>
              <dd>{labels.service_mode[booking.service_mode]}</dd>
            </div>
          </dl>
        </section>

        <section className="booking-detail-card">
          <h2>Place</h2>
          <p>{placeText}</p>
          {booking.service_mode === "HOME" && booking.service_address && (
            <p>{booking.service_address}</p>
          )}
        </section>

        <section className="booking-detail-card">
          <h2>Payment</h2>
          <dl>
            <div>
              <dt>Price</dt>
              <dd>฿{booking.price.toLocaleString()}</dd>
            </div>
            <div>
              <dt>Discount</dt>
              <dd>−฿{discount.toLocaleString()}</dd>
            </div>
            <div>
              <dt>Final amount</dt>
              <dd>฿{final_amount.toLocaleString()}</dd>
            </div>
            <div>
              <dt>Payment method</dt>
              <dd>{order?.payment_method ? labels.payment_method[order.payment_method] : "Not selected"}</dd>
            </div>
            <div>
              <dt>Payment status</dt>
              <dd>{order ? labels.payment_status[order.payment_status] : "Unpaid"}</dd>
            </div>
            <div>
              <dt>Payment time</dt>
              <dd>{order?.payment_time || "Not paid"}</dd>
            </div>
            {booking.package_id !== null && item.member_package && (
              <>
                <div>
                  <dt>Package</dt>
                  <dd>{labels.package_type[item.member_package.package_type]}</dd>
                </div>
                <div>
                  <dt>Remaining sessions</dt>
                  <dd>{item.member_package.remaining_sessions}</dd>
                </div>
              </>
            )}
          </dl>
        </section>

        <section className="booking-detail-card">
          <h2>Status information</h2>
          {booking.status === "PENDING" && (
            <p>
              Payment expires {booking.expires_at || "soon"}
              {remainingSeconds !== null && <> · {formattedRemaining} remaining</>}
              {remainingSeconds === 0 && " · Payment window expired"}
            </p>
          )}
          {booking.status === "CANCELLED" && (
            <dl>
              <div>
                <dt>Cancelled by</dt>
                <dd>{booking.cancelled_by || "Not recorded"}</dd>
              </div>
              <div>
                <dt>Reason</dt>
                <dd>{booking.cancel_reason || "Not provided"}</dd>
              </div>
              <div>
                <dt>Cancelled at</dt>
                <dd>{booking.cancelled_at || "Not recorded"}</dd>
              </div>
            </dl>
          )}
          {booking.status === "COMPLETED" && (
            <p>Completed {booking.completed_at || "as recorded in this preview"}.</p>
          )}
          {booking.status === "CONFIRMED" && <p>Your coach has confirmed this session.</p>}
          {booking.status === "NO_SHOW" && <p>This session is marked as a no-show.</p>}
        </section>
      </div>

      {booking.status === "COMPLETED" && (
        <section className="booking-detail-card booking-detail-review">
          <h2>Review</h2>
          {item.review_coach ? (
            <WrittenReview review_coach={item.review_coach} />
          ) : (
            <ReviewForm item={item} onSubmit={onSubmitReview} />
          )}
        </section>
      )}

      <div className="booking-detail-actions">
        {booking.status === "PENDING" && (
          <button className="button button-primary" onClick={onPayNow}>
            Pay now <ArrowRight size={15} />
          </button>
        )}
        {["PENDING", "CONFIRMED"].includes(booking.status) && (
          <button className="button button-outline" onClick={() => setCancelDialogOpen(true)}>
            Cancel session
          </button>
        )}
        {booking.status === "COMPLETED" && !item.review_coach && (
          <span>Leave your review above to help your coach.</span>
        )}
      </div>

      {cancelDialogOpen && (
        <div className="dialog-backdrop">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-booking-title"
            className="cancel-booking-dialog"
          >
            <button
              className="icon-button dialog-close"
              aria-label="Close cancellation dialog"
              onClick={() => setCancelDialogOpen(false)}
            >
              <X size={18} />
            </button>
            <h2 id="cancel-booking-title">Before you cancel</h2>
            <p>
              {toBusinessDateTime(booking.booking_date, booking.start_time).getTime() - Date.now() >=
              24 * 60 * 60 * 1000
                ? "This session is more than 24 hours away. Cancelling now is free; a payment refund or package session return is reflected in this preview."
                : "This session starts within 24 hours. You can still cancel, but the payment is non-refundable and package credit is not returned."}
            </p>
            <div className="cancel-dialog-actions">
              <button className="button button-outline" onClick={() => setCancelDialogOpen(false)}>
                Keep session
              </button>
              <button
                className="button button-primary"
                onClick={() => {
                  onCancel(item, "Cancelled by member");
                  setCancelDialogOpen(false);
                }}
              >
                Confirm cancellation
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
