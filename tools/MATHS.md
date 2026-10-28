# Visual maths activities

Open `exercises.html` and choose **Visual Maths**, or open `maths.html` directly. This is a static site: no build or new dependencies are required.

The five activities have four selectable levels each. They reuse `LevelGame` for Practice, Level up and Challenge modes, progression, review questions and browser-local records. Records are separate for each topic. The existing theme and safe storage helpers are reused.

## Adding an activity

- `js/maths-topics.js`: add a topic with a title, icon, description, hint, levels and `make(level)` question generator. It appears automatically on the hub.
- `js/maths-diagrams.js`: reusable SVG drawings with accessible descriptions. Descriptions should convey the visual information without unnecessarily solving the question.
- `js/maths.js`: shared rendering and answer handling. Questions can supply four text choices or a numeric answer, plus an optional unit and caption. Explanations appear after both correct and incorrect answers.
- `css/hub.css`: shared exercise-card styling for both hubs. `css/maths.css` adds diagram and activity styles using the existing theme variables.

Question IDs use the topic, level, review label and answer. Keep the review label specific to the generated values so distinct questions have distinct IDs. Question content is authored locally; do not insert untrusted HTML into SVGs or explanations.

## Checks

Run from the repository root:

```text
node tools/check-maths.cjs
node tools/check-maths-browser.mjs
```

The first command samples 4,000 questions and checks answers, unique choices, SVG descriptions and the Netflix dummy address. The second uses an installed Chrome browser (Windows default path; override with `CHROME_PATH`) with a temporary profile and local HTTP server. It checks 200-question fixed-level sessions in all seven maths games, staying at the chosen level after mistakes, saved mode preferences, all visual maths levels, correct and incorrect responses, skipping, finishing, replay, progression, challenge completion, invalid topics, phone-width overflow and scam link rendering. Desktop/light and mobile/dark screenshots are saved in the printed temporary directory. It needs Node 22 or newer; no test packages are required.

Maths games opt into `fixedPractice: true` in `LevelGame.create`. Practice (the default) never changes the selected level and has no question limit, including after mistakes. Level up advances after five correct non-review answers; Challenge adds three lives. Number Bee and Money & Shopping use the same setting. Other games keep their existing behaviour. Small question pools repeat naturally during long sessions.
