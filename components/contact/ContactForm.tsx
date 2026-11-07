"use client";

import { useState } from "react";
import { enquirySchema } from "@/lib/validation/enquiry";
import { clinic } from "@/content/clinic";

type Values = { fullName: string; phone: string; email: string; message: string; consent: boolean };
type Errors = Partial<Record<keyof Values, string>>;

const empty: Values = { fullName: "", phone: "", email: "", message: "", consent: false };

const validate = (v: Values): Errors => {
  const r = enquirySchema.safeParse(v);
  if (r.success) return {};
  const out: Errors = {};
  for (const [k, msgs] of Object.entries(r.error.flatten().fieldErrors)) {
    if (msgs?.[0]) out[k as keyof Values] = msgs[0];
  }
  return out;
};

export function ContactForm() {
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    const next = { ...values, [key]: value };
    setValues(next);
    if (touched[key]) setErrors(validate(next));
  };
  const blur = (key: keyof Values) => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validate(values));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setTouched({ fullName: true, phone: true, email: true, message: true, consent: true });
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0];
      document.getElementById(`enq-${first}`)?.focus();
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.status === 422) {
        const data = await res.json();
        const server: Errors = {};
        for (const [k, msgs] of Object.entries(data.errors ?? {})) server[k as keyof Values] = (msgs as string[])[0];
        setErrors(server);
        setStatus("idle");
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
    } catch {
      setStatus("failed");
    }
  };

  if (status === "sent") {
    return (
      <div className="pg-done" role="status">
        <span className="pg-done__mark" aria-hidden="true">&#10003;</span>
        <h2>Thanks, {values.fullName.split(" ")[0]}. We&rsquo;ll be in touch.</h2>
        <p className="pg-muted">
          Our team replies within opening hours, usually by phone. If it&rsquo;s urgent, call{" "}
          <a href={`tel:${clinic.urgentPhone.replace(/\s/g, "")}`}>{clinic.urgentPhone}</a>.
        </p>
      </div>
    );
  }

  const field = (key: keyof Values) => ({
    id: `enq-${key}`,
    name: key,
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `enq-${key}-error` : undefined,
    onBlur: () => blur(key),
  });
  const err = (key: keyof Values) =>
    errors[key] ? (
      <p className="pg-error" id={`enq-${key}-error`}>
        {errors[key]}
      </p>
    ) : null;

  return (
    <form className="pg-form" onSubmit={onSubmit} noValidate>
      <div className="pg-form__two">
        <div className="pg-field">
          <label htmlFor="enq-fullName">Full name</label>
          <input
            className="pg-input"
            type="text"
            autoComplete="name"
            value={values.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            {...field("fullName")}
          />
          {err("fullName")}
        </div>
        <div className="pg-field">
          <label htmlFor="enq-phone">Phone</label>
          <input
            className="pg-input"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            {...field("phone")}
          />
          {err("phone")}
        </div>
      </div>
      <div className="pg-field">
        <label htmlFor="enq-email">
          Email <small>Optional</small>
        </label>
        <input
          className="pg-input"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          {...field("email")}
        />
        {err("email")}
      </div>
      <div className="pg-field">
        <label htmlFor="enq-message">How can we help?</label>
        <textarea
          className="pg-input"
          value={values.message}
          maxLength={1000}
          placeholder="For example: I'd like a check-up for me and my two children."
          onChange={(e) => set("message", e.target.value)}
          {...field("message")}
        />
        {err("message")}
      </div>
      <div className="pg-field">
        <label className="pg-check" htmlFor="enq-consent">
          <input
            type="checkbox"
            checked={values.consent}
            onChange={(e) => set("consent", e.target.checked)}
            {...field("consent")}
          />
          <span>
            I agree that Dental can use these details to reply to me, as set out in the{" "}
            <a href="/privacy">privacy policy</a>.
          </span>
        </label>
        {err("consent")}
      </div>
      {status === "failed" ? (
        <p className="pg-alert" role="alert">
          We couldn&rsquo;t send your message. Your details are still here, so check your connection
          and try again, or call us on {clinic.phone}.
        </p>
      ) : null}
      <button className="pg-submit" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send message"} <span aria-hidden="true">&rarr;</span>
      </button>
      <p className="pg-muted" style={{ margin: 0, fontSize: 14 }}>
        Please don&rsquo;t include detailed medical history here. We&rsquo;ll ask what we need when we call.
      </p>
    </form>
  );
}
