"use client";

import { gamesData } from "@/lib/data";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import AppWindow from "./app-window";
import SkillBreaker from "./skill-breaker";

const Play = () => {
  return (
    <AppWindow
      id="play"
      section="Play"
      title="play.exe"
      index="05"
      heading="Off the clock, I make games"
    >
      <p className="-mt-4 mb-8 max-w-2xl text-lg text-foreground/75">
        Game development is where I learned to care about feel. Here&apos;s
        what I&apos;ve shipped, plus something you can play right now.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {gamesData.map((game, index) => (
          <motion.a
            key={game.title}
            href={game.href}
            target="_blank"
            rel="noreferrer noopener"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -4 }}
            className="group relative block overflow-hidden rounded-2xl border border-border"
          >
            <div className="relative aspect-video">
              <Image
                src={game.image}
                alt={`Screenshot of ${game.title}`}
                fill
                sizes="(min-width: 640px) 440px, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white">
              <div>
                <p className="text-lg font-bold">{game.title}</p>
                <p className="text-sm text-white/75">{game.blurb}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-black transition group-hover:bg-primary group-hover:text-white">
                Play <ArrowUpRight className="size-3.5" aria-hidden />
              </span>
            </div>
          </motion.a>
        ))}
      </div>

      <div className="mt-8">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-foreground/50">
          Play here · built for this site
        </p>
        <SkillBreaker />
      </div>
    </AppWindow>
  );
};

export default Play;
