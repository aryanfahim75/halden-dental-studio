import type { Metadata } from "next";
import { clinic } from "@/content/clinic";

export const metadata: Metadata = {
  title: `Privacy | ${clinic.name}`,
  description: "What the studio collects, why, and how long it is kept."
};

export default function PrivacyPage() {
  return (
    <div className="section">
      <div className="container container--narrow prose">
        <h1 className="h1 h1--small">Privacy, in plain words.</h1>
        <p className="lead">
          This is the standing promise of the studio. It is marked <strong>sample content</strong>:
          replace it with the clinic&apos;s own reviewed policy before publishing.
        </p>

        <h2>What we collect</h2>
        <p>
          A booking request contains the reason for your visit, the day and time you prefer, your
          name, phone number, an optional email, and an optional short note. We collect nothing else
          through this website.
        </p>

        <h2>Why we need it</h2>
        <p>
          Only to schedule your visit and contact you about it. Notes can describe a health
          problem, so they are handled as sensitive information: stored encrypted, visible only to
          reception staff, and deleted after{" "}
          <span className="sample-slot">retention period</span> unless you ask for longer storage.
        </p>

        <h2>What we never do</h2>
        <p>
          We never use your details for marketing without asking, never share them outside the
          clinical team, and never sell them.
        </p>

        <h2>Your rights</h2>
        <p>
          You can ask what we hold about you, ask for a correction, or ask us to delete it. Email{" "}
          {clinic.email} and we act within the response period.
        </p>
      </div>
    </div>
  );
}
