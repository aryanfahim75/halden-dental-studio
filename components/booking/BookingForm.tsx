"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingSchema, apiErrorCopy } from "@/lib/validation/booking";
import { Stepper, type StepperStep } from "@/components/ui/Stepper";
import { clinic } from "@/content/clinic";
import { track } from "@/lib/analytics";
import { ReasonStep } from "./steps/ReasonStep";
import { ScheduleStep } from "./steps/ScheduleStep";
import { DetailsStep } from "./steps/DetailsStep";
import { ReviewStep } from "./steps/ReviewStep";

export type BookingFormValues = {
  reason: string;
  toothId: string;
  date: string;
  time: string;
  fullName: string;
  phone: string;
  email: string;
  note: string;
  consent: boolean;
  requestId: string;
};

const steps: StepperStep[] = [
  { key: "reason", label: "Reason" },
  { key: "date", label: "Time" },
  { key: "details", label: "Your details" },
  { key: "review", label: "Review" }
];

const newRequestId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `req-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const stepIndexForField = (field: string): number => {
  if (field === "reason") return 0;
  if (field === "date" || field === "time") return 1;
  return 2;
};

export function BookingForm({ initialToothId }: { initialToothId: string }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [receipt, setReceipt] = useState<{ id: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const requestId = useRef(newRequestId());

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    mode: "onTouched",
    defaultValues: {
      reason: "",
      toothId: initialToothId,
      date: "",
      time: "",
      fullName: "",
      phone: "",
      email: "",
      note: "",
      consent: false,
      requestId: requestId.current
    }
  });

  const { watch, trigger, setValue, setError, handleSubmit, formState, getValues } = form;
  const values = watch();

  useEffect(() => {
    track("booking_step_view", { step: step + 1 });
  }, [step]);

  const goTo = (i: number, dir: 1 | -1 = 1) => {
    setDirection(dir);
    setStep(i);
  };

  const nextFromReason = async () => {
    if (await trigger(["reason"])) goTo(1, 1);
  };
  const nextFromTime = async () => {
    if (await trigger(["date", "time"])) goTo(2, 1);
  };
  const nextFromDetails = async () => {
    if (await trigger(["fullName", "phone", "email", "note", "consent"])) goTo(3, 1);
  };

  const submit = handleSubmit(async (payload) => {
    setSubmitError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.status === 201) {
        const json = (await res.json()) as { id: string };
        setReceipt(json);
        track("booking_success", { id: json.id });
        return;
      }
      if (res.status === 422) {
        const json = (await res.json()) as { errors?: Record<string, string> };
        const errors = json.errors ?? {};
        let firstStep = 3;
        for (const [k, message] of Object.entries(errors)) {
          setError(k as keyof BookingFormValues, { type: "server", message }, { shouldFocus: false });
          firstStep = Math.min(firstStep, stepIndexForField(k));
        }
        goTo(firstStep, -1);
        track("booking_submit", { outcome: "invalid" });
        return;
      }
      if (res.status === 429) {
        setSubmitError("Too many requests from your connection right now. Please call us and we will book you in.");
        track("booking_submit", { outcome: "rate_limited" });
        return;
      }
      setSubmitError(apiErrorCopy.network);
      track("booking_submit", { outcome: "error" });
    } catch {
      setSubmitError(apiErrorCopy.network);
      track("booking_submit", { outcome: "network_error" });
    }
  });

  if (receipt) {
    return (
      <div className="panel booking__done" role="status">
        <h2 className="booking__done-title">Request received.</h2>
        <p className="booking__done-body">Our team will contact you to confirm your time.</p>
        <p className="booking__done-note">
          This was a request, not a confirmed appointment. If something has changed, call us on{" "}
          <a href={`tel:${clinic.phone.replace(/\s/g, "")}`}>{clinic.phone}</a>.
        </p>
        <a className="btn btn--secondary" href="/">
          Back to the home page
        </a>
      </div>
    );
  }

  const stepEl = [
    <ReasonStep key="reason" form={form} onNext={nextFromReason} />,
    <ScheduleStep key="schedule" form={form} onNext={nextFromTime} onBack={() => goTo(0, -1)} />,
    <DetailsStep key="details" form={form} onNext={nextFromDetails} onBack={() => goTo(1, -1)} />,
    <ReviewStep
      key="review"
      values={values}
      onBack={() => goTo(2, -1)}
      onEdit={(target) => goTo(target, -1)}
      submitting={formState.isSubmitting}
      submitError={submitError}
    />
  ];

  return (
    <form className="booking__flow" noValidate onSubmit={(e) => { e.preventDefault(); void submit(e); }}>
      <Stepper
        steps={steps}
        current={step}
        currentLabel="current step"
        onGoTo={(i) => {
          if (i < step) goTo(i, -1);
        }}
      />
      <div className={`booking__stepbox booking__stepbox--${direction === 1 ? "fwd" : "back"}`} key={step}>
        {stepEl[step]}
      </div>
    </form>
  );
}
