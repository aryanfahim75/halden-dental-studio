import type { Metadata } from "next";
import { faqs } from "@/content/faq";
import { clinic } from "@/content/clinic";
import { ButtonLink } from "@/components/ui/Button";
import { HoursTable } from "@/components/visit/HoursTable";
import { TrackedLink } from "@/components/ui/TrackedLink";

export const metadata: Metadata = {
  title: `Your First Visit | ${clinic.name}`,
  description: "What happens in your first visit, step by step, plus answers to the questions people actually ask."
};

const visitSteps = [
  {
    title: "Arrive",
    body: "Forms take 5 minutes. Bring a medicines list."
  },
  {
    title: "Tell us what's wrong",
    body: "We listen first. Nothing is examined before we understand."
  },
  {
    title: "Exam if needed",
    body: "We show you the image on screen, in plain words."
  },
  {
    title: "Leave with a plan",
    body: "Options and costs in writing. Starting can wait."
  }
];

export default function YourVisitPage() {
  return (
    <div className="section">
      <div className="container">
        <h1 className="h1">Your first visit, step by step.</h1>
        <p className="lead">
          Most first visits take about 40 minutes. Here is exactly what happens in them.
        </p>

        <ol className="visit-steps visit-steps--full" data-rise>
          {visitSteps.map((s, i) => (
            <li className="visit-step" key={s.title}>
              <span className="visit-step__num" aria-hidden="true">
                {i + 1}
              </span>
              <span className="visit-step__stack">
                <span className="visit-step__title">{s.title}</span>
                <span className="visit-step__body">{s.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="container grid12 visit-grid">
        <section className="visit-grid__faq" aria-labelledby="faq-head" data-rise>
          <h2 className="h2" id="faq-head">
            Questions people ask
          </h2>
          <div className="faq">
            {faqs.map((f) => (
              <details className="faq__item" key={f.question}>
                <summary className="faq__summary">
                  <span className="faq__icon" aria-hidden="true" />
                  {f.question}
                </summary>
                <p className="faq__answer">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <aside className="visit-grid__side">
          <h2 className="h2 h2--small">Hours</h2>
          <HoursTable />

          <h2 className="h2 h2--small">Getting here</h2>
          <p className="visit-side__addr">
            Unit 4, 128 Fenwick Row, Harborough HB3 2QL
          </p>
          <TrackedLink href={clinic.directionsUrl} event="directions_tap" className="rows-link">
            Directions
          </TrackedLink>

          <h2 className="h2 h2--small">Urgent pain</h2>
          <p className="visit-side__body">
            Severe pain, swelling, a knocked-out tooth, or trouble breathing. Call now.
          </p>
          <a className="urgent-link urgent-link--block" href={`tel:${clinic.urgentPhone.replace(/\s/g, "")}`}>
            Urgent: {clinic.urgentPhone}
          </a>
        </aside>
      </div>

      <div className="container visit-cta" data-rise>
        <ButtonLink href="/book" variant="primary">
          Book a visit
        </ButtonLink>
      </div>
    </div>
  );
}
