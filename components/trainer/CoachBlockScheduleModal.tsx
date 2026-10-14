"use client";

import { useState } from "react";
import { CalendarX, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { apiBlockCoachSchedule, ApiError } from "@/lib/api-client";

export function CoachBlockScheduleModal({
  isOpen,
  onClose,
  defaultDate,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
  onSuccess?: (msg: string) => void;
}) {
  const [date, setDate] = useState(defaultDate || new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("16:00");
  const [reason, setReason] = useState("Personal leave");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      await apiBlockCoachSchedule({
        date,
        start_time: startTime,
        end_time: endTime,
        reason: reason.trim() || "Coach leave"
      });
      const msg = "已成功锁定该时段，状态更新为 BLOCKED。";
      setSuccessMsg(msg);
      onSuccess?.(msg);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      if (
        (err instanceof ApiError && err.status === 409) ||
        (err?.message && (err.message.includes("409") || err.message.toLowerCase().includes("booked") || err.message.toLowerCase().includes("conflict")))
      ) {
        setErrorMsg("该时间段已有预约，无法锁定 (409 Conflict)");
      } else {
        setErrorMsg(err?.message || "锁定失败，请检查时间设置");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-drawer-backdrop" role="presentation" onClick={onClose}>
      <div
        className="admin-form-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="请假与日历槽位锁定"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "480px" }}
      >
        <header>
          <div>
            <span className="eyebrow">COACH SCHEDULE</span>
            <h2>请假 / 锁定日历槽位</h2>
            <p>锁定工作台指定时段，暂停学员预约。</p>
          </div>
          <button className="icon-button" aria-label="Close" onClick={onClose}>
            <X size={19} />
          </button>
        </header>

        <form onSubmit={handleSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {errorMsg && (
            <div style={{ padding: "10px 14px", borderRadius: "8px", background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ padding: "10px 14px", borderRadius: "8px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <label className="settings-field">
            请假日期 <span className="req-star">*</span>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <label className="settings-field">
              开始时间 <span className="req-star">*</span>
              <input
                type="time"
                step="600"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </label>
            <label className="settings-field">
              结束时间 <span className="req-star">*</span>
              <input
                type="time"
                step="600"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </label>
          </div>

          <label className="settings-field">
            请假事由 / 锁定原因 <span className="req-star">*</span>
            <input
              type="text"
              required
              placeholder="例如：个人休假、生病、外部培训等"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <button type="button" className="button button-outline" onClick={onClose} disabled={submitting}>
              取消
            </button>
            <button type="submit" className="button button-primary" disabled={submitting}>
              <CalendarX size={15} />
              {submitting ? "正在锁定…" : "确认锁定"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
