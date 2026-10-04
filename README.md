# Pocket Cabinet

A personal corner of the internet for little adventures and lasting keepsakes.

## Run locally

Requires Python 3, with no package installation or build step:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

The site consists of `index.html`, `style.css`, and `app.js` and can be hosted by any static website host over HTTPS.

## Inside the cabinet

- A rotating daily adventure and riddle, selected by the visitor's local calendar date.
- A windowsill plant that grows with one watering per day.
- A daily mood tracker with a seven-entry history.
- An automatically saved notebook.
- A playful alter-ego generator.
- JSON export and restore for saved keepsakes.

Notes, moods, garden progress, and completed adventures use versioned browser local storage. Data belongs to the browser and site origin: it is not synced across devices, and moving to another domain will require exporting and restoring a backup. Clearing browser data removes saved keepsakes. Storage failures are reported and export remains available. Import validates the backup and asks before replacing current keepsakes.

The site does not have authentication. It makes no requests containing your saved data. Optional Google Fonts requests supply typography; system and Georgia fallbacks work without them.

Daily content rotates from a curated collection; it does not generate or publish new features automatically. Scheduled development, deployment, cross-device storage, and private access are future infrastructure work.

## Validation

`node --check app.js` verifies JavaScript syntax. Browser smoke checks should exercise notes, watering, adventures, and moods across reloads, riddle reveal, title generation, backup export/restore, and mobile overflow. Test data should use a disposable browser context.
