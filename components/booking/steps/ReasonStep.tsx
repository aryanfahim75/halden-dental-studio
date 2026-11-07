"use client";

import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { treatments, treatmentCategories } from "@/content/treatments";
import { teethById } from "@/content/teeth";
import { clinic } from "@/content/clinic";
import type { BookingFormValues } from "../BookingForm";

export function ReasonStep({
  form,
  onNext
}: {
  form: UseFormReturn<BookingFormValues>;
  onNext: () => void;
}) {
  const reason = form.watch("reason");
  const toothId = form.watch("toothId");
  const tooth = toothId ? teethById[toothId] : null;

  return (
    <div className="bstep">
      {tooth ? (
        <div className="tooth-chip-row">
          <span className="tooth-chip">
            <span className="tooth-chip__id">FDI {tooth.id}</span> {tooth.name}
          </span>
          <button
            type="button"
            className="tooth-chip-remove"
            onClick={() => form.setValue("toothId", "", { shouldValidate: true })}
          >
            Remove tooth
          </button>
        </div>
      ) : null}

      <p className="bstep__head">What brings you in?</p>
      <div className="options" role="radiogroup" aria-label="Reason for your visit">
        <div className="option-wrap">
          <input
            id="reason-pain"
            type="radio"
            value="pain"
            checked={reason === "pain"}
            className="option__input"
            {...form.register("reason")}
          />
          <label htmlFor="reason-pain" className="option option--pain">
            I&apos;m in pain
          </label>
        </div>
        {treatmentCategories.map((cat) => (
          <div className="options__group" key={cat}>
            <p className="label options__cat">{cat}</p>
            <div className="options__rows">
              {treatments
                .filter((t) => t.category === cat)
                .map((t) => {
                  const id = `reason-${t.slug}`;
                  return (
                    <div className="option-wrap" key={t.slug}>
                      <input
                        id={id}
                        type="radio"
                        value={t.slug}
                        checked={reason === t.slug}
                        className="option__input"
                        {...form.register("reason")}
                      />
                      <label htmlFor={id} className="option">
                        <span className="option__name">{t.name}</span>
                        <span className="option__meta">{t.visits} visit(s)</span>
                      </label>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
      {form.formState.errors.reason ? (
        <p className="field__error" role="alert">
          {form.formState.errors.reason.message}
        </p>
      ) : null}

      {reason === "pain" ? (
        <div className="urgent-callout" role="alert">
          <p>
            Call us now on{" "}
            <a href={`tel:${clinic.urgentPhone.replace(/\s/g, "")}`}>{clinic.urgentPhone}</a>.
          </p>
          <p>
            If you have facial swelling, a fever, or trouble breathing or swallowing, seek
            emergency care.
          </p>
          <p className="urgent-callout__soft">You can still send this request if you prefer.</p>
        </div>
      ) : null}

      <div className="bstep__actions">
        <Button type="button" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}
