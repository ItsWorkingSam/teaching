/* ============================================================
   Level game engine, shared by Spelling Bee, Number Bee,
   Money & Shopping and Word Detective.

   A game supplies its levels and questions. The engine runs the start
   screen, levels, lives, streaks, second chances, saved records and the
   end-of-game summary.

   LevelGame.create({
     mount: "game",                  // id of the element to build into
     storageKey: "number-bee-v1",    // where records are saved
     noun: ["question", "questions"],
     levels: [{ name, blurb }, ...],
     needsSpeech: false,             // warn if text-to-speech is missing
     fixedPractice: false,           // maths: stay at chosen level; add Level up mode
     remember: false,                // skip questions answered right before
     tip: "Press Enter to check.",   // small note under each question

     prepare(level) -> Promise       // optional: load data for a level
     next(level, step, ctx) -> q     // q.id must be a string. step runs
                                     // 0..toLevelUp-1 through the level;
                                     // ctx = { used, mastered } (Sets)
     render(q, area, ui)             // draw q into area, call ui.* below
     explain(q) -> { answer, note?, actions? }   // shown on a miss
     reviewItem(q, typed) -> { label, typed?, say? }  // summary list
   })

   ui, given to render():
     ui.correct({ answer?, note? })  // with a note, waits for "Next"
     ui.wrong({ typed?, answer?, note?, actions? })
     ui.tryAgain(message)            // nudge, no penalty
     ui.answered()                   // true once the question is over
   Controls marked data-lock are disabled once a question is answered.

   Depends on training-core.js (Store, Speech, showToast).
   ============================================================ */

const Widgets = {
	esc(s) {
		return String(s == null ? "" : s)
			.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
	},

	el(html) {
		const t = document.createElement("template");
		t.innerHTML = html.trim();
		return t.content.firstElementChild;
	},

	/* A button that reads `text` aloud (a string, or a function for
	   text that changes). */
	speakButton({ label, text, icon = "ph-speaker-high", rate = 0.85, big = false, after }) {
		const btn = Widgets.el(big
			? `<button type="button" class="btn hear-main"><i class="ph-bold ${icon}"></i> ${label}</button>`
			: `<button type="button" class="speak-btn small"><i class="ph-bold ${icon}"></i> ${label}</button>`);
		btn.addEventListener("click", () => {
			if (!Speech.supported()) { showToast("Speech isn't available in this browser", "info", 1600); return; }
			btn.classList.add("speaking");
			Speech.say(typeof text === "function" ? text() : text, {
				rate, onend: () => btn.classList.remove("speaking")
			});
			if (after) after();
		});
		return btn;
	},

	/* Text box plus Check button. `prefix` shows e.g. "$" inside the box. */
	answerForm({ placeholder = "Type your answer", inputmode = "text", prefix = "", label = "Your answer", onSubmit }) {
		const form = Widgets.el(`
			<form class="answer-row" autocomplete="off">
				<span class="answer-field${prefix ? " has-prefix" : ""}">
					${prefix ? `<span class="prefix" aria-hidden="true">${Widgets.esc(prefix)}</span>` : ""}
					<input type="text" data-lock aria-label="${Widgets.esc(label)}" placeholder="${Widgets.esc(placeholder)}"
						inputmode="${inputmode}" autocomplete="off" autocorrect="off" autocapitalize="none"
						spellcheck="false" enterkeyhint="done">
				</span>
				<button class="btn" type="submit" data-lock><i class="ph-bold ph-check"></i>&nbsp; Check</button>
			</form>`);
		const input = form.querySelector("input");
		form.addEventListener("submit", e => {
			e.preventDefault();
			const value = input.value.trim();
			if (!value) { showToast("Type your answer first", "info", 1300); return; }
			onSubmit(value, input);
		});
		input.addEventListener("input", () => input.classList.remove("field-wrong"));
		return { form, input };
	},

	/* Multiple-choice buttons. onPick(value, button). */
	choices(options, onPick, { columns = 1 } = {}) {
		const wrap = Widgets.el(`<div class="options${columns === 2 ? " cols-2" : ""}"></div>`);
		options.forEach(o => {
			const b = Widgets.el(`<button type="button" class="option" data-lock>${o.html != null ? o.html : Widgets.esc(o.label)}</button>`);
			b.addEventListener("click", () => onPick(o.value, b));
			wrap.append(b);
		});
		return wrap;
	},

	focus(input) {
		if (input && !input.disabled) input.focus({ preventScroll: true });
	}
};

/* Small random helpers, used by the generated games. */
const Rand = {
	int(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); },
	pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
	shuffle(arr) {
		const a = arr.slice();
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}
};

const LevelGame = {
	TO_LEVEL_UP: 5,      // correct new questions to move up a level
	LIVES: 3,
	REVIEW_GAP: 4,       // a missed question returns after this many others
	MISSES_TO_DROP: 3,   // practice: misses in a row before easing off a level
	MASTERED_CAP: 5000,
	PRAISE: ["Correct!", "Nice work!", "Perfect!", "Well done!", "That's it!", "Excellent!"],

	create(cfg) {
		const E = LevelGame;
		const esc = Widgets.esc;
		const root = document.getElementById(cfg.mount || "game");
		const levels = cfg.levels;
		const top = levels.length;
		const [noun, nouns] = cfg.noun || ["question", "questions"];
		const Noun = nouns.charAt(0).toUpperCase() + nouns.slice(1);

		let stats = Object.assign(
			{ done: 0, correct: 0, bestStreak: 0, highestLevel: 0, lastLevel: 1, lastMode: "practice", mastered: [] },
			Store.getJSON(cfg.storageKey, {}));
		const mastered = new Set(stats.mastered);
		let chosenLevel = Math.min(Math.max(stats.lastLevel, 1), top);
		let chosenMode = ["practice", "challenge", ...(cfg.fixedPractice ? ["levelup"] : [])].includes(stats.lastMode)
			? stats.lastMode : "practice";
		let game = null;
		let seq = 0;          // bumps per question, so stale callbacks do nothing

		const isFixedPractice = () => cfg.fixedPractice && game.mode === "practice";

		const prepare = n => cfg.prepare ? Promise.resolve(cfg.prepare(n)) : Promise.resolve();

		function save() {
			stats.mastered = Array.from(mastered).slice(-E.MASTERED_CAP);
			Store.setJSON(cfg.storageKey, stats);
		}

		/* ---------- Build the screens ---------- */

		root.innerHTML = `
			<section class="step-card game-card active" data-screen="start">
				<p class="section-label">1. Choose a starting level</p>
				<div class="level-grid"></div>
				<p class="section-label">2. Choose how to play</p>
				<div class="mode-row${cfg.fixedPractice ? " mode-row-three" : ""}">
					<button type="button" class="level-btn" data-mode="practice">
						<span class="lvl-name"><i class="ph-bold ph-leaf"></i> Practice</span>
						<span class="lvl-eg">${cfg.fixedPractice ? "Stay at your chosen level. Unlimited questions, no lives or timer." : "No limit. Keep going as long as you like."}</span>
					</button>
					${cfg.fixedPractice ? `<button type="button" class="level-btn" data-mode="levelup">
						<span class="lvl-name"><i class="ph-bold ph-trend-up"></i> Level up</span>
						<span class="lvl-eg">Move up after 5 correct answers. Unlimited attempts.</span>
					</button>` : ""}
					<button type="button" class="level-btn" data-mode="challenge">
						<span class="lvl-name"><i class="ph-bold ph-heart"></i> Challenge</span>
						<span class="lvl-eg">${cfg.fixedPractice ? "Move up after 5 correct answers. Three lives." : "Three lives. How far can you get?"}</span>
					</button>
				</div>
				<div class="game-warning" hidden></div>
				<button type="button" class="btn start-btn"><i class="ph-bold ph-play"></i>&nbsp; Start</button>
			</section>

			<section class="step-card game-card" data-screen="play">
				<div class="game-top">
					<span class="level-chip"><i class="ph-bold ph-medal"></i> <span data-ref="level"></span>
						<span class="level-dots" data-ref="dots" title="Progress to the next level"></span>
					</span>
					<span class="lives" data-ref="lives"></span>
				</div>
				<div class="stat-row">
					<div class="stat"><b data-ref="done">0</b><span>${esc(Noun)}</span></div>
					<div class="stat"><b data-ref="correct">0</b><span>Correct</span></div>
					<div class="stat"><b data-ref="streak">0</b><span>Streak</span></div>
				</div>
				<div data-ref="area" aria-live="polite"></div>
				<div class="under-row">
					<span class="mini-note" style="margin:0;">${esc(cfg.tip || "")}</span>
					<span>
						<button type="button" class="text-btn" data-ref="skip"><i class="ph-bold ph-question"></i> I don't know</button>
						<button type="button" class="text-btn" data-ref="finish"><i class="ph-bold ph-flag-checkered"></i> Finish</button>
					</span>
				</div>
				<div class="result" data-ref="result" role="status"></div>
			</section>

			<section id="success-screen" data-screen="summary" style="display:none;">
				<div class="success-emoji" data-ref="emoji"></div>
				<h2 data-ref="title"></h2>
				<p data-ref="note"></p>
				<div class="summary-stats" data-ref="tiles"></div>
				<div data-ref="review"></div>
				<div class="btn-row" style="justify-content:center;">
					<button type="button" class="btn" data-ref="again"><i class="ph-bold ph-arrow-clockwise"></i>&nbsp; Play again</button>
					<a class="btn btn-ghost" href="exercises.html"><i class="ph-bold ph-squares-four"></i>&nbsp; More exercises</a>
				</div>
			</section>`;

		const ref = name => root.querySelector(`[data-ref="${name}"]`);
		const screen = name => root.querySelector(`[data-screen="${name}"]`);

		function show(name) {
			["start", "play"].forEach(n => screen(n).classList.toggle("active", n === name));
			screen("summary").style.display = name === "summary" ? "block" : "none";
		}

		/* ---------- Start screen ---------- */

		function renderStart() {
			const grid = screen("start").querySelector(".level-grid");
			grid.innerHTML = levels.map((l, i) => `
				<button type="button" class="level-btn" data-level="${i + 1}" aria-pressed="${i + 1 === chosenLevel}">
					<span class="lvl-num">Level ${i + 1}</span>
					<span class="lvl-name">${esc(l.name)}</span>
					<span class="lvl-eg">${esc(l.blurb)}</span>
				</button>`).join("");
			grid.querySelectorAll("[data-level]").forEach(b => b.addEventListener("click", () => {
				chosenLevel = +b.dataset.level;
				grid.querySelectorAll("[data-level]").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
				prepare(chosenLevel).catch(() => {});   // warm it up
			}));

			screen("start").querySelectorAll("[data-mode]").forEach(b => {
				b.setAttribute("aria-pressed", String(b.dataset.mode === chosenMode));
				b.onclick = () => {
					chosenMode = b.dataset.mode;
					screen("start").querySelectorAll("[data-mode]").forEach(x =>
						x.setAttribute("aria-pressed", String(x === b)));
				};
			});

			renderRecords();
			if (cfg.needsSpeech) checkSpeech();
			prepare(chosenLevel).catch(() => {});
		}

		function checkSpeech() {
			const warn = screen("start").querySelector(".game-warning");
			const say = msg => { warn.textContent = msg; warn.hidden = false; };
			if (!Speech.supported()) {
				say("This browser can't read out loud, so this game won't work well here. Try Chrome, Edge or Safari.");
				return;
			}
			setTimeout(() => {   // voices load late in some browsers
				if (!window.speechSynthesis.getVoices().length) {
					say("No text-to-speech voices were found. Check your device's speech settings, or try another browser.");
				}
			}, 2000);
		}

		function renderRecords() {
			const el = cfg.recordsEl && document.getElementById(cfg.recordsEl);
			if (!el) return;
			if (!stats.done) { el.innerHTML = ""; return; }
			const pct = Math.round((stats.correct / stats.done) * 100);
			el.innerHTML = `
				<span class="hint-title" style="margin-bottom:6px;"><i class="ph-bold ph-trophy"></i> Your records</span>
				<div><span>${esc(Noun)} answered</span><b>${stats.done}</b></div>
				<div><span>Accuracy</span><b>${pct}%</b></div>
				<div><span>Best streak</span><b>${stats.bestStreak}</b></div>
				<div><span>Highest level</span><b>${stats.highestLevel || "-"}</b></div>`;
		}

		/* ---------- Game flow ---------- */

		async function start() {
			stats.lastLevel = chosenLevel;
			stats.lastMode = chosenMode;
			save();

			game = {
				mode: chosenMode, startLevel: chosenLevel, level: chosenLevel, inLevel: 0,
				done: 0, correct: 0, streak: 0, bestStreak: 0, lives: E.LIVES, missStreak: 0,
				used: new Set(),
				review: [],          // { q, due, tries }
				missed: new Map(),   // id -> { q, typed }
				current: null, answered: false
			};

			show("play");
			ref("area").innerHTML = `<p class="loading"><i class="ph-bold ph-spinner"></i> Loading…</p>`;
			ref("result").classList.remove("show");
			renderTop();
			if (await ensureLevel()) nextQuestion();
		}

		// The level may have just changed; make sure its data is loaded.
		async function ensureLevel() {
			try {
				await prepare(game.level);
				if (!isFixedPractice() && game.level < top) prepare(game.level + 1).catch(() => {});
				return true;
			} catch (e) {
				ref("area").innerHTML = `<p class="loading">Sorry, this level couldn't be loaded. Check your connection and refresh the page.</p>`;
				return false;
			}
		}

		function renderTop() {
			ref("level").textContent = `Level ${game.level} · ${levels[game.level - 1].name}`;
			const filled = game.level === top ? E.TO_LEVEL_UP : game.inLevel;
			ref("dots").title = isFixedPractice() ? "Staying at your chosen level" : "Progress to the next level";
			ref("dots").innerHTML = isFixedPractice() ? "" : Array.from({ length: E.TO_LEVEL_UP }, (_, i) =>
				`<span class="${i < filled ? "on" : ""}"></span>`).join("");
			const lives = ref("lives");
			lives.innerHTML = game.mode === "challenge"
				? Array.from({ length: E.LIVES }, (_, i) => `<i class="ph-bold ph-heart${i < game.lives ? "" : " lost"}"></i>`).join("")
				: "";
			lives.setAttribute("aria-label", game.mode === "challenge" ? `${game.lives} lives left` : "");
			ref("done").textContent = game.done;
			ref("correct").textContent = game.correct;
			ref("streak").textContent = game.streak;
		}

		function pick() {
			const due = game.review.findIndex(r => r.due <= game.done);
			if (due !== -1) {
				const r = game.review.splice(due, 1)[0];
				return { q: r.q, review: true, tries: r.tries };
			}
			const step = isFixedPractice() ? game.inLevel % E.TO_LEVEL_UP : Math.min(game.inLevel, E.TO_LEVEL_UP - 1);
			const q = cfg.next(game.level, step, { used: game.used, mastered });
			return { q, review: false, tries: 0 };
		}

		function nextQuestion() {
			if (game.mode === "challenge" && game.lives <= 0) { finish(); return; }

			game.current = pick();
			game.answered = false;
			game.used.add(game.current.q.id);
			const token = ++seq;

			const result = ref("result");
			result.classList.remove("show", "good");
			result.innerHTML = "";
			ref("skip").disabled = false;

			const area = ref("area");
			area.innerHTML = game.current.review
				? `<p class="review-tag"><i class="ph-bold ph-arrow-counter-clockwise"></i> Second chance</p>` : "";
			const body = document.createElement("div");
			area.append(body);
			cfg.render(game.current.q, body, makeUI(token));
			renderTop();
		}

		function makeUI(token) {
			const live = () => token === seq && game && !game.answered;
			return {
				correct(opts) { if (live()) right(opts || {}); },
				wrong(opts) { if (live()) wrong(opts || {}); },
				tryAgain(message) { if (live()) showToast(message, "info", 2600); },
				answered: () => !live()
			};
		}

		function lock() {
			game.answered = true;
			ref("area").querySelectorAll("[data-lock]").forEach(x => { x.disabled = true; });
			ref("skip").disabled = true;
		}

		function right({ answer, note }) {
			lock();
			const { q, review } = game.current;
			game.done++; game.correct++; game.streak++;
			game.bestStreak = Math.max(game.bestStreak, game.streak);
			game.missStreak = 0;
			stats.done++; stats.correct++;
			stats.bestStreak = Math.max(stats.bestStreak, game.streak);
			stats.highestLevel = Math.max(stats.highestLevel, game.level);
			if (cfg.remember && !review) mastered.add(q.id);

			let levelledUp = false;
			if (!review) {
				game.inLevel++;
				if (!isFixedPractice() && game.inLevel >= E.TO_LEVEL_UP && game.level < top) {
					game.level++;
					game.inLevel = 0;
					levelledUp = true;
					stats.highestLevel = Math.max(stats.highestLevel, game.level);
				}
			}
			save();
			renderTop();
			showToast(E.PRAISE[game.correct % E.PRAISE.length], "success", 1000);

			const advance = async () => {
				if (levelledUp) {
					showToast(`Level up! Level ${game.level}: ${levels[game.level - 1].name}`, "success", 2000);
					if (!(await ensureLevel())) return;
				}
				nextQuestion();
			};

			// A note (the "why") is worth reading, so wait for Next.
			if (note) {
				showResult({ good: true, title: "Correct", answer, note, onNext: advance });
			} else {
				setTimeout(advance, 1000);
			}
		}

		function wrong({ typed = "", answer, note, actions }) {
			lock();
			const { q, review, tries } = game.current;
			const ex = cfg.explain ? cfg.explain(q, typed) : {};

			game.done++;
			game.streak = 0;
			game.missStreak++;
			game.missed.set(q.id, { q, typed });
			stats.done++;
			if (tries < 1) game.review.push({ q, due: game.done + E.REVIEW_GAP, tries: tries + 1 });

			let status = "";
			if (game.mode === "challenge") {
				game.lives--;
				status = game.lives > 0
					? `${game.lives} ${game.lives === 1 ? "life" : "lives"} left.`
					: "That was your last life.";
			} else if (!isFixedPractice() && game.missStreak >= E.MISSES_TO_DROP && game.level > 1) {
				game.level--;
				game.inLevel = 0;
				game.missStreak = 0;
				status = `Let's try some slightly easier ones for a bit (Level ${game.level}).`;
			} else if (!review) {
				status = "It'll come back again soon for another try.";
			}
			save();
			renderTop();

			const out = game.mode === "challenge" && game.lives <= 0;
			showResult({
				good: false,
				title: typed ? "Not quite" : "Here's the answer",
				typed,
				answer: answer != null ? answer : ex.answer,
				note: [note || ex.note, status].filter(Boolean),
				actions: actions || ex.actions,
				nextLabel: out ? "See results" : null,
				onNext: async () => { if (await ensureLevel()) nextQuestion(); }
			});
		}

		/* `answer` is trusted HTML from the game; `typed` is escaped here. */
		function showResult({ good, title, typed, answer, note, actions, nextLabel, onNext }) {
			const notes = [].concat(note || []);
			const result = ref("result");
			result.classList.toggle("good", good);
			result.innerHTML = `
				<p class="result-title"><i class="ph-bold ${good ? "ph-check-circle" : "ph-x-circle"}" style="color:var(${good ? "--success" : "--error"})"></i> ${esc(title)}</p>
				${typed ? `<p class="result-line">You answered</p><div class="answer-big typed">${esc(typed)}</div>` : ""}
				${answer ? `<p class="result-line">${good ? "Answer" : "Correct answer"}</p><div class="answer-big">${answer}</div>` : ""}
				${notes.map(n => `<p class="result-note">${n}</p>`).join("")}
				<div class="btn-row" style="margin-top:12px;">
					<button type="button" class="btn" data-ref="next"><i class="ph-bold ph-arrow-right"></i>&nbsp; ${esc(nextLabel || "Next")}</button>
				</div>`;
			const row = result.querySelector(".btn-row");
			(actions || []).forEach(a => row.append(a));
			result.classList.add("show");
			const next = result.querySelector('[data-ref="next"]');
			next.addEventListener("click", onNext, { once: true });
			next.focus({ preventScroll: true });
			result.scrollIntoView({ behavior: "smooth", block: "nearest" });
		}

		/* ---------- Summary ---------- */

		function finish() {
			if (!game) return;
			if (window.speechSynthesis) window.speechSynthesis.cancel();
			seq++;

			if (!game.done) { game = null; show("start"); renderStart(); return; }

			const pct = Math.round((game.correct / game.done) * 100);
			const out = game.mode === "challenge" && game.lives <= 0;
			const climbed = game.level - game.startLevel;
			ref("emoji").textContent = pct >= 80 ? "🏆" : "⭐";
			ref("title").textContent = out ? "Out of lives" : "Well done!";
			ref("note").textContent = climbed > 0
				? `You climbed ${climbed} ${climbed === 1 ? "level" : "levels"}, from Level ${game.startLevel} to Level ${game.level}.`
				: `You finished on Level ${game.level} · ${levels[game.level - 1].name}.`;

			const tile = (v, label) => `<div class="stat"><b>${v}</b><span>${label}</span></div>`;
			ref("tiles").innerHTML = tile(game.done, esc(Noun)) + tile(game.correct, "Correct") +
				tile(pct + "%", "Accuracy") + tile(game.bestStreak, "Best streak");

			const missed = Array.from(game.missed.values());
			const items = missed.map(({ q, typed }) =>
				cfg.reviewItem ? cfg.reviewItem(q, typed) : { label: q.id, typed });
			const review = ref("review");
			review.innerHTML = items.length ? `
				<p class="section-label" style="text-align:left;margin-top:8px;">To practise</p>
				<ul class="review-list">${items.map(it => `
					<li>
						<span><span class="rw">${esc(it.label)}</span>${it.typed && it.typed !== it.label ? `<span class="rt">${esc(it.typed)}</span>` : ""}</span>
						${it.say ? `<button type="button" class="speak-btn small" data-say="${esc(it.say)}" aria-label="Hear it"><i class="ph-bold ph-speaker-high"></i></button>` : ""}
					</li>`).join("")}
				</ul>` : "";
			review.querySelectorAll("[data-say]").forEach(b =>
				b.addEventListener("click", () => Speech.say(b.dataset.say, { rate: 0.8 })));

			show("summary");
			renderRecords();
		}

		/* ---------- Wire up ---------- */

		screen("start").querySelector(".start-btn").addEventListener("click", start);
		ref("skip").addEventListener("click", () => { if (game && !game.answered) wrong({}); });
		ref("finish").addEventListener("click", finish);
		ref("again").addEventListener("click", () => { game = null; show("start"); renderStart(); });
		renderStart();
	}
};
