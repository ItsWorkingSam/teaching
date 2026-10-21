/* ============================================================
   Word Detective: spot the mistake, fill the gap, or pick the
   sentence that's written correctly.
   Content lives in word-detective-data.js.
   Runs on game-engine.js.
   ============================================================ */

(function () {
	const esc = Widgets.esc;
	const LEVELS = window.WORD_DETECTIVE || [];

	// Words as tappable chips; punctuation stays with its word.
	const tokens = sentence => sentence.split(" ");
	const core = token => token.replace(/^[“"‘(]+/, "").replace(/[.,!?;:”"’)]+$/, "");

	function fixedSentence(item) {
		return tokens(item.spot).map(t => core(t) === item.wrong
			? esc(t.replace(item.wrong, "\u0000")).replace("\u0000", `<strong>${esc(item.fix)}</strong>`)
			: esc(t)).join(" ");
	}

	const filled = item => esc(item.choose).replace("___", `<strong>${esc(item.answer)}</strong>`);
	const readable = text => text.replace("___", "blank");

	function next(level, step, { used }) {
		const items = LEVELS[level - 1].items.map((item, i) => ({ id: `${level}-${i}`, item }));
		const fresh = items.filter(x => !used.has(x.id));
		return Rand.pick(fresh.length ? fresh : items);
	}

	function heading(text, sayText) {
		const head = Widgets.el(`<div class="question-text"><span>${esc(text)}</span></div>`);
		head.append(Widgets.speakButton({ label: "Read it", text: sayText }));
		return head;
	}

	const renderers = {
		spot(item, area, ui) {
			area.append(heading("Tap the word that's wrong.", item.spot));
			const row = Widgets.el(`<div class="chip-sentence"></div>`);
			tokens(item.spot).forEach(t => {
				const b = Widgets.el(`<button type="button" class="word-chip" data-lock>${esc(t)}</button>`);
				b.addEventListener("click", () => {
					const result = { answer: fixedSentence(item), note: esc(item.why) };
					if (core(t) === item.wrong) {
						b.classList.add("correct");
						ui.correct(result);
					} else {
						b.classList.add("wrong");
						ui.wrong(Object.assign({ typed: core(t) }, result));
					}
				});
				row.append(b);
			});
			area.append(row);
		},

		choose(item, area, ui) {
			area.append(heading("Choose the right word for the gap.", readable(item.choose)));
			area.append(Widgets.el(`<p class="fill-sentence">${esc(item.choose).replace("___", '<span class="blank" aria-label="blank"></span>')}</p>`));
			area.append(Widgets.choices(Rand.shuffle(item.options).map(o => ({ value: o, label: o })), (value, btn) => {
				const result = { answer: filled(item), note: esc(item.why) };
				if (value === item.answer) {
					btn.classList.add("correct");
					ui.correct(result);
				} else {
					btn.classList.add("wrong");
					ui.wrong(Object.assign({ typed: value }, result));
				}
			}, { columns: 2 }));
		},

		pick(item, area, ui) {
			const right = item.pick[item.answer];
			area.append(heading("Which one is written correctly?", item.pick.join(". Or. ")));
			area.append(Widgets.choices(Rand.shuffle(item.pick).map(s => ({ value: s, label: s })), (value, btn) => {
				const result = { answer: esc(right), note: esc(item.why) };
				if (value === right) {
					btn.classList.add("correct");
					ui.correct(result);
				} else {
					btn.classList.add("wrong");
					ui.wrong(Object.assign({ typed: value }, result));
				}
			}));
		}
	};

	const kind = item => item.spot ? "spot" : item.choose ? "choose" : "pick";

	function explain({ item }) {
		const answer = { spot: fixedSentence, choose: filled, pick: i => esc(i.pick[i.answer]) }[kind(item)](item);
		return { answer, note: esc(item.why) };
	}

	function reviewItem({ item }, typed) {
		const label = { spot: i => `${i.wrong} → ${i.fix}`, choose: i => i.choose.replace("___", i.answer), pick: i => i.pick[i.answer] }[kind(item)](item);
		return { label, typed: kind(item) === "pick" ? "" : typed };
	}

	LevelGame.create({
		mount: "game",
		recordsEl: "records",
		storageKey: "word-detective-v1",
		noun: ["question", "questions"],
		levels: LEVELS,
		tip: "Tap your answer.",
		next,
		render: ({ item }, area, ui) => renderers[kind(item)](item, area, ui),
		explain,
		reviewItem
	});
})();
