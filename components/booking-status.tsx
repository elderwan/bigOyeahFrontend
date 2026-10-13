import type { BookingStatus } from "@/lib/database";

const labels: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  NO_SHOW: "No-show"
};

const colors: Record<BookingStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  CANCELLED: "bg-rose-50 text-rose-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  NO_SHOW: "bg-slate-100 text-slate-600"
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colors[status]}`}>
      {labels[status]}
    </span>
  );
}
