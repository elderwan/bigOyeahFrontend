"use client";

import { useState } from "react";
import { Activity, CheckCircle2, Clock3, Star } from "lucide-react";

export function TrainerProgress() {
  const [period, setPeriod] = useState("This week");

  return (
    <div className="workspace-content">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">YOUR PRACTICE</p>
          <h1>Coaching progress</h1>
          <p>A read on how your training time is taking shape.</p>
        </div>
        <select
          className="workspace-select"
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
        >
          <option>This week</option>
          <option>This month</option>
          <option>This year</option>
        </select>
      </div>

      <div className="workspace-stat-row">
        {[
          ["Completed sessions", "12", "of 16 planned", CheckCircle2],
          ["Member rating", "4.9", "from 128 notes", Star],
          ["Coaching hours", "26.5", period, Clock3]
        ].map(([label, value, note, Icon]) => (
          <article className="workspace-stat" key={label as string}>
            <span className="workspace-stat-icon">
              <Icon size={18} />
            </span>
            <small>{label as string}</small>
            <b>{value as string}</b>
            <span>{note as string}</span>
          </article>
        ))}
      </div>

      <div className="workspace-panel">
        <div className="section-title">
          <div>
            <h2>Member momentum</h2>
            <p>Summaries based on completed session evaluations.</p>
          </div>
          <Activity size={17} />
        </div>
        {[
          ["Alex Morgan", "Strength & Conditioning", "9 / 10 sessions", 90],
          ["Nattakarn S.", "Strength", "7 / 10 sessions", 70],
          ["Mali P.", "Mobility", "5 / 8 sessions", 63],
          ["Krit S.", "Foundations", "3 / 6 sessions", 50]
        ].map(([name, focus, count, percent]) => (
          <div className="member-progress-row" key={name as string}>
            <span className="trainer-member-avatar">
              {String(name).slice(0, 2).toUpperCase()}
            </span>
            <span>
              <b>{name as string}</b>
              <small>
                {focus as string} · {count as string}
              </small>
            </span>
            <div className="goal-progress">
              <i style={{ width: `${percent}%` }} />
            </div>
            <b>{percent}%</b>
          </div>
        ))}
      </div>
    </div>
  );
}
