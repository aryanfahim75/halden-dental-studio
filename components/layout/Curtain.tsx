"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";

if (typeof window !== "undefined") {
  gsap.registerPlugin();
}

export function Curtain() {
  const router = useRouter();

  useEffect(() => {
    const curtain = document.getElementById("curtain");
    if (!curtain) return;

    let active: gsap.core.Timeline | null = null;
    let isNavigating = false;

    const jump = (target: HTMLElement) => {
      const y =
        target.id === "top" ? 0 : target.getBoundingClientRect().top + window.scrollY;
      const lenis = (window as unknown as { __lenis?: any }).__lenis;
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
    };

    const navigateWithCurtain = (url: string) => {
      if (isNavigating) return;
      isNavigating = true;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        router.push(url);
        isNavigating = false;
        return;
      }

      active?.kill();
      curtain.style.display = "block";

      const columns = window.innerWidth <= 760 ? 4 : 6;
      curtain.innerHTML = "";
      for (let i = 0; i < columns; i++) {
        const bar = document.createElement("i");
        bar.style.left = `${(i / columns) * 100}%`;
        bar.style.width = `calc(${100 / columns}% + 1px)`;
        curtain.append(bar);
      }
      const bars = [...curtain.children] as HTMLElement[];

      active = gsap
        .timeline({
          onComplete() {
            router.push(url);
            curtain.style.display = "none";
            isNavigating = false;
          },
          onInterrupt: () => { isNavigating = false; },
          onKill: () => { isNavigating = false; },
        })
        .set(bars, { transformOrigin: "bottom", scaleY: 0 })
        .to(bars, { scaleY: 1, duration: 0.35, ease: "expo.inOut", stagger: 0.02 })
        .add(() => {
          // Navigation happens in onComplete
        })
        .set(bars, { transformOrigin: "top" })
        .to(bars, { scaleY: 0, duration: 0.35, ease: "expo.inOut", stagger: 0.02 }, "+=0.04");
    };

    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (anchor) {
        const hash = anchor.getAttribute("href");
        if (!hash || hash.length < 2) return;

        const target = document.querySelector<HTMLElement>(hash);
        if (!target) return;

        event.preventDefault();

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce) {
          jump(target);
          return;
        }

        active?.kill();
        curtain.style.display = "block";

        const columns = window.innerWidth <= 760 ? 4 : 6;
        curtain.innerHTML = "";
        for (let i = 0; i < columns; i++) {
          const bar = document.createElement("i");
          bar.style.left = `${(i / columns) * 100}%`;
          bar.style.width = `calc(${100 / columns}% + 1px)`;
          curtain.append(bar);
        }
        const bars = [...curtain.children] as HTMLElement[];

        active = gsap
          .timeline({
            onComplete() {
              curtain.style.display = "none";
              isNavigating = false;
            },
            onInterrupt: () => { isNavigating = false; },
            onKill: () => { isNavigating = false; },
          })
          .set(bars, { transformOrigin: "bottom", scaleY: 0 })
          .to(bars, { scaleY: 1, duration: 0.35, ease: "expo.inOut", stagger: 0.02 })
          .add(() => jump(target))
          .set(bars, { transformOrigin: "top" })
          .to(bars, { scaleY: 0, duration: 0.35, ease: "expo.inOut", stagger: 0.02 }, "+=0.04");
        return;
      }

      // Handle page navigation links (non-anchor)
      const pageAnchor = (event.target as HTMLElement | null)?.closest?.(
        'a[href^="/"]:not([href^="#"])'
      ) as HTMLAnchorElement | null;

      if (pageAnchor) {
        const href = pageAnchor.getAttribute("href");
        if (!href) return;

        // Don't intercept external links, book links, or same-page links
        if (
          href.startsWith("http") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:") ||
          href === "/book" ||
          window.location.pathname === href
        ) {
          return;
        }

        event.preventDefault();
        navigateWithCurtain(href);
      }
    };

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      active?.kill();
      curtain.style.display = "none";
      curtain.innerHTML = "";
    };
  }, [router]);

  return <div id="curtain" aria-hidden="true" />;
}