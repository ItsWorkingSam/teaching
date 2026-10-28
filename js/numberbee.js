/* ============================================================
   Number Bee: mental maths that climbs from adding within 20 to
   percentages, GST and order of operations.
   Every question is generated, so it never runs out.
   `s` is progress through the level (0-4): numbers grow with it.
   Runs on game-engine.js + numeracy.js.
   ============================================================ */

(function () {
	const { int, pick } = Rand;
	const f = Num.fmt;

	/* q(big, answer, explain, extra) builds a standard question. */
	const q = (big, answer, explain, extra = {}) => Object.assign({ id: big, big, answer, explain }, extra);

	const add = (a, b, why) => q(`${f(a)} + ${f(b)} = ?`, a + b, why);
	const sub = (a, b, why) => q(`${f(a)} − ${f(b)} = ?`, a - b, why);
	const mul = (a, b, why) => q(`${f(a)} × ${f(b)} = ?`, a * b, why);
	const div = (a, b, why) => q(`${f(a * b)} ÷ ${f(a)} = ?`, b, why);

	const LEVELS = [
		{
			name: "Starter", blurb: "Adding and taking away to 20",
			make: [
				s => { const a = int(1, 5 + s), b = int(1, 5 + s); return add(a, b, `Start at ${Math.max(a, b)} and count on ${Math.min(a, b)}.`); },
				s => { const a = int(6, 10 + s * 2), b = int(1, a - 1); return sub(a, b, `Start at ${a} and count back ${b}.`); },
				() => { const b = int(1, 9); return q(`${b} + ? = 10`, 10 - b, `${b} and ${10 - b} make 10. Pairs that make 10 are worth learning by heart.`); },
				s => { const a = int(2, 5 + s); return q(`Double ${a}`, a * 2, `Double means add it to itself: ${a} + ${a} = ${a * 2}.`, { say: `What is double ${a}?` }); }
			]
		},
		{
			name: "Everyday", blurb: "To 100, and the 2, 5 and 10 times tables",
			make: [
				s => { const a = int(11, 40 + s * 10), b = int(2, s < 2 ? 9 : 39); return add(a, b, `Add the tens, then the ones: ${a} + ${b} = ${a + b}.`); },
				s => { const a = int(20, 60 + s * 8), b = int(2, s < 2 ? 9 : a - 5); return sub(a, b, `Take away the tens first, then the ones. ${a} − ${b} = ${a - b}.`); },
				() => { const t = pick([2, 5, 10]), b = int(1, 10); return mul(t, b, `Count in ${t}s ${b} times: ${t * b}.`); },
				s => { const a = int(5, 20 + s * 5) * 2; return q(`Half of ${a}`, a / 2, `Half means share into 2 equal parts: ${a} ÷ 2 = ${a / 2}.`); }
			]
		},
		{
			name: "Times tables", blurb: "All the tables, and sharing",
			make: [
				s => { const t = pick(s < 2 ? [3, 4, 5, 10] : [6, 7, 8, 9, 11, 12]), b = int(2, 12); return mul(t, b, `${t} × ${b} = ${t * b}. Tip: ${t} × ${b} is the same as ${b} × ${t}.`); },
				s => { const t = pick(s < 2 ? [2, 3, 4, 5] : [6, 7, 8, 9]), b = int(2, 10); return div(t, b, `Think: what times ${t} makes ${t * b}? ${t} × ${b} = ${t * b}, so the answer is ${b}.`); },
				() => { const t = int(3, 9), b = int(3, 9); return q(`${t} × ? = ${t * b}`, b, `${t} × ${b} = ${t * b}.`); }
			]
		},
		{
			name: "Bigger numbers", blurb: "Hundreds, ×10 and rounding",
			make: [
				s => { const a = int(100, 400 + s * 100), b = int(50, 300 + s * 60); return add(a, b, `Add hundreds, then tens, then ones: ${a} + ${b} = ${a + b}.`); },
				s => { const a = int(300, 600 + s * 80), b = int(40, a - 100); return sub(a, b, `Check by adding back: ${a - b} + ${b} = ${a}.`); },
				s => { const a = int(12, 25 + s * 15), b = int(3, 9); return mul(a, b, `Split it up: ${Math.floor(a / 10) * 10} × ${b} = ${Math.floor(a / 10) * 10 * b}, plus ${a % 10} × ${b} = ${(a % 10) * b}. Total ${a * b}.`); },
				() => { const a = int(3, 95), m = pick([10, 100]); return q(`${a} × ${m} = ?`, a * m, `Multiplying by ${m} moves every digit ${m === 10 ? "one place" : "two places"} to the left: ${f(a * m)}.`); },
				s => {
					const to = s < 2 ? 10 : pick([10, 100]);
					const a = int(to === 10 ? 11 : 101, to === 10 ? 99 : 999);
					const r = Math.round(a / to) * to;
					return q(`Round ${a} to the nearest ${to}`, r, `Look at the ${to === 10 ? "ones" : "tens"} digit: 5 or more rounds up, 4 or less rounds down. ${a} → ${r}.`);
				}
			]
		},
		{
			name: "Fractions & decimals", blurb: "Parts of amounts and decimals",
			make: [
				s => {
					const [sym, top, bot] = pick(s < 2 ? [["½", 1, 2], ["¼", 1, 4], ["⅒", 1, 10]] : [["⅓", 1, 3], ["¾", 3, 4], ["⅕", 1, 5], ["⅔", 2, 3]]);
					const unit = int(2, 12 + s * 3), whole = unit * bot;
					return q(`${sym} of ${whole} = ?`, unit * top,
						`Divide by the bottom number, times by the top: ${whole} ÷ ${bot} = ${unit}${top > 1 ? `, then × ${top} = ${unit * top}` : ""}.`);
				},
				s => {
					const dp = s < 2 ? 1 : 2, k = 10 ** dp;
					const a = int(10, 90) / (dp === 1 ? 10 : 20), b = int(5, 60) / (dp === 1 ? 10 : 20);
					const ans = Math.round((a + b) * k) / k;
					return q(`${f(a)} + ${f(b)} = ?`, ans, `Line up the decimal points and add: ${f(a)} + ${f(b)} = ${f(ans)}.`);
				},
				() => { const a = int(25, 99) / 10; return q(`${f(a)} − 1.5 = ?`, Math.round((a - 1.5) * 10) / 10, `Take away 1, then 0.5: ${f(a)} − 1.5 = ${f(Math.round((a - 1.5) * 10) / 10)}.`); },
				() => { const a = int(12, 99) / 10, m = pick([10, 100]); return q(`${f(a)} × ${m} = ?`, Math.round(a * m), `× ${m} moves the digits ${m === 10 ? "one place" : "two places"} left: ${f(Math.round(a * m))}.`); }
			]
		},
		{
			name: "Percentages", blurb: "Percent of amounts, negatives, squares",
			make: [
				s => {
					const p = pick(s < 2 ? [10, 50, 25] : [20, 5, 15, 75, 30]);
					const base = pick([20, 40, 60, 80, 120, 200, 240, 300, 400]);
					const ans = base * p / 100;
					const how = {
						10: `10% is one tenth: ${base} ÷ 10 = ${f(ans)}.`,
						50: `50% is half: ${base} ÷ 2 = ${f(ans)}.`,
						25: `25% is a quarter: ${base} ÷ 4 = ${f(ans)}.`,
						20: `Find 10% (${f(base / 10)}) and double it: ${f(ans)}.`,
						5: `Find 10% (${f(base / 10)}) and halve it: ${f(ans)}.`,
						15: `10% is ${f(base / 10)}, 5% is ${f(base / 20)}. Add them: ${f(ans)}.`,
						75: `25% is ${f(base / 4)}. Three lots of that: ${f(ans)}.`,
						30: `10% is ${f(base / 10)}. Three lots of that: ${f(ans)}.`
					}[p];
					return q(`${p}% of ${base} = ?`, ans, how);
				},
				() => {
					const place = pick(["Queenstown", "Tekapo", "Ohakune", "Twizel", "Ranfurly"]);
					const start = -int(1, 8), rise = int(4, 15), end = start + rise;
					const text = `It's ${f(start)}°C in ${place} at 6 am. By midday it's ${rise} degrees warmer. What's the temperature now?`;
					return { id: text, text, answer: end, suffix: "°C",
						explain: `Count up from ${f(start)}: ${rise} degrees warmer is ${f(end)}°C. Getting to 0 uses up ${-start} of the ${rise} degrees.` };
				},
				() => { const a = int(3, 15); return q(`${a}² = ?`, a * a, `${a}² means ${a} × ${a} = ${a * a}.`, { say: `What is ${a} squared?` }); },
				() => { const a = int(-9, -1), b = int(2, 9); return sub(a, b, `Start at ${f(a)} and go ${b} further below zero: ${f(a - b)}.`); }
			]
		},
		{
			name: "Champion", blurb: "GST, ratios and order of operations",
			make: [
				() => {
					const p = pick([10, 20, 25, 15]), base = pick([40, 60, 80, 120, 200]);
					const up = Rand.int(0, 1) === 1;
					const ans = up ? base * (1 + p / 100) : base * (1 - p / 100);
					const text = `A $${base} price goes ${up ? "up" : "down"} by ${p}%. What's the new price?`;
					return { id: text, text, answer: ans, prefix: "$",
						explain: `${p}% of $${base} is $${f(base * p / 100)}. ${up ? "Add it on" : "Take it off"}: ${Num.money(ans)}.` };
				},
				() => {
					const ex = pick([20, 40, 60, 80, 100, 120, 200]);
					const text = `A tradie quotes $${ex} plus GST. GST in New Zealand is 15%. What's the total?`;
					return { id: text, text, answer: ex * 1.15, prefix: "$",
						explain: `15% of $${ex}: 10% is $${f(ex / 10)}, 5% is $${f(ex / 20)}, so GST is ${Num.money(ex * 0.15)}. Total ${Num.money(ex * 1.15)}.` };
				},
				() => {
					const [a, b] = pick([[2, 1], [3, 1], [3, 2], [1, 4], [2, 3]]);
					const part = int(4, 15), total = (a + b) * part;
					const text = `Mere and Sam share $${total} in the ratio ${a}:${b}. How much does Mere get?`;
					return { id: text, text, answer: a * part, prefix: "$",
						explain: `${a} + ${b} = ${a + b} parts. One part is $${total} ÷ ${a + b} = $${part}. Mere gets ${a} parts: $${a * part}.` };
				},
				() => {
					const a = int(2, 9), b = int(2, 6), c = int(2, 6);
					return q(`${a} + ${b} × ${c} = ?`, a + b * c, `Multiply before you add: ${b} × ${c} = ${b * c}, then ${a} + ${b * c} = ${a + b * c}.`);
				},
				() => {
					const a = int(2, 6), b = int(2, 6), c = int(1, a * b - 1);
					return q(`(${a} × ${b}) − ${c} = ?`, a * b - c, `Brackets first: ${a} × ${b} = ${a * b}, then − ${c} = ${a * b - c}.`);
				},
				() => { const a = int(4, 15); return q(`√${a * a} = ?`, a, `The square root asks: what times itself makes ${a * a}? ${a} × ${a} = ${a * a}.`, { say: `What is the square root of ${a * a}?` }); }
			]
		}
	];

	LevelGame.create({
		fixedPractice: true,
		mount: "game",
		recordsEl: "records",
		storageKey: "number-bee-v1",
		noun: ["question", "questions"],
		levels: LEVELS,
		tip: "Press Enter to check.",
		next: (level, step, { used }) => Num.fresh(() => pick(LEVELS[level - 1].make)(step), used),
		render: Num.render,
		explain: item => ({ answer: Num.answerText(item), note: item.explain }),
		reviewItem: (item, typed) => ({ label: `${item.big || item.text}  →  ${Num.answerPlain(item)}`, typed })
	});
})();
