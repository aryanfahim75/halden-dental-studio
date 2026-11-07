"use client";

import { useEffect, useState } from "react";
import { clinic } from "@/content/clinic";
import { DAY_NAMES } from "@/lib/hours";

/** Opening hours, Monday first, with today highlighted once the browser knows the day. */
export function ContactHours() {
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => setToday(new Date().getDay()), []);
  const ordered = [...clinic.hours].sort((a, b) => ((a.day + 6) % 7) - ((b.day + 6) % 7));

  return (
    <table className="pg-hours">
      <caption className="vh">Opening hours</caption>
      <tbody>
        {ordered.map((h) => (
          <tr key={h.day} data-today={today === h.day || undefined}>
            <th scope="row">{DAY_NAMES[h.day]}</th>
            <td>{h.open && h.close ? `${h.open} to ${h.close}` : "Closed"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
