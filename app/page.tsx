"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
// Three.js borrows: keeps ~600KB out of the first paint bundle; canvas mounts client-side.
const Stage3D = dynamic(() => import("@/components/arch/Stage3D").then((m) => m.Stage3D), { ssr: false });
import { Story } from "@/components/home/Story";
import { Manifest } from "@/components/home/Manifest";
import { Treatments } from "@/components/home/Treatments";
import { Visit } from "@/components/home/Visit";
import { Team } from "@/components/home/Team";
import { CTA } from "@/components/home/CTA";

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <div id="bg" className="bg-layer" aria-hidden="true" />
      <div id="bgPine" className="bg-layer bg-pine" aria-hidden="true" />
      <div className="ghost" id="g1" aria-hidden="true">
        Repair
      </div>
      <div className="ghost" id="g2" aria-hidden="true">
        Shade
      </div>
      <div className="ghost" id="g3" aria-hidden="true">
        Implant
      </div>
      <div className="ghost" id="g4" aria-hidden="true">
        Family
      </div>
      <Stage3D id="stage" />

      <div id="intro" aria-hidden="true">
        <div className="pa" />
        <div className="pb" />
        <div className="nm">
          <span className="m">
            <span>Dental</span>
          </span>
        </div>
        <div className="ln2">
          <i />
        </div>
      </div>
      <div id="curtain" aria-hidden="true" />
      <div className="rail light" id="rail" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <header id="hdr" className="halden-header light" data-open={mobileOpen || undefined}>
        <a className="halden-brand" href="#top">
          Dental
        </a>
        <nav aria-label="Main" className="halden-nav">
          <a href="#top">Home</a>
          <a href="/treatments">Treatments</a>
          <a href="/doctors">Doctors</a>
          <a href="/gallery">Gallery</a>
          <a href="#cta">Contact</a>
        </nav>
        <Link className="pill" href="#cta">
          <span className="roll" data-t="Book a consultation">
            Book a consultation
          </span>
        </Link>
        <button
          type="button"
          className="menu-btn"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span className="menu-btn__lines" aria-hidden="true" />
          <span className="vh">{mobileOpen ? "Close menu" : "Open menu"}</span>
        </button>
        <div
          id="mobile-menu"
          className="mobile-menu"
          data-shown={mobileOpen || undefined}
          hidden={!mobileOpen}
        >
          <nav aria-label="Mobile" className="mobile-menu__nav">
            <a href="#top" className="mobile-menu__link" onClick={() => setMobileOpen(false)}>Home</a>
            <a href="/treatments" className="mobile-menu__link" onClick={() => setMobileOpen(false)}>Treatments</a>
            <a href="/doctors" className="mobile-menu__link" onClick={() => setMobileOpen(false)}>Doctors</a>
            <a href="/gallery" className="mobile-menu__link" onClick={() => setMobileOpen(false)}>Gallery</a>
            <a href="#cta" className="mobile-menu__link" onClick={() => setMobileOpen(false)}>Contact</a>
            <a className="mobile-menu__link btn btn--primary-film btn--default" href="/book" onClick={() => setMobileOpen(false)}>
              Book a visit
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <h1 id="hero-title" aria-label="Care for every smile">
            <span className="ln">Care for</span>
            <span className="ln">
              <em>every</em> smile
            </span>
          </h1>
          <div className="heroFoot">
            <p>Complete dental care for the whole family, in one calm clinic.</p>
            <ul className="svc" aria-label="Services">
              <li><Link href="#treat">Check-ups</Link></li>
              <li><Link href="#treat">Fillings</Link></li>
              <li><Link href="#treat">Whitening</Link></li>
              <li><Link href="#treat">Aligners</Link></li>
              <li><Link href="#treat">Implants</Link></li>
              <li><Link href="#treat">Children</Link></li>
            </ul>
          </div>
        </section>

        <Story />
        <Manifest />
        <Treatments />
        <Visit />
        <Team />
        <CTA />
      </main>

      <div className="tag" id="tagA" aria-hidden="true">
        <span>
          <b>Ceramic crown</b>
          <small>Enamel-like finish</small>
        </span>
      </div>
      <div className="tag" id="tagB" aria-hidden="true">
        <span>
          <b>Abutment</b>
          <small>Connects crown to implant</small>
        </span>
      </div>
      <div className="tag" id="tagC" aria-hidden="true">
        <span>
          <b>Titanium implant</b>
          <small>Anchored in the jaw</small>
        </span>
      </div>
    </>
  );
}