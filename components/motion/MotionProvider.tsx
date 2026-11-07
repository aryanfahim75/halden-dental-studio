"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function MotionProvider() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray<HTMLElement>("[data-rise]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 18 },
          {
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            immediateRender: false,
            scrollTrigger: { trigger: el, start: "top 88%", once: true }
          }
        );
      });

      const heroBits = gsap.utils.toArray<HTMLElement>("[data-hero-rise]");
      if (heroBits.length) {
        gsap.fromTo(
          heroBits,
          { y: 24 },
          {
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.08,
            delay: 0.2,
            immediateRender: false
          }
        );
      }
    });

    return () => mm.revert();
  }, []);

  return null;
}
