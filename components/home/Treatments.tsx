"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function Treatments() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const track = document.getElementById("track");
      if (!track) return;

      // Horizontal track. In reduced motion it still follows scroll, without smoothing,
      // so every card remains reachable and the page content stays complete.
      const trackTween = gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: "#treat",
          start: "top top",
          end: "bottom bottom",
          scrub: reduce ? true : 0.8,
          invalidateOnRefresh: true,
        },
      });

      const cards = gsap.utils.toArray<HTMLElement>(".card");
      const count = document.getElementById("tCount");
      const bar = document.getElementById("tBar");

      if (!reduce) {
        gsap.from(".tHead h2", {
          yPercent: 60,
          opacity: 0,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: {
            trigger: "#treat",
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        });

        gsap.from(cards.slice(0, 3), {
          y: 90,
          rotate: 1.6,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.09,
          scrollTrigger: {
            trigger: "#treat",
            start: "top 62%",
            toggleActions: "play none none reverse",
          },
        });

        // Images drift inside the cards as the horizontal track moves.
        cards.forEach((card) => {
          const image = card.querySelector<HTMLElement>("img");
          if (!image) return;
          gsap.fromTo(
            image,
            { xPercent: -7, scale: 1.16 },
            {
              xPercent: 7,
              scale: 1.16,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                containerAnimation: trackTween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            }
          );
        });
      }

      ScrollTrigger.create({
        trigger: "#treat",
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          if (bar) bar.style.transform = `scaleX(${self.progress})`;
          if (count) {
            count.textContent = `${Math.min(5, 1 + Math.floor(self.progress * 5))} / 5`;
          }
          if (!reduce) {
            gsap.to(cards, {
              skewX: Math.max(-2.4, Math.min(2.4, self.getVelocity() / -900)),
              duration: 0.5,
              overwrite: "auto",
            });
          }
        },
      });
    });

    return () => ctx.revert();
  }, []);

  const cardStyle = (color: string) => ({ "--t": color } as React.CSSProperties);

  return (
    <section id="treat" className="solid">
      <div className="tSticky">
        <div className="tHead">
          <h2>What we do</h2>
          <span id="tCount">1 / 5</span>
        </div>
        <div className="track" id="track">
          <article className="card" style={cardStyle("#D8E4E1")}>
            <img id="s1" alt="Top view of a tooth showing its grooves" />
            <div>
              <h3>Check-ups and cleaning</h3>
              <p>Exams, scans and professional cleaning that keep problems small.</p>
            </div>
          </article>
          <article className="card dark" style={cardStyle("#0E4F55")}>
            <img id="s2" alt="Ceramic crown on deep teal" />
            <div>
              <h3>Fillings and crowns</h3>
              <p>Tooth-coloured repairs for decay, cracks and worn teeth.</p>
            </div>
          </article>
          <article className="card" style={cardStyle("#EFE6DA")}>
            <img id="s3" alt="Bright ceramic tooth lit from above" />
            <div>
              <h3>Whitening and aligners</h3>
              <p>A brighter shade and straighter teeth, planned with you.</p>
            </div>
          </article>
          <article className="card dark" style={cardStyle("#145F64")}>
            <img id="s4" alt="Close view of a titanium implant thread" />
            <div>
              <h3>Implants</h3>
              <p>A long-term way to replace a missing tooth.</p>
            </div>
          </article>
          <article className="card" style={cardStyle("#E6E2DA")}>
            <img id="s5" alt="Small tooth tilted playfully" />
            <div>
              <h3>Children's dentistry</h3>
              <p>Friendly first visits and gentle care as they grow.</p>
            </div>
          </article>
        </div>
        <div className="bar">
          <i id="tBar" />
        </div>
      </div>
    </section>
  );
}