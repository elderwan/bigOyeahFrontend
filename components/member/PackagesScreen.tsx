"use client";

import { Activity, ArrowRight, Dumbbell, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { MemberPackage, PackageCatalogEntry, PackageType } from "@/lib/database";
import { PublicDemoAccount } from "@/lib/demo-auth";
import { getMembershipTierInfo } from "@/lib/member-preview-data";

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`pill ${className}`}>{children}</span>;
}

export function PackagesScreen({
  account,
  catalog,
  catalogLoading,
  catalogError,
  memberPackages,
  packagesLoading,
  packagesError,
  onChoose
}: {
  account?: PublicDemoAccount | null;
  catalog: PackageCatalogEntry[];
  catalogLoading: boolean;
  catalogError: string;
  memberPackages: MemberPackage[];
  packagesLoading: boolean;
  packagesError: string;
  onChoose: (name: PackageType) => void;
}) {
  const tierInfo = getMembershipTierInfo(account?.total_spend || 0, account?.level_code || "BRONZE");
  const formatBaht = (amount: number) =>
    `฿${Number(amount).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  const activePackages = memberPackages.filter((item) => item.status === "ACTIVE");

  return (
    <div className="content-wrap narrow-wrap">
      <div className="packages-hero">
        <div>
          <Pill className="pill-glass">
            <Sparkles size={13} /> A little more momentum
          </Pill>
          <h1>
            More sessions.<br />
            More of what moves you.
          </h1>
          <p>Make room for the progress you came for.</p>
        </div>
        <div className="package-hero-person">
          <span>YOUR NEXT CHAPTER</span>
          <Activity size={68} strokeWidth={1.1} />
        </div>
      </div>

      <section className="member-packages-section">
        <div className="section-title package-section-title">
          <div>
            <h2>Your active packages</h2>
            <p>Balances from your purchased session packages.</p>
          </div>
        </div>
        {packagesLoading ? (
          <p role="status">Loading your package balances…</p>
        ) : packagesError ? (
          <p role="alert">{packagesError}</p>
        ) : activePackages.length > 0 ? (
          <div className="member-package-list">
            {activePackages.map((item) => (
              <article className="member-package-card" key={item.package_id}>
                <div>
                  <span className="eyebrow">PACKAGE #{item.package_id}</span>
                  <h3>{item.package_type} Sessions</h3>
                  <p>
                    {item.remaining_sessions} of {item.total_sessions} sessions remaining
                  </p>
                </div>
                <div className="member-package-meta">
                  <strong>{formatBaht(Number(item.price))}</strong>
                  <span>Expires {new Date(`${item.expire_date}T00:00:00`).toLocaleDateString()}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="member-package-empty">You don’t have any active packages yet.</p>
        )}
      </section>

      <div className="section-title package-section-title">
        <div>
          <h2>Session packages</h2>
          <p>Current offers from the package catalog.</p>
        </div>
      </div>

      {catalogLoading ? (
        <p role="status">Loading package offers…</p>
      ) : catalogError ? (
        <p role="alert">{catalogError}</p>
      ) : catalog.length > 0 ? (
        <div className="package-plan-grid">
          {catalog.map((plan) => {
            const totalSessions = Number(plan.paid_sessions) + Number(plan.bonus_sessions);
            const pricePerSession = Number(plan.price) / totalSessions;
            return (
              <article className="package-plan" key={plan.package_type}>
                <span className="plan-session-icon">
                  <Dumbbell size={20} />
                </span>
                <span className="plan-session-count">
                  {plan.paid_sessions}+{plan.bonus_sessions} Sessions
                </span>
                <span className="plan-price">{formatBaht(Number(plan.price))}</span>
                <span className="plan-each">
                  {formatBaht(pricePerSession)} / session · {plan.validity_days} days
                </span>
                <button
                  className="button button-outline"
                  onClick={() => onChoose(plan.package_type)}
                >
                  View package <ArrowRight size={14} />
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <p>No active session packages are available right now.</p>
      )}

      <section className="membership-progress-card">
        <div className="membership-medal">
          <Trophy size={24} />
        </div>
        <div className="membership-progress-copy">
          <p className="eyebrow">YOUR MEMBERSHIP</p>
          <h2>{tierInfo.tier} Member</h2>
          <p>Keep showing up. The next tier is within reach.</p>
          <div className="membership-track">
            <i style={{ width: `${tierInfo.percent}%` }} />
          </div>
          <small>
            {tierInfo.nextTierText} <span>{tierInfo.ratioText}</span>
          </small>
        </div>
        <div className="membership-discount">
          <b>{tierInfo.discountRate * 100}%</b>
          <span>session discount</span>
        </div>
      </section>

      <div className="package-footnote">
        <ShieldCheck size={15} />
        <span>Unused sessions stay on your account. Review the package terms at checkout.</span>
      </div>
    </div>
  );
}
