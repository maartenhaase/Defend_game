# JBD rebuild v1 — test report

Runtime target used for this build check: headless Chromium, 390×844 CSS-pixel viewport, standalone HTML injected as one document. This verifies the browser runtime and portrait layout but is **not** a real iPhone Safari device test.

Checks performed:
- bundled JavaScript syntax check with `node --check`
- load and initialize game
- click DEPLOY through browser input
- artillery intro completes and persistent crater cover nodes are created
- pointer-input MG, AP and HE shots
- infantry observed in ADVANCE, SPRINT_TO_COVER and FIRE_FROM_COVER states
- HE kill reaches visible DEAD state
- forced cleanup verifies Level 1 completion transition
- browser runtime reported no uncaught JavaScript errors during the final functional run

The hidden `?debug=1` mode shows FPS/entity/particle data and AI states. `?stress=1&debug=1` starts a cosmetic/entity stress setup for profiling.

Stress check (same runtime, stress flag forced because the test harness uses `about:blank` and cannot preserve a query string while injecting the standalone document):
- 25 active infantry
- 410 active pooled particles at the measured peak
- ~62 FPS immediately after stress deploy and ~60 FPS after 5 seconds in the headless runtime
- no uncaught JavaScript errors during that stress run
