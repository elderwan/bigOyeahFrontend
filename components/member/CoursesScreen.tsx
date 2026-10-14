"use client";

import { useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import {
  preview_coach_courses,
  preview_coach_listings,
  preview_courses
} from "@/lib/member-preview-data";
import { labels } from "@/lib/labels";

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

export function CoursesScreen({
  navigate,
  coach_id,
  course_id,
  onSelectCourse
}: {
  navigate: (screen: string) => void;
  coach_id: number;
  course_id: number;
  onSelectCourse: (course_id: number) => void;
}) {
  const [active, setActive] = useState("All sessions");
  const kinds = ["All sessions", "BEGINNER", "INTERMEDIATE", "ADVANCED"];
  const offered_courses = preview_coach_courses.filter(
    (item) => item.coach_id === coach_id && item.is_active === 1
  );
  const shown = preview_courses.filter(
    (course) =>
      course.is_active === 1 &&
      offered_courses.some((item) => item.course_id === course.course_id) &&
      (active === "All sessions" || course.difficulty === active)
  );

  return (
    <div className="content-wrap narrow-wrap">
      <button className="back-link" onClick={() => navigate("coach")}>
        <ArrowLeft size={16} /> Coach Tan
      </button>
      <PageHeading
        eyebrow="TRAIN WITH TAN"
        title="Choose your kind of strong."
        detail="Find a session that fits the way you want to move."
      />
      <div className="filter-row course-type-tabs">
        {kinds.map((kind) => (
          <button
            key={kind}
            className={`filter-chip ${active === kind ? "selected" : ""}`}
            onClick={() => setActive(kind)}
          >
            {kind === "All sessions" ? kind : labels.difficulty[kind as keyof typeof labels.difficulty]}
          </button>
        ))}
      </div>
      <div className="course-list">
        {shown.map((course) => (
          <CourseCard
            key={course.course_id}
            course={{
              name: course.course_name,
              description: course.description || "",
              duration: course.default_duration,
              price:
                offered_courses.find((item) => item.course_id === course.course_id)
                  ?.price_per_session || 0,
              level: labels.difficulty[course.difficulty],
              image:
                preview_coach_listings.find((listing) => listing.coach.coach_id === coach_id)?.ui
                  .image || preview_coach_listings[0].ui.image,
              kind: course.difficulty
            }}
            onClick={() => onSelectCourse(course.course_id)}
          />
        ))}
      </div>
      <div className="info-callout">
        <ShieldCheck size={18} />
        <span>
          <b>Every session is personal.</b>
          <small>Your coach will tailor each workout around your goals and experience.</small>
        </span>
      </div>
    </div>
  );
}
