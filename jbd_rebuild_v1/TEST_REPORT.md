# JBD rebuild v1 — Milestone 5 test report

Date: 2026-09-14
Scope: Level 1 vertical slice + assault-whistle cover release + Milestone 5 visual/audio polish.

## Automated / logic checks
- Bundled JavaScript: `node --check` passed.
- Module top-level load harness: passed.
- Crater assault pulse with 3 occupied craters:
  - assault whistle emitted;
  - shared release at 3.8 s;
  - all 3 soldiers changed from crater cover to ADVANCE in the same pulse;
  - all crater `occupiedBy` values were cleared;
  - assault sprint timers were active after release.
- HE cover protection:
  - exposed infantry: 100% reference damage;
  - crater-covered infantry: 58% of reference damage.

## Browser runtime
Chromium headless, emulated viewport 390×844, DPR 2. The standalone HTML was injected directly into the browser document for testing because localhost navigation is blocked by the runtime administrator policy.

Verified:
- DEPLOY interaction;
- artillery and crater creation;
- natural infantry cover selection;
- natural assault-whistle cycles;
- synchronized crater release;
- MG / AP / HE pointer timing;
- HE explosion;
- audio context unlock;
- particle engine and rendering;
- 0 observed uncaught JavaScript/runtime error events.

Natural run sample at ~13 seconds:
- ~59.9 FPS;
- assault pulse: 1;
- 3 infantry released together in that pulse;
- 14 crater cover nodes.

Stress sample:
- 27 living infantry;
- 304 active particles;
- ~60 FPS;
- quality scalar: 1.0.

## Not claimed
- No physical iPhone Safari test was performed.
- Audio identity was executed without runtime errors, but subjective speaker/headphone quality still needs a human listen test.
