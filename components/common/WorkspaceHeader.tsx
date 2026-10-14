"use client";

import { LogOut } from "lucide-react";
import { Brand } from "./Brand";

export function WorkspaceHeader({
  name,
  role,
  onSignOut
}: {
  name: string;
  role: string;
  onSignOut: () => void;
}) {
  return (
    <header className="workspace-topbar">
      <Brand />
      <div className="workspace-user">
        <span className="workspace-user-avatar">{name.slice(0, 1).toUpperCase()}</span>
        <span>
          <b>{name}</b>
          <small>{role}</small>
        </span>
        <button className="button button-outline" onClick={onSignOut}>
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </header>
  );
}
