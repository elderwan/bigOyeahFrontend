"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Clock3,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  X
} from "lucide-react";
import {
  preview_coach_courses,
  preview_coach_listings,
  preview_courses
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

function CoachCard({
  coach,
  onClick,
  favorite,
  onFavorite
}: {
  coach: {
    name: string;
    short: string;
    title: string;
    rating: string;
    reviews: number;
    area: string;
    price: number;
    level: string;
    years: number;
    tags: string[];
    image: string;
  };
  onClick: () => void;
  favorite: boolean;
  onFavorite: () => void;
}) {
  return (
    <article className="coach-card" onClick={onClick}>
      <Photo id={coach.image} alt="" />
      <div className="coach-card-body">
        <div className="coach-card-header">
          <div>
            <h3>{coach.name}</h3>
            <p>{coach.title}</p>
          </div>
          <span className="coach-rating">
            <Star size={13} fill="currentColor" /> {coach.rating}
          </span>
        </div>
        <div className="coach-card-footer">
          <span><MapPin size={13} /> {coach.area}</span>
          <strong>฿{coach.price} / session</strong>
        </div>
      </div>
    </article>
  );
}

export function ExploreScreen({
  search,
  setSearch,
  favorites,
  toggleFavorite,
  navigate,
  onSelectCoach
}: {
  search: string;
  setSearch: (value: string) => void;
  favorites: string[];
  toggleFavorite: (name: string) => void;
  navigate: (screen: string) => void;
  onSelectCoach: (coach_id: number, course_id: number) => void;
}) {
  type ExploreFilterFields = {
    district: string;
    course_id: string;
    difficulty: string;
    service_mode: string;
    coach_level: string;
    gym_id: string;
  };
  const emptyFilters: ExploreFilterFields = {
    district: "",
    course_id: "",
    difficulty: "",
    service_mode: "",
    coach_level: "",
    gym_id: ""
  };
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<ExploreFilterFields>(emptyFilters);
  const [activeFilters, setActiveFilters] = useState<ExploreFilterFields>(emptyFilters);
  const [filtersApplied, setFiltersApplied] = useState(false);

  const filterControls: {
    key: keyof ExploreFilterFields;
    label: string;
    options: [string, string][];
  }[] = [
    {
      key: "district",
      label: "District",
      options: [
        ["NIMMAN", "Nimman"],
        ["OLD_CITY", "Old City"],
        ["CENTRAL", "Central"],
        ["MAE_RIM", "Mae Rim"],
        ["HANG_DONG", "Hang Dong"]
      ]
    },
    {
      key: "course_id",
      label: "Course",
      options: preview_courses
        .filter((course) => course.is_active === 1)
        .map((course) => [String(course.course_id), course.course_name] as [string, string])
    },
    {
      key: "difficulty",
      label: "Difficulty",
      options: [
        ["BEGINNER", "Beginner"],
        ["INTERMEDIATE", "Intermediate"],
        ["ADVANCED", "Advanced"]
      ]
    },
    {
      key: "service_mode",
      label: "Service mode",
      options: [
        ["GYM", "Gym"],
        ["HOME", "Home"],
        ["BOTH", "Gym and home"]
      ]
    },
    {
      key: "coach_level",
      label: "Coach level",
      options: [
        ["BEGINNER", "Beginner"],
        ["INTERMEDIATE", "Intermediate"],
        ["ADVANCED", "Advanced"],
        ["MASTER", "Master"]
      ]
    },
    {
      key: "gym_id",
      label: "Gym",
      options: Array.from(
        new Map(
          preview_coach_listings
            .filter((entry) => entry.gym.is_active === 1)
            .map((entry) => [String(entry.gym.gym_id), entry.gym.gym_name] as [string, string])
        )
      )
    }
  ];

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  const visibleListings = preview_coach_listings.filter((listing) => {
    if (
      listing.coach.status !== "ACTIVE" ||
      listing.coach_service.is_active !== 1 ||
      listing.gym.is_active !== 1 ||
      listing.course.is_active !== 1 ||
      listing.coach_course.is_active !== 1
    )
      return false;
    const offered_courses = preview_coach_courses.filter(
      (item) => item.coach_id === listing.coach.coach_id && item.is_active === 1
    );
    const matchesSearch = `${listing.display_name} ${offered_courses
      .map((item) => preview_courses.find((course) => course.course_id === item.course_id)?.course_name || "")
      .join(" ")} ${listing.ui.location_label} ${listing.coach.coach_level}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const { district, course_id, difficulty, service_mode, coach_level, gym_id } = activeFilters;
    return (
      matchesSearch &&
      (!district || listing.coach_service.service_area === district || listing.gym.district === district) &&
      (!course_id || offered_courses.some((item) => item.course_id === Number(course_id))) &&
      (!difficulty ||
        offered_courses.some(
          (item) =>
            (!course_id || item.course_id === Number(course_id)) &&
            preview_courses.find((course) => course.course_id === item.course_id)?.difficulty === difficulty
        )) &&
      (!service_mode || listing.coach.service_mode === service_mode) &&
      (!coach_level || listing.coach.coach_level === coach_level) &&
      (!gym_id || listing.gym.gym_id === Number(gym_id))
    );
  });

  const filterLabel = (key: keyof ExploreFilterFields, value: string) =>
    filterControls.find((control) => control.key === key)?.options.find(([option]) => option === value)?.[1] ||
    value;

  const changeActiveFilter = (key: keyof ExploreFilterFields, value: string) =>
    setActiveFilters((current) => ({ ...current, [key]: current[key] === value ? "" : value }));

  return (
    <div className="content-wrap">
      <PageHeading
        eyebrow="Find your fit"
        title="The right coach changes everything."
        detail="Good people, smart training, and a plan that feels like yours."
      />
      <div className="search-bar">
        <Search size={18} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, specialty, or location"
          aria-label="Search coaches"
        />
        <button
          className="filter-button"
          aria-expanded={filtersOpen}
          onClick={() => {
            setDraftFilters(activeFilters);
            setFiltersOpen((open) => !open);
          }}
        >
          <SlidersHorizontal size={16} /> Filters{" "}
          {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
        </button>
      </div>

      {activeFilterCount > 0 && (
        <div className="active-filter-chips" aria-label="Active filters">
          {(Object.keys(activeFilters) as (keyof ExploreFilterFields)[])
            .filter((key) => activeFilters[key])
            .map((key) => (
              <button key={key} onClick={() => changeActiveFilter(key, activeFilters[key])}>
                {filterControls.find((control) => control.key === key)?.label}:{" "}
                {filterLabel(key, activeFilters[key])}
                <X size={13} />
              </button>
            ))}
        </div>
      )}

      {filtersOpen && (
        <section className="explore-filter-panel" aria-label="Coach filters">
          {filterControls.map(({ key, label, options }) => (
            <label className="select-field" key={key} htmlFor={`explore-filter-${key}`}>
              {label}
              <select
                id={`explore-filter-${key}`}
                value={draftFilters[key]}
                onChange={(event) =>
                  setDraftFilters((current) => ({ ...current, [key]: event.target.value }))
                }
              >
                <option value="">All</option>
                {options.map(([value, name]) => (
                  <option value={value} key={value}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <div className="explore-filter-actions">
            <button
              className="text-link"
              onClick={() => {
                setDraftFilters(emptyFilters);
                setActiveFilters(emptyFilters);
                setFiltersApplied(true);
              }}
            >
              Clear all
            </button>
            <button
              className="button button-primary"
              onClick={() => {
                setActiveFilters(draftFilters);
                setFiltersApplied(true);
                setFiltersOpen(false);
              }}
            >
              Apply filters
            </button>
          </div>
        </section>
      )}

      <div className="explore-location-row">
        <span>
          <MapPin size={15} /> In Chiang Mai
        </span>
        <span className="result-count">
          {visibleListings.length} coaches {filtersApplied ? "matching your filters" : "to explore"}
        </span>
      </div>

      {visibleListings.length ? (
        <div className="coach-grid">
          {visibleListings.map((listing) => {
            const selected_course = activeFilters.course_id
              ? preview_courses.find((item) => item.course_id === Number(activeFilters.course_id)) ||
                listing.course
              : listing.course;
            const selected_coach_course =
              preview_coach_courses.find(
                (item) =>
                  item.coach_id === listing.coach.coach_id && item.course_id === selected_course.course_id
              ) || listing.coach_course;
            const coachCard = {
              name: listing.display_name,
              short: listing.display_name,
              title: selected_course.course_name,
              rating: listing.ui.avg_rating.toFixed(1),
              reviews: listing.ui.review_count,
              area: listing.ui.location_label,
              price: selected_coach_course.price_per_session,
              level: listing.coach.coach_level,
              years: listing.coach.years_experience || 0,
              tags: [selected_course.course_name],
              image: listing.ui.image
            };
            return (
              <CoachCard
                key={listing.coach.coach_id}
                coach={coachCard}
                onClick={() => {
                  onSelectCoach(listing.coach.coach_id, selected_course.course_id);
                  navigate("coach");
                }}
                favorite={favorites.includes(listing.display_name)}
                onFavorite={() => toggleFavorite(listing.display_name)}
              />
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <Search size={25} />
          <h3>No coaches found</h3>
          <p>Try another name, course, or filter combination.</p>
          <button
            className="text-link"
            onClick={() => {
              setSearch("");
              setActiveFilters(emptyFilters);
              setDraftFilters(emptyFilters);
              setFiltersApplied(true);
            }}
          >
            Clear search and filters
          </button>
        </div>
      )}

      <section className="browse-band">
        <div>
          <p className="eyebrow">TRAIN YOUR WAY</p>
          <h2>A good workout starts with a good match.</h2>
          <p>Explore by goal, not just by gym.</p>
        </div>
        <div className="browse-categories">
          {["Get stronger", "Move better", "Build a habit"].map((item, index) => (
            <button
              key={item}
              onClick={() => {
                const next = {
                  ...emptyFilters,
                  course_id: index === 0 ? "1" : index === 1 ? "3" : ""
                };
                setActiveFilters(next);
                setDraftFilters(next);
                setFiltersApplied(true);
              }}
            >
              <span>{["01", "02", "03"][index]}</span>
              {item}
              <ArrowUpRight size={16} />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
