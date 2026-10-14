"use client";

import { useState } from "react";
import { Star, X, CheckCircle2, AlertCircle } from "lucide-react";
import { apiCreateMemberReviewByCoach, ApiError } from "@/lib/api-client";

export function CoachReviewModal({
  isOpen,
  onClose,
  bookingId,
  memberName,
  courseName,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number;
  memberName: string;
  courseName: string;
  onSuccess?: (msg: string) => void;
}) {
  const [completionScore, setCompletionScore] = useState(5);
  const [proficiencyScore, setProficiencyScore] = useState(4);
  const [trainingArea, setTrainingArea] = useState<string>("LOWER_BODY");
  const [trainingType, setTrainingType] = useState<string>("STRENGTH");
  const [coachNote, setCoachNote] = useState("Great form and core stability throughout the session.");
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
      await apiCreateMemberReviewByCoach({
        booking_id: bookingId,
        completion_score: completionScore,
        proficiency_score: proficiencyScore,
        training_area: trainingArea,
        training_type: trainingType,
        coach_note: coachNote.trim()
      });
      const msg = `已完成对学员 ${memberName} 的课后评价。`;
      setSuccessMsg(msg);
      onSuccess?.(msg);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      if (
        (err instanceof ApiError && err.status === 409) ||
        (err?.message && (err.message.includes("409") || err.message.toLowerCase().includes("already exists")))
      ) {
        setErrorMsg("该预约课程已提交过评价，无需重复提交。");
      } else {
        setErrorMsg(err?.message || "提交评价失败，请重试。");
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
        aria-label="课后评价学员"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "500px" }}
      >
        <header>
          <div>
            <span className="eyebrow">SESSION REVIEW · BOOKING #{bookingId}</span>
            <h2>评价学员 · {memberName}</h2>
            <p>课程：{courseName}</p>
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <label className="settings-field">
              动作完成度评分 (1-5)
              <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCompletionScore(star)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: completionScore >= star ? "#eab308" : "#cbd5e1" }}
                  >
                    <Star size={22} fill={completionScore >= star ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </label>

            <label className="settings-field">
              熟练度表现评分 (1-5)
              <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setProficiencyScore(star)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: proficiencyScore >= star ? "#eab308" : "#cbd5e1" }}
                  >
                    <Star size={22} fill={proficiencyScore >= star ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <label className="settings-field">
              训练重点部位
              <select value={trainingArea} onChange={(e) => setTrainingArea(e.target.value)}>
                <option value="LOWER_BODY">下肢 / 下半身 (LOWER_BODY)</option>
                <option value="UPPER_BODY">上肢 / 上半身 (UPPER_BODY)</option>
                <option value="CORE">核心集群 (CORE)</option>
                <option value="BACK">背部链 (BACK)</option>
                <option value="SHOULDER">肩部 (SHOULDER)</option>
                <option value="FULL_BODY">全身综合 (FULL_BODY)</option>
              </select>
            </label>

            <label className="settings-field">
              训练类型
              <select value={trainingType} onChange={(e) => setTrainingType(e.target.value)}>
                <option value="STRENGTH">力量训练 (STRENGTH)</option>
                <option value="CARDIO">心肺燃脂 (CARDIO)</option>
                <option value="FLEXIBILITY">柔韧拉伸 (FLEXIBILITY)</option>
                <option value="BALANCE">平衡稳定性 (BALANCE)</option>
                <option value="POWER">爆发力 (POWER)</option>
              </select>
            </label>
          </div>

          <label className="settings-field">
            教练评语与指导建议
            <textarea
              rows={3}
              value={coachNote}
              onChange={(e) => setCoachNote(e.target.value)}
              placeholder="记录学员动作发力点、进步与下周训练重点…"
            />
          </label>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <button type="button" className="button button-outline" onClick={onClose} disabled={submitting}>
              取消
            </button>
            <button type="submit" className="button button-primary" disabled={submitting}>
              <Star size={15} />
              {submitting ? "正在提交…" : "提交课后评价"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
