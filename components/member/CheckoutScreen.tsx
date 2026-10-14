"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CalendarDays,
  CircleHelp,
  MapPin,
  ShieldCheck,
  Star,
  Trophy
} from "lucide-react";
import { MembershipLevel, Order, PackageCatalogEntry, PackageType } from "@/lib/database";
import { labels } from "@/lib/labels";
import {
  MemberPreviewBooking,
  createSimulatedBooking,
  preview_coach_courses,
  preview_coach_listings,
  preview_courses,
  formatBookingDate,
  preview_membership_levels
} from "@/lib/member-preview-data";
import { apiCreateBooking, apiMockPayBooking, apiPurchasePackage, getAccessToken } from "@/lib/api-client";

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`pill ${className}`}>{children}</span>;
}

function Photo({ id, alt = "" }: { id: string; alt?: string }) {
  return (
    <span
      className="coach-photo"
      aria-hidden="true"
      style={{
        backgroundImage: `url("https://images.unsplash.com/${id}?auto=format&fit=crop&w=480&q=80")`
      }}
    />
  );
}

function formatSqlTime(start_time: string): string {
  if (!start_time) return "";
  const parts = start_time.split(":");
  const hour = Number(parts[0] || 0);
  const minute = Number(parts[1] || 0);
  return `${String(hour % 12 || 12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}

function mergePaidOrder(order: Order, payment: Partial<Order> | null): Order {
  return {
    ...order,
    order_id: payment?.order_id ?? order.order_id,
    total_amount: Number(payment?.total_amount ?? order.total_amount),
    discount: Number(payment?.discount ?? order.discount),
    final_amount: Number(payment?.final_amount ?? order.final_amount),
    payment_method: payment?.payment_method ?? order.payment_method,
    payment_status: payment?.payment_status ?? "PAID",
    payment_time: payment?.payment_time ?? new Date().toISOString(),
    refunded_at: payment?.refunded_at ?? order.refunded_at,
    created_at: payment?.created_at ?? order.created_at,
    updated_at: payment?.updated_at ?? new Date().toISOString()
  };
}

export function CheckoutScreen({
  booking_date,
  start_time,
  service_mode,
  district,
  service_address,
  package_type,
  packageCatalog,
  catalogLoading,
  catalogError,
  setPackageChoice,
  membership_level,
  setLevelId,
  member_id,
  existingBooking,
  navigate,
  course,
  coach,
  onBookingSuccess
}: {
  booking_date: string;
  start_time: string;
  service_mode: "GYM" | "HOME";
  district: string;
  service_address: string;
  package_type: PackageType | null;
  packageCatalog: PackageCatalogEntry[];
  catalogLoading: boolean;
  catalogError: string;
  setPackageChoice: (value: PackageType | null) => void;
  membership_level: MembershipLevel;
  setLevelId: (value: number) => void;
  member_id: number;
  existingBooking?: MemberPreviewBooking | null;
  navigate: (screen: string) => void;
  course: (typeof preview_courses)[number];
  coach: (typeof preview_coach_listings)[number];
  onBookingSuccess?: (booking: MemberPreviewBooking, paymentSummary: string) => void;
}) {
  const coach_course =
    preview_coach_courses.find(
      (item) => item.coach_id === coach.coach.coach_id && item.course_id === course.course_id
    ) || coach.coach_course;

  const [confirming, setConfirming] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [pendingBooking, setPendingBooking] = useState<MemberPreviewBooking | null>(null);
  const [pendingPackage, setPendingPackage] = useState<{ packageId: number; type: PackageType } | null>(null);
  const singleSessionTotal = Math.round(
    coach_course.price_per_session * (1 - membership_level.discount_rate)
  );
  const selectedPackage = packageCatalog.find(
    (item) => item.package_type === package_type && Number(item.is_active) === 1
  );
  const totalDue =
    existingBooking?.orders[0]?.final_amount ??
    (package_type === null ? singleSessionTotal : Number(selectedPackage?.price ?? 0));
  const packagePriceUnavailable =
    package_type !== null && (catalogLoading || Boolean(catalogError) || !selectedPackage);

  const handleConfirm = async () => {
    setConfirming(true);
    setPaymentError("");
    try {
      let completedBooking: MemberPreviewBooking;
      if (service_mode === "HOME" && service_address.trim().length < 8) {
        throw new Error("Enter a full address for at-home training.");
      }
      if (package_type && !selectedPackage) {
        throw new Error("Package details are unavailable. Return to packages and try again.");
      }
      if (existingBooking) {
        let payment: Partial<Order> | null = null;
        if (getAccessToken()) {
          payment = await apiMockPayBooking(existingBooking.booking.booking_id);
          if (!payment || payment.payment_status !== "PAID") {
            throw new Error("The demo payment was not confirmed. Please try again.");
          }
        }
        const paidAt = new Date().toISOString();
        completedBooking = {
          ...existingBooking,
          booking: {
            ...existingBooking.booking,
            status: "CONFIRMED",
            expires_at: null,
            updated_at: paidAt
          },
          orders: existingBooking.orders.map((order) => mergePaidOrder(order, payment))
        };
      } else if (getAccessToken()) {
        let booking = pendingBooking;
        if (!booking) {
          let packageId =
            package_type && pendingPackage?.type === package_type ? pendingPackage.packageId : null;
          if (package_type && packageId === null) {
            const purchasedPackage = await apiPurchasePackage({ package_type });
            packageId = purchasedPackage?.package_id ?? null;
            if (!packageId) throw new Error("The package could not be prepared for checkout.");
            setPendingPackage({ packageId, type: package_type });
          }
          const createdBooking = await apiCreateBooking({
            coach_id: coach.coach.coach_id,
            course_id: course.course_id,
            gym_id: service_mode === "GYM" ? coach.gym.gym_id : null,
            package_id: packageId,
            booking_date,
            start_time,
            duration_minutes: course.default_duration,
            break_minutes: coach.coach.break_interval,
            service_mode,
            service_district: service_mode === "HOME" ? district : null,
            service_address: service_mode === "HOME" ? service_address.trim() : null
          });
          if (!createdBooking?.booking_id) {
            throw new Error("The booking service did not return a booking confirmation.");
          }
          booking = createSimulatedBooking({
            booking_id: Number(createdBooking.booking_id),
            order_id: Number(createdBooking.order_id || createdBooking.booking_id + 1000),
            member_id,
            coach,
            course,
            booking_date,
            start_time,
            service_mode,
            service_district: service_mode === "HOME" ? district : null,
            service_address: service_mode === "HOME" ? service_address.trim() : null,
            price: Number(createdBooking.price ?? (package_type ? 0 : singleSessionTotal)),
            package_id: packageId,
            package_type,
            packageDetails: selectedPackage
              ? {
                  sessions: Number(selectedPackage.paid_sessions) + Number(selectedPackage.bonus_sessions),
                  price: Number(selectedPackage.price),
                  validityDays: Number(selectedPackage.validity_days)
                }
              : undefined
          });
          setPendingBooking(booking);
        }
        const payment = await apiMockPayBooking(booking.booking.booking_id);
        if (!payment || payment.payment_status !== "PAID") {
          throw new Error("The demo payment was not confirmed. Please try again.");
        }
        completedBooking = {
          ...booking,
          booking: { ...booking.booking, status: "CONFIRMED", expires_at: null },
          orders: booking.orders.map((order) => mergePaidOrder(order, payment))
        };
      } else {
        if (!booking_date || !start_time) {
          throw new Error("Choose an available date and time before paying.");
        }
        const id = Date.now();
        completedBooking = createSimulatedBooking({
          booking_id: id,
          order_id: id + 1000,
          member_id,
          coach,
          course,
          booking_date,
          start_time,
          service_mode,
          service_district: service_mode === "HOME" ? district : null,
          service_address: service_mode === "HOME" ? service_address.trim() : null,
          price: package_type ? 0 : singleSessionTotal,
          totalAmount: package_type ? 0 : coach_course.price_per_session,
          discount: package_type ? 0 : coach_course.price_per_session - singleSessionTotal,
          package_id: package_type ? id + 2000 : null,
          package_type
        });
      }
      const completedOrder = completedBooking.orders[0];
      const paymentSummary =
        completedBooking.booking.package_id !== null &&
        (completedOrder?.payment_method === "PACKAGE_CREDIT" ||
          Number(completedOrder?.final_amount ?? completedBooking.booking.price) === 0)
          ? existingBooking
            ? "Package credit used · no additional payment was due."
            : `Package purchase · ฿${Number(selectedPackage?.price ?? 0).toLocaleString()} · one session used as credit.`
          : `Session payment · ฿${Number(
              completedOrder?.final_amount ?? completedBooking.booking.price
            ).toLocaleString()}.`;
      onBookingSuccess?.(completedBooking, paymentSummary);
      navigate("success");
    } catch (issue) {
      setPaymentError(
        issue instanceof Error ? issue.message : "The booking could not be completed. Please try again."
      );
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="content-wrap narrow-wrap">
      <button className="back-link" onClick={() => navigate("booking")}>
        <ArrowLeft size={16} /> Back to time selection
      </button>
      <div className="page-heading">
        <div>
          <p className="eyebrow">ONE LAST STEP</p>
          <h1>Your time is waiting.</h1>
          <p className="page-detail">Review your session, then confirm with a one-click demo payment.</p>
        </div>
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          <section className="checkout-card">
            <div className="summary-coach">
              <Photo id={coach.ui.image} alt="" />
              <span>
                <b>{coach.display_name}</b>
                <small>{course.course_name}</small>
                <small>
                  <Star size={12} fill="currentColor" /> {coach.ui.avg_rating} · ฿{coach_course.price_per_session}
                </small>
              </span>
              <Pill className="verified-pill">
                <ShieldCheck size={13} /> Verified
              </Pill>
            </div>
            <div className="checkout-detail-row">
              <span>
                <CalendarDays size={15} /> {formatBookingDate(booking_date)} · {formatSqlTime(start_time)}
              </span>
              <span className="checkout-location">
                <MapPin size={15} />
                {service_mode === "GYM" ? (
                  "Nimman Gym"
                ) : (
                  <span>
                    At home · {labels.district[district as keyof typeof labels.district]}
                    <small>{service_address.trim() || "Add a full address to continue"}</small>
                  </span>
                )}
              </span>
            </div>
          </section>

          {!existingBooking && package_type === null && (
            <section className="checkout-card">
              <div className="section-title">
                <div>
                  <h2>Member discount</h2>
                  <p>Your membership makes every session go further.</p>
                </div>
                <Pill className="gold-pill">
                  <Award size={13} /> Member
                </Pill>
              </div>
              <div className="membership-choice-row">
                <span className="membership-medal">
                  <Trophy size={18} />
                </span>
                <span>
                  <b>{membership_level.level_name}</b>
                  <small>{membership_level.discount_rate * 100}% off this session</small>
                </span>
                <strong>− ฿{Math.round(coach_course.price_per_session * membership_level.discount_rate)}</strong>
              </div>
              <div className="tier-selector">
                {preview_membership_levels.map((item) => (
                  <button
                    key={item.level_id}
                    className={`tier-option ${membership_level.level_id === item.level_id ? "selected" : ""}`}
                    onClick={() => setLevelId(item.level_id)}
                  >
                    {item.level_name.replace(" Member", "")}
                  </button>
                ))}
              </div>
            </section>
          )}

          {!existingBooking && (
            <section className="checkout-card">
              <div className="section-title">
                <div>
                  <h2>Session package</h2>
                  <p>Package types follow the FitBooking plan options.</p>
                </div>
                <button className="text-link" onClick={() => navigate("packages")}>
                  Compare plans <ArrowRight size={14} />
                </button>
              </div>
              <div className="package-choices">
                {[
                  {
                    name: "Single session",
                    type: null,
                    price: singleSessionTotal,
                    detail: `Flexible, one at a time · ${membership_level.discount_rate * 100}% member discount`
                  },
                  ...packageCatalog
                    .filter((plan) => Number(plan.is_active) === 1)
                    .map((plan) => ({
                      name: `${plan.package_type} Sessions`,
                      type: plan.package_type,
                      price: Number(plan.price),
                      detail: `${plan.paid_sessions} paid + ${plan.bonus_sessions} bonus · ${plan.validity_days}-day validity`
                    }))
                ].map(({ name, type, price, detail }) => (
                  <button
                    key={type || "single-session"}
                    className={`package-choice ${package_type === type ? "selected" : ""}`}
                    onClick={() => setPackageChoice(type)}
                    disabled={Boolean(type) && (catalogLoading || Boolean(catalogError))}
                  >
                    <span className="radio-dot" />
                    <span>
                      <b>{name}</b>
                      <small>{detail}</small>
                    </span>
                    <strong>฿{price.toLocaleString()}</strong>
                  </button>
                ))}
              </div>
              {catalogLoading && <p role="status">Loading current package prices…</p>}
              {catalogError && <p role="alert">{catalogError}</p>}
              {!catalogLoading && !catalogError && packageCatalog.length === 0 && (
                <p>No packages are currently available. You can still book a single session.</p>
              )}
            </section>
          )}

          <section className="checkout-card">
            <div className="payment-simulation-card">
              <span className="payment-simulation-icon"><ShieldCheck size={17} /></span>
              <span>
                <b>One-click demo payment</b>
                <small>This marks the order as paid for testing. No real payment is processed.</small>
              </span>
              <Pill>Simulated</Pill>
            </div>
          </section>
        </div>

        <aside className="checkout-total-card">
          <p className="eyebrow">ORDER SUMMARY</p>
          <div className="summary-line">
            <span>
              {package_type && selectedPackage
                ? `${selectedPackage.package_type} session package`
                : course.course_name}
            </span>
            <b>
              ฿
              {existingBooking?.booking.price ??
                (package_type ? Number(selectedPackage?.price ?? 0) : coach_course.price_per_session)}
            </b>
          </div>
          {existingBooking ? (
            <div className="summary-line subdued">
              <span>Unpaid session</span>
              <b>Booking #{existingBooking.booking.booking_id}</b>
            </div>
          ) : package_type === null ? (
            <div className="summary-line subdued">
              <span>
                {membership_level.level_name} · {membership_level.discount_rate * 100}%
              </span>
              <b>−฿{Math.round(coach_course.price_per_session * membership_level.discount_rate)}</b>
            </div>
          ) : (
            <div className="summary-line subdued">
              <span>{labels.package_type[package_type]} package</span>
              <b>
                {selectedPackage
                  ? `${selectedPackage.paid_sessions}+${selectedPackage.bonus_sessions} sessions`
                  : "Package price unavailable"}
              </b>
            </div>
          )}
          <div className="summary-divider" />
          <div className="summary-total">
            <span>Total to simulate</span>
            <b>{packagePriceUnavailable ? "—" : `฿${totalDue.toLocaleString()}`}</b>
          </div>
          {paymentError && <p className="payment-error" role="alert">{paymentError}</p>}
          <button
            className="button button-primary"
            onClick={handleConfirm}
            disabled={
              confirming ||
              (!existingBooking && (!booking_date || !start_time)) ||
              packagePriceUnavailable
            }
            style={{ width: "100%", justifyContent: "center" }}
          >
            {confirming ? "Simulating payment..." : "Simulate payment"} <ArrowRight size={16} />
          </button>
          <p className="secure-note">
            <ShieldCheck size={13} /> No charge or payment provider is involved.
          </p>
          <button className="text-link checkout-help" onClick={() => navigate("profile")}>
            <CircleHelp size={14} /> Need a hand?
          </button>
        </aside>
      </div>
    </div>
  );
}
