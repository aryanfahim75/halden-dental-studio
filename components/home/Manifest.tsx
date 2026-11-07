"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function Manifest() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      // Split text into words
      const mt = document.getElementById("mText");
      if (!mt) return;

      if (mt.dataset.split !== "1") {
        const originalText = mt.textContent || "";
        mt.innerHTML = originalText
          .split(" ")
          .map((w) => `<span class="w">${w}</span>`)
          .join(" ");
        mt.dataset.split = "1";
      }

      const words = [...mt.querySelectorAll<HTMLElement>(".w")];

      ScrollTrigger.create({
        trigger: "#manifest",
        start: "top 72%",
        end: "bottom 58%",
        scrub: true,
        onUpdate: (self) => {
          const n = Math.round(self.progress * words.length);
          words.forEach((w, i) => w.classList.toggle("on", i < n));
        },
      });

      if (!reduce) {
        // The manifesto panel settles forward out of the slate story.
        gsap.fromTo(
          "#manifest",
          { scale: 0.92, borderRadius: 56 },
          {
            scale: 1,
            borderRadius: 0,
            ease: "none",
            scrollTrigger: {
              trigger: "#manifest",
              start: "top bottom",
              end: "top 30%",
              scrub: true,
            },
          }
        );

        // Trust items animation
        gsap.from(".trust > div", {
          y: 28,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: {
            trigger: ".trust",
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="solid" id="manifest">
      <div className="wrap">
        <p id="mText">
          We explain everything before we touch anything. You see your scans, your options and
          your costs, in writing, before you decide. Then we take our time.
        </p>
        <div className="trust">
          <div>
            <b></b>
            <h3>Costs in writing</h3>
            <p>Your plan and price before any treatment starts.</p>
          </div>
          <div>
            <b></b>
            <h3>Nervous patients welcome</h3>
            <p>We explain each step, and you can stop at any time.</p>
          </div>
          <div>
            <b></b>
            <h3>Care for all ages</h3>
            <p>Children, adults and older patients, seen by one team.</p>
          </div>
          <div>
            <b></b>
            <h3>Urgent help</h3>
            <p>Call us first when something hurts or breaks.</p>
          </div>
        </div>
      </div>
    </section>
  );
}