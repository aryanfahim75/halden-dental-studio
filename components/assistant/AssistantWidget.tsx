"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { clinic } from "@/content/clinic";
import { track } from "@/lib/analytics";

type Msg = { role: "user" | "bot"; text: string; urgent?: boolean; action?: { label: string; href: string; external?: boolean } };

const QUICK: string[] = [
  "What are your opening hours?",
  "Where are you?",
  "I'm in pain",
  "How do I book?"
];

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text: `Hello. I know this studio's hours, address, team and treatments. I can't diagnose or quote final prices. What would you like to know?`
    }
  ]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    track("assistant_open", { started: open });
  }, [open]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || busy) return;
    setDraft("");
    setMessages((m) => [...m, { role: "user", text: message }]);
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const json = (await res.json()) as { reply: string; urgent: boolean; action: { label: string; href: string } | null; suggestions: string[] };
      setMessages((m) => [
        ...m,
        { role: "bot", text: json.reply, urgent: json.urgent, action: json.action ?? undefined }
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text: `The connection failed. Call us on ${clinic.phone} and reception will help you.`,
          action: { label: "Call the studio", href: `tel:${clinic.phone.replace(/\s/g, "")}`, external: true }
        }
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="assistant" data-open={open || undefined}>
      {open ? (
        <div className="assistant__panel" role="dialog" aria-label="Dental assistant">
          <div className="assistant__head">
            <p className="assistant__title">Dental assistant</p>
            <button type="button" className="assistant__close" aria-label="Close assistant" onClick={() => setOpen(false)}>
              <span aria-hidden="true" />
            </button>
          </div>

          <div className="assistant__list" ref={listRef}>
            {messages.map((m, i) => (
              <div className={`assistant__msg assistant__msg--${m.role}`} key={i}>
                <p className={m.urgent ? "assistant__text assistant__text--urgent" : "assistant__text"}>{m.text}</p>
                {m.action ? (
                  m.action.external ? (
                    <a className="assistant__action" href={m.action.href}>
                      {m.action.label}
                    </a>
                  ) : (
                    <Link className="assistant__action" href={m.action.href} onClick={() => track("assistant_handoff", { href: m.action?.href })}>
                      {m.action.label}
                    </Link>
                  )
                ) : null}
              </div>
            ))}
            {busy ? <p className="assistant__typing">Typing</p> : null}
          </div>

          <div className="assistant__quick">
            {QUICK.map((q) => (
              <button key={q} type="button" className="assistant__quick-btn" onClick={() => send(q)}>
                {q}
              </button>
            ))}
          </div>

          <div className="assistant__form">
            <label className="vh" htmlFor="assistant-input">
              Ask the assistant
            </label>
            <input
              id="assistant-input"
              ref={inputRef}
              className="assistant__input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send(draft);
              }}
              placeholder="Ask about hours, location, booking"
              maxLength={300}
            />
            <button type="button" className="btn btn--primary assistant__send" disabled={busy} onClick={() => send(draft)}>
              Ask
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="assistant__toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="assistant__toggle-mark" aria-hidden="true" />
        <span className="vh">{open ? "Close assistant" : "Open assistant"}</span>
      </button>
    </div>
  );
}
