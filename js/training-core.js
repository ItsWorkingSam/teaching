/* ============================================================
   Training core — shared step engine, feedback, theme, speech
   ============================================================ */

let TRAINING = {
	currentStep: 0,
	steps: [],
	hints: []
};

function initTraining(config) {
	TRAINING.steps = config.steps;
	TRAINING.hints = config.hints || [];
	TRAINING.currentStep = 0;

	updateUI();
}

function nextStep() {
	const s = TRAINING;

	const cur = document.getElementById(s.steps[s.currentStep].id);
	if (cur) cur.classList.remove("active");

	s.currentStep++;
	window.currentStep = s.currentStep;

	if (s.currentStep < s.steps.length) {
		const el = document.getElementById(s.steps[s.currentStep].id);
		if (el) el.classList.add("active");
		updateUI();
	} else {
		finishTraining();
	}
}

function updateUI() {
	const s = TRAINING;

	const percent = (s.currentStep / s.steps.length) * 100;

	const fill = document.getElementById("progress-fill");
	if (fill) fill.style.width = percent + "%";

	const indicator = document.getElementById("level-indicator");
	if (indicator) {
		indicator.innerText = `Activity ${s.currentStep + 1} of ${s.steps.length}`;
	}

	const hint = document.getElementById("hint-text");
	if (hint) hint.innerText = s.hints[s.currentStep] || "";
}

function finishTraining() {
	const fill = document.getElementById("progress-fill");
	if (fill) fill.style.width = "100%";

	const hintBox = document.querySelector(".hint-box");
	if (hintBox) hintBox.style.display = "none";

	const wrapperCards = document.querySelectorAll(".step-card");
	wrapperCards.forEach(c => c.classList.remove("active"));

	const success = document.getElementById("success-screen");
	if (success) success.style.display = "block";
}

/* ------------------------------------------------------------
   Feedback toast
   ------------------------------------------------------------ */

let _toastTimer = null;

function ensureToast() {
	let t = document.getElementById("toast");
	if (!t) {
		t = document.createElement("div");
		t.id = "toast";
		document.body.appendChild(t);
	}
	return t;
}

const _toastIcons = {
	success: "ph-check-circle",
	error: "ph-x-circle",
	info: "ph-info"
};

function showToast(message, type = "success", duration = 1400) {
	const t = ensureToast();
	t.className = "";
	t.classList.add(type);
	const icon = _toastIcons[type] || _toastIcons.info;
	t.innerHTML = `<i class="ph-bold ${icon}"></i><span>${message}</span>`;

	// force reflow so the transition replays
	void t.offsetWidth;
	t.classList.add("show");

	clearTimeout(_toastTimer);
	_toastTimer = setTimeout(() => t.classList.remove("show"), duration);
}

/* Writes to the inline #status-display area (used by mouse.html) */
function showFeedback(message, type = "error") {
	const el = document.getElementById("status-display");
	if (el) {
		el.style.color = type === "error" ? "var(--error)" : "var(--muted)";
		el.innerText = message;
		clearTimeout(el._t);
		el._t = setTimeout(() => { el.innerText = ""; }, 2200);
	}
	if (type === "error") showToast(message, "error");
}

/* Show a "Correct!" toast, then advance. Guarded against double-fire. */
let _advancing = false;

function flashCorrect(message = "Correct!", callback, delay = 850) {
	if (_advancing) return;
	_advancing = true;
	showToast(message, "success", Math.max(900, delay));
	setTimeout(() => {
		_advancing = false;
		(callback || nextStep)();
	}, delay);
}

/* ------------------------------------------------------------
   Theme
   ------------------------------------------------------------ */

const THEME_KEY = "theme-preference";

/* localStorage throws in some privacy modes and when site data is blocked.
   Every page loads this file first, so one throw here would break them all. */
const Store = {
	get(key) {
		try { return localStorage.getItem(key); } catch (e) { return null; }
	},
	set(key, value) {
		try { localStorage.setItem(key, value); } catch (e) { /* not saved, still works */ }
	},
	getJSON(key, fallback) {
		try { return JSON.parse(this.get(key)) || fallback; } catch (e) { return fallback; }
	},
	setJSON(key, value) {
		this.set(key, JSON.stringify(value));
	}
};

function getThemePreference() {
	const saved = Store.get(THEME_KEY);
	if (saved) return saved;
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
	document.documentElement.setAttribute("data-theme", theme);
	Store.set(THEME_KEY, theme);
	const icon = document.querySelector("#theme-toggle i");
	if (icon) {
		icon.className = theme === "dark" ? "ph-bold ph-sun" : "ph-bold ph-moon";
	}
}

function initTheme() {
	applyTheme(getThemePreference());
	const toggle = document.getElementById("theme-toggle");
	if (toggle) {
		toggle.addEventListener("click", () => {
			const current = document.documentElement.getAttribute("data-theme");
			applyTheme(current === "dark" ? "light" : "dark");
		});
	}
}

// Apply theme as early as possible to avoid a flash.
applyTheme(getThemePreference());
document.addEventListener("DOMContentLoaded", initTheme);

/* ------------------------------------------------------------
   Text to speech (Web Speech API)
   ------------------------------------------------------------ */

const Speech = {
	voice: null,
	_current: null,

	pickVoice() {
		const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
		if (!voices.length) return null;
		// NZ/GB/AU/US English in that order. Within each, prefer the
		// higher-quality "Natural"/"Online"/Google voices over the robotic
		// built-in ones (Edge and Chrome both ship these).
		const order = ["en-NZ", "en-GB", "en-AU", "en-US", "en"];
		const quality = v => /natural|online|neural|google|premium|enhanced/i.test(v.name) ? 0 : 1;
		for (const pref of order) {
			const matches = voices
				.filter(v => v.lang && v.lang.replace("_", "-").toLowerCase().startsWith(pref.toLowerCase()))
				.sort((a, b) => quality(a) - quality(b));
			if (matches.length) return matches[0];
		}
		return voices[0];
	},

	supported() {
		return typeof window !== "undefined" && "speechSynthesis" in window;
	},

	say(text, opts = {}) {
		if (!this.supported()) return false;
		window.speechSynthesis.cancel();
		const u = new SpeechSynthesisUtterance(text);
		if (!this.voice) this.voice = this.pickVoice();
		if (this.voice) u.voice = this.voice;
		u.lang = (this.voice && this.voice.lang) || "en-GB";
		u.rate = opts.rate != null ? opts.rate : 0.9;
		u.pitch = opts.pitch != null ? opts.pitch : 1;
		if (opts.onstart) u.onstart = opts.onstart;
		// Chrome can drop onend if the utterance is garbage collected, and
		// skips it entirely when cancelled, so hold a reference and treat
		// errors as an end too.
		if (opts.onend) {
			let done = false;
			const end = () => { if (!done) { done = true; opts.onend(); } };
			u.onend = end;
			u.onerror = end;
		}
		this._current = u;
		window.speechSynthesis.speak(u);
		return true;
	}
};

// Voices load asynchronously in most browsers.
if (typeof window !== "undefined" && "speechSynthesis" in window) {
	window.speechSynthesis.onvoiceschanged = () => { Speech.voice = Speech.pickVoice(); };
}
