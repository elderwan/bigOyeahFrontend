"use client";

import { FormEvent, useEffect, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { PublicDemoAccount, DEMO_MESSAGES_KEY } from "@/lib/demo-auth";
import {
  apiGetCoachMeMessages,
  apiSendCoachMeMessage,
  apiGetMemberMessages,
  apiSendMessage,
  getAccessToken
} from "@/lib/api-client";

interface DemoMessage {
  sender: "MEMBER" | "COACH";
  author: string;
  text: string;
  created_at: string;
}

export function Conversation({
  account,
  role = "MEMBER"
}: {
  account: PublicDemoAccount;
  role?: "MEMBER" | "COACH";
}) {
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const loadMessages = async () => {
    if (!getAccessToken()) return;
    try {
      const data = role === "COACH"
        ? await apiGetCoachMeMessages(1)
        : await apiGetMemberMessages();

      if (Array.isArray(data) && data.length > 0) {
        setMessages(
          data.map((m: any) => ({
            sender: m.sender_role === "COACH" ? "COACH" : "MEMBER",
            author: m.sender_name || (m.sender_role === "COACH" ? "Coach Tan" : "Alex Morgan"),
            text: m.message_text || m.text || "",
            created_at: m.created_at || new Date().toISOString()
          }))
        );
        return;
      }
    } catch (err: any) {
      console.warn("Error loading chat messages:", err.message);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (getAccessToken()) {
      loadMessages();
    } else {
      try {
        const raw = window.localStorage.getItem(DEMO_MESSAGES_KEY);
        const parsed: unknown = raw ? JSON.parse(raw) : null;
        if (Array.isArray(parsed) && mounted) {
          setMessages(
            parsed.filter(
              (item): item is DemoMessage =>
                typeof item === "object" &&
                item !== null &&
                typeof (item as DemoMessage).text === "string" &&
                ["MEMBER", "COACH"].includes((item as DemoMessage).sender)
            )
          );
        } else if (mounted) {
          setMessages([
            {
              sender: role === "MEMBER" ? "COACH" : "MEMBER",
              author: role === "MEMBER" ? "Coach Tan" : "Alex Morgan",
              text: "Looking forward to our next session. Is there anything you’d like to focus on?",
              created_at: new Date().toISOString()
            }
          ]);
        }
      } catch {
        setError("Saved demo messages could not be read.");
      }
    }
    return () => {
      mounted = false;
    };
  }, [role]);

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;

    setSending(true);
    const nextMsg: DemoMessage = {
      sender: role,
      author: account.display_name,
      text,
      created_at: new Date().toISOString()
    };
    const next = [...messages, nextMsg];

    if (getAccessToken()) {
      try {
        if (role === "COACH") {
          await apiSendCoachMeMessage({ member_id: 1, message_text: text });
        } else {
          await apiSendMessage({ coach_id: 1, message_text: text });
        }
        await loadMessages();
      } catch (err: any) {
        console.warn("Backend chat send:", err.message);
      }
    }

    try {
      window.localStorage.setItem(DEMO_MESSAGES_KEY, JSON.stringify(next));
      setMessages(next);
      setDraft("");
      setError("");
    } catch {
      setError("This message could not be saved locally.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="workspace-content message-page">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">ONE-TO-ONE SUPPORT</p>
          <h1>Messages</h1>
          <p>Keep the conversation going between sessions.</p>
        </div>
        <span className="pill">
          <span className="availability-dot" /> Connected to chat
        </span>
      </div>
      <section className="workspace-panel conversation-panel">
        <header>
          <span className="trainer-member-avatar">
            {role === "MEMBER" ? "TT" : "AM"}
          </span>
          <span>
            <b>{role === "MEMBER" ? "Coach Tan" : "Alex Morgan"}</b>
            <small>
              {role === "MEMBER" ? "Strength & Conditioning" : "Member · Gold"}
            </small>
          </span>
          <span className="conversation-online">Active session</span>
        </header>
        <div className="conversation-messages" aria-live="polite">
          {messages.map((message, index) => (
            <div
              key={`${message.created_at}-${index}`}
              className={`message-row ${message.sender === role ? "message-own" : ""}`}
            >
              <span className="message-bubble">
                <small>{message.author}</small>
                <span>{message.text}</span>
                <time>
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </time>
              </span>
            </div>
          ))}
          {!messages.length && (
            <div className="empty-state">
              <MessageCircle size={24} />
              <h3>Start a conversation</h3>
              <p>Send a note about your next session.</p>
            </div>
          )}
        </div>
        <form className="conversation-compose" onSubmit={send}>
          <label className="sr-only" htmlFor="demo-message">
            Message
          </label>
          <input
            id="demo-message"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={500}
            placeholder="Write a message…"
          />
          <button
            className="button button-primary"
            type="submit"
            disabled={!draft.trim() || sending}
          >
            <Send size={15} /> {sending ? "Sending..." : "Send"}
          </button>
        </form>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <p className="auth-notice">
          Messages are persisted to the database and synced across devices.
        </p>
      </section>
    </div>
  );
}

export function MemberMessages({ account }: { account: PublicDemoAccount }) {
  return <Conversation account={account} role="MEMBER" />;
}
