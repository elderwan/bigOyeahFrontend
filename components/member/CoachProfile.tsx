"use client";

import {
  ArrowLeft,
  ArrowRight,
  Dumbbell,
  Heart,
  House,
  MapPin,
  ShieldCheck,
  Star
} from "lucide-react";
import {
  preview_coach_courses,
  preview_coach_listings,
  preview_courses
} from "@/lib/member-preview-data";
import { labels } from "@/lib/labels";

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

function CourseCard({
  course,
  onClick
}: {
  course: {
    name: string;
    description: string;
    duration: number;
    price: number;
    level: string;
    image: string;
    kind: string;
  };
  onClick: () => void;
}) {
  return (
    <div className="course-card" onClick={onClick}>
      <div className="course-card-content">
        <div className="course-card-header">
          <h3>{course.name}</h3>
          <Pill>{course.level}</Pill>
        </div>
        <p className="course-card-desc">{course.description}</p>
        <div className="course-card-footer">
          <span>{course.duration} mins</span>
          <b>฿{course.price.toLocaleString()}</b>
        </div>
      </div>
    </div>
  );
}

export function CoachProfile({
  navigate,
  notify,
  favorite,
  toggleFavorite,
  coach,
  course_id,
  onChooseCourse
}: {
  navigate: (screen: string) => void;
  notify: (message: string) => void;
  favorite: boolean;
  toggleFavorite: () => void;
  coach: (typeof preview_coach_listings)[number];
  course_id: number;
  onChooseCourse: (course_id: number) => void;
}) {
  const offered_courses = preview_coach_courses.filter(
    (item) => item.coach_id === coach.coach.coach_id && item.is_active === 1
  );
  const selected_course =
    preview_courses.find((item) => item.course_id === course_id) || coach.course;
  const selected_coach_course =
    offered_courses.find((item) => item.course_id === selected_course.course_id) ||
    coach.coach_course;

  return (
    <div className="content-wrap narrow-wrap">
      <button className="back-link" onClick={() => navigate("explore")}>
        <ArrowLeft size={16} /> Back to coaches
      </button>
      <section className="coach-profile-hero">
        <Photo id={coach.ui.image} alt={`${coach.display_name} training`} />
        <div className="profile-image-shade" />
        <div className="coach-profile-hero-copy">
          <Pill className="verified verified-light">
            <ShieldCheck size={13} /> Verified coach
          </Pill>
          <h1>{coach.display_name}</h1>
          <p>{selected_course.course_name} Specialist</p>
          <div className="profile-hero-stats">
            <span>
              <Star size={15} fill="currentColor" /> <b>{coach.ui.avg_rating.toFixed(1)}</b> (
              {coach.ui.review_count} reviews)
            </span>
            <span>
              <MapPin size={15} /> {coach.ui.location_label}
            </span>
            <span>
              <House size={14} /> {labels.service_mode[coach.coach.service_mode]}
            </span>
          </div>
        </div>
        <button
          className="icon-button profile-favorite"
          onClick={toggleFavorite}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart size={20} fill={favorite ? "currentColor" : "none"} />
        </button>
      </section>

      <div className="coach-profile-columns">
        <div className="profile-main-column">
          <section className="profile-section">
            <div className="section-title">
              <div>
                <h2>About {coach.display_name}</h2>
                <p>How we can work together</p>
              </div>
              <Pill>{coach.coach.years_experience ?? 0} years experience</Pill>
            </div>
            <p className="body-copy">
              {coach.coach.bio ||
                "A coach who builds a practical plan around your goals and experience."}
            </p>
            <button
              className="text-link"
              onClick={() => notify("This is a local member-side design preview.")}
            >
              Read more <ArrowRight size={14} />
            </button>
          </section>

          <section className="profile-section">
            <h2>Specialties</h2>
            <div className="tag-row">
              <Pill>
                <Dumbbell size={13} /> {coach.course.course_name}
              </Pill>
            </div>
          </section>

          <section className="profile-section">
            <div className="section-title">
              <div>
                <h2>Training with {coach.display_name}</h2>
                <p>Choose a session to see available times.</p>
              </div>
              <button className="text-link" onClick={() => navigate("courses")}>
                All courses <ArrowRight size={14} />
              </button>
            </div>
            {offered_courses.map((coach_course) => {
              const course = preview_courses.find((item) => item.course_id === coach_course.course_id);
              if (!course || course.is_active !== 1) return null;
              return (
                <CourseCard
                  key={course.course_id}
                  course={{
                    name: course.course_name,
                    description: course.description || "",
                    duration: course.default_duration,
                    price: coach_course.price_per_session,
                    level: labels.difficulty[course.difficulty],
                    image: coach.ui.image,
                    kind: course.difficulty
                  }}
                  onClick={() => onChooseCourse(course.course_id)}
                />
              );
            })}
          </section>

          <section className="profile-section">
            <div className="section-title">
              <h2>Kind words</h2>
              <button className="text-link" onClick={() => navigate("reviews")}>
                All reviews <ArrowRight size={14} />
              </button>
            </div>
            <div className="quote-card">
              <div className="stars">★★★★★</div>
              <p>“Clear guidance and a session shaped around the member’s goals.”</p>
              <span>Member feedback · Preview data</span>
            </div>
          </section>
        </div>

        <aside className="coach-booking-card">
          <p className="eyebrow">START YOUR SESSION</p>
          <div className="coach-price">
            ฿{selected_coach_course.price_per_session.toLocaleString()}
            <small> / session</small>
          </div>
          <p>{selected_course.default_duration} minutes · one-to-one coaching</p>
          <div className="coach-availability">
            <span className="availability-dot" /> Availability based on the coach schedule
          </div>
          <div className="coach-service-pills">
            <Pill>
              <House size={13} /> {labels.service_mode[coach.coach.service_mode]}
            </Pill>
            <Pill>
              <MapPin size={13} /> {labels.district[coach.gym.district]}
            </Pill>
          </div>
          <PrimaryButton onClick={() => navigate("courses")}>
            Choose a session <ArrowRight size={16} />
          </PrimaryButton>
          <p className="secure-note">
            <ShieldCheck size={13} /> Preview schedule only.
          </p>
        </aside>
      </div>
    </div>
  );
}
