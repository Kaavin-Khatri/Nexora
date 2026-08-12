"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { getAccessToken } from "@/lib/jobs";
import { toast } from "sonner";
import { animated, useSpring } from "@react-spring/web";
import { animate, random } from "animejs";

type Particle = {
  x: number;
  y: number;
  radius: number;
  color: string;
  tx: number;
  ty: number;
};

export function ApplyButton({
  jobId,
  initialApplied,
}: {
  jobId: string;
  initialApplied: boolean;
}) {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(initialApplied);
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Elastic button physics
  const [{ scale }, apiSpring] = useSpring(() => ({
    scale: 1,
    config: { tension: 400, friction: 15 },
  }));

  const triggerBurst = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Setup canvas
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(2, 2);
    }

    const particles: Particle[] = [];
    const colors = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ffffff'];

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: canvas.width / 4,
        y: canvas.height / 4,
        radius: random(2, 5),
        color: colors[random(0, colors.length - 1)],
        tx: random(-150, 150),
        ty: random(-150, 150),
      });
    }

    particles.forEach(p => {
      animate(p, {
        x: p.x + p.tx,
        y: p.y + p.ty,
        radius: 0,
        duration: random(600, 1200),
        easing: 'easeOutExpo',
      });
    });

    // Dummy animation just to drive the render loop
    animate(particles[0], {
      duration: 1200,
      onRender: () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        });
      },
      onComplete: () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    });
  };

  if (applied) {
    return (
      <Button variant="outline" asChild className="relative overflow-hidden group border-primary/30 hover:border-primary/50 text-neutral-200">
        <Link href="/candidate/applications">
          <CheckCircle2 className="mr-2 size-4 text-success" aria-hidden />
          Applied
          {/* Shine effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
        </Link>
      </Button>
    );
  }

  const handleApply = async () => {
    setApplying(true);
    try {
      const token = await getAccessToken();
      await api("/applications", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ job_id: jobId }),
      });
      triggerBurst();
      setTimeout(() => {
        setApplied(true);
        toast.success("Application submitted successfully!");
        router.refresh();
      }, 500); // Wait for burst before re-rendering
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string };
      if (error.status === 422) {
        toast.error(error.message || "A parsed resume is required to apply.");
        router.push("/candidate/resume");
      } else if (error.status === 409) {
        toast.error("You have already applied to this job.");
        setApplied(true);
      } else {
        toast.error(error.message || "Something went wrong.");
      }
    } finally {
      if (!applied) setApplying(false);
    }
  };

  return (
    <div className="relative inline-block">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-50 -left-1/2 -top-1/2" 
        style={{ width: '200%', height: '200%' }}
      />
      <animated.div style={{ scale }}>
        <Button 
          onClick={handleApply} 
          disabled={applying}
          onMouseDown={() => apiSpring.start({ scale: 0.95 })}
          onMouseUp={() => apiSpring.start({ scale: 1 })}
          onMouseLeave={() => apiSpring.start({ scale: 1 })}
          className="shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-shadow duration-300 relative overflow-hidden group bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {applying && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
          <span className="relative z-10 flex items-center">
            {applying ? "Applying..." : "Apply now"}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
        </Button>
      </animated.div>
    </div>
  );
}
