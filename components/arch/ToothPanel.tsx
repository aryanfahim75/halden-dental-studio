"use client";

import Link from "next/link";
import { appStore } from "@/lib/store";
import { treatmentNamesForSlugs, type Tooth } from "@/content/teeth";

export function ToothPanel({ tooth }: { tooth: Tooth }) {
  const related = treatmentNamesForSlugs(tooth.relatedTreatmentSlugs);
  return (
    <div className="tooth-panel" key={tooth.id}>
      <p className="tooth-panel__fdi">FDI {tooth.id}</p>
      <h3 className="tooth-panel__name">{tooth.name}</h3>
      <p className="tooth-panel__head">Common reasons people bring this tooth in</p>
      <ul className="tooth-panel__concerns">
        {tooth.concerns.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <p className="tooth-panel__head">Treatments for this tooth</p>
      <ul className="tooth-panel__treatments">
        {related.map((t) => (
          <li key={t.slug}>
            <Link href={`/treatments#${t.slug}`}>{t.name}</Link>
          </li>
        ))}
      </ul>
      <Link
        className="btn btn--primary-film"
        href={`/book?tooth=${tooth.id}`}
        onClick={() => appStore.setTooth(tooth.id)}
      >
        Book for this tooth
      </Link>
      <p className="tooth-panel__note">
        These are common reasons people visit, not a diagnosis.
      </p>
    </div>
  );
}
