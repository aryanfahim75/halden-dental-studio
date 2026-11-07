import type { Metadata } from "next";
import { clinic } from "@/content/clinic";

export const metadata: Metadata = {
  title: `Terms | ${clinic.name}`
};

export default function TermsPage() {
  return (
    <div className="section">
      <div className="container container--narrow prose">
        <h1 className="h1 h1--small">Terms of use.</h1>
        <p className="lead">
          Sample content. The clinic replaces this page with its reviewed terms before launch.
        </p>
        <h2>Booking requests</h2>
        <p>
          A request sent through this website reserves nothing by itself. The front desk confirms
          the day and time, and mentions anything that changes.
        </p>
        <h2>Cancellation</h2>
        <p>
          <span className="sample-slot">cancellation policy</span>
        </p>
        <h2>Not medical advice</h2>
        <p>
          Nothing on this website is a diagnosis or a treatment plan. Assessment happens in the
          chair, with you present.
        </p>
      </div>
    </div>
  );
}
