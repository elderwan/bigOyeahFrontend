"use client";

import { Activity, ArrowRight, Clock3, Dumbbell, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { PackageType } from "@/lib/database";
import { PublicDemoAccount } from "@/lib/demo-auth";
import { getMembershipTierInfo } from "@/lib/member-preview-data";

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`pill ${className}`}>{children}</span>;
}

export function PackagesScreen({
  account,
  onChoose
}: {
  account?: PublicDemoAccount | null;
  onChoose: (name: PackageType) => void;
}) {
  const tierInfo = getMembershipTierInfo(account?.total_spend || 0, account?.level_code || "BRONZE");

  const plans: {
    packageType: PackageType;
    sessions: string;
    price: string;
    each: string;
    saving: string;
    popular: boolean;
  }[] = [
    { packageType: "5+1", sessions: "5+1 Sessions", price: "฿3,400", each: "฿680 / paid session", saving: "Save 5%", popular: false },
    { packageType: "10+3", sessions: "10+3 Sessions", price: "฿8,970", each: "฿690 / session", saving: "Save 14%", popular: true },
    { packageType: "20+7", sessions: "20+7 Sessions", price: "฿17,550", each: "฿650 / session", saving: "Save 20%", popular: false }
  ];

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

      <div className="section-title package-section-title">
        <div>
          <h2>Session packages</h2>
          <p>One-on-one time with a coach you choose.</p>
        </div>
        <span className="package-validity">
          <Clock3 size={14} /> 180 days to use
        </span>
      </div>

      <div className="package-plan-grid">
        {plans.map((plan) => (
          <article
            key={plan.packageType}
            className={`package-plan ${plan.popular ? "popular" : ""}`}
          >
            <span className="popular-ribbon" hidden={!plan.popular}>
              MOST LOVED
            </span>
            <span className="plan-session-icon">
              <Dumbbell size={20} />
            </span>
            <span className="plan-session-count">{plan.sessions}</span>
            <span className="plan-price">{plan.price}</span>
            <span className="plan-each">{plan.each}</span>
            <Pill className="savings-pill">{plan.saving}</Pill>
            <button
              className={`button ${plan.popular ? "button-primary" : "button-outline"}`}
              onClick={() => onChoose(plan.packageType)}
            >
              View package <ArrowRight size={14} />
            </button>
          </article>
        ))}
      </div>

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
