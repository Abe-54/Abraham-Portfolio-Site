import GooFilter from "./goo-filter";

/*
 * A project cover pours out of the goo. Over the picture sits a sheet of the band's ground with goo
 * holes in it; when the row's entrance plays, the holes grow from the bottom-right corner, fuse, and
 * uncover the picture (styles/projects.css). No script: it runs on the row's data-entrance, so a row
 * that is already on screen, or one seen earlier in the visit, simply shows its picture.
 *
 * Behind the cover sits a small blob of the goo at the same corner, the way the goo sits behind the
 * portrait. When the card lifts under the pointer, the blob swells into the space it leaves.
 */

const W = 280;
const H = 190;
const COLUMNS = [35, 105, 175, 245];
const ROWS = [32, 95, 158];
// The corner the goo pours from.
const FROM = { x: W, y: H };
const FAR = Math.hypot(W, H);

const CELLS = ROWS.flatMap((cy) =>
  COLUMNS.map((cx) => ({ cx, cy, delay: Math.round((Math.hypot(FROM.x - cx, FROM.y - cy) / FAR) * 520) })),
);

export function CoverPour({ id }: { id: string }) {
  return (
    <svg className="cover-pour" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <GooFilter id={`${id}-goo`} blur={9} sharpness={20} cut={8} region={{ x: -60, y: -60, width: W + 120, height: H + 120 }} />
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
          <rect width={W} height={H} fill="#ffffff" />
          <g filter={`url(#${id}-goo)`} fill="#000000">
            {CELLS.map((cell) => (
              <circle
                key={`${cell.cx}-${cell.cy}`}
                className="cover-pour-cell"
                cx={cell.cx}
                cy={cell.cy}
                r={62}
                style={
                  {
                    // Each blob grows from its own centre, set in user units: Firefox ignores
                    // transform-box: fill-box inside a mask and would grow them all from the corner.
                    transformOrigin: `${cell.cx}px ${cell.cy}px`,
                    "--cell-delay": `${cell.delay}ms`,
                  } as React.CSSProperties
                }
              />
            ))}
          </g>
        </mask>
      </defs>
      <rect className="cover-pour-sheet" width={W} height={H} mask={`url(#${id}-mask)`} />
    </svg>
  );
}

export function CoverBlob({ id }: { id: string }) {
  return (
    <svg className="cover-blob" viewBox="0 0 120 100" aria-hidden="true">
      <defs>
        <GooFilter id={`${id}-blob`} blur={7} region={{ x: -20, y: -20, width: 160, height: 140 }} />
      </defs>
      <g filter={`url(#${id}-blob)`} fill="#3366FF">
        <circle cx="62" cy="50" r="34" />
        <circle cx="92" cy="72" r="22" />
        <circle cx="38" cy="76" r="16" />
      </g>
    </svg>
  );
}
