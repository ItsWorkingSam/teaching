/* ============================================================
   Spelling engine — data driven.
   Expects window.SPELLING_SET = { meta:{title, subtitle}, questions:[...] }
   Depends on training-core.js (Speech, showToast, initTheme).
   ============================================================ */

const SET = window.SPELLING_SET || { meta: {}, questions: [] };
const QUESTIONS = SET.questions;

const TYPE_META = {
	dictation: { label: "Listen & spell", icon: "ph-ear" },
	choice: { label: "Choose the correct spelling", icon: "ph-list-checks" },
	missing: { label: "Fill the missing letters", icon: "ph-dots-three-outline" },
	homophone: { label: "Choose the right word", icon: "ph-arrows-split" },
	unscramble: { label: "Unscramble the word", icon: "ph-shuffle" },
	suffix: { label: "Add the ending", icon: "ph-plus-circle" },
	plural: { label: "Make it plural", icon: "ph-stack" },
	correct: { label: "Fix the mistake", icon: "ph-eraser" }
};

const PRAISE = ["Correct!", "Nice work!", "Perfect!", "Well spelled!", "That's it!", "Excellent!"];

let qi = 0;
let score = 0;
let attempts = 0;
let hintLevel = 0;
let revealedCount = 0;
let locked = false;

let card;

const DEFAULT_HINT = "Give it a go first. If you get stuck, press the Hint button below for a clue, one step at a time.";

function norm(s) {
	return (s || "").toLowerCase().trim().replace(/\s+/g, " ");
}

/* Derive the visible pattern for a "missing" question.
   Either an explicit q.pattern ("sep_rate") or q.blanks index list. */
function getPattern(q) {
	if (q.pattern) return q.pattern;
	return q.word.split("").map((c, i) => (q.blanks || []).includes(i) ? "_" : c).join("");
}

function speakBtnHTML(label, extraClass) {
	return `<button class="speak-btn ${extraClass || ""}" data-speak>
		<i class="ph-bold ph-speaker-high"></i> ${label}
	</button>`;
}

function updateProgress() {
	document.getElementById("progress-fill").style.width =
		(qi / QUESTIONS.length) * 100 + "%";
	document.getElementById("level-indicator").innerText =
		`Question ${qi + 1} of ${QUESTIONS.length}`;
}

function setHint(text) {
	document.getElementById("hint-text").innerText = text || "";
}

function spellOut(word) {
	return word.toUpperCase().split("").join(" · ");
}

function handleCorrect() {
	if (locked) return;
	locked = true;
	score++;
	showToast(PRAISE[qi % PRAISE.length], "success", 900);
	qi++;
	setTimeout(() => {
		locked = false;
		if (qi < QUESTIONS.length) loadQuestion();
		else finish();
	}, 950);
}

function handleWrong(el, q) {
	attempts++;
	if (el) {
		el.classList.remove("field-wrong");
		void el.offsetWidth;
		el.classList.add("field-wrong");
	}
	if (attempts >= 2) {
		showToast("Not quite. Press “Hint” below if you'd like a clue.", "info", 1800);
	} else {
		showToast("Not quite. Try again", "error", 1400);
	}
}

/* ---------- Renderers ---------- */

function typeTag(type) {
	const m = TYPE_META[type];
	return `<span class="q-type-tag"><i class="ph-bold ${m.icon}"></i> ${m.label}</span>`;
}

function loadQuestion() {
	const q = QUESTIONS[qi];
	attempts = 0;
	hintLevel = 0;
	updateProgress();
	// Start neutral. The curated hint is only revealed when the learner
	// presses the Hint button, so the answer isn't given away up front.
	setHint(DEFAULT_HINT);

	card.classList.remove("active");
	void card.offsetWidth;
	card.innerHTML = typeTag(q.type) + renderers[q.type](q) + helpBarHTML();
	card.classList.add("active");

	wirers[q.type](q);
	wireSpeakButtons(q);
	wireHelp(q);
}

function helpBarHTML() {
	return `
		<div class="help-bar">
			<button class="help-btn" id="hint-btn"><i class="ph-bold ph-lightbulb"></i> Hint</button>
			<button class="help-btn danger" id="reveal-btn"><i class="ph-bold ph-eye"></i> Show answer</button>
		</div>`;
}

/* Escalating hints, then a full reveal so a student is never stuck. */
function wireHelp(q) {
	const hintBtn = document.getElementById("hint-btn");
	const revealBtn = document.getElementById("reveal-btn");
	if (hintBtn) hintBtn.addEventListener("click", () => giveHint(q));
	if (revealBtn) revealBtn.addEventListener("click", () => revealAnswer(q));
}

function giveHint(q) {
	if (locked) return;
	const ans = (q.answer || q.word || "").toString();
	hintLevel++;

	// Multiple-choice: first the curated clue, then eliminate wrong options.
	if (q.type === "choice" || q.type === "homophone") {
		if (hintLevel === 1 && q.hint) {
			setHint(q.hint);
			showToast("Hint added to the sidebar", "info", 1100);
			return;
		}
		const wrong = Array.from(card.querySelectorAll(".option"))
			.filter(b => !b.disabled && norm(b.dataset.val) !== norm(q.answer));
		if (wrong.length > 1) {
			wrong[0].disabled = true;
			wrong[0].style.opacity = "0.4";
			wrong[0].style.textDecoration = "line-through";
			showToast("Removed a wrong choice", "info", 1200);
		} else {
			setHint("Try saying each option aloud in the sentence. Which one sounds right?");
			showToast("Say it aloud", "info", 1200);
		}
		return;
	}

	// Spelling types: curated clue first, then increasingly specific structure.
	if (hintLevel === 1) {
		setHint(q.hint || `This word has ${ans.length} letters.`);
	} else if (hintLevel === 2) {
		setHint(`It has ${ans.length} letters and starts with “${ans[0].toUpperCase()}”.`);
	} else if (hintLevel === 3) {
		setHint(`It begins with “${ans[0].toUpperCase()}” and ends with “${ans[ans.length - 1].toUpperCase()}”. ${ans.length} letters in total.`);
	} else {
		setHint("Full spelling:  " + spellOut(ans) + ".   Use “Show answer” if you'd like to move on.");
	}
	showToast("Hint added to the sidebar", "info", 1100);
}

function revealAnswer(q) {
	const ans = q.answer || q.word;

	switch (q.type) {
		case "dictation":
		case "suffix":
		case "plural":
		case "correct": {
			const inp = document.getElementById("answer");
			inp.value = ans;
			inp.disabled = true;
			inp.classList.remove("field-wrong");
			inp.classList.add("field-revealed");
			const c = document.getElementById("check");
			if (c) c.disabled = true;
			break;
		}
		case "choice":
		case "homophone": {
			card.querySelectorAll(".option").forEach(b => {
				b.disabled = true;
				if (norm(b.dataset.val) === norm(q.answer)) b.classList.add("revealed");
				else b.style.opacity = "0.5";
			});
			break;
		}
		case "missing": {
			const pattern = getPattern(q);
			card.querySelectorAll(".letter-input").forEach(x => {
				x.value = q.word[+x.dataset.i];
				x.disabled = true;
				x.classList.remove("field-wrong");
				x.classList.add("field-revealed");
			});
			void pattern;
			const c = document.getElementById("check");
			if (c) c.disabled = true;
			break;
		}
		case "unscramble": {
			document.getElementById("slots").innerHTML =
				q.word.split("").map(ch => `<span class="slot revealed">${ch}</span>`).join("");
			card.querySelectorAll(".tile").forEach(t => t.classList.add("used"));
			const cl = document.getElementById("clear");
			if (cl) cl.disabled = true;
			break;
		}
	}

	revealedCount++;
	setHint(`No problem. This word is spelled:  ${spellOut(ans)}.  Have a look, then continue.`);

	const bar = card.querySelector(".help-bar");
	if (bar) {
		bar.innerHTML =
			`<button class="btn" id="continue-btn"><i class="ph-bold ph-arrow-right"></i>&nbsp; Continue</button>
			 <span class="mini-note" style="margin:0;">Answer shown. This one won't count toward your score.</span>`;
		document.getElementById("continue-btn").addEventListener("click", () => {
			if (locked) return;
			locked = true;
			qi++;
			setTimeout(() => {
				locked = false;
				if (qi < QUESTIONS.length) loadQuestion();
				else finish();
			}, 150);
		});
	}
}

function wireSpeakButtons(q) {
	card.querySelectorAll("[data-speak]").forEach(btn => {
		btn.addEventListener("click", () => {
			const phrase = btn.dataset.phrase || q.word || q.answer || "";
			if (!Speech.supported()) {
				showToast("Speech isn't available in this browser", "info", 1600);
				return;
			}
			btn.classList.add("speaking");
			Speech.say(phrase, {
				rate: btn.dataset.slow ? 0.65 : 0.85,
				onend: () => btn.classList.remove("speaking")
			});
		});
	});
}

const renderers = {
	dictation(q) {
		return `
			<p class="instruction">Listen to the word, then type it below.</p>
			<div class="controls">
				${speakBtnHTML("Hear the word")}
				${speakBtnHTML("Slower", "small").replace('data-speak', 'data-speak data-slow="1"')}
				<button class="speak-btn small" data-speak data-phrase="${q.sentence}">
					<i class="ph-bold ph-chat-text"></i> In a sentence
				</button>
			</div>
			<input type="text" id="answer" autocomplete="off" autocapitalize="off"
				spellcheck="false" placeholder="Type the word you heard" style="margin-top:16px;">
			<div class="controls" style="margin-top:14px;">
				<button class="btn" id="check">Check</button>
			</div>
			<p class="mini-note">Tip: press the speaker as many times as you need.</p>`;
	},

	choice(q) {
		const opts = q.options.map(o =>
			`<button class="option" data-val="${o}">${o}</button>`).join("");
		return `
			<p class="instruction">${q.prompt || "Which spelling is correct?"}</p>
			<div class="options">${opts}</div>`;
	},

	missing(q) {
		const pattern = getPattern(q);
		const letters = q.word.split("").map((ch, i) => {
			if (pattern[i] === "_") {
				return `<input class="letter-input" maxlength="1" data-i="${i}"
					autocomplete="off" autocapitalize="off" spellcheck="false">`;
			}
			return `<span class="fixed-letter">${ch}</span>`;
		}).join("");
		return `
			<p class="instruction">Fill in the missing letters to complete the word.</p>
			<div class="controls" style="margin-bottom:6px;">${speakBtnHTML("Hear the word")}</div>
			<div class="letter-row">${letters}</div>
			<div class="controls">
				<button class="btn" id="check">Check</button>
			</div>`;
	},

	homophone(q) {
		const opts = q.options.map(o =>
			`<button class="option" data-val="${o}">${o}</button>`).join("");
		return `
			<p class="instruction">Choose the word that fits the sentence.</p>
			<p class="sentence">${q.before}<span class="blank">?</span>${q.after}</p>
			<div class="options cols-2">${opts}</div>`;
	},

	unscramble(q) {
		const shuffled = shuffle(q.word.split(""));
		const tiles = shuffled.map((ch, i) =>
			`<button class="tile" data-letter="${ch}" data-tid="${i}">${ch}</button>`).join("");
		return `
			<p class="instruction">Put the letters in the right order to spell the word.</p>
			<div class="controls" style="margin-bottom:8px;">${speakBtnHTML("Hear the word")}</div>
			<div class="answer-slots" id="slots"></div>
			<div class="tiles" id="tiles">${tiles}</div>
			<div class="controls">
				<button class="btn btn-ghost" id="clear"><i class="ph-bold ph-arrow-counter-clockwise"></i>&nbsp; Clear</button>
			</div>`;
	},

	suffix(q) {
		return `
			<p class="instruction">Join the word and the ending together, spelled correctly.</p>
			<p class="sentence"><strong>${q.base}</strong> &nbsp;+&nbsp; <strong>${q.suffix}</strong> &nbsp;=&nbsp; ?</p>
			<input type="text" id="answer" autocomplete="off" autocapitalize="off"
				spellcheck="false" placeholder="Type the whole word">
			<div class="controls" style="margin-top:14px;">
				<button class="btn" id="check">Check</button>
			</div>`;
	},

	plural(q) {
		return `
			<p class="instruction">Write the <strong>plural</strong> (more than one) of this word.</p>
			<p class="sentence">one <strong>${q.singular}</strong> &nbsp;→&nbsp; two <strong>?</strong></p>
			<input type="text" id="answer" autocomplete="off" autocapitalize="off"
				spellcheck="false" placeholder="Type the plural">
			<div class="controls" style="margin-top:14px;">
				<button class="btn" id="check">Check</button>
			</div>`;
	},

	correct(q) {
		return `
			<p class="instruction">One word is spelled wrong. Type the correct spelling.</p>
			<p class="sentence">${q.before}<span class="wrong-word">${q.wrong}</span>${q.after}</p>
			<input type="text" id="answer" autocomplete="off" autocapitalize="off"
				spellcheck="false" placeholder="Type the corrected word">
			<div class="controls" style="margin-top:14px;">
				<button class="btn" id="check">Check</button>
			</div>`;
	}
};

/* ---------- Wiring ---------- */

function wireTextAnswer(getAnswer) {
	const input = document.getElementById("answer");
	const check = document.getElementById("check");
	const run = () => {
		if (locked) return;
		if (norm(input.value) === norm(getAnswer())) {
			input.classList.add("field-correct");
			input.disabled = true;
			handleCorrect();
		} else {
			handleWrong(input, QUESTIONS[qi]);
		}
	};
	check.addEventListener("click", run);
	input.addEventListener("keydown", e => { if (e.key === "Enter") run(); });
	input.addEventListener("input", () => input.classList.remove("field-wrong"));
	input.focus();
}

function wireOptions(correctVal) {
	card.querySelectorAll(".option").forEach(btn => {
		btn.addEventListener("click", () => {
			if (locked || btn.disabled) return;
			if (norm(btn.dataset.val) === norm(correctVal)) {
				btn.classList.add("correct");
				card.querySelectorAll(".option").forEach(b => b.disabled = true);
				handleCorrect();
			} else {
				btn.classList.add("wrong");
				btn.disabled = true;
				handleWrong(null, QUESTIONS[qi]);
			}
		});
	});
}

const wirers = {
	dictation(q) { wireTextAnswer(() => q.word); },
	suffix(q) { wireTextAnswer(() => q.answer); },
	plural(q) { wireTextAnswer(() => q.answer); },
	correct(q) { wireTextAnswer(() => q.answer); },
	choice(q) { wireOptions(q.answer); },
	homophone(q) { wireOptions(q.answer); },

	missing(q) {
		const inputs = Array.from(card.querySelectorAll(".letter-input"));
		inputs.forEach((inp, idx) => {
			inp.addEventListener("input", () => {
				inp.value = inp.value.toLowerCase();
				card.querySelectorAll(".letter-input").forEach(x => x.classList.remove("field-wrong"));
				if (inp.value && inputs[idx + 1]) inputs[idx + 1].focus();
			});
			inp.addEventListener("keydown", e => {
				if (e.key === "Backspace" && !inp.value && inputs[idx - 1]) inputs[idx - 1].focus();
				if (e.key === "Enter") checkMissing(q, inputs);
			});
		});
		document.getElementById("check").addEventListener("click", () => checkMissing(q, inputs));
		if (inputs[0]) inputs[0].focus();
	},

	unscramble(q) {
		const slots = document.getElementById("slots");
		const placed = [];

		const refresh = () => {
			slots.innerHTML = placed.map((p, i) =>
				`<span class="slot" data-pos="${i}">${p.letter}</span>`).join("");
			slots.querySelectorAll(".slot").forEach(s => {
				s.addEventListener("click", () => {
					if (locked) return;
					const pos = +s.dataset.pos;
					const removed = placed.splice(pos, 1)[0];
					if (removed) {
						const tile = card.querySelector(`.tile[data-tid="${removed.tid}"]`);
						if (tile) tile.classList.remove("used");
					}
					refresh();
				});
			});
			if (placed.length === q.word.length) checkUnscramble(q, placed);
		};

		card.querySelectorAll(".tile").forEach(tile => {
			tile.addEventListener("click", () => {
				if (locked || tile.classList.contains("used")) return;
				tile.classList.add("used");
				placed.push({ letter: tile.dataset.letter, tid: tile.dataset.tid });
				refresh();
			});
		});

		document.getElementById("clear").addEventListener("click", () => {
			if (locked) return;
			placed.length = 0;
			card.querySelectorAll(".tile").forEach(t => t.classList.remove("used"));
			refresh();
		});
	}
};

function checkMissing(q, inputs) {
	if (locked) return;
	if (inputs.some(i => !i.value)) {
		showToast("Fill in every box first", "info", 1400);
		return;
	}
	const pattern = getPattern(q);
	const built = q.word.split("").map((ch, i) =>
		pattern[i] === "_" ? (inputs.find(x => +x.dataset.i === i).value) : ch).join("");
	if (norm(built) === norm(q.word)) {
		inputs.forEach(i => { i.classList.add("field-correct"); i.disabled = true; });
		handleCorrect();
	} else {
		inputs.forEach(i => i.classList.add("field-wrong"));
		handleWrong(null, q);
	}
}

function checkUnscramble(q, placed) {
	if (locked) return;
	const built = placed.map(p => p.letter).join("");
	if (norm(built) === norm(q.word)) {
		card.querySelectorAll(".slot").forEach(s => {
			s.style.background = "var(--success-soft)";
			s.style.color = "var(--success)";
		});
		handleCorrect();
	} else {
		card.querySelectorAll(".slot").forEach(s => s.classList.add("field-wrong"));
		handleWrong(null, q);
		setTimeout(() => {
			if (locked) return;
			placed.length = 0;
			card.querySelectorAll(".tile").forEach(t => t.classList.remove("used"));
			document.getElementById("slots").innerHTML = "";
		}, 700);
	}
}

function shuffle(arr) {
	const a = arr.slice();
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	if (a.join("") === arr.join("") && arr.length > 1) return shuffle(arr);
	return a;
}

function finish() {
	document.getElementById("progress-fill").style.width = "100%";
	const hb = document.querySelector(".hint-box");
	if (hb) hb.style.display = "none";
	card.classList.remove("active");
	card.style.display = "none";
	document.getElementById("level-indicator").innerText = "Complete";
	document.getElementById("final-score").innerText =
		`Score: ${score} / ${QUESTIONS.length}` + (revealedCount ? `  ·  ${revealedCount} revealed` : "");
	document.getElementById("success-screen").style.display = "block";
}

/* ---------- Start ---------- */

function startSpelling() {
	card = document.getElementById("quiz-card");
	if (!card || !QUESTIONS.length) return;

	const meta = SET.meta || {};
	if (meta.title) {
		document.title = meta.title + " · Spelling";
		const h1 = document.getElementById("set-title");
		if (h1) h1.textContent = meta.title;
		const brand = document.getElementById("brand-label");
		if (brand) brand.textContent = meta.title;
	}
	const sub = document.getElementById("set-subtitle");
	if (sub && meta.subtitle) sub.textContent = meta.subtitle;

	loadQuestion();
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", startSpelling);
} else {
	startSpelling();
}
