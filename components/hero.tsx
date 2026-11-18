import { marketDashUrl } from "@/lib/content";
import GooeyPortrait from "./gooey-portrait";

export default function Hero() {
  return (
    <section aria-labelledby="hero-title" className="hero">
      <h1 id="hero-title" className="sr-only">
        Abraham Rubio
      </h1>
      <div className="hero-stage">
        <div className="hero-disc-clip" aria-hidden="true">
          <div className="hero-disc" />
        </div>
        <div data-tone="day" className="hero-day">
          <div className="hero-copy">
            <p className="t-label">By day</p>
            <h2 className="t-hero hero-title">Full-stack developer.</h2>
            <p className="hero-text">
              User-focused software that ships, built with React, TypeScript and Next.js.
            </p>
          </div>
          <a href="#work" className="btn btn-solid hero-btn press">
            See my work →
          </a>
        </div>
        <div data-tone="night" className="hero-night">
          <GooeyPortrait />
          <p className="t-label t-tag">By night</p>
          <h2 className="t-hero hero-title hero-title-night">
            Indie game <span className="text-accent">dev.</span>
          </h2>
          <p className="hero-text">Playful worlds in Unity and C#, where code and creativity meet.</p>
          <a href={marketDashUrl} target="_blank" rel="noopener" className="btn btn-blue hero-btn press">
            Play Market Dash ▸
          </a>
        </div>
      </div>
    </section>
  );
}
