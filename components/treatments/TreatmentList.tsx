"use client";

import Link from "next/link";
import { useState } from "react";
import { treatments, treatmentCategories, type TreatmentCategory } from "@/content/treatments";

type Filter = "All" | TreatmentCategory;

const visitLabel = (v: string) => (v === "1" ? "1 visit" : `${v} visits`);

export function TreatmentList() {
  const [active, setActive] = useState<Filter>("All");
  const groups = active === "All" ? treatmentCategories : [active];
  const countOf = (c: Filter) =>
    c === "All" ? treatments.length : treatments.filter((t) => t.category === c).length;

  return (
    <>
      <div className="pg-filter">
        <div className="pg-filter__row" role="group" aria-label="Filter treatments by category">
          {(["All", ...treatmentCategories] as Filter[]).map((c) => (
            <button
              key={c}
              type="button"
              className="pg-chip"
              aria-pressed={active === c}
              onClick={() => setActive(c)}
            >
              {c} <span className="pg-chip__n">{countOf(c)}</span>
            </button>
          ))}
        </div>
      </div>

      {groups.map((cat) => {
        const rows = treatments.filter((t) => t.category === cat);
        return (
          <section className="pg-band" key={cat} aria-labelledby={`band-${cat}`}>
            <div className="pg-band__head" data-reveal>
              <h2 id={`band-${cat}`}>{cat}</h2>
              <p>
                {rows.length} {rows.length === 1 ? "treatment" : "treatments"}
              </p>
            </div>
            <ul className="pg-rows">
              {rows.map((t) => (
                <li className="pg-row" key={t.slug} id={t.slug} data-reveal>
                  <div>
                    <h3>{t.name}</h3>
                    <p className="pg-row__summary">{t.summary}</p>
                  </div>
                  <dl className="pg-row__facts">
                    <div>
                      <dt>Typical visits</dt>
                      <dd>{visitLabel(t.visits)}</dd>
                    </div>
                    <div>
                      <dt>Recovery</dt>
                      <dd>{t.recovery}</dd>
                    </div>
                  </dl>
                  <Link className="pg-row__book" href="/book" aria-label={`Book a visit for ${t.name}`}>
                    Book <span aria-hidden="true">&rarr;</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <p className="pg-note">
        Recovery varies from person to person. Your dentist confirms the plan, number of visits and
        cost with you in writing before anything starts.
      </p>
    </>
  );
}
