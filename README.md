# DEAD AIR

A personal daily drop-in: the latest addition up front, ongoing toys and saved records below. Static HTML/CSS/JavaScript; no build step, dependencies, external fonts, or external services.

## Run

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

GitHub Pages serves the repository root on `main`. Relative asset paths work under the repository subpath and custom domains.

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
git diff --check
```

Browser smoke validation covers deterministic image generation, saved compositions, PNG download, legacy migration, frequency capture, notes/patterns/tempo/archive across reloads, audio start/mute, backup restoration, invalid backup rejection, blocked storage, reduced motion, and 320/390/768px layouts. Use an isolated browser context so test data cannot affect personal saves.

## Future updates

An update means shipping an actual feature, experiment, or visual overhaul with release notes, while preserving existing saves. There is no automated daily development schedule connected yet. The site does not claim rotating content is a new release.
