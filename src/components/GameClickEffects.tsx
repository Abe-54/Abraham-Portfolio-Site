import { useEffect, useRef, useState, type CSSProperties } from "react";

type Particle = {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  rotate: number;
  color: string;
  delay: number;
};

const colors = ["var(--primary)", "var(--term-green)", "var(--accent)"];
const selectors = ".keycap, .btn, .linkbtn, .ico, button";

export default function GameClickEffects() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const nextId = useRef(0);
  const reduceMotion = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => {
      reduceMotion.current = media.matches;
    };

    updateMotionPreference();
    media.addEventListener("change", updateMotionPreference);

    const onClick = (event: MouseEvent) => {
      if (reduceMotion.current) return;

      const target = event.target as Element | null;
      const trigger = target?.closest(selectors);
      if (!trigger) return;
      if (
        trigger instanceof HTMLButtonElement &&
        (trigger.disabled || trigger.getAttribute("aria-disabled") === "true")
      ) {
        return;
      }

      const count = 6 + Math.floor(Math.random() * 4);
      const burst = Array.from({ length: count }, (_, index) => {
        const angle = (Math.PI * 2 * index) / count + Math.random() * 0.28;
        const distance = 18 + Math.random() * 22;

        return {
          id: nextId.current++,
          x: event.clientX,
          y: event.clientY,
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance - 8,
          size: 3 + Math.random() * 3,
          rotate: Math.random() * 180 - 90,
          color: colors[index % colors.length],
          delay: Math.random() * 35,
        };
      });

      setParticles((current) => [...current, ...burst]);
      window.setTimeout(() => {
        const ids = new Set(burst.map((particle) => particle.id));
        setParticles((current) =>
          current.filter((particle) => !ids.has(particle.id))
        );
      }, 720);
    };

    window.addEventListener("click", onClick, { capture: true });

    return () => {
      media.removeEventListener("change", updateMotionPreference);
      window.removeEventListener("click", onClick, { capture: true });
    };
  }, []);

  return (
    <div className="game-click-effects" aria-hidden="true">
      {particles.map((particle) => {
        const style = {
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          background: particle.color,
          "--dx": `${particle.dx}px`,
          "--dy": `${particle.dy}px`,
          "--rot": `${particle.rotate}deg`,
          "--delay": `${particle.delay}ms`,
        } as CSSProperties & Record<string, string | number>;

        return (
          <span
            key={particle.id}
            className="game-click-particle"
            style={style}
          />
        );
      })}
    </div>
  );
}
