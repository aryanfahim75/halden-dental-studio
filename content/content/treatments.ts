export type TreatmentCategory =
  | "Everyday care"
  | "Repair"
  | "Cosmetic"
  | "Surgery"
  | "Children";

export type Treatment = {
  slug: string;
  name: string;
  category: TreatmentCategory;
  summary: string;
  visits: string;
  recovery: string;
};

export const treatmentCategories: TreatmentCategory[] = [
  "Everyday care",
  "Repair",
  "Cosmetic",
  "Surgery",
  "Children"
];

export const treatments: Treatment[] = [
  {
    slug: "check-up-and-clean",
    name: "Check-up and clean",
    category: "Everyday care",
    summary:
      "A full look at your teeth, gums and existing work, then a scale, polish and a plain-language plan.",
    visits: "1",
    recovery: "Back to normal the same day"
  },
  {
    slug: "gum-care",
    name: "Gum care",
    category: "Everyday care",
    summary:
      "Deeper cleaning if your gums bleed, feel sore or sit low on the tooth. Nothing invasive, nothing rushed.",
    visits: "1 or more",
    recovery: "Gums may feel tender for a few days"
  },
  {
    slug: "fillings",
    name: "Fillings",
    category: "Repair",
    summary:
      "A cavity cleared and filled with a tooth-coloured material, matched to the shade around it.",
    visits: "1",
    recovery: "Numbness fades within hours"
  },
  {
    slug: "root-canal-treatment",
    name: "Root canal treatment",
    category: "Repair",
    summary:
      "The nerve of an aching tooth is cleaned, shaped and sealed. Done properly, it saves the tooth you have.",
    visits: "1 to 2",
    recovery: "Mild tenderness for a few days"
  },
  {
    slug: "crowns-and-bridges",
    name: "Crowns and bridges",
    category: "Repair",
    summary:
      "A tooth too broken to fill is covered with a strong cap, or a gap is bridged. You approve the shade first.",
    visits: "2",
    recovery: "Temporary sensitivity is common"
  },
  {
    slug: "clear-aligners",
    name: "Clear aligners",
    category: "Cosmetic",
    summary:
      "Removable trays that move teeth a little at a time. You see the planned outcome before you start.",
    visits: "Several, over months",
    recovery: "Mild pressure after each new aligner"
  },
  {
    slug: "whitening",
    name: "Whitening",
    category: "Cosmetic",
    summary:
      "Supervised whitening at the studio and at home. We set a target shade together and check progress.",
    visits: "1 to 2",
    recovery: "Short-term sensitivity is common"
  },
  {
    slug: "veneers",
    name: "Veneers",
    category: "Cosmetic",
    summary:
      "Thin porcelain facings for front teeth. Charges, time and the try-in look are all agreed in writing first.",
    visits: "2 to 3",
    recovery: "Temporary sensitivity is common"
  },
  {
    slug: "wisdom-tooth-removal",
    name: "Wisdom tooth removal",
    category: "Surgery",
    summary:
      "Sore or crowded wisdom teeth assessed with an X-ray, then removed calmly with a clear aftercare plan.",
    visits: "1",
    recovery: "Rest for a few days"
  },
  {
    slug: "dental-implants",
    name: "Dental implants",
    category: "Surgery",
    summary:
      "A titanium root placed where a tooth is lost. Healing happens in stages and you see each stage coming.",
    visits: "Several, over months",
    recovery: "Healing happens in stages"
  },
  {
    slug: "childrens-dentistry",
    name: "Children's dentistry",
    category: "Children",
    summary:
      "Short, friendly visits that make the studio a familiar place. Lots of praise, very little done at once.",
    visits: "1 or more",
    recovery: "Guidance given for each child"
  }
];

export const treatmentBySlug = new Map(treatments.map((t) => [t.slug, t]));
