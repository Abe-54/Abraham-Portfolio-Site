import type { Metadata } from "next";
import Link from "next/link";
import GooFlood from "@/components/goo-flood";
import withDrop from "@/components/with-drop";

export const metadata: Metadata = {
  title: "Game over",
};

export default function NotFound() {
  return (
    <main
      id="main"
      tabIndex={-1}
      data-tone="night"
      className="shell flex min-h-[70svh] flex-col items-center justify-center gap-4 py-24 text-center"
    >
      <h1 className="t-hero text-[56px] leading-none md:text-[88px] lg:text-[112px]">{withDrop("Game over.")}</h1>
      <p className="t-label">This page doesn&apos;t exist</p>
      <Link href="/" className="btn btn-blue press mt-3">
        <GooFlood id="flood-continue" />
        Continue →
      </Link>
    </main>
  );
}
