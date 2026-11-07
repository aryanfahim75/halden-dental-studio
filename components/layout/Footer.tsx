"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clinic } from "@/content/clinic";
import { DAY_NAMES } from "@/lib/hours";

const pages = [
  { href: "/", label: "Home" },
  { href: "/treatments", label: "Treatments" },
  { href: "/doctors", label: "Doctors" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" }
];

export function Footer() {
  const pathname = usePathname();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div className="site-footer__col site-footer__col--brand">
            <Link href="/" className="brand">
            <span className="brand__name">{clinic.shortName}</span>
            <span className="brand__sub">Dental Studio</span>
          </Link>
          <p className="site-footer__line">{clinic.addressLines.join(", ")}</p>
          <p className="site-footer__line">{clinic.email}</p>
        </div>

        <nav className="site-footer__col" aria-label="Pages">
          <h2 className="site-footer__head">Pages</h2>
          <ul className="site-footer__list">
            {pages.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="site-footer__link">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-footer__col">
          <h2 className="site-footer__head">Hours</h2>
          <table className="hours hours--footer">
            <tbody>
              {clinic.hours.map((h) => (
                <tr key={h.day}>
                  <th scope="row">{DAY_NAMES[h.day]}</th>
                  <td>{h.open && h.close ? `${h.open}–${h.close}` : "Closed"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="site-footer__col">
          <h2 className="site-footer__head">Contact</h2>
          <ul className="site-footer__list">
            <li>
              <a
                className="site-footer__link"
                href={`tel:${clinic.phone.replace(/\s/g, "")}`}
              >
                {clinic.phone}
              </a>
            </li>
            <li>
              <a
                className="site-footer__link urgent-link"
                href={`tel:${clinic.urgentPhone.replace(/\s/g, "")}`}
              >
                Urgent: {clinic.urgentPhone}
              </a>
            </li>
            <li>
              <a className="site-footer__link" href={`mailto:${clinic.email}`}>
                {clinic.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      </div>

      <div className="site-footer__base">
        <p className="site-footer__legal">
          <Link href="/privacy">Privacy</Link>
          <span aria-hidden="true">·</span>
          <Link href="/terms">Terms</Link>
        </p>
        {clinic.isSample ? (
          <p className="site-footer__sample">Sample content. Replace before publishing.</p>
        ) : null}
      </div>
    </footer>
  );
}