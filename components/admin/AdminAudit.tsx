"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { apiGetAdminAuditLog, getAccessToken } from "@/lib/api-client";

export function AdminAudit({ onFilter }: { onFilter: () => void }) {
  const [liveLogs, setLiveLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  const demoEvents = [
    ["Admin FitBooking", "Updated KPI rule", "kpi_rule · ADVANCED", "2 min ago"],
    ["System", "Generated monthly snapshot", "coach_kpi_record · April 2026", "18 min ago"],
    ["Admin FitBooking", "Paused location", "gym · Hang Dong Training Room", "42 min ago"],
    ["Coach Tan", "Completed booking", "booking · #24016", "1 hr ago"]
  ];

  const fetchLogs = async (pageNum: number) => {
    if (!getAccessToken()) return;
    setLoading(true);
    try {
      const offset = (pageNum - 1) * limit;
      const data = await apiGetAdminAuditLog({ limit, offset });
      if (Array.isArray(data)) {
        setLiveLogs(data);
      }
    } catch (err: any) {
      console.warn("Failed to load audit logs:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const offset = (page - 1) * limit;

  return (
    <section className="workspace-panel admin-audit-panel">
      <div className="section-title">
        <div>
          <h2>Audit log</h2>
          <p>Important system and user actions recorded in audit_log, newest first.</p>
        </div>
        <button className="button button-outline" onClick={onFilter}>
          <Filter size={14} /> Filter events
        </button>
      </div>

      <div className="admin-audit-list">
        {loading ? (
          <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
            Loading audit log page {page}…
          </div>
        ) : liveLogs.length > 0 ? (
          liveLogs.map((log) => (
            <div className="admin-audit-row" key={log.log_id}>
              <span className="admin-audit-mark">
                <ClipboardList size={15} />
              </span>
              <span>
                <b>{log.action}</b>
                <small>
                  {log.entity_type} #{log.entity_id} · By {log.username || `User #${log.user_id}`}
                </small>
              </span>
              <time>{log.created_at ? log.created_at.replace("T", " ") : ""}</time>
            </div>
          ))
        ) : (
          demoEvents.map(([who, action, target, time]) => (
            <div className="admin-audit-row" key={`${who}-${action}-${time}`}>
              <span className="admin-audit-mark">
                <ClipboardList size={15} />
              </span>
              <span>
                <b>{action}</b>
                <small>
                  {target} · By {who}
                </small>
              </span>
              <time>{time}</time>
            </div>
          ))
        )}
      </div>

      {/* Pagination Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 4px 4px 4px",
          borderTop: "1px solid #eef2f6",
          marginTop: "12px",
          fontSize: "13px",
          color: "#475569"
        }}
      >
        <span>
          {liveLogs.length > 0
            ? `Showing records ${offset + 1} - ${offset + liveLogs.length} (Page ${page})`
            : `Page ${page}`}
        </span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            className="button button-outline"
            style={{ padding: "5px 12px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "4px" }}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
          >
            <ChevronLeft size={14} /> 上一页 (Previous)
          </button>
          <span style={{ fontWeight: 600, padding: "0 6px" }}>{page}</span>
          <button
            className="button button-outline"
            style={{ padding: "5px 12px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "4px" }}
            onClick={() => setPage((p) => p + 1)}
            disabled={liveLogs.length < limit || loading}
          >
            下一页 (Next) <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}
