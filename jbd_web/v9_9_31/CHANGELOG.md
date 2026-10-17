# V9.9.31 — Upgrade test

Replaces the Tiger-only demo with an upgrade sandbox. +8 kills adds banked credit only inside this mode; real combat kills do not alter the selected tier. Reset clears credits and called support. Both campaign and test buttons show the upgrade and cost.

| Kills | Strike | Reinforcements |
| --- | --- | --- |
| 8 | Small artillery, 3 rounds | 3 infantry |
| 16 | Napalm plane, 5 bombs | 5-person MG command group |
| 24 | AH-64, 30 seconds | 8 elite troopers |
| 32 | Heavy artillery, 8 rounds | Armored MG scout car |
| 40 | Big precision strike, 3 impacts | Tiger tank |

Activating spends the displayed tier cost from one shared bank; saving advances both available choices. Surplus credit is retained. Napalm cannot depart before dropping all five bombs on narrow screens. The sandbox retains looping enemy encounters and a protected bunker.

Validation: Node syntax and real-engine VM regression suite, all ten UI activation paths, strike damage, napalm fire zones at 320/390/844px, helicopter projectiles/30-second expiry, infantry counts/elite armor, allied vehicles, reset, campaign isolation and surplus accounting. Browser visuals and physical phone audio not independently verified for this release.
