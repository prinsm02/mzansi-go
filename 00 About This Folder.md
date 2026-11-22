# app

Source of the Mzansi Go GPS training app (Expo, React Native, TypeScript). This folder is the public GitHub repo `mzansi-go`; no personal data or tokens live here.

- `App.tsx` screen switcher, `index.ts` entry (loads the background GPS task first)
- `src/lib` maths (geo.ts), GPX/CSV (export.ts), phone storage (db.ts), settings, GitHub sync
- `src/lib/route.ts` pace colours for the route replay + route names from suburbs, `src/lib/b64.ts` upload encoding (tests in `route.test.ts`)
- `src/ui/RouteMap.tsx` fixed summary map with tap-to-play by pace
- `src/tracking/tracker.ts` recording engine, `src/screens` screens, `src/ui/kit.tsx` look
- `.github/workflows/build-ios.yml` free unsigned .ipa build

See `../00 How To Run.md`.

## Where this came from
Created 2026-11-14 by Claude from the Expo blank-typescript template (SDK 58).
