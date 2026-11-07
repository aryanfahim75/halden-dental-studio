"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { clinic } from "@/content/clinic";
import { track } from "@/lib/analytics";
import { ButtonLink } from "@/components/ui/Button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/treatments", label: "Treatments" },
  { href: "/doctors", label: "Doctors" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" }
];

export function Header() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  // Don't render on home page (which has its own header)
  if (pathname === "/") return null;

  const closeAndTrack = () => setOpen(false);

  return (
    <header className="site-header" data-open={open || undefined}>
      <div className="site-header__bar">
        <Link href="/" className="brand" aria-label={`${clinic.name}, home`}>
          <span className="brand__name">{clinic.shortName}</span>
          <span className="brand__sub">Dental Studio</span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`site-nav__link${pathname === l.href ? " is-active" : ""}`}
              aria-current={pathname === l.href ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="site-header__end">
          <a
            className="urgent-link"
            href={`tel:${clinic.urgentPhone.replace(/\s/g, "")}`}
            onClick={() => track("phone_tap")}
          >
            Urgent pain? <span className="urgent-link__num">{clinic.urgentPhone}</span>
          </a>
          <ButtonLink href="/book" className="site-header__book">
            Book a visit
          </ButtonLink>
          <button
            ref={menuBtnRef}
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="menu-btn__lines" aria-hidden="true" />
            <span className="vh">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        ref={panelRef}
        className="mobile-menu"
        data-shown={open || undefined}
        hidden={!open}
      >
        <nav aria-label="Mobile" className="mobile-menu__nav">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="mobile-menu__link"
              onClick={closeAndTrack}
              aria-current={pathname === l.href ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
          <a
            href={`tel:${clinic.urgentPhone.replace(/\s/g, "")}`}
            className="mobile-menu__link urgent-link"
            onClick={closeAndTrack}
          >
            Urgent pain? <span className="urgent-link__num">{clinic.urgentPhone}</span>
          </a>
          <ButtonLink href="/book" onClick={closeAndTrack} className="btn--primary" variant="primary-film">
            Book a visit
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}
