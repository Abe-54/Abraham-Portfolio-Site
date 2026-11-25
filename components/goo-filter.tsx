// Numbers are user units; percentages are shares of the SVG.
type Region = { x: number | string; y: number | string; width: number | string; height: number | string };

/**
 * The goo: blur, then a hard alpha threshold, so shapes near each other fuse with a liquid neck. Keep
 * the blur small; it is the slow part, in Safari most of all.
 *
 * By default the filter's region follows the shapes' box. Shapes that grow from nothing need a fixed
 * `region`: Firefox measures the box at the shapes' current size, so a region that follows it crops them.
 */
export default function GooFilter({
  id,
  blur = 6,
  sharpness = 18,
  cut = 7,
  region,
}: {
  id: string;
  blur?: number;
  sharpness?: number;
  cut?: number;
  region?: Region;
}) {
  const bounds = region
    ? { filterUnits: "userSpaceOnUse" as const, ...region }
    : { x: "-20%", y: "-20%", width: "140%", height: "140%" };
  return (
    <filter id={id} {...bounds} colorInterpolationFilters="sRGB">
      <feGaussianBlur in="SourceGraphic" stdDeviation={blur} />
      <feColorMatrix values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${sharpness} -${cut}`} />
    </filter>
  );
}
