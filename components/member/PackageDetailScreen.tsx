"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  QrCode,
  X
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { apiPurchasePackage, apiGetOrderPromptPayQr, getAccessToken } from "@/lib/api-client";

const packageDetails = {
  "5+1": {
    label: "5+1 Sessions",
    price: "฿3,400",
    rawAmount: 3400,
    each: "฿680 / paid session",
    saving: "Save 5%",
    sessions: 6,
    details: [
      "5 paid sessions + 1 bonus session",
      "Choose your own verified coach",
      "Valid for 180 days",
      "Reschedule according to booking terms"
    ]
  },
  "10+3": {
    label: "10+3 Sessions",
    price: "฿8,970",
    rawAmount: 8970,
    each: "฿690 / session",
    saving: "Save 14%",
    sessions: 13,
    details: [
      "10 paid sessions + 3 bonus sessions",
      "Choose your own verified coach",
      "Valid for 180 days",
      "Best for building a steady routine"
    ]
  },
  "20+7": {
    label: "20+7 Sessions",
    price: "฿17,550",
    rawAmount: 17550,
    each: "฿650 / session",
    saving: "Save 20%",
    sessions: 27,
    details: [
      "20 paid sessions + 7 bonus sessions",
      "Choose your own verified coach",
      "Valid for 180 days",
      "Lowest price per session"
    ]
  }
} as const;

export function PackageDetailScreen({
  selected,
  onBack,
  onChoose
}: {
  selected: string;
  onBack: () => void;
  onChoose: (packageName: string) => void;
}) {
  const plan = packageDetails[selected as keyof typeof packageDetails] || packageDetails["10+3"];

  const [modalOpen, setModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"PROMPTPAY" | "CARD" | "CASH">("PROMPTPAY");
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<{
    order_id: number;
    amount: number | string;
    promptpay_payload?: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePurchase = async () => {
    setErrorMsg("");
    setPurchasing(true);
    try {
      if (getAccessToken()) {
        const pkgRes = await apiPurchasePackage({
          package_type: selected,
          payment_method: paymentMethod
        });
        const orderId = pkgRes?.order_id || 101;
        let qrPayload: string | undefined = undefined;

        if (paymentMethod === "PROMPTPAY") {
          try {
            const qrRes = await apiGetOrderPromptPayQr(orderId);
            qrPayload = qrRes.promptpay_payload || qrRes.qr_data;
          } catch (qrErr: any) {
            console.warn("PromptPay QR fetch error:", qrErr.message);
          }
        }

        setPurchaseResult({
          order_id: orderId,
          amount: pkgRes?.total_amount || plan.price,
          promptpay_payload: qrPayload
        });
      } else {
        setPurchaseResult({
          order_id: 999,
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
          <h1>{plan.label}</h1>
          <p>More time with a coach you trust, and a plan that has room to work.</p>
          <span className="pill savings-pill">{plan.saving}</span>
        </div>
        <div className="package-detail-price">
          <b>{plan.price}</b>
          <span>{plan.each}</span>
          <small>Verified Chiang Mai training</small>
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
          {plan.details.map((detail) => (
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
              <b>{plan.sessions} sessions</b>
              <small>One-to-one coaching</small>
            </span>
          </div>
          <button
            className="button button-primary"
            onClick={() => setModalOpen(true)}
            style={{ width: "100%", justifyContent: "center" }}
          >
            Purchase package <ArrowRight size={15} />
          </button>
          <button
            className="button button-outline"
            onClick={() => onChoose(selected)}
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
          {Object.entries(packageDetails).map(([name, option]) => (
            <button
              className={name === selected ? "selected" : ""}
              key={name}
              onClick={() => onChoose(name)}
            >
              <span>
                <b>{option.label}</b>
                <small>{option.each}</small>
              </span>
              <strong>{option.price}</strong>
              <span>
                {name === selected ? "Selected" : "View details"} <ChevronRight size={14} />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Package Purchase Modal with PromptPay QR */}
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
                <span className="eyebrow">CHECKOUT · SESSION PACKAGE</span>
                <h2>{purchaseResult ? "Purchase Successful!" : `Purchase ${plan.label}`}</h2>
                <p>{purchaseResult ? "Your package has been credited to your account." : `Total: ${plan.price}`}</p>
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
                      <span style={{ fontWeight: 600 }}>{plan.label}</span>
                      <strong style={{ color: "#166534" }}>{plan.price}</strong>
                    </div>
                    <small style={{ color: "#64748b" }}>{plan.sessions} personal training sessions · 180 days validity</small>
                  </div>

                  <div>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "8px" }}>
                      Select payment method
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {[
                        { id: "PROMPTPAY", label: "PromptPay QR", detail: "Scan with any Thai mobile banking app" },
                        { id: "CARD", label: "Credit / Debit Card", detail: "Visa, Mastercard" },
                        { id: "CASH", label: "Cash / Front Desk", detail: "Pay in person upon gym visit" }
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          className={`payment-option ${paymentMethod === m.id ? "selected" : ""}`}
                          onClick={() => setPaymentMethod(m.id as any)}
                        >
                          <span className="radio-dot" />
                          <span>
                            <b>{m.label}</b>
                            <small>{m.detail}</small>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                    <button type="button" className="button button-outline" onClick={closeModal} disabled={purchasing}>
                      Cancel
                    </button>
                    <button type="button" className="button button-primary" onClick={handlePurchase} disabled={purchasing}>
                      {purchasing ? "Processing…" : `Confirm & Pay ${plan.price}`}
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
                      {plan.sessions} sessions have been added to your FitBooking account.
                    </p>
                  </div>

                  {purchaseResult.promptpay_payload ? (
                    <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                      <div style={{ background: "#ffffff", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
                        <QRCodeSVG value={purchaseResult.promptpay_payload} size={180} />
                      </div>
                      <span style={{ fontSize: "13px", color: "#334155", maxWidth: "320px" }}>
                        Scan this official PromptPay QR code using your mobile banking application (SCB, KBank, Bangkok Bank, Krungthai).
                      </span>
                    </div>
                  ) : (
                    <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "10px", width: "100%", textAlign: "left" }}>
                      <p style={{ margin: 0, fontSize: "13px", color: "#334155" }}>
                        <b>Payment Status:</b> Confirmed ({paymentMethod})
                      </p>
                    </div>
                  )}

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
