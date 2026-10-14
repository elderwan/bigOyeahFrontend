"use client";

import { LucideIcon } from "lucide-react";

export function WorkspaceMobileNav({
  items,
  active,
  navigate
}: {
  items: readonly (readonly [string, string, LucideIcon])[];
  active: string;
  navigate: (screen: string) => void;
}) {
  return (
    <nav className="workspace-mobile-nav" aria-label="Workspace navigation">
      {items.map(([key, label, Icon]) => (
        <button
          key={key}
          className={active === key ? "active" : ""}
          onClick={() => navigate(key)}
        >
          <Icon size={18} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
