"use client";

import {
  Bell,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Bookings", icon: CalendarDays, active: false },
  { label: "Trainers", icon: Dumbbell, active: false },
  { label: "Members", icon: Users, active: false },
  { label: "Payments", icon: CircleDollarSign, active: false }
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8faf7]">
      {open ? (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-20 bg-ink/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-emerald-950/10 bg-[#1f4439] px-5 py-6 text-white transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-3">
          <div>
            <p className="text-xl font-bold tracking-tight">FitBooking</p>
            <p className="mt-1 text-xs text-emerald-100/60">PERSONAL TRAINING</p>
          </div>
          <button
            className="rounded-lg p-2 text-emerald-100/70 hover:bg-white/10 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-12">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-100/50">
            MAIN MENU
          </p>
          <nav className="mt-4 space-y-2">
            {navigation.map(({ label, icon: Icon, active }) => (
              <button
                key={label}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                  active
                    ? "bg-[#d7e7d8] font-semibold text-[#254b3e]"
                    : "text-emerald-50/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.4 : 1.8} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto space-y-2">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-emerald-50/70 hover:bg-white/10 hover:text-white">
            <Settings size={18} />
            Settings
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-emerald-50/70 hover:bg-white/10 hover:text-white">
            <LogOut size={18} />
            Sign out
          </button>
          <div className="mt-5 flex items-center gap-3 border-t border-white/10 px-3 pt-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6b86a] text-sm font-bold text-[#254b3e]">
              AD
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Admin FitBooking</p>
              <p className="text-xs text-emerald-100/50">Administrator</p>
            </div>
            <ChevronDown className="ml-auto text-emerald-100/50" size={16} />
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-emerald-950/10 bg-[#f8faf7]/90 px-5 backdrop-blur md:px-10">
          <button
            className="rounded-xl p-2 text-ink lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="hidden lg:block">
            <p className="text-sm text-slate-500">Monday, October 12, 2026</p>
            <p className="font-semibold text-ink">Hello, Administrator</p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button className="relative rounded-xl p-2 text-slate-500 hover:bg-white" aria-label="Notifications">
              <Bell size={20} />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-terracotta" />
            </button>
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <span className="hidden text-sm font-medium text-slate-600 sm:block">THB · Chiang Mai</span>
          </div>
        </header>
        <main className="px-5 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
}
