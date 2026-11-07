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

export function Visit() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const heading = document.querySelector<HTMLElement>(".vLeft h2");
      const paragraph = document.querySelector<HTMLElement>(".vLeft p");
      const steps = gsap.utils.toArray<HTMLElement>(".step");

      if (reduce) return;

      if (heading) {
        const words = maskWords(heading);
        gsap.from(words, {
          yPercent: 115,
          rotate: 3,
          duration: 1,
          ease: "expo.out",
          stagger: 0.05,
          scrollTrigger: {
            trigger: heading,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        });
      }

      if (paragraph) {
        gsap.from(paragraph, {
          y: 18,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: heading || paragraph,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        });
      }

      steps.forEach((step, index) => {
        gsap.from(step.querySelectorAll(".n, h3, p"), {
          y: 22,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.07,
          scrollTrigger: {
            trigger: step,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });

        if (steps[index + 1]) {
          gsap.to(step, {
            scale: 0.93,
            opacity: 0.5,
            ease: "none",
            scrollTrigger: {
              trigger: steps[index + 1],
              start: "top 82%",
              end: "top 22%",
              scrub: true,
            },
          });
        }
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="solid" id="visit">
      <div className="wrap vGrid">
        <div className="vLeft">
          <h2>
            Your first visit, without the <em>dread.</em>
          </h2>
          <p>Most new patients tell us the hardest part is walking in. So we made that part easy.</p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="n">one</span>
            <div>
              <h3>Sit down and talk</h3>
              <p>No chair yet. Tell us what's going on and what you'd like to change.</p>
            </div>
          </div>
          <div className="step">
            <span className="n">two</span>
            <div>
              <h3>See what we see</h3>
              <p>Scans and photos appear on screen, explained in plain language.</p>
            </div>
          </div>
          <div className="step">
            <span className="n">three</span>
            <div>
              <h3>Choose your plan</h3>
              <p>You get your options and costs in writing. There's no pressure to decide today.</p>
            </div>
          </div>
          <div className="step">
            <span className="n">four</span>
            <div>
              <h3>Stop any time</h3>
              <p>Raise your hand during treatment and we pause. You stay in control.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
