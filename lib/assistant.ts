import { clinic } from "@/content/clinic";
import { treatments } from "@/content/treatments";
import { hoursSummary } from "@/lib/hours";

export type AssistantReply = {
  reply: string;
  urgent: boolean;
  action: { label: string; href: string } | null;
  suggestions: string[];
};

const URGENT_WORDS = [
  "pain",
  "hurts",
  "hurting",
  "aching",
  "swelling",
  "swollen",
  "fever",
  "bleeding",
  "knocked out",
  "broke",
  "broken tooth",
  "can't swallow",
  "cant swallow",
  "trouble breathing",
  "emergency"
];

const PRICE_WORDS = ["price", "prices", "cost", "how much", "charge", "fee", "quote"];

const match = (q: string, words: string[]): boolean => words.some((w) => q.includes(w));

export const answer = (questionRaw: string): AssistantReply => {
  const q = questionRaw.toLowerCase();

  if (match(q, URGENT_WORDS)) {
    return {
      reply: `That needs a person, not a message. Call us now on ${clinic.urgentPhone}. If there is facial swelling, a fever, or trouble breathing or swallowing, seek emergency care straight away. You can still request the earliest visit below, but the phone is faster.`,
      urgent: true,
      action: { label: `Call ${clinic.urgentPhone}`, href: `tel:${clinic.urgentPhone.replace(/\s/g, "")}` },
      suggestions: []
    };
  }

  if (match(q, ["open", "hours", "when", "today", "tomorrows", "shut"])) {
    return {
      reply: `We are open ${hoursSummary()}. The fastest way in is the Book a visit page; it only shows days we are open.`,
      urgent: false,
      action: { label: "Book a visit", href: "/book" },
      suggestions: ["Where are you?", "I'm in pain"]
    };
  }

  if (match(q, ["where", "address", "located", "location", "parking", "directions", "getting there"])) {
    return {
      reply: `We are at ${clinic.address}. The Your visit page has a directions link and what to expect in your first ten minutes.`,
      urgent: false,
      action: { label: "Directions", href: clinic.directionsUrl },
      suggestions: ["What are your opening hours?", "How do I book?"]
    };
  }

  if (match(q, PRICE_WORDS)) {
    return {
      reply:
        "You get the plan and cost in writing before any treatment starts, so quotes come after an exam rather than over chat. For a routine check-up, the guide price policy is the same for everything we do.",
      urgent: false,
      action: { label: "Book a check-up", href: "/book" },
      suggestions: ["What are your opening hours?", "How do I book?"]
    };
  }

  if (match(q, ["whitening", "veneers", "cosmetic", "smile", "brighter", "shades"])) {
    return {
      reply:
        "Whitening and veneers are both on the treatments page, with how many visits they take and what recovery feels like. The shade preview on the home page shows what a target shade could look like.",
      urgent: false,
      action: { label: "See treatments", href: "/treatments" },
      suggestions: ["How do I book?", "How much does whitening cost?"]
    };
  }

  if (match(q, ["nervous", "scared", "anxious", "fear", "terrified", "worried"])) {
    return {
      reply:
        "Being nervous is common and nothing we judge. The Your visit page walks through the first appointment step by step: you hear the plan first, nothing is done without your say-so, and you can raise your hand to stop at any point.",
      urgent: false,
      action: { label: "See your first visit", href: "/your-visit" },
      suggestions: ["How do I book?", "What are your opening hours?"]
    };
  }

  if (match(q, ["child", "kid", "son", "daughter", "baby", "toddler"])) {
    return {
      reply:
        "Yes, children are welcome. Their first visits are short and friendly, with very little done at once. Book a check-up and clean and make a note that it is for a child.",
      urgent: false,
      action: { label: "Book a visit", href: "/book" },
      suggestions: ["What should I bring?", "Where are you?"]
    };
  }

  const found = treatments.find((t) => q.includes(t.name.toLowerCase().split(" ")[0]));
  if (found) {
    return {
      reply: `${found.name}: ${found.summary} It usually takes ${found.visits} visit${found.visits.startsWith("S") ? "" : "s"} and recovery is: ${found.recovery.toLowerCase()}.`,
      urgent: false,
      action: { label: "Book a visit", href: "/book" },
      suggestions: ["What are your opening hours?", "How do I book?"]
    };
  }

  return {
    reply:
      "I can help with opening hours, where we are, which treatment fits, and starting a booking. For anything clinical, call the studio and speak to the team.",
    urgent: false,
    action: { label: "Book a visit", href: "/book" },
    suggestions: ["What are your opening hours?", "Where are you?", "I'm in pain"]
  };
};
