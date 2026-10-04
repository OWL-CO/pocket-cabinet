# DEAD AIR

A personal industrial network console: web discovery, an ongoing mystery, useful tools, and an archive of previous experiments. Static HTML/CSS/JavaScript; no build step, dependencies, external fonts, or external services.

## Run

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

GitHub Pages serves the repository root on `main`. Relative asset paths work under the repository subpath and custom domains.

## Release 006 / Network Ghost

An original industrial interface inspired by cinematic cyberpunk infrastructure: layered schematics, an isometric relay city, phosphor traces, and a dead-letter signal diagram. The topology is functional: twelve keyboard-accessible nodes preview discovery routes, show the selected connection, and indicate previously opened sites. Pin/open counts reflect local saves. On phones, nodes become a compact numbered grid. Trace and scan animations stop for reduced-motion preferences. The map is a schematic of the curated index, not a real-time network or location scan.

All existing save formats and utilities remain compatible.

## Release 005 / Relay

- **Drift Engine:** a handpicked index of twelve external sites. Filter strange corners, visual rabbit holes, or useful tools; shuffle to another route, open it in a new tab, or keep it for later. Unopened sites are prioritized and navigation is always user-initiated. External websites have their own privacy policies and availability; they are not embedded or fetched by this site.
- **Dead Letter:** a short, solvable first chapter of an ARG-style mystery. Inspect a recovered packet, decode its payload, and submit the access word. Resolution persists.
- **Workbench:** UTF-8 hex/text conversion, a 25/5-minute focus timer, persistent tasks, and an autosaved scratchpad. The timer uses a saved deadline, so it remains accurate across tab suspension and reloads. It has no notification/alarm integration.
- **Experiment storage:** earlier generated prints, signal hunting, and drum sequencing remain available in a collapsible lab.

Relay data is an additive `hub` field in the existing version 2 save format. Older backups migrate with empty hub records. Backups now include bookmarks, opened routes, puzzle progress, tasks, and timer state. Local text processing does not send data to any server.

## Release 004

A bootleg zine theme: paper texture, black/red/yellow contrast, pasted labels, heavy borders, and oversized headlines. The latest/ongoing structure and all existing save formats remain intact.

## Release 003

**Signal Prints:** a seeded generative image toy. Make a new composition, return to it later, or download a 1200 × 800 PNG. Seeds persist and are included in backups. Version 2 backups from earlier releases remain compatible.

The homepage now leads with the newest experiment, keeps earlier toys accessible, and records a short release history.

## Release 002

- **Signal Hunter:** sweep 88–108 MHz, use signal strength to locate three hidden stations per sector, and intercept at 90% lock. Recovered transmissions persist in the archive. Scramble for another sector; previously undiscovered stories are prioritized.
- **Noise Engine:** an eight-step kick/snare/hi-hat sequencer with synthesized Web Audio, adjustable tempo, mutation, and persistent patterns. Audio requires a user action. Mute stops playback; hiding the tab stops the engine.
- **Black Box:** persistent notes, JSON export/restore, and migration from the original site's saves.

The waveform supports reduced-motion preferences. Controls support touch and keyboard; range inputs support arrow keys. No flashing effects or autoplay audio.

## Persistence

`dead-air-v2` stores notes, patterns, tempo, recovered transmissions, the current print seed, and a preserved copy of legacy records. The original `pocket-cabinet-v1` key is never changed. Old notes migrate into the new editor. Old moods, garden waterings, and adventures remain available in exported backups. Both version 1 and version 2 backups can be imported; imports validate before asking to replace current data.

Saves belong to the browser and origin, with no authentication or cross-device sync. Export before clearing browser data or changing domains. Storage failures are reported; in-memory data can still be exported.

## Checks

```sh
node --check app.js
node --check hub.js
git diff --check
```

With the local server running, the prepared cloud runtime provides Playwright and Chromium for repeatable browser checks:

```sh
node tests/relay.cjs
node tests/legacy.cjs
```

The browser defaults to `/usr/bin/chromium`; set `CHROMIUM_PATH` for another installed executable. Outside this environment, install Playwright separately to run these checks. Tests use disposable contexts and write screenshots under `/tmp`. External navigation uses a controlled fixture; availability of linked websites is not validated.

Browser smoke validation covers route filtering, bookmarks and controlled external navigation, puzzle resolution, Unicode conversion, task persistence, timer pause/reload/completion using a simulated clock, restored relay records, deterministic image generation, saved compositions, PNG download, legacy migration, frequency capture, notes/patterns/tempo/archive across reloads, audio start/mute, backup restoration, invalid backup rejection, blocked storage, reduced motion, and 320/390/768px layouts. Use an isolated browser context so test data cannot affect personal saves.

## Future updates

An update means shipping an actual feature, experiment, or visual overhaul with release notes, while preserving existing saves. There is no automated daily development schedule connected yet. The site does not claim rotating content is a new release.
