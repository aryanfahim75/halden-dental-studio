import type { Metadata } from "next";
import { TreatmentList } from "@/components/treatments/TreatmentList";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/components/pages/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { clinic } from "@/content/clinic";

export const metadata: Metadata = {
  title: `Dental Treatments in ${clinic.city} | ${clinic.name}`,
  description:
    "Check-ups, fillings, root canals, crowns, whitening, aligners, implants and children's dentistry, with typical visits and recovery explained plainly.",
};

export default function TreatmentsPage() {
  return (
    <div className="pg-page">
      <PageHero
        eyebrow="Treatments"
        titleLabel="Clear care, explained plainly."
        title={
          <>
            Clear care, explained <em>plainly.</em>
          </>
        }
        lead="Everything we offer, from routine check-ups to implants and children's care. Each treatment shows how many visits it usually takes and what recovery feels like."
        actions={
          <ButtonLink href="/book" variant="primary-film">
            Book a visit
          </ButtonLink>
        }
      />
      <section className="pg-section">
        <div className="pg-wrap">
          <TreatmentList />
        </div>
      </section>
      <Reveal />
    </div>
  );
}
