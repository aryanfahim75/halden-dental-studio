import type { Metadata } from "next";
import { clinic } from "@/content/clinic";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/components/pages/Reveal";
import { GallerySection } from "@/components/gallery/GalleryGrid";

export const metadata: Metadata = {
  title: `Gallery | ${clinic.name}`,
  description: "Browse our clinic, team, treatments and patient smiles at Dental Studio.",
};

const images = [
  { src: "/images/clinic-1.jpg", alt: "Modern reception area", category: "Clinic" },
  { src: "/images/clinic-2.jpg", alt: "Treatment room with dental chair", category: "Clinic" },
  { src: "/images/clinic-3.jpg", alt: "Sterilization and lab area", category: "Clinic" },
  { src: "/images/team-1.jpg", alt: "Dr. Sarah Mitchell with patient", category: "Team" },
  { src: "/images/team-2.jpg", alt: "Hygiene team at work", category: "Team" },
  { src: "/images/treatment-1.jpg", alt: "Digital smile design process", category: "Treatments" },
  { src: "/images/treatment-2.jpg", alt: "Implant surgery setup", category: "Treatments" },
  { src: "/images/treatment-3.jpg", alt: "Orthodontic aligners", category: "Treatments" },
  { src: "/images/patient-1.jpg", alt: "Patient smile transformation", category: "Smiles" },
  { src: "/images/patient-2.jpg", alt: "Veneers before and after", category: "Smiles" },
  { src: "/images/patient-3.jpg", alt: "Whitening results", category: "Smiles" },
  { src: "/images/tech-1.jpg", alt: "CBCT 3D imaging", category: "Technology" },
  { src: "/images/tech-2.jpg", alt: "Intraoral scanner", category: "Technology" },
  { src: "/images/tech-3.jpg", alt: "Digital workflow", category: "Technology" },
];

export default function GalleryPage() {
  return (
    <div className="pg-page">
      <PageHero
        eyebrow="Gallery"
        titleLabel="Our clinic in pictures."
        title={
          <>
            Our clinic in <em>pictures.</em>
          </>
        }
        lead="From the reception to the lab, our team to our technology — see what makes Dental Studio different."
      />

      <section className="pg-section">
        <div className="pg-wrap">
          <GallerySection images={images} />
        </div>
      </section>

      <section className="pg-section pg-section--band" data-reveal>
        <div className="pg-wrap pg-band-cta">
          <div>
            <h2>Want to see more?</h2>
            <p>Book a visit and experience the studio yourself.</p>
          </div>
          <a href="/book" className="btn btn--primary">
            Book a visit
          </a>
        </div>
      </section>

      <Reveal />
    </div>
  );
}