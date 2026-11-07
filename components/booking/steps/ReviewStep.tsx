"use client";

import { Button } from "@/components/ui/Button";
import { treatmentBySlug } from "@/content/treatments";
import { teethById } from "@/content/teeth";
import { clinic } from "@/content/clinic";
import type { BookingFormValues } from "../BookingForm";

function Row({ term, value, edit, editLabel }: { term: string; value: React.ReactNode; edit?: () => void; editLabel: string }) {
  return (
    <div className="review__row">
      <div>
        <p className="review__term">{term}</p>
        <p className="review__value">{value}</p>
      </div>
      {edit ? (
        <button type="button" className="review__edit" onClick={edit} aria-label={`Edit ${editLabel}`}>
          Edit
        </button>
      ) : null}
    </div>
  );
}

export function ReviewStep({
  values,
  onBack,
  onEdit,
  submitting,
  submitError
}: {
  values: BookingFormValues;
  onBack: () => void;
  onEdit: (step: number) => void;
  submitting: boolean;
  submitError: string | null;
}) {
  const treatment = values.reason === "pain" ? null : treatmentBySlug.get(values.reason);
  const tooth = values.toothId ? teethById[values.toothId] : null;
  const dayLabel = values.date
    ? new Date(`${values.date}T00:00:00`).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short"
      })
    : "";

  return (
    <div className="bstep">
      <div className="review">
        <Row
          term="Reason"
          editLabel="reason"
          edit={() => onEdit(0)}
          value={
            treatment ? (
              treatment.name
            ) : (
              <span className="review__pain">I&apos;m in pain</span>
            )
          }
        />
        {tooth ? (
          <Row term="Tooth" editLabel="tooth" edit={() => onEdit(2)} value={
            <>
              <span className="review__fdi">FDI {tooth.id}</span> {tooth.name}
            </>
          } />
        ) : null}
        <Row term="Day" editLabel="the day" edit={() => onEdit(1)} value={dayLabel} />
        <Row term="Time" editLabel="the time" edit={() => onEdit(1)} value={values.time} />
        <Row term="Name" editLabel="the name" edit={() => onEdit(2)} value={values.fullName} />
        <Row term="Phone" editLabel="the phone number" edit={() => onEdit(2)} value={values.phone} />
        {values.email ? (
          <Row term="Email" editLabel="the email" edit={() => onEdit(2)} value={values.email} />
        ) : null}
        {values.note ? (
          <Row term="Note" editLabel="the note" edit={() => onEdit(2)} value={values.note} />
        ) : null}
      </div>

      <p className="review__hint">
        This is a request, not a confirmed appointment. Our team will contact you to confirm your
        time.
      </p>

      {submitError ? (
        <p className="field__error" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="bstep__actions">
        <Button variant="secondary" type="button" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Sending" : "Send request"}
        </Button>
      </div>

      <p className="review__fallback">
        Rather not fill forms? Call us on{" "}
        <a href={`tel:${clinic.phone.replace(/\s/g, "")}`}>{clinic.phone}</a> and reception will do
        this with you.
      </p>
    </div>
  );
}
