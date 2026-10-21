/* ============================================================
   Money & Shopping: NZ coins and notes, adding up, change, cash
   rounding, best buys, specials, pay and GST.
   Every question is generated from the price list below.
   Amounts are worked in whole cents so 0.1 + 0.2 never bites.
   `s` is progress through the level (0-4).
   Runs on game-engine.js + numeracy.js.
   ============================================================ */

(function () {
	const { int, pick, shuffle } = Rand;
	const esc = Widgets.esc;
	const $ = cents => Num.money(cents / 100);

	/* Everyday NZ prices, in cents. Rough supermarket/dairy prices. */
	const ITEMS = [
		["2 L milk", 450], ["loaf of bread", 320], ["dozen eggs", 890], ["500 g butter", 680],
		["box of cereal", 550], ["1 kg bananas", 390], ["1 kg apples", 420], ["1 kg kiwifruit", 360],
		["bag of feijoas", 400], ["1 kg kūmara", 480], ["1 kg onions", 280], ["block of cheese", 1250],
		["500 g mince", 900], ["pack of sausages", 750], ["tin of spaghetti", 160], ["mince pie", 550],
		["flat white", 520], ["fish and chips", 1200], ["bottle of fizzy", 300], ["chocolate fish", 120],
		["2 L ice cream", 750], ["toilet paper (12 pack)", 850], ["dishwashing liquid", 420], ["bag of rice", 380],
		["pair of jandals", 900], ["bag of carrots", 290], ["can of tuna", 250], ["packet of biscuits", 330]
	];

	/* Things that read well as "a ___ is $X each". */
	const DEAL_ITEMS = [
		["loaf of bread", 320], ["tin of spaghetti", 160], ["chocolate fish", 120], ["can of tuna", 250],
		["packet of biscuits", 330], ["bottle of fizzy", 300], ["bag of rice", 380], ["mince pie", 550]
	];

	const COINS = [10, 20, 50, 100, 200];
	const NOTES = [500, 1000, 2000, 5000, 10000];

	/* ---------- Pictures ---------- */

	function moneyPiece(c) {
		const label = c < 100 ? `${c}c` : `$${c / 100}`;
		if (c >= 500) return `<span class="note n${c / 100}" role="img" aria-label="${label} note">${label}</span>`;
		const cls = { 10: "c10", 20: "c20 silver", 50: "c50 silver", 100: "d1 gold", 200: "d2 gold" }[c];
		return `<span class="coin ${cls}" role="img" aria-label="${label} coin">${label}</span>`;
	}

	function receipt(lines, total) {
		return `<div class="receipt">
			${lines.map(([name, c]) => `<div class="receipt-row"><span>${esc(name)}</span><span>${$(c)}</span></div>`).join("")}
			${total != null ? `<div class="receipt-row total"><span>TOTAL</span><span>${$(total)}</span></div>` : ""}
		</div>`;
	}

	const items = (n, wholeDollars) => shuffle(ITEMS).slice(0, n).map(([name, c]) =>
		[name, wholeDollars ? Math.max(100, Math.round(c / 100) * 100) : c]);
	const sum = lines => lines.reduce((t, [, c]) => t + c, 0);

	/* A money question with a $ box. Answer given in cents. */
	const ask = (text, cents, explain, html = "") =>
		({ id: text + html, text, html, answer: cents / 100, prefix: "$", explain });

	/* ---------- Levels ---------- */

	const LEVELS = [
		{
			name: "Coins & notes", blurb: "Count up NZ money",
			make: [s => {
				const pool = [COINS.slice(0, 3), COINS, COINS.concat([500]), COINS.concat([500, 1000, 2000]), COINS.concat(NOTES.slice(0, 4))][s];
				const n = [2, 3, 4, 5, 6][s] + int(0, 1);
				const pieces = Array.from({ length: n }, () => pick(pool)).sort((a, b) => b - a);
				const total = pieces.reduce((t, c) => t + c, 0);
				return ask("How much money is here?", total,
					`Start with the biggest: ${pieces.map(c => c < 100 ? `${c}c` : `$${c / 100}`).join(" + ")} = ${$(total)}.`,
					`<div class="money-tray">${pieces.map(moneyPiece).join("")}</div>`);
			}]
		},
		{
			name: "Adding up", blurb: "What does the shopping cost?",
			make: [s => {
				const lines = items(s < 2 ? 2 : 3, s < 1);
				const total = sum(lines);
				return ask("What's the total?", total,
					`Add the dollars, then the cents: ${lines.map(([, c]) => $(c)).join(" + ")} = ${$(total)}.`,
					receipt(lines));
			}]
		},
		{
			name: "Change", blurb: "Paying and getting change",
			make: [s => {
				const lines = items(s < 2 ? 1 : int(2, 3), false);
				const total = sum(lines);
				const note = NOTES.find(n => n > total && n >= [1000, 2000, 2000, 5000, 5000][s]) || 10000;
				return ask(`You pay with a ${$(note)} note. How much change do you get?`, note - total,
					`Count up from ${$(total)} to ${$(note)}, or take away: ${$(note)} − ${$(total)} = ${$(note - total)}.`,
					receipt(lines, total));
			}]
		},
		{
			name: "Cash & budgets", blurb: "Cash rounding and what's left",
			make: [
				() => {
					let t;
					do { t = int(300, 4999); } while (t % 10 === 0 || t % 10 === 5);
					const r = Math.round(t / 10) * 10;
					return ask(`Your total is ${$(t)}. You pay with cash. NZ has no 1c or 5c coins, so it's rounded to the nearest 10c. What do you pay?`, r,
						`${t % 10} cents ${t % 10 < 5 ? "is less than 5, so round down" : "is more than 5, so round up"}: ${$(t)} → ${$(r)}. (Card payments aren't rounded.)`);
				},
				s => {
					const budget = pick([5000, 8000, 10000, 15000, 20000]);
					const spent = int(Math.round(budget * 0.4), budget - 300);
					return ask(`Your grocery budget this week is ${$(budget)}. You've spent ${$(spent)} so far. How much is left?`, budget - spent,
						`${$(budget)} − ${$(spent)} = ${$(budget - spent)}.`);
				},
				s => {
					const lines = items(3, false), total = sum(lines);
					let have = Math.floor(total / 500) * 500 - (s > 2 ? 500 : 0);
					if (have >= total) have -= 500;          // always a little short
					have = Math.max(500, have);
					if (have >= total) have = total - int(1, 9) * 10;
					return ask(`You have ${$(have)} in your wallet. How much more do you need to buy all of this?`, total - have,
						`The total is ${$(total)}. ${$(total)} − ${$(have)} = ${$(total - have)} more.`, receipt(lines, total));
				}
			]
		},
		{
			name: "Best buy", blurb: "Compare prices to find the best value",
			make: [
				() => {
					const [unit, small, big] = pick([["kg", [500, "500 g"], [1000, "1 kg"]], ["L", [1000, "1 L"], [2000, "2 L"]], ["kg", [250, "250 g"], [1000, "1 kg"]]]);
					const product = unit === "kg" ? pick(["coffee", "cheese", "rice", "flour", "mince"]) : pick(["milk", "orange juice", "yoghurt"]);
					const smallPrice = int(15, 60) * 10;
					const ratio = big[0] / small[0];
					const bigPrice = smallPrice * ratio + pick([-1, 1]) * int(2, 8) * 10;
					const per = (p, size) => p / (size / 1000);   // cents per kg or L
					const bestIsBig = per(bigPrice, big[0]) < per(smallPrice, small[0]);
					const text = `Which ${product} is better value?`;
					return {
						id: text + smallPrice + bigPrice, text, kind: "choice",
						options: [
							{ value: "small", html: `${small[1]} for ${$(smallPrice)}` },
							{ value: "big", html: `${big[1]} for ${$(bigPrice)}` }
						],
						answer: bestIsBig ? "big" : "small",
						answerLabel: bestIsBig ? `${big[1]} for ${$(bigPrice)}` : `${small[1]} for ${$(smallPrice)}`,
						explain: `Compare the price per ${unit}: ${small[1]} works out at ${$(per(smallPrice, small[0]))} per ${unit}, ${big[1]} at ${$(per(bigPrice, big[0]))} per ${unit}.${bestIsBig ? "" : " Bigger isn't always cheaper!"}`
					};
				},
				() => {
					const kg = pick([2, 3, 4, 5]), per = int(15, 60) * 10;
					const product = pick(["potatoes", "oranges", "onions", "carrots", "apples"]);
					return ask(`A ${kg} kg bag of ${product} costs ${$(kg * per)}. What's the price per kg?`, per,
						`Divide the price by the weight: ${$(kg * per)} ÷ ${kg} = ${$(per)} per kg.`);
				}
			]
		},
		{
			name: "Specials", blurb: "Percent off and multi-buy deals",
			make: [
				s => {
					const pct = pick(s < 2 ? [50, 10, 25] : [20, 30, 15, 40]);
					const price = pick([2000, 2400, 3000, 4000, 4800, 6000, 8000, 12000]);
					const off = price * pct / 100;
					const thing = pick(["jacket", "pair of shoes", "rugby jersey", "lunchbox", "frying pan", "backpack"]);
					return ask(`A ${thing} is ${$(price)}, with ${pct}% off. What do you pay?`, price - off,
						`${pct}% of ${$(price)} is ${$(off)}. Take it off: ${$(price)} − ${$(off)} = ${$(price - off)}.`);
				},
				() => {
					const [name, each] = pick(DEAL_ITEMS);
					const n = pick([2, 3, 4]);
					const deal = Math.floor((each * n * 0.85) / 10) * 10;
					return ask(`A ${name} is ${$(each)} each, or ${n} for ${$(deal)}. How much do you save buying ${n} on the deal?`, each * n - deal,
						`${n} at ${$(each)} each costs ${$(each * n)}. The deal is ${$(deal)}. You save ${$(each * n)} − ${$(deal)} = ${$(each * n - deal)}.`);
				}
			]
		},
		{
			name: "Pay & GST", blurb: "Wages, GST and yearly costs",
			make: [
				s => {
					const rate = pick([2400, 2500, 2550, 2800, 3000, 3250]);
					const hours = pick(s < 2 ? [10, 20, 30, 40] : [15, 25, 32, 37, 38]);
					return ask(`You earn ${$(rate)} an hour and work ${hours} hours this week. What's your pay before tax?`, rate * hours,
						`Hours × rate: ${hours} × ${$(rate)} = ${$(rate * hours)}.`);
				},
				() => {
					const ex = pick([2000, 4000, 6000, 8000, 12000, 20000]);
					const gst = ex * 0.15;
					return ask(`A price is ${$(ex)} plus GST. GST is 15%. What's the price including GST?`, ex + gst,
						`10% of ${$(ex)} is ${$(ex / 10)}, 5% is ${$(ex / 20)}, so GST is ${$(gst)}. ${$(ex)} + ${$(gst)} = ${$(ex + gst)}.`);
				},
				() => {
					const inc = pick([2300, 4600, 6900, 9200, 11500, 23000]);
					const gst = inc * 3 / 23;
					return ask(`A receipt says ${$(inc)} including GST. How much of that is GST?`, gst,
						`GST is 3/23 of a GST-inclusive price: ${$(inc)} ÷ 23 = ${$(inc / 23)}, × 3 = ${$(gst)}. (Not 15% of ${$(inc)}, because the GST is already in it.)`);
				},
				() => {
					const [label, per] = pick([["week", 52], ["fortnight", 26], ["month", 12]]);
					const cost = pick([1500, 2500, 4000, 6000, 12000, 15000]);
					const what = pick(["phone plan", "power bill", "car insurance", "gym membership", "internet"]);
					return ask(`Your ${what} costs ${$(cost)} a ${label}. How much is that a year?`, cost * per,
						`There are ${per} ${label}s in a year: ${$(cost)} × ${per} = ${$(cost * per)}.`);
				}
			]
		}
	];

	/* Best-buy questions are a choice; everything else is a $ box. */
	function render(q, area, ui) {
		if (q.kind !== "choice") return Num.render(q, area, ui);
		const head = Widgets.el(`<div class="question-text"><span>${esc(q.text)}</span></div>`);
		head.append(Widgets.speakButton({
			label: "Read it", text: `${q.text} ${q.options.map(o => o.html).join(", or ")}`
		}));
		const opts = Widgets.choices(q.options, (value, btn) => {
			if (value === q.answer) {
				btn.classList.add("correct");
				ui.correct({ note: esc(q.explain) });
			} else {
				btn.classList.add("wrong");
				ui.wrong({ typed: btn.textContent, answer: esc(q.answerLabel), note: esc(q.explain) });
			}
		});
		opts.classList.add("compare");
		area.append(head, opts);
	}

	LevelGame.create({
		mount: "game",
		recordsEl: "records",
		storageKey: "money-shopping-v1",
		noun: ["question", "questions"],
		levels: LEVELS,
		tip: "Type just the amount, like 4.50.",
		next: (level, step, { used }) => Num.fresh(() => pick(LEVELS[level - 1].make)(step), used),
		render,
		explain: q => q.kind === "choice"
			? { answer: esc(q.answerLabel), note: esc(q.explain) }
			: { answer: Num.answerText(q), note: q.explain },
		reviewItem: (q, typed) => ({
			label: `${q.text} → ${q.kind === "choice" ? q.answerLabel : Num.answerPlain(q)}`, typed
		})
	});
})();
