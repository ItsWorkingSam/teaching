/* Shared page controller: topic metadata drives both navigation and games. */
(() => {
    const esc = Widgets.esc;
    const grid = document.getElementById('maths-topics');
    if (grid) {
        grid.innerHTML = Object.entries(MathsTopics).map(([key, t]) => `
            <a class="exercise-card" href="maths-activity.html?topic=${key}">
                <span class="ex-icon"><i class="ph-bold ${t.icon}" aria-hidden="true"></i></span>
                <h2>${esc(t.title)}</h2><p>${esc(t.description)}</p>
                <span class="go">4 levels · Choose a level <i class="ph-bold ph-arrow-right" aria-hidden="true"></i></span>
            </a>`).join('');
        return;
    }
    const key = new URLSearchParams(location.search).get('topic');
    const topic = Object.hasOwn(MathsTopics, key) ? MathsTopics[key] : null;
    if (!topic) {
        document.getElementById('game').innerHTML = '<p class="source-area">Choose an activity from <a href="maths.html">Visual Maths</a> to get started.</p>';
        return;
    }
    document.title = `${topic.title} · Visual Maths`;
    document.getElementById('topic-title').textContent = topic.title;
    document.getElementById('topic-description').textContent = topic.description;
    document.getElementById('topic-hint').textContent = topic.hint;
    const answerText = q => `${q.answer}${q.unit ? ' ' + q.unit : ''}`;
    LevelGame.create({
        fixedPractice: true,
        mount: 'game', recordsEl: 'records', storageKey: `visual-maths-${key}-v1`,
        levels: topic.levels, tip: 'Take your time. Use the hint or choose “I don’t know” for an explanation.',
        next(level, step, { used }) {
            let q;
            for (let i = 0; i < 40; i++) { q = topic.make(level); if (!used.has(q.id)) break; }
            return q;
        },
        render(q, area, ui) {
            area.innerHTML = `<p class="question-text">${esc(q.prompt)}</p>
                <figure class="maths-visual">${q.diagram}${q.caption ? `<figcaption class="maths-caption">${esc(q.caption)}</figcaption>` : ''}</figure>
                <details class="maths-help"><summary>Show a hint</summary><p>${esc(topic.hint)}</p></details>`;
            const submit = (value, control) => {
                if (ui.answered()) return;
                const correct = q.choices ? value === String(q.answer) : Math.abs(Number(value) - q.answer) < 1e-8;
                control.classList.add(correct ? 'correct' : 'wrong');
                if (correct) ui.correct({ answer: esc(answerText(q)), note: q.explain });
                else ui.wrong({ typed: value });
            };
            if (q.choices) {
                const options = Widgets.choices(q.choices.map(value => ({ label: value, value })), submit, { columns: 2 });
                area.append(options);
                Widgets.focus(options.querySelector('button'));
            } else {
                const { form, input } = Widgets.answerForm({
                    label: q.unit ? `Your answer in ${q.unit}` : 'Your answer',
                    placeholder: q.unit ? `Answer in ${q.unit}` : 'Type a number',
                    inputmode: key === 'number-lines' ? 'text' : 'decimal',
                    onSubmit(value, input) {
                        const normal = value.replace(/−/g, '-');
                        if (!/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normal)) { ui.tryAgain('Enter a number only, such as 4 or 0.5. The unit is already shown.'); return; }
                        submit(normal, input);
                    }
                });
                if (q.unit) area.insertAdjacentHTML('beforeend', `<p class="mini-note">Give your answer in ${esc(q.unit)}.</p>`);
                area.append(form);
                Widgets.focus(input);
            }
        },
        explain: q => ({ answer: esc(answerText(q)), note: q.explain }),
        reviewItem: (q, typed) => ({ label: `${q.review} → ${answerText(q)}`, typed })
    });
    document.querySelector('[data-screen="summary"] a').href = 'maths.html';
})();
