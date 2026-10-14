"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  X
} from "lucide-react";
import { apiPurchasePackage, getAccessToken } from "@/lib/api-client";
import { PackageCatalogEntry, PackageType } from "@/lib/database";

export function PackageDetailScreen({
  selected,
  catalog,
  onBack,
  onChoose,
  onSelectPackage,
  onPurchaseComplete
}: {
  selected: PackageType;
  catalog: PackageCatalogEntry[];
  onBack: () => void;
  onChoose: (packageName: PackageType) => void;
  onSelectPackage: (packageName: PackageType) => void;
  onPurchaseComplete: () => void;
}) {
  const plan = catalog.find((entry) => entry.package_type === selected && Number(entry.is_active) === 1);
  const totalSessions = plan ? Number(plan.paid_sessions) + Number(plan.bonus_sessions) : 0;
  const planPrice = plan ? Number(plan.price) : 0;
  const formatBaht = (amount: number) =>
    `฿${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

  const [modalOpen, setModalOpen] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<{
    order_id: number;
    amount: number | string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePurchase = async () => {
    if (!plan) {
      setErrorMsg("This package is not currently available.");
      return;
    }
    setErrorMsg("");
    setPurchasing(true);
    try {
      if (getAccessToken()) {
        const pkgRes = await apiPurchasePackage({
          package_type: selected
        });
        if (!pkgRes?.order_id) throw new Error("The package order could not be confirmed.");
        setPurchaseResult({
          order_id: pkgRes.order_id,
          amount: pkgRes.total_amount ?? plan.price
        });
        onPurchaseComplete();
      } else {
        setPurchaseResult({
          order_id: Date.now(),
          amount: plan.price
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to purchase package.");
    } finally {
      setPurchasing(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setPurchaseResult(null);
    setErrorMsg("");
  };

  return (
    <div className="content-wrap narrow-wrap package-detail-wrap">
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={15} /> Back to packages
      </button>

      <section className="package-detail-hero">
        <div>
          <span className="package-detail-mark">
            <Dumbbell size={20} />
          </span>
          <p className="eyebrow">YOUR NEXT TRAINING CHAPTER</p>
          <h1>{plan ? `${plan.package_type} Sessions` : "Package unavailable"}</h1>
          <p>More time with a coach you trust, and a plan that has room to work.</p>
          {plan && (
            <span className="pill savings-pill">
              {plan.paid_sessions} paid + {plan.bonus_sessions} bonus
            </span>
          )}
        </div>
        <div className="package-detail-price">
          {plan ? (
            <>
              <b>{formatBaht(planPrice)}</b>
              <span>{formatBaht(planPrice / totalSessions)} / session</span>
              <small>{plan.validity_days} days validity</small>
            </>
          ) : (
            <small>Package data could not be loaded from the catalog.</small>
          )}
        </div>
      </section>

      <div className="package-detail-grid">
        <section className="workspace-panel">
          <div className="section-title">
            <div>
              <h2>What’s included</h2>
              <p>Clear details before you choose.</p>
            </div>
            <CheckCircle2 size={19} />
          </div>
          {(plan
            ? [
                `${plan.paid_sessions} paid sessions + ${plan.bonus_sessions} bonus sessions`,
                `${totalSessions} total coaching sessions`,
                `Valid for ${plan.validity_days} days`,
                "One-on-one sessions with a coach you choose"
              ]
            : ["Package details are unavailable until the catalog loads."]
          ).map((detail) => (
            <div className="package-detail-included" key={detail}>
              <span>
                <Check size={14} />
              </span>
              {detail}
            </div>
          ))}
        </section>

        <aside className="package-detail-aside">
          <p className="eyebrow">A GOOD FIT IF</p>
          <h2>You want a routine that has room to grow.</h2>
          <p>
            Use your sessions one at a time, at your pace. Choose your coach and training focus during
            booking.
          </p>
          <div className="package-detail-count">
            <Dumbbell size={17} />
            <span>
            <b>{plan ? `${totalSessions} sessions` : "No package selected"}</b>
              <small>One-to-one coaching</small>
            </span>
          </div>
          <button
            className="button button-primary"
            onClick={() => setModalOpen(true)}
            style={{ width: "100%", justifyContent: "center" }}
          disabled={!plan}
          >
          Purchase package <ArrowRight size={15} />
          </button>
          <button
            className="button button-outline"
            onClick={() => onChoose(selected)}
            disabled={!plan}
            style={{ width: "100%", marginTop: "8px", justifyContent: "center" }}
          >
            Book session with package
          </button>
        </aside>
      </div>

      <section className="package-compare">
        <div className="section-title">
          <div>
            <h2>Compare packages</h2>
            <p>Pick the amount of coaching that feels right.</p>
          </div>
        </div>
        <div className="package-compare-options">
          {catalog.map((option) => (
            <button
              className={option.package_type === selected ? "selected" : ""}
              key={option.package_type}
              onClick={() => onSelectPackage(option.package_type)}
            >
              <span>
                <b>{option.package_type} Sessions</b>
                <small>
                  {option.paid_sessions} paid + {option.bonus_sessions} bonus ·{" "}
                  {option.validity_days} days
                </small>
              </span>
              <strong>{formatBaht(Number(option.price))}</strong>
              <span>
                {option.package_type === selected ? "Selected" : "View details"}{" "}
                <ChevronRight size={14} />
              </span>
            </button>
          ))}
        </div>
      </section>

      {modalOpen && (
        <div className="admin-drawer-backdrop" role="presentation" onClick={closeModal}>
          <div
            className="admin-form-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Purchase Package"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "480px" }}
          >
            <header>
              <div>
                <span className="eyebrow">DEMO CHECKOUT · SESSION PACKAGE</span>
                <h2>
                  {purchaseResult
                    ? "Package confirmed"
                    : `Purchase ${plan?.package_type ?? "package"} sessions`}
                </h2>
                <p>
                  {purchaseResult
                    ? "The demo payment is complete. No real payment was processed."
                    : `Total to simulate: ${formatBaht(planPrice)}`}
                </p>
              </div>
              <button className="icon-button" aria-label="Close" onClick={closeModal}>
                <X size={19} />
              </button>
            </header>

            <div style={{ padding: "24px" }}>
              {errorMsg && (
                <div style={{ padding: "10px 14px", borderRadius: "8px", background: "#fef2f2", color: "#b91c1c", marginBottom: "16px", fontSize: "13px" }}>
                  {errorMsg}
                </div>
              )}

              {!purchaseResult ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontWeight: 600 }}>{plan?.package_type} Sessions</span>
                      <strong style={{ color: "#166534" }}>{formatBaht(planPrice)}</strong>
                    </div>
                    <small style={{ color: "#64748b" }}>
                      {totalSessions} personal training sessions · {plan?.validity_days} days validity
                    </small>
                  </div>

                  <div className="payment-simulation-card">
                    <span className="payment-simulation-icon"><CheckCircle2 size={17} /></span>
                    <span>
                      <b>One-click demo payment</b>
                      <small>This only updates the demo order. No real payment is taken.</small>
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                    <button type="button" className="button button-outline" onClick={closeModal} disabled={purchasing}>
                      Cancel
                    </button>
                    <button type="button" className="button button-primary" onClick={handlePurchase} disabled={purchasing}>
                      {purchasing ? "Simulating payment…" : `Simulate payment · ${formatBaht(planPrice)}`}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#f0fdf4", color: "#166534", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CheckCircle2 size={28} />
                  </div>

                  <div>
                    <h3 style={{ margin: "0 0 4px", fontSize: "17px", color: "#0f172a" }}>Order #{purchaseResult.order_id} Confirmed</h3>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                      {totalSessions} sessions have been added to your FitBooking account.
                    </p>
                  </div>

                  <div className="payment-simulation-receipt">
                    <p><b>Payment status:</b> Simulated · No charge</p>
                    <p>
                      {formatBaht(Number(purchaseResult.amount))} · {totalSessions} coaching sessions
                    </p>
                  </div>

                  <button className="button button-primary" onClick={closeModal} style={{ marginTop: "12px", width: "100%" }}>
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
