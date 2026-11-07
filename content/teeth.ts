import { treatments, type Treatment } from "./treatments";

export type ToothKind = "incisor" | "canine" | "premolar" | "molar";

export type Tooth = {
  id: string;
  quadrant: 1 | 2 | 3 | 4;
  digit: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  arch: "upper" | "lower";
  side: "right" | "left";
  name: string;
  kind: ToothKind;
  concerns: string[];
  relatedTreatmentSlugs: string[];
};

const quadrantLabels: Record<number, string> = {
  1: "Upper right",
  2: "Upper left",
  3: "Lower left",
  4: "Lower right"
};

const positionNames: Record<number, string> = {
  1: "central incisor",
  2: "lateral incisor",
  3: "canine",
  4: "first premolar",
  5: "second premolar",
  6: "first molar",
  7: "second molar",
  8: "wisdom tooth"
};

const kindsByDigit: Record<number, ToothKind> = {
  1: "incisor",
  2: "incisor",
  3: "canine",
  4: "premolar",
  5: "premolar",
  6: "molar",
  7: "molar",
  8: "molar"
};

const groupContent: Record<string, { concerns: string[]; relatedTreatmentSlugs: string[] }> = {
  incisor: {
    concerns: ["Chips", "Gaps", "Discolouration"],
    relatedTreatmentSlugs: ["fillings", "veneers", "whitening"]
  },
  canine: {
    concerns: ["Wear", "Gum recession", "Chips"],
    relatedTreatmentSlugs: ["gum-care", "fillings", "crowns-and-bridges"]
  },
  premolar: {
    concerns: ["Cavities", "Cracks", "Sensitivity"],
    relatedTreatmentSlugs: ["fillings", "crowns-and-bridges"]
  },
  molarLow: {
    concerns: ["Deep cavities", "Cracks", "Ache when chewing"],
    relatedTreatmentSlugs: ["fillings", "root-canal-treatment", "crowns-and-bridges"]
  },
  wisdom: {
    concerns: ["Pain at the back", "Swelling", "Crowding"],
    relatedTreatmentSlugs: ["wisdom-tooth-removal"]
  }
};

function groupFor(digit: number): (typeof groupContent)[string] {
  const kind = kindsByDigit[digit];
  if (digit === 8) return groupContent.wisdom;
  if (kind === "molar") return groupContent.molarLow;
  return groupContent[kind];
}

const quadrants: Array<{ q: 1 | 2 | 3 | 4; arch: "upper" | "lower"; side: "right" | "left" }> = [
  { q: 1, arch: "upper", side: "right" },
  { q: 2, arch: "upper", side: "left" },
  { q: 3, arch: "lower", side: "left" },
  { q: 4, arch: "lower", side: "right" }
];

export const teeth: Tooth[] = quadrants.flatMap(({ q, arch, side }) =>
  ([1, 2, 3, 4, 5, 6, 7, 8] as const).map((digit) => ({
    id: `${q}${digit}`,
    quadrant: q,
    digit,
    arch,
    side,
    name: `${quadrantLabels[q]} ${positionNames[digit]}`,
    kind: kindsByDigit[digit],
    ...groupFor(digit)
  }))
);

export const teethById: Record<string, Tooth> = Object.fromEntries(
  teeth.map((t) => [t.id, t])
);

export const isToothId = (id: string): boolean =>
  Object.prototype.hasOwnProperty.call(teethById, id);

export const treatmentNamesForSlugs = (slugs: string[]): Treatment[] =>
  slugs
    .map((s) => treatments.find((t) => t.slug === s))
    .filter((t): t is Treatment => Boolean(t));

export const chartTopRow = [
  ["18", "17", "16", "15", "14", "13", "12", "11"],
  ["21", "22", "23", "24", "25", "26", "27", "28"]
];

export const chartBottomRow = [
  ["48", "47", "46", "45", "44", "43", "42", "41"],
  ["31", "32", "33", "34", "35", "36", "37", "38"]
];
