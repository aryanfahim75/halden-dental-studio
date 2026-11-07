import type { Metadata } from "next";
import { clinic } from "@/content/clinic";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/components/pages/Reveal";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactHours } from "@/components/contact/ContactHours";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: `Contact Us | ${clinic.name}`,
  description: `Call, message or visit ${clinic.name} in ${clinic.city}. Opening hours, directions and a quick enquiry form.`,
};

const tel = (n: string) => `tel:${n.replace(/\s/g, "")}`;

export default function ContactPage() {
  return (
    <div className="pg-page">
      <PageHero
        eyebrow="Contact"
        titleLabel="Start with a conversation."
        title={
          <>
            Start with a <em>conversation.</em>
          </>
        }
        lead="Call, message or send us a note. We'll help you choose the right appointment, or tell you what to do if something hurts."
        actions={
          <>
            <ButtonLink href="/book" variant="primary-film">
              Book a visit
            </ButtonLink>
            <a className="pg-hero__urgent" href={tel(clinic.urgentPhone)}>
              In pain? {clinic.urgentPhone}
            </a>
          </>
        }
      />

      <section className="pg-section">
        <div className="pg-wrap pg-contact">
          <div data-reveal>
            <div className="pg-card pg-info">
              <h2>Visit or call</h2>
              <div className="pg-info__block">
                <p className="pg-info__k">Address</p>
                <address className="pg-info__v">
                  {clinic.addressLines.map((l) => (
                    <span key={l}>
                      {l}
                      <br />
                    </span>
                  ))}
                </address>
                <p className="pg-info__v" style={{ marginTop: 10 }}>
                  <a href={clinic.directionsUrl} target="_blank" rel="noopener noreferrer">
                    Get directions &rarr;
                  </a>
                </p>
              </div>
              <div className="pg-info__block">
                <p className="pg-info__k">Phone and messages</p>
                <p className="pg-info__v pg-info__line">
                  <span>Reception</span>
                  <a href={tel(clinic.phone)}>{clinic.phone}</a>
                </p>
                <p className="pg-info__v pg-info__line">
                  <span>WhatsApp</span>
                  <a
                    href={`https://wa.me/${clinic.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {clinic.whatsapp}
                  </a>
                </p>
                <p className="pg-info__v pg-info__line">
                  <span>Email</span>
                  <a href={`mailto:${clinic.email}`}>{clinic.email}</a>
                </p>
              </div>
              <div className="pg-info__block">
                <p className="pg-info__k">Opening hours</p>
                <ContactHours />
              </div>
              {clinic.isSample ? (
                <p className="pg-sample">Sample details. Replace with the clinic&rsquo;s real information before launch.</p>
              ) : null}
            </div>

            <div className="pg-urgent">
              <strong>In severe pain?</strong>
              <p>
                Call <a href={tel(clinic.urgentPhone)}>{clinic.urgentPhone}</a> now. If you have facial
                swelling with a fever, or trouble breathing or swallowing, go to emergency care straight away.
              </p>
            </div>
          </div>

          <div className="pg-card" data-reveal>
            <h2>Send us a message</h2>
            <p className="pg-muted" style={{ margin: 0, fontSize: 16 }}>
              We reply within opening hours. For an appointment time, booking online is quickest.
            </p>
            <ContactForm />
          </div>
        </div>
      </section>
      <Reveal />
    </div>
  );
}
