"use client";

import { useState } from "react";
import { ChevronRight, Search, UsersRound } from "lucide-react";

export function TrainerClients() {
  const [query, setQuery] = useState("");
  const [activeMember, setActiveMember] = useState("");
  const clients = [
    ["Alex Morgan", "Strength & Conditioning", "14 sessions", "photo-1534528741775-53994a69daeb"],
    ["Nattakarn S.", "Strength & Conditioning", "12 sessions", "photo-1544005313-94ddf0286df2"],
    ["Mali P.", "Mobility & Flexibility", "8 sessions", "photo-1500648767791-00dcc994a43e"],
    ["Krit S.", "Strength Foundations", "5 sessions", "photo-1583454110551-21f2fa2afe61"]
  ];

  const visible = clients.filter(([name, course]) =>
    `${name} ${course}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="workspace-content">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">PEOPLE YOU TRAIN WITH</p>
          <h1>Your members</h1>
          <p>Keep every plan personal and easy to follow.</p>
        </div>
        <span className="pill">
          <UsersRound size={14} /> 18 active members
        </span>
      </div>

      <label className="search-bar trainer-client-search">
        <Search size={17} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search members or training type"
        />
      </label>

      <div className="workspace-panel trainer-clients-panel">
        {visible.map(([name, course, sessions, image]) => (
          <article className="trainer-client-row" key={name}>
            <span
              className="trainer-client-photo"
              aria-hidden="true"
              style={{
                backgroundImage: `url("https://images.unsplash.com/${image}?auto=format&fit=crop&w=100&q=80")`
              }}
            />
            <span>
              <b>{name}</b>
              <small>{course}</small>
            </span>
            <span>{sessions}</span>
            <button
              className="button button-outline"
              onClick={() => setActiveMember(activeMember === name ? "" : name)}
            >
              Member notes
            </button>
            <button
              className="icon-button"
              onClick={() => setActiveMember(activeMember === name ? "" : name)}
              aria-label={`View ${name}`}
            >
              <ChevronRight size={17} />
            </button>
            {activeMember === name && (
              <p className="client-demo-note">
                Training focus: steady strength progress, good movement quality, and a plan that fits their week.
              </p>
            )}
          </article>
        ))}
        {!visible.length && (
          <div className="empty-state">
            <UsersRound size={23} />
            <h3>No members match</h3>
            <p>Try a different name or training type.</p>
          </div>
        )}
      </div>
    </div>
  );
}
