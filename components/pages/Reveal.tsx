"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

/**
 * Animates [data-reveal] elements as they enter the viewport.
 * Elements stay fully visible until they are about to animate, so content
 * never gets stuck hidden if a trigger misfires or JavaScript is slow.
 */
export function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    let queue: HTMLElement[] = [];
    let raf = 0;

    const flush = () => {
      raf = 0;
      gsap.fromTo(
        queue,
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: 0.08, clearProps: "transform,opacity" }
      );
      queue = [];
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          queue.push(entry.target as HTMLElement);
        });
        if (queue.length && !raf) raf = requestAnimationFrame(flush);
      },
      { rootMargin: "0px 0px -8% 0px" }
    );

    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}
