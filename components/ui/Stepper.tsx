"use client";

export type StepperStep = {
  key: string;
  label: string;
};

export function Stepper({
  steps,
  current,
  onGoTo,
  currentLabel
}: {
  steps: StepperStep[];
  current: number;
  onGoTo: (index: number) => void;
  currentLabel: string;
}) {
  return (
    <nav aria-label="Booking steps" className="stepper">
      <ol className="stepper__list">
        {steps.map((step, i) => {
          const state = i < current ? "done" : i === current ? "current" : "future";
          const reachable = i <= current;
          return (
            <li className="stepper__item" key={step.key}>
              {reachable ? (
                <button
                  type="button"
                  className={`stepper__btn stepper__btn--${state}`}
                  aria-current={i === current ? "step" : undefined}
                  onClick={() => reachable && onGoTo(i)}
                >
                  <span className="stepper__num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="stepper__label">{step.label}</span>
                  {i === current ? <span className="vh">{currentLabel}</span> : null}
                </button>
              ) : (
                <span className={`stepper__body stepper__btn--${state}`}>
                  <span className="stepper__num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="stepper__label">{step.label}</span>
                </span>
              )}
              {i < steps.length - 1 ? <span className="stepper__rule" aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
