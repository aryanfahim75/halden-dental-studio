export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  registration: string;
  qualifications: string;
  bio: string;
  isSample: boolean;
  portrait: string;
};

export const team: TeamMember[] = [
  {
    slug: "lena-halloran",
    name: "Dr Lena Halloran",
    role: "Principal dentist",
    registration: "To be added",
    qualifications: "BDS, MFDS RCS(Ed)",
    bio: "Fifteen years in restorative care. Short plans, X-ray first.",
    isSample: true,
    portrait: "/images/portrait-1.svg"
  },
  {
    slug: "tomas-arey",
    name: "Dr Tomas Arey",
    role: "Endodontist",
    registration: "To be added",
    qualifications: "BDS, MSc Endodontology",
    bio: "Root canal, done quietly. Explained in plain words.",
    isSample: true,
    portrait: "/images/portrait-2.svg"
  },
  {
    slug: "nadia-perske",
    name: "Nadia Perske",
    role: "Dental hygienist",
    registration: "To be added",
    qualifications: "Dip DH",
    bio: "Steady gum care. Brushing coaching that sticks.",
    isSample: true,
    portrait: "/images/portrait-3.svg"
  }
];