# V9.9.30 combat balance audit

The game uses a single visible battlefield in CSS pixels. A soldier is approximately 21 pixels tall. Movement is therefore compared with sprite size, rather than making units faster when screen resolution increases.

| Parameter | V9.9.29 | V9.9.30 | Purpose |
|---|---:|---:|---|
| Allied normal movement | 40 px/s | 13 px/s | Approximately 0.6 body heights per second |
| Allied flanking movement | 64 px/s | 20 px/s maximum | Short tactical bounds, approximately one body height per second |
| Bound duration | Repeated chase updates | 1.6–2.25 seconds | Commit to one movement |
| Pause between bounds | Uncoordinated toggles | 1.5–2.4 seconds | Cover, observe and aim |
| Aim before firing | Immediate / on the move | 0.24 seconds planted | Readable firing posture |
| Rifle / MG magazine | Unlimited | 10 / 30 rounds | Natural pauses and fire support |
| Rifle / MG reload | None | 2.65 / 3.35 seconds | Reload in cover |
| Rifle aimed hit probability before skill/range | 34% | 48% | Fewer, more effective aimed shots |
| Rifle damage before weapon/level modifiers | 4.6–6.8 | 7–9.5 | Make allied aimed fire meaningful |
| MG rounds per burst | 4–5 | 3–4 | Controlled suppressive fire |
| MG burst interval | 0.115 seconds | 0.135 seconds | Distinct individual reports |
| MG pause after burst | 0.65–1 second | 1.05–1.65 seconds | Observe / re-aim |
| Enemy base rifle movement | 28 px/s before mode | 19.6 px/s before mode | Comparable infantry scales |
| Allied rifle / MG projectile speed | 820 / 720 px/s | 650 / 600 px/s | Comparable ballistics across sides |
| Enemy rifle / marksman projectile speed | 305 / 385 px/s | 600 / 680 px/s | Avoid visibly slow paintballs and expired rounds |
| Allied Rifle / MG / marksman range | 300 / 300 / 300 px | 330 / 370 / 410 px | Give each role a useful firing position |
| Tiger route / arrival speed | 30 / 48–52 px/s plus generic controller | 19 / 23 px/s, one controller | Weight, pauses and deliberate movement |
| Large explosion camera shake cap | 12 px | 7.5 px | Weight without constant camera noise |
| Explosion full-screen flash cap | 44% | 22% | Preserve visibility |
| Allied gunshot volume request | Flat 0.95 | 0.34–0.78 by distance | Player, nearby troops and distant troops occupy different mix levels |
| Recorded reflection | None | 82 ms, 13% level, rate limited | Short spatial tail without continuous wash |
| Support ladder | 8 / 16 / 24 / 32 / 40 kills | 8 / 16 / 24 / 32 / 40 kills | Existing timing retained |

## Simulation results

- In the fixed 12-second engagement: 37 aimed/suppressive shots, recorded audio scheduled for every shot, about 91 damage to an unarmored test target.
- In the clear firing-lane scenario: 100% planted engagement time, zero shots while moving, visible magazine reload pauses.
- In the approach scenario: maximum 20 px/s, longest continuous movement about 2.22 seconds, with cover pauses.
- A hidden enemy behind a house is reached through a valid firing lane; the soldier stops when it can engage instead of chasing into melee.
- Near misses and blast shock pin friendly troops; they recover and resume firing.
- Firing cadence, HP, movement and spread remain finite and within audited limits through 40 campaign maps in both difficulty modes.

The automated harness runs the full engine with mocked canvas and audio playback. It verifies behavior and scheduled recorded sound calls; it does not substitute for listening on a physical phone.
