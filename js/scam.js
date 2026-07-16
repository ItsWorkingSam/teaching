/* ============================================================
   Spot the Scam engine.
   Expects window.SCAM_SCENARIOS (see scam-scenarios.js).
   Depends on training-core.js (showToast, theme).
   ============================================================ */

const SCENARIOS = window.SCAM_SCENARIOS || [];

let si = 0;
let score = 0;
let answered = false;
let card;

function updateProgress() {
	document.getElementById("progress-fill").style.width =
		(si / SCENARIOS.length) * 100 + "%";
	document.getElementById("level-indicator").innerText =
		`Message ${si + 1} of ${SCENARIOS.length}`;
}

/* ---------- Message rendering ---------- */

function esc(s) {
	return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* Highlight anything that looks like a web address so learners' eyes
   are drawn to it, without making it a working (tappable) link. */
function markUrls(text) {
	return esc(text).replace(
		/((?:https?:\/\/)?[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s]*)?)/gi,
		'<span class="url">$1</span>'
	);
}

function renderMessage(m) {
	if (m.channel === "sms") {
		return `
			<div class="msg msg-sms">
				<div class="msg-head"><i class="ph-bold ph-chat-circle"></i> Text message</div>
				<div class="msg-from">From: <strong>${esc(m.from)}</strong></div>
				<div class="sms-bubble">${markUrls(m.body)}</div>
			</div>`;
	}
	if (m.channel === "email") {
		return `
			<div class="msg msg-email">
				<div class="msg-head"><i class="ph-bold ph-envelope-simple"></i> Email</div>
				<div class="email-head">
					<div class="email-row"><span class="lbl">From</span> <span>${esc(m.fromName)} &lt;<span class="email-addr">${esc(m.fromAddress)}</span>&gt;</span></div>
					<div class="email-row"><span class="lbl">Subject</span> <strong>${esc(m.subject)}</strong></div>
				</div>
				<div class="email-body">${markUrls(m.body)}</div>
			</div>`;
	}
	if (m.channel === "popup") {
		return `
			<div class="msg msg-popup">
				<div class="popup-bar">${esc(m.title)}</div>
				<div class="popup-body">
					<p>${markUrls(m.body)}</p>
					<div class="popup-actions"><span class="popup-btn">${esc(m.button || "OK")}</span></div>
				</div>
			</div>`;
	}
	if (m.channel === "call") {
		const lines = m.lines.map(l => `<div class="call-line">${esc(l)}</div>`).join("");
		return `
			<div class="msg msg-call">
				<div class="msg-head"><i class="ph-bold ph-phone-call"></i> Phone call</div>
				<div class="msg-from">${esc(m.caller)}</div>
				<div class="call-lines">${lines}</div>
			</div>`;
	}
	return "";
}

/* ---------- Load a scenario ---------- */

function loadScenario() {
	const sc = SCENARIOS[si];
	answered = false;
	updateProgress();

	card.classList.remove("active");
	void card.offsetWidth;
	card.innerHTML = renderMessage(sc.message) + builders[sc.type](sc);
	card.classList.add("active");

	wirers[sc.type](sc);
}

const builders = {
	judge() {
		return `
			<p class="ask">Is this a scam, or is it genuine?</p>
			<div class="judge-btns">
				<button class="judge-btn scam" data-choice="scam"><i class="ph-bold ph-warning"></i> It's a scam</button>
				<button class="judge-btn safe" data-choice="safe"><i class="ph-bold ph-shield-check"></i> It's genuine</button>
			</div>
			<div class="reveal-slot"></div>`;
	},
	action(sc) {
		const opts = sc.options.map((o, i) =>
			`<button class="option" data-i="${i}">${esc(o)}</button>`).join("");
		return `
			<p class="ask">${esc(sc.prompt)}</p>
			<div class="options">${opts}</div>
			<div class="reveal-slot"></div>`;
	},
	spot(sc) {
		const opts = sc.candidates.map((c, i) =>
			`<button class="option" data-i="${i}">${c.text}</button>`).join("");
		return `
			<p class="ask">${esc(sc.prompt)}</p>
			<div class="options">${opts}</div>
			<div class="reveal-slot"></div>`;
	}
};

/* ---------- Answer handling ---------- */

const wirers = {
	judge(sc) {
		card.querySelectorAll(".judge-btn").forEach(btn => {
			btn.addEventListener("click", () => {
				if (answered) return;
				answered = true;
				const correct = btn.dataset.choice === sc.verdict;
				if (correct) score++;
				card.querySelectorAll(".judge-btn").forEach(b => {
					b.disabled = true;
					if (b.dataset.choice === sc.verdict) b.classList.add("is-correct");
				});
				if (!correct) btn.classList.add("is-wrong");
				showToast(correct ? "Correct" : "Have a look at why", correct ? "success" : "error", 1300);
				revealJudge(sc, correct);
			});
		});
	},

	action(sc) {
		card.querySelectorAll(".option").forEach(btn => {
			btn.addEventListener("click", () => {
				if (answered) return;
				const i = +btn.dataset.i;
				if (i === sc.answer) {
					answered = true;
					score++;
					btn.classList.add("correct");
					card.querySelectorAll(".option").forEach(b => b.disabled = true);
					showToast("Correct", "success", 1200);
					revealNote(sc.why, "safe");
				} else {
					btn.classList.add("wrong");
					btn.disabled = true;
					showToast("Not the safest choice. Try again", "error", 1500);
				}
			});
		});
	},

	spot(sc) {
		card.querySelectorAll(".option").forEach(btn => {
			btn.addEventListener("click", () => {
				if (answered) return;
				const c = sc.candidates[+btn.dataset.i];
				if (c.correct) {
					answered = true;
					score++;
					btn.classList.add("correct");
					card.querySelectorAll(".option").forEach(b => b.disabled = true);
					showToast("Correct", "success", 1200);
					revealNote(c.note, "safe");
				} else {
					btn.classList.add("wrong");
					btn.disabled = true;
					showToast("Not the main giveaway. Try again", "error", 1600);
					revealNote(c.note, "info", true);
				}
			});
		});
	}
};

/* ---------- Reveal panels ---------- */

function revealJudge(sc, correct) {
	const scam = sc.verdict === "scam";
	const verdictLine = scam
		? `<div class="verdict scam"><i class="ph-bold ph-warning-circle"></i> This one is a scam</div>`
		: `<div class="verdict safe"><i class="ph-bold ph-shield-check"></i> This one is genuine</div>`;

	const flagsTitle = scam ? "Warning signs" : "Why it's genuine";
	const flags = sc.flags.map(f => `<li>${esc(f)}</li>`).join("");

	const html = `
		<div class="reveal ${scam ? "scam" : "safe"}">
			${verdictLine}
			<div class="reveal-sub">${flagsTitle}</div>
			<ul class="flag-list">${flags}</ul>
			<div class="safe-action"><i class="ph-bold ph-lightbulb"></i> <span>${esc(sc.action)}</span></div>
			<button class="btn continue-btn"><i class="ph-bold ph-arrow-right"></i>&nbsp; Next message</button>
		</div>`;
	const slot = card.querySelector(".reveal-slot");
	slot.innerHTML = html;
	slot.querySelector(".continue-btn").addEventListener("click", nextScenario);
	slot.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* Used by action / spot. `transient` shows a note but no Continue (retry). */
function revealNote(text, tone, transient) {
	const slot = card.querySelector(".reveal-slot");
	if (transient) {
		slot.innerHTML = `<div class="reveal ${tone}"><p class="reveal-note">${esc(text)}</p></div>`;
		return;
	}
	slot.innerHTML = `
		<div class="reveal ${tone}">
			<p class="reveal-note"><i class="ph-bold ph-check-circle"></i> ${esc(text)}</p>
			<button class="btn continue-btn"><i class="ph-bold ph-arrow-right"></i>&nbsp; Next message</button>
		</div>`;
	slot.querySelector(".continue-btn").addEventListener("click", nextScenario);
	slot.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* ---------- Flow ---------- */

function nextScenario() {
	si++;
	if (si < SCENARIOS.length) loadScenario();
	else finish();
}

function finish() {
	document.getElementById("progress-fill").style.width = "100%";
	card.classList.remove("active");
	card.style.display = "none";
	document.getElementById("level-indicator").innerText = "Complete";

	const pct = Math.round((score / SCENARIOS.length) * 100);
	let note;
	if (pct >= 85) note = "Excellent. You spotted the warning signs like a pro.";
	else if (pct >= 60) note = "Good work. A quick recap of the golden rules will make you even sharper.";
	else note = "Nice effort. The golden rules below are the key things to remember.";

	document.getElementById("final-score").innerText = `You spotted ${score} of ${SCENARIOS.length} correctly`;
	document.getElementById("final-note").innerText = note;
	document.getElementById("success-screen").style.display = "block";
}

/* ---------- Start ---------- */

function startScam() {
	card = document.getElementById("scenario-card");
	if (!card || !SCENARIOS.length) return;
	loadScenario();
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", startScam);
} else {
	startScam();
}
