"use client";

import { useEffect, useRef } from "react";

export function GSAPAnimations() {
  const container = useRef(null);

  useEffect(() => {
    let mm: any;

    const loadGSAP = async () => {
      const gsapModule = await import("gsap");
      const stModule = await import("gsap/ScrollTrigger");
      
      const gsap = gsapModule.default;
      const ScrollTrigger = stModule.default;
      gsap.registerPlugin(ScrollTrigger);

      mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // --- HERO SECTION ---
        const heroTl = gsap.timeline();
        
        // Split text effect manually by wrapping words in spans or just animating whole lines
        heroTl.fromTo(".hero-headline", 
          { y: 60, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power4.out" }
        )
        .fromTo(".hero-subline", 
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, 
          "-=0.9"
        )
        .fromTo(".hero-cta", 
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "back.out(1.7)" }, 
          "-=0.7"
        )
        .fromTo(".hero-ambient-glow",
          { opacity: 0, scale: 0.5 },
          { opacity: 0.2, scale: 1, duration: 2, ease: "power2.out" },
          0
        );

        // --- FLOATING / MAGNETIC CTA ---
        const ctas = document.querySelectorAll('.hero-cta');
        ctas.forEach(cta => {
          cta.addEventListener('mousemove', (e: any) => {
            const rect = cta.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(cta, { x: x * 0.2, y: y * 0.2, duration: 0.3, ease: "power2.out" });
          });
          cta.addEventListener('mouseleave', () => {
            gsap.to(cta, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
          });
        });

        // --- SCROLL: HOW MATCHING WORKS ---
        gsap.fromTo(".step-card", 
          { y: 80, opacity: 0, rotateY: 15 },
          {
            y: 0, 
            opacity: 1, 
            rotateY: 0,
            duration: 1,
            stagger: 0.25,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".steps-container",
              start: "top 80%",
            }
          }
        );

        // --- SCROLL: FEATURE PARALLAX ---
        const featureRows = document.querySelectorAll(".feature-row");
        featureRows.forEach((row, i) => {
          const image = row.querySelector(".feature-image");
          const text = row.querySelector(".feature-text");

          // Text slides in
          gsap.fromTo(text,
            { x: i % 2 === 0 ? -50 : 50, opacity: 0 },
            {
              x: 0, opacity: 1, duration: 1, ease: "power3.out",
              scrollTrigger: {
                trigger: row,
                start: "top 75%",
              }
            }
          );

          // Image scales and parallax
          gsap.fromTo(image,
            { scale: 0.9, opacity: 0, y: 30 },
            {
              scale: 1, opacity: 1, y: 0, duration: 1.2, ease: "power3.out",
              scrollTrigger: {
                trigger: row,
                start: "top 85%",
              }
            }
          );
          
          // Subtle scrub parallax for the image
          gsap.to(image, {
            y: -40,
            ease: "none",
            scrollTrigger: {
              trigger: row,
              start: "top bottom",
              end: "bottom top",
              scrub: true
            }
          });
        });
      });
    };

    loadGSAP();

    return () => {
      if (mm) mm.revert();
    };
  }, []);

  return null;
}
