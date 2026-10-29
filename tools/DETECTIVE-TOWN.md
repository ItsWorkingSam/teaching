# Detective Town

Open `detective-town.html`, or choose **Detective Town** on the exercises hub. Static HTML, CSS and JavaScript; no build step or additional runtime packages.

## Rules

- Levels: 4 people / 1 impostor; 6 / 1; 8 / 2; 9 / 2 with poison; 10 / 3 with poison.
- Every good player claims their genuine role. Genuine roles are unique, even if somebody is poisoned. Impostors claim a good role and can give true or false information.
- All unpoisoned good information is true. On levels 4 and 5, exactly one impostor is the Poisoner. They affect the next seat clockwise only if it is good. Poisoned information can be true or false; the good role claim is still genuine.
- All claims refer to the initial circle. Reveals do not move seats or change poison or information.
- An accusation reveals alignment. Finding an impostor costs nothing; accusing a good person loses one of three lives. Find every impostor to win. No timer or automatic difficulty changes.
- Inspecting, reading aloud and notebook marks are free. Notebook marks are guesses, never game-confirmed information.

## Code structure

- `js/detective-town-engine.js`: DOM-free seeded generator, role definitions, information evaluation and exhaustive solver. Exported as a browser global and CommonJS for tests.
- `js/detective-town.js`: selection, notes, accusations, hints, explanations, records and restoring a saved case from its seed. Uses the existing `Store`, theme and `Speech` helpers.
- `css/detective-town.css`: scoped styles; existing shared theme variables remain the basis for both light and dark mode.
- `assets/detective-town/`: locally hosted artwork. See `CREDITS.md`; visible credits also appear on the page.

The solver enumerates all exact-size impostor subsets and, where applicable, each possible Poisoner among them. It rejects duplicate genuine roles and any false unpoisoned good claim. A case is accepted only when one complete arrangement remains. The solver does not read the stored solution. Impostor information is deliberately unconstrained, so a truthful claim is not proof of innocence.

Hints eliminate one explicitly stated hypothetical arrangement with a concrete contradiction. They do not declare every person in a rejected combination innocent. End-of-case explanations check the claims against the solution and identify poison.

To add a role, update `ROLES`, its targets in `makeClaim`, its information calculation in `value`, its wording in `statement`, and the independent checker. Only add it to difficulty pools where the ability is appropriate. If the generator or rules change, bump the saved-state version/key so existing seeds cannot silently become different cases.

## Verification

From the repository root:

```text
node tools/check-detective-town.cjs
node tools/check-detective-town-browser.mjs
```

The rule test compares 2,500 seeded cases against an independently implemented exhaustive solver, checks deterministic restoration, and checks clockwise poison wraparound.

The browser test uses Node 22+ and installed Chrome (override the Windows default path with `CHROME_PATH`). No test packages are needed. It exercises all five levels, portraits, notes, hints, saved-case resume, keyboard navigation, correct/wrong accusations, repeated accusations being unavailable, wins, losses and repeat cases. It also checks horizontal overflow and ten-seat hit-area overlap at widths from 320px to 1280px. Screenshots are saved to the printed OS temporary directory. Chrome runs with a separate temporary profile; the test starts and stops its own local HTTP server.
