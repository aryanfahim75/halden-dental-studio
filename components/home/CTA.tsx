"use client";

import { useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { clinic } from "@/content/clinic";
import { DAY_NAMES } from "@/lib/hours";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function maskWords(el: HTMLElement) {
  if (el.dataset.masked === "1") {
    return el.querySelectorAll<HTMLElement>(".m > span");
  }

  const walk = (node: Node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent || "";
        const frag = document.createDocumentFragment();
        text.split(/(\s+)/).forEach((token) => {
          if (!token) return;
          if (/^\s+$/.test(token)) {
            frag.append(" ");
            return;
          }
          const outer = document.createElement("span");
          outer.className = "m";
          const inner = document.createElement("span");
          inner.textContent = token;
          outer.append(inner);
          frag.append(outer);
        });
        child.replaceWith(frag);
      } else if (
        child.nodeType === Node.ELEMENT_NODE &&
        (child as Element).tagName === "EM"
      ) {
        walk(child);
      }
    });
  };

  walk(el);
  el.dataset.masked = "1";
  return el.querySelectorAll<HTMLElement>(".m > span");
}

export function CTA() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduce) return;

      const heading = document.querySelector<HTMLElement>("#cta h2");
      if (!heading) return;

      // The closing panel opens to full bleed as it arrives.
      gsap.fromTo(
        "#cta",
        { clipPath: "inset(9% 5% 0% 5% round 40px 40px 0px 0px)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 0px 0px 0px 0px)",
          ease: "none",
          scrollTrigger: {
            trigger: "#cta",
            start: "top bottom",
            end: "top 25%",
            scrub: true,
          },
        }
      );

      const words = maskWords(heading);

      gsap
        .timeline({
          scrollTrigger: {
            trigger: heading,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        })
        .from(words, {
          yPercent: 115,
          rotate: 3,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.07,
        })
        .from(
          "#cta .pill",
          { y: 24, opacity: 0, duration: 0.8, ease: "power3.out" },
          0.35
        )
        .from(
          ".foot > div",
          { y: 24, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.09 },
          0.45
        );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section id="cta" className="solid" style={{ background: "var(--pine)" }}>
      <div className="wrap">
        <h2>Start with a conversation.</h2>
        <Link href="/book" className="pill" style={{ minHeight: "54px", padding: "0 30px" }}>
          <span className="roll" data-t="Book a consultation">
            Book a consultation
          </span>{" "}
          <span className="arr" aria-hidden="true">
            &#8594;
          </span>
        </Link>
        <div className="foot">
          <div>
            <b>{clinic.name}</b>
            {clinic.addressLines.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </div>
          <div>
            <b>Hours</b>
            {clinic.hours
              .filter((h) => h.open)
              .map((h) => (
                <span key={h.day}>
                  {DAY_NAMES[h.day]} {h.open}&ndash;{h.close}
                  <br />
                </span>
              ))}
          </div>
          <div>
            <b>Contact</b>
            <a href={`tel:${clinic.phone.replace(/\s/g, "")}`}>{clinic.phone}</a>
            <br />
            <a href={`mailto:${clinic.email}`}>{clinic.email}</a>
          </div>
        </div>
        <p className="sample">
          Design preview. {clinic.shortName} is a fictional clinic with sample details.
        </p>
      </div>
    </section>
  );
}
