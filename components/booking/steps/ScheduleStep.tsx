"use client";

import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { formatDayLabel, isOpenDay, openDates, timeSlots } from "@/lib/hours";
import type { BookingFormValues } from "../BookingForm";

export function ScheduleStep({
  form,
  onNext,
  onBack
}: {
  form: UseFormReturn<BookingFormValues>;
  onNext: () => void;
  onBack: () => void;
}) {
  const [dates, setDates] = useState<Date[] | null>(null);
  const date = form.watch("date");
  const time = form.watch("time");

  useEffect(() => {
    setDates(openDates());
  }, []);

  const dow = date ? new Date(`${date}T00:00:00`).getDay() : null;
  const slots = dow !== null && isOpenDay(dow) ? timeSlots(dow) : [];
  const isToday = date ? date === new Date().toISOString().slice(0, 10) : false;

  const localSlotTime = (slot: string): number => {
    const [hh, mm] = slot.split(":").map(Number);
    return hh * 60 + mm;
  };
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  return (
    <div className="bstep">
      <p className="bstep__head">Choose a day</p>
      {dates === null ? (
        <p className="options__placeholder">Loading the next open days</p>
      ) : (
        <div className="pick pick--dates" role="radiogroup" aria-label="Choose a day">
          {dates.map((d) => {
            const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
              d.getDate()
            ).padStart(2, "0")}`;
            const remaining = isTodayCheck(iso) ? timeSlots(d.getDay()).filter((s) => localSlotTime(s) > nowMinutes) : timeSlots(d.getDay());
            const disabled = remaining.length === 0;
            return (
              <button
                type="button"
                key={iso}
                className="pick__btn"
                data-selected={date === iso || undefined}
                disabled={disabled}
                aria-pressed={date === iso}
                onClick={() => {
                  form.setValue("date", iso, { shouldValidate: true });
                  if (form.watch("time") && !timeSlots(d.getDay()).includes(form.watch("time"))) {
                    form.setValue("time", "");
                  }
                }}
              >
                {formatDayLabel(d)}
              </button>
            );
          })}
        </div>
      )}
      {form.formState.errors.date ? (
        <p className="field__error" role="alert">
          {form.formState.errors.date.message}
        </p>
      ) : null}

      <p className="bstep__head">Choose a time</p>
      {date === "" ? (
        <p className="options__placeholder">Choose a day first</p>
      ) : (
        <div className="pick pick--times" role="radiogroup" aria-label="Choose a time">
          {slots.map((slot) => {
            const disabled = isToday && localSlotTime(slot) <= nowMinutes;
            return (
              <button
                type="button"
                key={slot}
                className="pick__btn"
                data-selected={time === slot || undefined}
                disabled={disabled}
                aria-pressed={time === slot}
                onClick={() => form.setValue("time", slot, { shouldValidate: true })}
              >
                {slot}
              </button>
            );
          })}
        </div>
      )}
      {form.formState.errors.time ? (
        <p className="field__error" role="alert">
          {form.formState.errors.time.message}
        </p>
      ) : null}

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

function isTodayCheck(iso: string): boolean {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return iso === today;
}
