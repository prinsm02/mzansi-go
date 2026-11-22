# Changelog

## 1.1.4

- Old name removed everywhere: the results repo is now mzansi-go-data (the app switches a saved iron-man-data setting over by itself), app slug mzansi-go.

## 1.1.3

- History now sits to the RIGHT of Home: swipe left on Home to open it, swipe right (or Back) to return.

## 1.1.2

- Softer, cleaner red glow: the hero card glow no longer fades through a dark band on iPhone, and the coral numbers' glow is tighter so iOS does not cut it off in hard edges.
- GitHub repo renamed to prinsm02/mzansi-go.

## 1.1.1

- Logo letters now read MGo (M black, G and o red), same race bib.

## 1.1.0 (Mzansi Go)

- New name: **Mzansi Go**, with the race-bib logo now reading MG (MGo from 1.1.1).
- Opening screen credits the developer and the first version date (14 Nov 2026).
- GitHub upload fixed: plain-JS UTF-8 (no TextEncoder/TextDecoder), accepts a pasted repo link, clear "Not ready" status in Settings, real error messages. Upload now works even when automatic upload is off.
- Automatic upload: when you tap Save on a session, or 5 minutes after finishing, and when the app opens.
- Summary map is fixed (no drag, zoom or rotate), so swiping over it scrolls the pages. Tap it to play the route coloured by pace: red fast, yellow medium, green slow.
- Route name fills in from the suburbs (or roads) along the way; still editable.
- Session type is a clear red pill, saved the moment you tap it, and shown next to the sport.
- Home: Run, Bike and Swim each get their own tile with a colour line; sport switch moved up, away from Start; initials under the profile picture; swipe right for History (no link).
- Stats look like the Running Dashboard: hero numbers, load cards with the red bar, personal bests, smooth red lines with white glowing points, red gradient bars with a white dot.
- Only "Swim" anywhere: Settings and set-up show one Swim; pool or open water is chosen when starting.

## 1.0.4

- 3-second logo screen when the app opens.
- One Swim tab: open water (GPS) or pool (log lengths) is chosen when you start.
- Bottom left shows only your avatar; the bottom Stats link is gone (tap the week card for Stats).
- History has one Swim filter covering open water and pool.
- Centred Run | Bike | Swim switch right above the Start button.
- Tidier week card: month in one row with the total, training load as a small coloured pill.
- Haptics: buzz on start, pause, resume, finish, GPS lock, every km split and when switching sport.
- Live screen tells you to step outside if GPS has not locked after 30 seconds.

## 1.0.3

- Stats charts label every bar and point, with units, period titles, sport legends, and week or month comparisons.
- Bar and trend charts have tick marks, gridlines, and a tap callout for the exact values.
- Training load (acute:chronic workload) on Stats for all sports together, and for run, bike, and swim, with zone colours and an 8-week trend. Home shows the combined ratio when there is enough history.
- Clearer units, dates, and empty states on History, Live, Pool, Profile, Session, Events, and Settings.
