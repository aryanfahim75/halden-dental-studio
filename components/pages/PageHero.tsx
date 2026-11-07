import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  titleLabel: string;
  lead: string;
  actions?: ReactNode;
};

/** Teal hero shared by the inner pages. Content is visible without JavaScript. */
export function PageHero({ eyebrow, title, titleLabel, lead, actions }: PageHeroProps) {
  return (
    <section className="pg-hero" aria-labelledby="page-title">
      <div className="pg-wrap pg-hero__grid">
        <div>
          <p className="pg-eyebrow" data-reveal>
            {eyebrow}
          </p>
          <h1 id="page-title" aria-label={titleLabel} data-reveal>
            {title}
          </h1>
        </div>
        <div className="pg-hero__side">
          <p className="pg-hero__lead" data-reveal>
            {lead}
          </p>
          {actions ? (
            <div className="pg-hero__actions" data-reveal>
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
