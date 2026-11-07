"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// @ts-expect-error - lenis 1.3.x has no types for the ESM entry point
import Lenis from "lenis/dist/lenis.mjs";
import { SHADES, stageState } from "@/lib/three/stageState";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Cleanup = () => void;

export function Story() {
  useEffect(() => {
    // Populate the shade chips once. Re-running the effect (dev StrictMode) keeps them.
    const shadesContainer = document.getElementById("shades");
    if (shadesContainer && !shadesContainer.childElementCount) {
      shadesContainer.innerHTML = SHADES.map(
        (s) => `<span style="--c:${s[1]}"><b></b>${s[0]}</span>`
      ).join("");
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const html = document.documentElement;
    const cleanups: Cleanup[] = [];

    // The intro is only ever shown by JS, so a failure can never leave it covering the page.
    if (reduce) {
      const intro = document.getElementById("intro");
      if (intro) intro.style.display = "none";
      html.classList.remove("is-intro");
    }

    // Smooth scrolling
    let lenis: Lenis | null = null;
    const lenisWindow = window as unknown as { __lenis?: Lenis | null };
    const lenisTick = (time: number) => {
      lenis?.raf(time * 1000);
    };

    if (!reduce) {
      lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(lenisTick);
      gsap.ticker.lagSmoothing(0);
      lenisWindow.__lenis = lenis;
    }

    // ---- text splitting helpers (idempotent so dev StrictMode cannot double-split) ----

    const maskWords = (el: HTMLElement) => {
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
    };

    const splitChars = (el: HTMLElement) => {
      if (el.dataset.chars === "1") {
        return el.querySelectorAll<HTMLElement>(".c");
      }

      const walk = (node: Node) => {
        [...node.childNodes].forEach((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            const frag = document.createDocumentFragment();
            [...(child.textContent || "")].forEach((ch) => {
              if (ch === " ") {
                frag.append(" ");
                return;
              }
              const span = document.createElement("span");
              span.className = "c";
              span.textContent = ch;
              frag.append(span);
            });
            child.replaceWith(frag);
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            walk(child);
          }
        });
      };

      walk(el);
      el.dataset.chars = "1";
      return el.querySelectorAll<HTMLElement>(".c");
    };

    // ---- intro ----

    const runIntro = (chars: NodeListOf<HTMLElement>, webgl: boolean) => {
      const intro = document.getElementById("intro");
      if (!intro) return;

      const name = intro.querySelector<HTMLElement>(".nm > .m > span");
      const rule = intro.querySelector<HTMLElement>(".ln2");
      const line = intro.querySelector<HTMLElement>(".ln2 i");
      const panelA = intro.querySelector<HTMLElement>(".pa");
      const panelB = intro.querySelector<HTMLElement>(".pb");
      if (!name || !rule || !line || !panelA || !panelB) return;

      intro.style.display = "flex";
      lenis?.stop();
      html.classList.add("is-intro");

      // On slow devices a long hydration/compile task can leave the ticker with a
      // multi-second delta, which would skip the whole intro in one frame. Clamp
      // catch-up while it plays, then return to the page's normal ticker settings.
      gsap.ticker.lagSmoothing(500, 33);

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        gsap.ticker.lagSmoothing(0);
        intro.style.display = "none";
        html.classList.remove("is-intro");
        lenis?.start();
        window.requestAnimationFrame(() => ScrollTrigger.refresh());
      };

      // Failsafe: never let a stalled tween trap the page behind the intro.
      const failsafe = window.setTimeout(finish, 4500);
      cleanups.push(() => {
        window.clearTimeout(failsafe);
        finish();
      });

      gsap.set(chars, { yPercent: 115, rotate: 5 });

      gsap
        .timeline({
          onComplete: () => {
            window.clearTimeout(failsafe);
            finish();
          },
        })
        .from(name, { yPercent: 115, duration: 0.7, ease: "expo.out" }, 0)
        .to(line, { scaleX: 1, duration: 0.85, ease: "power2.inOut" }, 0.1)
        .to([name, rule], { opacity: 0, duration: 0.25 }, 0.95)
        .to(panelA, { yPercent: -101, duration: 1.05, ease: "expo.inOut" }, 1.05)
        .to(panelB, { yPercent: 101, duration: 1.05, ease: "expo.inOut" }, 1.05)
        .to(
          chars,
          { yPercent: 0, rotate: 0, duration: 1.15, ease: "expo.out", stagger: 0.022 },
          1.55
        )
        .from(
          ".heroFoot > *",
          { y: 18, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.1 },
          2.1
        );

      if (webgl) {
        gsap.from(stageState, {
          rotY: -3.4,
          camZ: 13,
          duration: 2.5,
          ease: "expo.out",
          delay: 0.95,
        });
      }
    };

    // ---- curtain navigation ----

    const setupCurtain = (): Cleanup => {
      const curtain = document.getElementById("curtain");
      if (!curtain) return () => {};

      curtain.innerHTML = "";
      const columns = window.innerWidth <= 760 ? 4 : 6;
      for (let i = 0; i < columns; i++) {
        const bar = document.createElement("i");
        bar.style.left = `${(i / columns) * 100}%`;
        bar.style.width = `calc(${100 / columns}% + 1px)`;
        curtain.append(bar);
      }
      const bars = [...curtain.children] as HTMLElement[];

      let active: gsap.core.Timeline | null = null;

      const jump = (target: HTMLElement) => {
        const y =
          target.id === "top" ? 0 : target.getBoundingClientRect().top + window.scrollY;
        if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
        else window.scrollTo(0, y);
        ScrollTrigger.update();
      };

      const onClick = (event: MouseEvent) => {
        const anchor = (event.target as HTMLElement | null)?.closest?.(
          'a[href^="#"]'
        ) as HTMLAnchorElement | null;
        if (!anchor) return;

        const hash = anchor.getAttribute("href");
        if (!hash || hash.length < 2) return;

        const target = document.querySelector<HTMLElement>(hash);
        if (!target) return;

        event.preventDefault();

        if (reduce) {
          jump(target);
          return;
        }

        active?.kill();
        curtain.style.display = "block";
        active = gsap
          .timeline({
            onComplete() {
              curtain.style.display = "none";
            },
          })
          .set(bars, { transformOrigin: "bottom", scaleY: 0 })
          .to(bars, { scaleY: 1, duration: 0.55, ease: "expo.inOut", stagger: 0.04 })
          .add(() => jump(target))
          .set(bars, { transformOrigin: "top" })
          .to(bars, { scaleY: 0, duration: 0.6, ease: "expo.inOut", stagger: 0.04 }, "+=0.08");
      };

      document.addEventListener("click", onClick);

      return () => {
        document.removeEventListener("click", onClick);
        active?.kill();
        curtain.style.display = "none";
        curtain.innerHTML = "";
      };
    };

    // ---- magnetic buttons ----

    const setupMagnetic = (): Cleanup => {
      if (reduce) return () => {};
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        return () => {};
      }

      const removers: Cleanup[] = [];

      document.querySelectorAll<HTMLElement>(".pill").forEach((button) => {
        const x = gsap.quickTo(button, "x", { duration: 0.6, ease: "power3" });
        const y = gsap.quickTo(button, "y", { duration: 0.6, ease: "power3" });

        const move = (event: PointerEvent) => {
          const rect = button.getBoundingClientRect();
          x((event.clientX - rect.left - rect.width / 2) * 0.22);
          y((event.clientY - rect.top - rect.height / 2) * 0.3);
        };
        const leave = () => {
          x(0);
          y(0);
        };

        button.addEventListener("pointermove", move);
        button.addEventListener("pointerleave", leave);
        removers.push(() => {
          button.removeEventListener("pointermove", move);
          button.removeEventListener("pointerleave", leave);
        });
      });

      return () => {
        removers.forEach((fn) => fn());
        document.querySelectorAll(".pill").forEach((el) => gsap.killTweensOf(el));
      };
    };

    // ---- motion layer ----

    // Stage3D loads async (dynamic import), so the canvas may not exist yet at
    // hydration. The timeline only tweens the shared stageState object, which
    // the canvas reads once it mounts — harmless if WebGL never loads.
    const webgl = true;

    const ctx = gsap.context(() => {
      const hdr = document.getElementById("hdr");
      const S = stageState;
      const chapters = gsap.utils.toArray<HTMLElement>("#story .ch");

      // 3D story timeline matching the new design
      if (webgl) {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: "#story",
            start: "top bottom",
            endTrigger: "#manifest",
            end: "top bottom",
            scrub: reduce ? true : 1.1,
          },
        });

        const H = { abutY: -13, implY: -16 };

        tl.fromTo(
          S,
          { rotY: 0.5, rotX: 0.42, offX: 1.05, offY: 0.8, camZ: 10.5 },
          { rotY: 1.5, rotX: 0.5, offX: 1.2, offY: 0, camZ: 7.4, duration: 0.7 }, 0.05
        )       /* check-ups */
          .fromTo(
            S,
            { ringY: 1.25 },
            { ringY: 1.25, ringS: 1, duration: 0.01, immediateRender: false },
            0.7
          )
          .to(S, { ringO: 0.95, duration: 0.08 }, 0.72)
          .to(S, { ringY: -0.85, duration: 0.6, ease: "sine.inOut" }, 0.76)
          .to(S, { ringO: 0, duration: 0.1 }, 1.3)
          .to(S, { offX: -1.05, offY: 0, camZ: 5.6, rotY: 3, rotX: 0.95, duration: 0.6 }, 1.13)                                                   /* repair */
          .to(S, { offX: 1.15, offY: -0.1, camZ: 6.4, rotY: 4.2, rotX: 0.45, duration: 0.6 }, 2.13)                                                 /* cosmetic */
          .to(S, { hue: 4, duration: 0.5 }, 2.73)
          .to(S, { hue: 1, duration: 0.4 }, 3.25)
          .to(S, { crownY: 2.3, abutY: 0.75, implY: -0.2, offX: 1.3, offY: -0.25, camZ: 15, rotY: 5.2, rotX: 0.14, duration: 0.6 }, 3.13)                   /* implants */
          .to(S, { tags: 1, axis: 1, duration: 0.2 }, 3.62)
          .to(S, { tags: 0, axis: 0, duration: 0.15 }, 4.2)
          .to(S, { crownY: 0, abutY: H.abutY, implY: H.implY, offX: -1.1, offY: 0.05, camZ: 8.4, rotY: 6.4, rotX: 0.32, tilt: -0.18, duration: 0.6 }, 4.13)  /* family */
          .to(S, { offX: 1.15, offY: 0, camZ: 7, rotY: 7.4, rotX: 0.42, tilt: 0, duration: 0.6 }, 5.13)                                              /* urgent */
          .set(S, { ringY: 0.1, ringS: 0.5 }, 5.7)
          .to(S, { ringO: 0.9, duration: 0.02 }, 5.7)
          .to(S, { ringS: 2.3, ringO: 0, duration: 0.3, ease: "power2.out" }, 5.72)
          .to(S, { crownY: 1.7, abutY: 0.7, implY: 0, offX: 0, offY: 0.7, camZ: 18, rotY: 8.6, rotX: 0.16, duration: 0.4 }, 6.0)                            /* one clinic */
          .to(S, { crownY: 0.93, abutY: 0.33, rotY: 9.4, duration: 0.4 }, 6.42)
          .set(S, { ringY: 0.35, ringS: 0.42 }, 6.85)
          .to(S, { ringO: 1, duration: 0.02 }, 6.85)
          .to(S, { ringS: 2.6, ringO: 0, duration: 0.25, ease: "power2.out" }, 6.88);

        // Leave with the manifesto: one viewport of vertical travel.
        gsap.to(S, {
          exit: 1,
          ease: "none",
          scrollTrigger: {
            trigger: "#manifest",
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });

        if (!reduce) {
          ScrollTrigger.create({
            trigger: "#story",
            start: "top bottom",
            endTrigger: "#manifest",
            end: "top top",
            onUpdate(self) {
              S.velT = Math.max(-1, Math.min(1, self.getVelocity() / 3500));
            },
          });
        }
      }

      // Slate background behind the last chapter.
      gsap.to("#bgPine", {
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: "#story .ch:last-child",
          start: "top 62%",
          end: "top 18%",
          scrub: true,
        },
      });

      // Header is light over the hero/story, dark over the reading sections,
      // then light again over the CTA.
      ScrollTrigger.create({
        start: 0,
        endTrigger: "#manifest",
        end: "top 10%",
        toggleClass: { targets: hdr, className: "light" },
      });

      // Header hides on scroll down, returns on scroll up.
      let last = 0;
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate(self) {
          const y = self.scroll();
          hdr?.classList.toggle("up", y > 200 && y > last);
          last = y;
        },
      });

      // Chapter rail (navigation aid — available with reduced motion too).
      const rail = document.getElementById("rail");
      if (rail) {
        const ticks = [...rail.querySelectorAll("i")];
        const setRail = (active: boolean) => {
          if (reduce) rail.style.opacity = active ? "1" : "0";
          else gsap.to(rail, { opacity: active ? 1 : 0, duration: 0.4 });
        };

        ScrollTrigger.create({
          trigger: "#story",
          start: "top 60%",
          end: "bottom 60%",
          onToggle: (self) => setRail(self.isActive),
          onUpdate: (self) => {
            const n = Math.min(6, Math.floor(self.progress * 7));
            ticks.forEach((tick, i) => tick.classList.toggle("on", i === n));
          },
        });
      }

      // ---- motion-only reveals ----

      if (!reduce) {
        const heroTitle = document.querySelector<HTMLElement>(".hero h1");
        if (heroTitle) runIntro(splitChars(heroTitle), webgl);

        gsap.to(".heroFoot", {
          opacity: 0,
          y: -30,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "35% top",
            scrub: true,
          },
        });

        gsap.to(".hero h1", {
          yPercent: -16,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        // Story chapter text.
        document.querySelectorAll<HTMLElement>("#story .txt").forEach((txt) => {
          const heading = txt.querySelector<HTMLElement>("h2");
          if (!heading) return;

          const label = txt.querySelector<HTMLElement>(".label");
          const paragraph = txt.querySelector<HTMLElement>("p");
          const swatches = txt.querySelectorAll<HTMLElement>(".shades span");
          const rule = txt.querySelector<HTMLElement>(".rule");
          const words = maskWords(heading);

          gsap
            .timeline({
              scrollTrigger: {
                trigger: txt,
                start: "top 78%",
                toggleActions: "play none none reverse",
              },
            })
            .from(rule ? [rule] : [], { scaleX: 0, duration: 0.7, ease: "expo.out" }, 0)
            .from(
              label ? [label] : [],
              { y: 10, opacity: 0, duration: 0.6, ease: "power3.out" },
              0.08
            )
            .from(
              words,
              { yPercent: 115, rotate: 3, duration: 1, ease: "expo.out", stagger: 0.055 },
              0.1
            )
            .from(
              paragraph ? [paragraph] : [],
              { y: 18, opacity: 0, duration: 0.8, ease: "power3.out" },
              0.4
            )
            .from(
              swatches,
              { y: 26, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.05 },
              0.5
            );
        });

        // Ghost words behind the 3D canvas - 4 ghosts now.
        (
          [
            ["#g1", chapters[1]],
            ["#g2", chapters[2]],
            ["#g3", chapters[3]],
            ["#g4", chapters[4]],
          ] as const
        ).forEach(([selector, chapter], index) => {
          if (!chapter) return;
          const ghost = document.querySelector<HTMLElement>(selector);
          if (!ghost) return;
          const direction = index % 2 ? 1 : -1;

          gsap
            .timeline({
              scrollTrigger: {
                trigger: chapter,
                start: "top 85%",
                end: "bottom 15%",
                scrub: 1,
              },
            })
            .fromTo(
              ghost,
              { xPercent: 14 * direction, opacity: 0 },
              { xPercent: 3 * direction, opacity: 0.06, ease: "none", duration: 0.3 }
            )
            .to(ghost, { xPercent: -3 * direction, ease: "none", duration: 0.4 })
            .to(ghost, {
              xPercent: -14 * direction,
              opacity: 0,
              ease: "none",
              duration: 0.3,
            });
        });
      }
    });

    // Keep a scroll-driven treatment card track in reduced motion too, but never
    // smooth it. The animation itself lives in the Treatments component.
    const curtainCleanup = setupCurtain();
    const magneticCleanup = setupMagnetic();

    // Recalculate once fonts and generated images have settled.
    const refresh = () => ScrollTrigger.refresh();
    const refreshTimer = window.setTimeout(refresh, 400);
    window.addEventListener("load", refresh);

    return () => {
      curtainCleanup();
      magneticCleanup();
      ctx.revert();
      window.clearTimeout(refreshTimer);
      window.removeEventListener("load", refresh);
      html.classList.remove("is-intro");
      const intro = document.getElementById("intro");
      if (intro) intro.style.display = "none";
      const curtain = document.getElementById("curtain");
      if (curtain) {
        curtain.style.display = "none";
        curtain.innerHTML = "";
      }
      cleanups.forEach((fn) => fn());
      gsap.ticker.remove(lenisTick);
      lenis?.destroy();
      lenisWindow.__lenis = null;
    };
  }, []);

  return (
    <section id="story">
      <div className="ch">
        <div className="txt">
          <i className="rule" aria-hidden="true" />
          <span className="label">Check-ups and cleaning</span>
          <h2>
            Small checks prevent <em>big</em> problems.
          </h2>
          <p>Regular exams, digital scans and a thorough clean, so we spot issues early.</p>
        </div>
      </div>
      <div className="ch end">
        <div className="txt">
          <i className="rule" aria-hidden="true" />
          <span className="label">Fillings and repair</span>
          <h2>
            Repairs that <em>blend</em> in.
          </h2>
          <p>Tooth-coloured fillings and crowns restore strength and shape without looking like dental work.</p>
        </div>
      </div>
      <div className="ch">
        <div className="txt">
          <i className="rule" aria-hidden="true" />
          <span className="label">Whitening and aligners</span>
          <h2>
            A brighter, straighter <em>smile.</em>
          </h2>
          <p>Professional whitening and clear aligners, planned around your teeth and your goals.</p>
          <div className="shades" id="shades" />
        </div>
      </div>
      <div className="ch">
        <div className="txt">
          <i className="rule" aria-hidden="true" />
          <span className="label">Implants</span>
          <h2>
            Replace a tooth, keep your <em>confidence.</em>
          </h2>
          <p>An implant, abutment and crown work together as one strong, natural-looking tooth.</p>
        </div>
      </div>
      <div className="ch end">
        <div className="txt">
          <i className="rule" aria-hidden="true" />
          <span className="label">Children and family</span>
          <h2>
            Gentle care from the <em>first</em> tooth.
          </h2>
          <p>Calm, friendly visits for children, parents and grandparents, all in one place.</p>
        </div>
      </div>
      <div className="ch">
        <div className="txt">
          <i className="rule" aria-hidden="true" />
          <span className="label">Urgent care</span>
          <h2>
            In pain? Call us <em>today.</em>
          </h2>
          <p>Toothache, a broken tooth or swelling? Call first and we'll tell you what to do next.</p>
          <a className="urgent" href="#cta">+00 000 000 000</a>
        </div>
      </div>
      <div className="ch mid onPine last">
        <div className="txt">
          <i className="rule" aria-hidden="true" />
          <span className="label">Dental Studio</span>
          <h2>
            Every smile. One <em>clinic.</em>
          </h2>
        </div>
      </div>
    </section>
  );
}