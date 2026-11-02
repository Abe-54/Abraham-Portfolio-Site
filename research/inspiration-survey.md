# Inspiration survey: creative, interesting, mechanical

Resolves #5 (map: #4). Surveyed 2026-11-01. Every URL below was fetched that day and returned a page.

**Brief:** one content source, two modes. **Play** (default): games, Easter eggs, window chrome. **Focus**: quiet, crafted, skimmable recruiter page. Brand words: creative, interesting, mechanical.

**Already explored, so not repeated here:** editorial serif "field notes", navy and coral "game select" menus, light "workbench" with tabbed cards, dark terminal homepage.

**Verification limits:** the fetch tool returns text, not rendered pixels. Structure, copy, and controls in the table come from those fetches. A few visual details (Nothing's dot-matrix type, Brittany Chiang's sticky column, Lynn Fisher's resize illustrations, Poolsuite's windows) are well documented, but the text fetch can't show them. Check them in a browser before building on them.

## Sites

| # | Site | URL | Kind | Mode | The one technique worth stealing |
|---|------|-----|------|------|----------------------------------|
| 1 | Teenage Engineering | https://teenage.engineering | Hardware / synths | Play | **Deadpan lowercase copy with hard line breaks**, with the odd all-caps line ("THIS SHADOW IS") for a punchline. Pair it with tiny utilitarian labels ("checkout0" as the cart readout). The voice sounds like a machine's spec sheet that has a sense of humor. |
| 2 | Nothing | https://nothing.tech | Industrial consumer tech | Play | **Dot-matrix display type used only for labels and numbers**, never for body text. It suggests an LED readout without making the page harder to read. Use it for window titles, counters, and the mode switch. |
| 3 | Playdate | https://play.date | Toy / handheld (Panic) | Play | **One feature per section, each headed by a noun and a period**: "The System.", "The Crank." Each section shows the hardware detail (the crank flips out from the side) and then a demo video. This structure lets each project show its single signature mechanic. |
| 4 | Analogue | https://www.analogue.co | Hardware (game consoles) | Both | **The product as a lone object hero, plus a firmware ticker** ("New! 3DOS V1.5.1 out now!") that works as a live changelog. Steal the ticker as a "what I shipped lately" strip. |
| 5 | Poolsuite | https://poolsuite.net | Web app (retro Mac OS) | Play | **A real boot sequence before the desktop.** The page preloads a boot background and then hands over to draggable windows. A 1–2 s boot screen could earn the window chrome, and it should be skippable. |
| 6 | Rauno Freiberg | https://rauno.me | Design engineer (Vercel) | Both | **Old versions of the site kept live on subdomains** (2022.rauno.me, 2023.rauno.me), linked from the main nav. The site's history becomes content. His "Craft" page holds the interaction experiments, so the homepage stays to a bio and a short manifesto. |
| 7 | Emil Kowalski | https://emilkowal.ski | Design engineer (ex-Linear, Vercel) | Focus | **Two plain lists, Projects and Writing, each item a linked title with a one-line summary.** No cards, images, or tags. A recruiter can skim it in about 10 seconds, and the craft shows in the linked projects (Sonner, Vaul), not in decoration. |
| 8 | Paco Coursey | https://paco.me | Design engineer (Linear, ex-Vercel) | Focus | **Small verb-led section labels** (Building, Projects, Writing, Now, Connect) separated by hairline rules, with a one-line self-description ("Crafting interfaces"). The "Now" section adds a human note without adding a games layer. |
| 9 | Brittany Chiang | https://brittanychiang.com | Frontend engineer (Klaviyo) | Focus | **Split layout: a sticky left column (name, role, anchor nav that highlights the current section) and a scrolling right column.** Each experience entry carries dates, role, a sentence, and tech chips. It's the most widely copied recruiter layout because it works. One hidden toy, a spinning TARDIS in the footer ("Click to time travel"), sets the right amount of Easter egg for Focus mode. |
| 10 | Jhey Tompkins | https://jhey.dev | Design engineer (Shopify) | Both | **Live status telemetry on the homepage**: the current game, local weather and time ("84.1°F · 17:23"), Steam and Spotify, plus a **git revision hash in the footer** ("Rev 0eb0233"). It reads like instrument readouts. It's mechanical without being a gimmick, and it can be built from data Abraham already has (GitHub, Steam, Unity). |
| 11 | Lynn Fisher | https://lynnandtonic.com | Designer / front-end | Play | **A version number on the site itself ("v. XIX") with a full redesign every year**, plus a "mode" control. Treating the portfolio as a versioned product fits the two-mode idea. The mode toggle could carry a firmware-style version label. |
| 12 | Josh W. Comeau | https://www.joshwcomeau.com | Dev educator / creative dev | Play | **UI sound effects on by default, with a visible "Disable sounds" control in the footer** next to the dark-mode toggle. Clicks feel physical, and the opt-out keeps it polite. This is the cheapest way to make the window chrome feel mechanical. |
| 13 | basement.studio | https://basement.studio | Studio / agency | Play | **A separate "Lab" area** under "More" holds the experiments, so the client work (Selected Work, What We Do, Clients) stays clean. Steal the split: games and toys live in a lab, and the case studies stay credible in both modes. |
| 14 | Lucas Pope | https://dukope.com | Game dev (Obra Dinn, Papers, Please) | Both | **Each game entry pairs a status banner (released, jam entry) with a devlog link and a playable browser build**, including old Ludum Dare games ported from Flash to HTML5 with conversion notes. It shows the game-dev side of Abraham honestly: playable builds and process, not a sizzle reel. |
| 15 | Bruno Simon | https://bruno-simon.com | Creative dev, 3D | Play: **ceiling, not template** | **A drivable Three.js and Rapier physics world** in which the portfolio is something you drive into. It's the reference point for how far "play" can go, and it's beyond this project's budget. One takeaway that does fit: secrets are found by exploring, not handed out as achievements. (The site's own achievements and leaderboard are the part to skip.) |

Also checked, held as a second ceiling: **Henry Heffernan**, https://henryheffernan.com ("Portfolio 2022"), a 3D room with a usable in-world computer OS. It's the closest example of the windowed-OS metaphor taken to full 3D. **Ceiling, not template.**

Also live and useful: **Elektron**, https://www.elektron.se. All-caps CTAs and a strict product grid with prices. It reinforces cluster A and adds no new technique.

## Direction clusters

### A. Instrument panel
Sites: Teenage Engineering, Nothing, Analogue, Jhey Tompkins (and Elektron).
**For Play mode:** windows become labeled hardware modules, with dot-matrix titles, deadpan lowercase copy, and live readouts (time, latest commit, now playing). The mechanical feel comes from labels and telemetry, not 3D.

### B. Toy box
Sites: Playdate, Josh W. Comeau, Lynn Fisher, basement.studio (Lab).
**For Play mode:** one signature physical mechanic (a crank, dial, or switch) drives navigation, with UI sounds that can be muted and a lab shelf for the games. Each project gets its own "The Thing." section.

### C. Boot-to-desktop OS
Sites: Poolsuite, Rauno Freiberg (versioned archives); Henry Heffernan and Bruno Simon as ceilings.
**For Play mode:** a short, skippable boot sequence opens a desktop of draggable windows. Past versions of the site and old builds sit there as "installed apps," so the history becomes something to explore.

### D. Quiet index (the Focus mode reference set)
Sites: Emil Kowalski, Paco Coursey, Brittany Chiang, Lucas Pope.
**For Play mode:** this is what Play mode collapses into. The same content records render as linked titles with one-line summaries, a sticky name and nav column, and at most one hidden toy. It confirms that the shared content model needs only a title, a one-liner, dates, tech, and links to drive both modes.

**Suggested pairing to test next:** A or B for Play mode (they fit "mechanical" and avoid repeating the terminal and game-select directions), D for Focus mode, and C only if the window chrome stays in scope.
