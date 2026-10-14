"use client";

import { useEffect, useState } from "react";
import { apiCheckHealth, getApiBaseUrl } from "@/lib/api-client";

export function ApiConnectionBadge() {
  const [status, setStatus] = useState<{ checked: boolean; online: boolean; baseUrl: string }>({
    checked: false,
    online: false,
    baseUrl: getApiBaseUrl()
  });

  useEffect(() => {
    let mounted = true;
    apiCheckHealth().then((res) => {
      if (mounted) {
        setStatus({ checked: true, online: res.online, baseUrl: res.baseUrl });
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className={`api-status-badge ${status.online ? "online" : "offline"}`} title={`API Base URL: ${status.baseUrl}`}>
      <span className={`api-dot ${status.online ? "online" : "offline"}`} />
      <span className="api-status-text">
        {status.online ? (
          <><b>Live API:</b> <code>{status.baseUrl.replace(/^https?:\/\//, "")}</code></>
        ) : (
          <><b>Backend:</b> Offline (Local Demo active)</>
        )}
      </span>
    </div>
  );
}
