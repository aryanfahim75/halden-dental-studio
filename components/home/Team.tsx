"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

export function Team() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduce) return;

      // Team heading animation
      const th = document.querySelector<HTMLElement>(".teamHead h2");
      if (th) {
        const words = maskWords(th);
        gsap.from(words, {
          yPercent: 115,
          rotate: 3,
          duration: 1,
          ease: "expo.out",
          stagger: 0.05,
          scrollTrigger: {
            trigger: th,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // Team cards animation
      gsap.utils.toArray<HTMLElement>(".doc").forEach((d, i) => {
        gsap.from(d, {
          y: 70,
          opacity: 0,
          duration: 1.1,
          ease: "expo.out",
          delay: i * 0.08,
          scrollTrigger: {
            trigger: ".docs",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });

        // Portrait scale animation
        const portraitSpan = d.querySelector<HTMLElement>(".ph span");
        if (portraitSpan) {
          gsap.fromTo(
            portraitSpan,
            { yPercent: 18, scale: 1.08 },
            {
              yPercent: -18,
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: d,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        }
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="solid" id="team">
      <div className="wrap">
        <div className="teamHead">
          <h2>
            The people looking <em>after you.</em>
          </h2>
          <p>One team for check-ups, repairs, cosmetic care, implants and children.</p>
        </div>
        <div className="docs">
          <article className="doc">
            <div className="ph">
              <small>Sample profile</small>
              <span>A</span>
            </div>
            <h3>Principal dentist</h3>
            <p>General and restorative dentistry</p>
          </article>
          <article className="doc">
            <div className="ph">
              <small>Sample profile</small>
              <span>R</span>
            </div>
            <h3>Family dentist</h3>
            <p>Children's and preventive care</p>
          </article>
          <article className="doc">
            <div className="ph">
              <small>Sample profile</small>
              <span>S</span>
            </div>
            <h3>Cosmetic dentist</h3>
            <p>Whitening, aligners and implants</p>
          </article>
        </div>
      </div>
    </section>
  );
}