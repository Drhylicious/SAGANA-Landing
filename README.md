# SAGANA-Landing

Official SAGANA landing page, featuring system information, application downloads, and QR code access.

Live site: https://sagana-landing.vercel.app (permanent address; the QR code points to `/get`).

A plain static site: no framework, no build step. Vercel serves the files in this folder as they are.
It is independent of the Flutter app repository (`Drhylicious/SAGANA`).

## Files

| Path | Purpose |
| --- | --- |
| `index.html`, `styles.css`, `app.js` | The page, its styles, and its behaviour (menu, tabs, live version info) |
| `vercel.json` | The two permanent redirects, `/get` and `/download`, plus security and cache headers |
| `assets/screens/*.webp` | Real SAGANA screenshots (generated from the User Manual's raw captures) |
| `assets/sagana-qr.svg`, `assets/sagana-qr.png` | The permanent QR code (SVG on the page, PNG for printing) |
| `scripts/` | `build-images.mjs`, `make-qr.mjs`, `verify-qr.mjs`, `config.mjs` |

## The two permanent links

| URL | What it does |
| --- | --- |
| `https://sagana-landing.vercel.app/get` | Redirects to the Download section. **This is what the QR code contains.** |
| `https://sagana-landing.vercel.app/download` | Redirects to the newest APK on GitHub Releases. The Download Now button uses this. |

Because both go through this site, the APK can later move to different hosting by editing only `vercel.json`.

## Releasing a new APK (no change to this repo)

1. In the Flutter repo, raise `version:` in `pubspec.yaml` (for example `1.0.2+3`). The number after `+` must always go up.
2. Build the signed release APK and rename it to exactly `SAGANA.apk`.
3. On GitHub, in `Drhylicious/SAGANA` create a Release tagged `v1.0.2` and attach `SAGANA.apk`. Add release notes.
   (Tick *pre-release* first if you want to test; pre-releases are not "latest".)
4. Done. `/download` serves the new file and this page shows the new version, size, date and history.

The asset name must stay `SAGANA.apk`; that is what keeps `/releases/latest/download/SAGANA.apk` valid.

## Changing this site

- Edit the files and push to `main`; Vercel redeploys automatically.
- Run locally: `npm install`, then `npm run dev` (http://localhost:3000). Local `serve` does not apply `vercel.json`, so test `/get` and `/download` on Vercel.
- Regenerate screenshots / logos: `npm run images`
- Regenerate the QR: `npm run qr`, then check it with `npm run verify-qr`.

**Never change `SITE_URL` in `scripts/config.mjs` after QR codes are printed.** If the domain must change, keep the old
domain active and redirecting.
