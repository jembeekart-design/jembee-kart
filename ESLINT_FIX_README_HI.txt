JEMBEE PLAY — ESLint fix (VerticalVideoFeed)

Replace the existing file at:
src/app/videos/components/VerticalVideoFeed.tsx

The library-video deep-link effect now waits for the next animation frame before
updating React state and scrolling to the committed video section. The scheduled
frame is cancelled when the effect reruns or the component unmounts.

After extracting this ZIP into the project root, run:
./node_modules/.bin/eslint src > eslint-result.txt 2>&1
ESLINT_EXIT_CODE=$?
grep -n -B 3 -A 5 "error" eslint-result.txt
echo "ESLINT_EXIT_CODE=$ESLINT_EXIT_CODE"

This ZIP contains only the patched source file and this README. It does not
contain dependencies and is not a deployment package.
