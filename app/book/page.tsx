import type { Metadata } from "next";
import { clinic } from "@/content/clinic";
import { isToothId } from "@/content/teeth";
import { BookingForm } from "@/components/booking/BookingForm";
import { HoursTable } from "@/components/visit/HoursTable";
import { TelLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: `Book a Dental Appointment | ${clinic.name}`,
  description: "Request a visit in four short steps. The team confirms your time."
};

export default async function BookPage({
  searchParams
}: {
  searchParams: Promise<{ tooth?: string }>;
}) {
  const params = await searchParams;
  const tooth = params.tooth && isToothId(params.tooth) ? params.tooth : "";

  return (
    <div className="section">
      <div className="container">
        <h1 className="h1 h1--small">Book a visit.</h1>
        <p className="lead">
          Four short steps. A slot only becomes real once the team confirms it.
        </p>
        <div className="booking-grid">
          <BookingForm initialToothId={tooth} />
          <aside className="booking__side" aria-label="Studio hours and urgent care">
            <div className="booking__side-card">
              <p className="label">Opening hours</p>
              <HoursTable />
            </div>
            <div className="booking__side-card">
              <p className="label">In pain now?</p>
              <p className="booking__side-note">
                Call{" "}
                <TelLink number={clinic.urgentPhone} className="urgent-link" event="phone_tap">
                  {clinic.urgentPhone}
                </TelLink>{" "}
                , we fit you in between booked visits. Use 999 for breathing trouble,
                uncontrolled bleeding, fever with swelling.
              </p>
              <TelLink number={clinic.phone} className="visit-side__link urgent-link--block" event="phone_tap">
                {clinic.phone}; replies in a day
              </TelLink>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
