let TRAINING = {
	currentStep: 0,
	steps: [],
	hints: []
};

function initTraining(config) {
	TRAINING.steps = config.steps;
	TRAINING.hints = config.hints;
	TRAINING.currentStep = 0;

	updateUI();
}

function nextStep() {
	const s = TRAINING;

	document.getElementById(s.steps[s.currentStep].id)
		.classList.remove("active");

	s.currentStep++;

	if (s.currentStep < s.steps.length) {
		document.getElementById(s.steps[s.currentStep].id)
			.classList.add("active");

		updateUI();
	} else {
		finishTraining();
	}
}

function updateUI() {
	const s = TRAINING;

	const percent =
		(s.currentStep / s.steps.length) * 100;

	document.getElementById("progress-fill").style.width =
		percent + "%";

	const indicator = document.getElementById("level-indicator");
	if (indicator) {
		indicator.innerText =
			`Activity ${s.currentStep + 1} of ${s.steps.length}`;
	}

	const hint = document.getElementById("hint-text");
	if (hint) {
		hint.innerText = s.hints[s.currentStep] || "";
	}
}

function finishTraining() {
	document.getElementById("progress-fill").style.width = "100%";

	const hintBox = document.querySelector(".hint-box");
	if (hintBox) hintBox.style.display = "none";

	const success = document.getElementById("success-screen");
	if (success) success.style.display = "block";
}