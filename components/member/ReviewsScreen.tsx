"use client";

import { ArrowLeft, ArrowRight, Check, Star } from "lucide-react";
import { preview_coach_listings } from "@/lib/member-preview-data";

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
  className = ""
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button className={`button button-primary ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

export function ReviewsScreen({
  rating,
  setRating,
  tags,
  toggleTag,
  notify
}: {
  rating: number;
  setRating: (value: number) => void;
  tags: string[];
  toggleTag: (value: string) => void;
  notify: (message: string) => void;
}) {
  const coachImage = preview_coach_listings[0]?.ui?.image || "photo-1583454110551-21f2fa2afe61";
  const positive = ["Motivating", "Professional", "Friendly", "Knowledgeable", "On time"];
  return (
    <div className="content-wrap narrow-wrap">
      <button className="back-link" onClick={() => notify("Showing your completed sessions.")}>
        <ArrowLeft size={16} /> Your completed sessions
      </button>
      <PageHeading
        eyebrow="YOUR VOICE MATTERS"
        title="How did training with Tan feel?"
        detail="Your words help great coaches keep doing what they do."
      />
      <section className="review-form-card">
        <div className="review-coach-summary">
          <Photo id={coachImage} alt="" />
          <span>
            <b>Coach Tan</b>
            <small>Strength & Conditioning</small>
          </span>
          <span className="review-session-date">Apr 09 · 09:10 AM</span>
        </div>
        <div className="review-rating-block">
          <h2>How was your session?</h2>
          <p>Tap a star to leave an overall rating.</p>
          <div className="interactive-stars" role="group" aria-label="Rate your session">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
              >
                <Star size={29} fill={rating >= star ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
          <span className="rating-caption">
            {["", "Not for me", "Could be better", "It was good", "Really enjoyed it", "Loved it"][rating]}
          </span>
        </div>
        <div className="review-tag-block">
          <h3>What stood out?</h3>
          <p>Pick all that feel right.</p>
          <div className="tag-row">
            {positive.map((tag) => (
              <button
                key={tag}
                className={`review-tag ${tags.includes(tag) ? "selected" : ""}`}
                onClick={() => toggleTag(tag)}
              >
                {tags.includes(tag) && <Check size={13} />}
                {tag}
              </button>
            ))}
          </div>
        </div>
        <div className="review-comment-block">
          <label htmlFor="review-note">Anything else you’d like to share?</label>
          <textarea
            id="review-note"
            maxLength={500}
            placeholder="A few words can mean a lot to your coach…"
          />
          <span>0 / 500</span>
        </div>
        <PrimaryButton
          className="review-submit"
          onClick={() => notify("Thanks for sharing. Your review is saved in this preview.")}
        >
          Share your review <ArrowRight size={15} />
        </PrimaryButton>
      </section>
      <section className="coach-reviews-block">
        <div className="section-title">
          <div>
            <h2>Kind words for Tan</h2>
            <p>Notes from people who’ve trained together.</p>
          </div>
          <div className="review-overall">
            <Star size={15} fill="currentColor" />
            <b>4.9</b> <span>128 reviews</span>
          </div>
        </div>
        <div className="quote-card">
          <div className="stars">★★★★★</div>
          <h3>A coach who really listens.</h3>
          <p>“The first trainer who understood my goals and built a plan I actually look forward to.”</p>
          <span>Nattakarn S. · Apr 05, 2026</span>
        </div>
      </section>
    </div>
  );
}
