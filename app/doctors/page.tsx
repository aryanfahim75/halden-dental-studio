import type { Metadata } from "next";
import { team } from "@/content/team";
import { clinic } from "@/content/clinic";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/components/pages/Reveal";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: `Our Dentists | ${clinic.name}`,
  description:
    "Meet the dentists and hygienists at Dental Studio, with their roles, qualifications and registration details.",
};

const shortName = (name: string) => name.replace(/^Dr\s+/, "Dr ").split(" ").slice(0, 2).join(" ");

export default function DoctorsPage() {
  return (
    <div className="pg-page">
      <PageHero
        eyebrow="Doctors"
        titleLabel="The people looking after you."
        title={
          <>
            The people looking <em>after you.</em>
          </>
        }
        lead="One team for check-ups, repairs, cosmetic care, implants and children. You'll always know who is treating you and what they're qualified to do."
      />

      <section className="pg-section">
        <div className="pg-wrap">
          <ul className="pg-team">
            {team.map((m) => (
              <li className="pg-doc" key={m.slug} data-reveal>
                <div className="pg-doc__photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.portrait} alt={m.isSample ? "" : `Portrait of ${m.name}`} width={400} height={500} loading="lazy" />
                  {m.isSample ? <span className="pg-tag">Sample profile</span> : null}
                </div>
                <div className="pg-doc__body">
                  <div>
                    <p className="pg-doc__role">{m.role}</p>
                    <h2>{m.name}</h2>
                  </div>
                  <p className="pg-doc__bio">{m.bio}</p>
                  <dl>
                    <div>
                      <dt>Qualifications</dt>
                      <dd>{m.qualifications}</dd>
                    </div>
                    <div>
                      <dt>Registration</dt>
                      <dd>{m.registration}</dd>
                    </div>
                  </dl>
                  <div className="pg-doc__cta">
                    <ButtonLink href="/book" variant="secondary">
                      Book with {shortName(m.name)}
                    </ButtonLink>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="pg-band-cta" data-reveal>
            <div>
              <h2>Not sure who to see?</h2>
              <p>Book a first visit and we'll match you with the right person for your care.</p>
            </div>
            <ButtonLink href="/book">Book a first visit</ButtonLink>
          </div>
        </div>
      </section>
      <Reveal />
    </div>
  );
}
