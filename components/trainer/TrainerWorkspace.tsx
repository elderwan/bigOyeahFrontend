"use client";

import { useState } from "react";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  Clock3,
  Dumbbell,
  MessageCircle,
  UsersRound,
  Award
} from "lucide-react";
import { PublicDemoAccount } from "@/lib/demo-auth";
import { WorkspaceHeader } from "@/components/common/WorkspaceHeader";
import { WorkspaceMobileNav } from "@/components/common/WorkspaceMobileNav";
import { Conversation } from "@/components/common/Conversation";
import { TrainerSchedule, TrainerSessionRows } from "./TrainerSchedule";
import { TrainerClients } from "./TrainerClients";
import { TrainerProgress } from "./TrainerProgress";

const trainerNav = [
  ["trainerHome", "Overview", Activity],
  ["trainerSchedule", "Schedule", CalendarDays],
  ["trainerMessages", "Messages", MessageCircle],
  ["trainerClients", "Clients", UsersRound],
  ["trainerProgress", "Progress", Award]
] as const;

export function TrainerOverview({
  account,
  navigate
}: {
  account: PublicDemoAccount;
  navigate: (screen: string) => void;
}) {
  return (
    <div className="workspace-content">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">TUESDAY · CHIANG MAI</p>
          <h1>Good morning, {account.display_name.split(" ")[0]}.</h1>
          <p>Your day, your people, and the progress you’re building together.</p>
        </div>
        <button className="button button-primary" onClick={() => navigate("trainerSchedule")}>
          <CalendarDays size={16} /> View schedule
        </button>
      </div>

      <div className="workspace-stat-row">
        {[
          ["Sessions today", "4", "2 more to go", CalendarDays],
          ["Active members", "18", "3 new this month", UsersRound],
          ["Hours coached", "26.5", "This week", Clock3]
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

      <div className="workspace-columns">
        <section className="workspace-panel">
          <div className="section-title">
            <div>
              <h2>Up next</h2>
              <p>Your Tuesday training schedule</p>
            </div>
            <button className="text-link" onClick={() => navigate("trainerSchedule")}>
              Full schedule <ArrowRight size={14} />
            </button>
          </div>
          <TrainerSessionRows compact />
        </section>

        <section className="workspace-panel">
          <div className="section-title">
            <div>
              <h2>Member check-in</h2>
              <p>Last note from your clients</p>
            </div>
            <MessageCircle size={18} />
          </div>
          <div className="trainer-note">
            <span className="member-avatar">AM</span>
            <div>
              <b>Alex Morgan</b>
              <p>“Looking forward to working on my deadlift form today.”</p>
              <small>Strength & Conditioning · 9:10 AM</small>
            </div>
          </div>
          <button
            className="button button-outline workspace-full-button"
            onClick={() => navigate("trainerMessages")}
          >
            Open messages <ArrowRight size={14} />
          </button>
        </section>
      </div>

      <section className="workspace-panel workspace-week-panel">
        <div className="section-title">
          <div>
            <h2>This week at a glance</h2>
            <p>Keep the rhythm steady, not rushed.</p>
          </div>
          <span className="pill">12 of 16 sessions</span>
        </div>
        <div className="trainer-week-bars">
          {[
            ["Mon", 55],
            ["Tue", 83],
            ["Wed", 42],
            ["Thu", 68],
            ["Fri", 49],
            ["Sat", 92],
            ["Sun", 22]
          ].map(([d, height]) => (
            <div key={d as string}>
              <span>{height}%</span>
              <i style={{ height: `${height}%` }} />
              <small>{d}</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function TrainerWorkspace({
  screen,
  account,
  navigate,
  onSignOut
}: {
  screen: string;
  account: PublicDemoAccount;
  navigate: (screen: string) => void;
  onSignOut: () => void;
}) {
  return (
    <main className="workspace-shell">
      <WorkspaceHeader
        name={account.display_name}
        role="Verified trainer"
        onSignOut={onSignOut}
      />
      <div className="workspace-body">
        <aside className="workspace-sidebar">
          <p className="workspace-sidebar-label">TRAINER SPACE</p>
          {trainerNav.map(([key, label, Icon]) => (
            <button
              key={key}
              className={
                screen === key || (key === "trainerMessages" && screen === "messages")
                  ? "active"
                  : ""
              }
              onClick={() => navigate(key === "trainerMessages" ? "messages" : key)}
            >
              <Icon size={17} />
              {label}
              {key === "trainerMessages" && <i>1</i>}
            </button>
          ))}
          <p className="workspace-sidebar-note">
            Coach operations are synced with live backend when authenticated.
          </p>
        </aside>
        <section className="workspace-main">
          {(screen === "trainerHome" || screen === "trainer") && (
            <TrainerOverview account={account} navigate={navigate} />
          )}
          {screen === "trainerSchedule" && <TrainerSchedule account={account} />}
          {(screen === "messages" || screen === "trainerMessages") && (
            <Conversation account={account} role="COACH" />
          )}
          {screen === "trainerClients" && <TrainerClients />}
          {screen === "trainerProgress" && <TrainerProgress />}
        </section>
      </div>
      <WorkspaceMobileNav
        items={trainerNav}
        active={screen === "messages" ? "trainerMessages" : screen}
        navigate={(dest) => navigate(dest === "trainerMessages" ? "messages" : dest)}
      />
    </main>
  );
}
