import { marketDashUrl } from "@/lib/content";
import GooFlood from "./goo-flood";
import GooInk from "./goo-ink";
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
          <GooInk>
            <div className="hero-copy">
              <p className="t-label">By day</p>
              <h2 className="t-hero hero-title">Full-stack developer.</h2>
              <p className="hero-text">I build web apps with React, TypeScript and Next.js.</p>
            </div>
          </GooInk>
          <a href="#work" className="btn btn-solid hero-btn press">
            <GooFlood id="flood-work" />
            See my work →
          </a>
        </div>
        <div data-tone="night" className="hero-night">
          <GooeyPortrait />
          <GooInk>
            <div className="hero-night-copy">
              <p className="t-label t-tag">By night</p>
              <h2 className="t-hero hero-title hero-title-night">
                Indie game <span className="text-accent">dev.</span>
              </h2>
              <p className="hero-text">I make playful worlds in Unity and C#.</p>
            </div>
          </GooInk>
          <a href={marketDashUrl} target="_blank" rel="noopener" className="btn btn-blue hero-btn press">
            <GooFlood id="flood-play" />
            Play Market Dash ▸
          </a>
        </div>
      </div>
    </section>
  );
}
