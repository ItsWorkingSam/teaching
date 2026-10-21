/* ============================================================
   Numeracy helpers shared by Number Bee and Money & Shopping:
   reading typed answers, formatting numbers and money, and the
   standard "type a number" question.
   Runs on game-engine.js.
   ============================================================ */

const Num = {
	/* Read what someone typed: "$1,250.50", "−3", "45%", "50c", "8°C".
	   Returns NaN if it isn't a number. */
	parse(text) {
		let s = String(text).trim().toLowerCase()
			.replace(/[−–]/g, "-")          // proper minus / en dash
			.replace(/[\s,$%]|°c?|nzd/g, "");
		let cents = false;
		if (/c$/.test(s)) { cents = true; s = s.slice(0, -1); }
		if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
		const n = Number(s);
		return cents ? n / 100 : n;
	},

	same(a, b) { return Math.abs(a - b) < 0.005; },

	/* 1234.5 -> "1,234.5" (NZ uses commas for thousands). */
	fmt(n, dp) {
		const opts = dp == null ? { maximumFractionDigits: 2 } : { minimumFractionDigits: dp, maximumFractionDigits: dp };
		return n.toLocaleString("en-NZ", opts).replace("-", "−");
	},

	/* Money always shows cents: $4.50, $12.00. */
	money(n) {
		return (n < 0 ? "−$" : "$") + Math.abs(n).toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	},

	/* Round to cents without floating-point surprises (0.1 + 0.2). */
	cents(n) { return Math.round(n * 100) / 100; },

	/* Turn maths symbols into words for text-to-speech. */
	speakable(text) {
		return String(text)
			.replace(/(\d),(\d)/g, "$1$2")
			.replace(/−(\d)/g, "minus $1")
			.replace(/×/g, " times ").replace(/÷/g, " divided by ")
			.replace(/ − /g, " minus ").replace(/\+/g, " plus ").replace(/=/g, " equals ")
			.replace(/\?/g, " what ").replace(/°C/g, " degrees")
			.replace(/½/g, "one half").replace(/¼/g, "one quarter").replace(/¾/g, "three quarters")
			.replace(/⅓/g, "one third").replace(/⅔/g, "two thirds").replace(/⅕/g, "one fifth").replace(/⅒/g, "one tenth");
	},

	/* Pick a generated question the player hasn't seen this session. */
	fresh(make, used, tries = 25) {
		let q;
		for (let i = 0; i < tries; i++) {
			q = make();
			if (!used.has(q.id)) return q;
		}
		return q;
	},

	/* The standard question: some HTML above, a number box below.
	   q = { id, text?, big?, html?, say?, answer, prefix?, suffix?, explain } */
	render(q, area, ui) {
		const say = q.say || Num.speakable(q.big || q.text || "");
		const head = Widgets.el(`<div class="question-text"><span>${q.text ? Widgets.esc(q.text) : ""}</span></div>`);
		head.append(Widgets.speakButton({ label: "Read it", text: say, after: () => Widgets.focus(input) }));
		area.append(head);
		if (q.html) area.append(Widgets.el(`<div>${q.html}</div>`));
		if (q.big) area.append(Widgets.el(`<p class="question-big">${Widgets.esc(q.big)}</p>`));

		const { form, input } = Widgets.answerForm({
			placeholder: q.placeholder || "Your answer",
			inputmode: "decimal",
			prefix: q.prefix || "",
			onSubmit(value) {
				const n = Num.parse(value);
				if (Number.isNaN(n)) return ui.tryAgain("Type a number, like 12 or 4.50");
				if (Num.same(n, q.answer)) {
					input.classList.add("field-correct");
					return ui.correct();
				}
				input.classList.add("field-wrong");
				ui.wrong({ typed: value, answer: Num.answerText(q), note: q.explain });
			}
		});
		if (q.suffix) form.querySelector(".answer-field").append(Widgets.el(
			`<span class="mini-note" style="align-self:center;margin:0 0 0 10px;">${Widgets.esc(q.suffix)}</span>`));
		area.append(form);
		Widgets.focus(input);
	},

	/* The answer as plain text ("$4.50", "8 °C"); answerText escapes it for HTML. */
	answerPlain(q) {
		const v = q.prefix === "$" ? Num.money(q.answer) : Num.fmt(q.answer);
		return v + (q.suffix ? " " + q.suffix : "");
	},

	answerText(q) { return Widgets.esc(Num.answerPlain(q)); }
};
