JEMBEE PLAY — ESLint Date.now render fix

Apply this patch in the project root with:
  unzip -o JEMBEE_PLAY_Feed_UI_DateNow_Render_Fix_2026-11-10.zip -d .

Change: the Shorts “New” badge time reference is now captured asynchronously after mount via requestAnimationFrame. Date.now() is no longer called during render. The “New” badge still appears only when createdAt is within the last 7 days.

After applying, run:
  ./node_modules/.bin/eslint src
  ./node_modules/.bin/tsc --noEmit --incremental false --pretty false
