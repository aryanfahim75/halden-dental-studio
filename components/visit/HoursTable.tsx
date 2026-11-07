"use client";

import { useEffect, useState } from "react";
import { clinic } from "@/content/clinic";
import { DAY_NAMES } from "@/lib/hours";

export function HoursTable() {
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => {
    setToday(new Date().getDay());
  }, []);

  return (
    <table className="hours hours--visit">
      <caption className="vh">Opening hours</caption>
      <tbody>
        {clinic.hours.map((h) => (
          <tr key={h.day} data-today={today === h.day || undefined}>
            <th scope="row">{DAY_NAMES[h.day]}</th>
            <td>{h.open && h.close ? `${h.open}–${h.close}` : "Closed"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
