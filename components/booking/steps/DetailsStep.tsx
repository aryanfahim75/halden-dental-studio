"use client";

import Link from "next/link";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import type { BookingFormValues } from "../BookingForm";

export function DetailsStep({
  form,
  onNext,
  onBack
}: {
  form: UseFormReturn<BookingFormValues>;
  onNext: () => void;
  onBack: () => void;
}) {
  const reg = form.register;
  const errs = form.formState.errors;

  return (
    <div className="bstep">
      <Field id="fullName" label="Full name" error={errs.fullName?.message}>
        <input
          id="fullName"
          className="field__input"
          type="text"
          autoComplete="name"
          aria-invalid={Boolean(errs.fullName) || undefined}
          aria-describedby={errs.fullName ? "fullName-error" : undefined}
          {...reg("fullName")}
        />
      </Field>

      <Field id="phone" label="Phone" hint="With its country code, like +44 20 7946 0958" error={errs.phone?.message}>
        <input
          id="phone"
          className="field__input"
          type="tel"
          autoComplete="tel"
          aria-invalid={Boolean(errs.phone) || undefined}
          aria-describedby={errs.phone ? "phone-error" : undefined}
          {...reg("phone")}
        />
      </Field>

      <Field id="email" label="Email" optional error={errs.email?.message}>
        <input
          id="email"
          className="field__input"
          type="text"
          inputMode="email"
          autoComplete="email"
          aria-invalid={Boolean(errs.email) || undefined}
          aria-describedby={errs.email ? "email-error" : undefined}
          {...reg("email")}
        />
      </Field>

      <Field id="note" label="Short note" optional hint="What is going on, in your own words. 500 characters at most." error={errs.note?.message}>
        <textarea
          id="note"
          className="field__input field__input--area"
          rows={4}
          maxLength={500}
          aria-invalid={Boolean(errs.note) || undefined}
          aria-describedby={errs.note ? "note-error" : undefined}
          {...reg("note")}
        />
      </Field>

      <div className="field field--consent">
        <label className="field__label" htmlFor="consent">
          <input id="consent" type="checkbox" className="field__checkbox" {...reg("consent")} />
          <span>
            I agree that this request and my details can be used to book the visit, as set out in the{" "}
            <Link href="/privacy">privacy note</Link>.
          </span>
        </label>
        {errs.consent ? (
          <p className="field__error" id="consent-error" role="alert">
            {errs.consent.message}
          </p>
        ) : null}
      </div>

      <div className="bstep__actions">
        <Button variant="secondary" type="button" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}
