"use client";

import { useEffect } from "react";

export function GSAPAnimations() {
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
        // Hero animation
        // Initial state for animation to prevent flash, since we want them to start invisible
        // Actually, we use .from() which automatically sets initial state, 
        // but to avoid flash of unstyled content, we might need a brief hide,
        // or just accept a tiny flash since it's progressive enhancement.
        // For best results with from(), the elements just snap to the from state when JS runs.
        const tl = gsap.timeline();
        
        tl.from(".hero-headline", {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: "power3.out"
        })
        .from(".hero-subline", {
          y: 20,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out"
        }, "-=0.6")
        .from(".hero-cta", {
          y: 10,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out"
        }, "-=0.4");

        // 3-step ScrollTrigger
        gsap.from(".step-card", {
          scrollTrigger: {
            trigger: ".steps-container",
            start: "top 75%",
          },
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out"
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
