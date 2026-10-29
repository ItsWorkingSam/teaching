/* Detective Town UI. The solver and generator live in detective-town-engine.js. */
(() => {
    const L = Lantern, $ = id => document.getElementById(id);
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    const portrait = name => `assets/detective-town/${name.toLowerCase()}.svg`;
    const KEY = 'lantern-circle-v1';
    const saved = Store.getJSON(KEY, {});
    let chosen = Number.isInteger(saved.level) && L.LEVELS[saved.level] ? saved.level : 0;
    let records = { solved: Number(saved.solved) || 0, played: Number(saved.played) || 0 };
    let state = null, puzzle = null, selected = 0;
    function save() { Store.setJSON(KEY, { level: chosen, ...records, case: state }); }
    function setup() {
        document.body.classList.remove('case-open');
        $('setup').hidden = false; $('play').hidden = true;
        $('difficulty-grid').innerHTML = L.LEVELS.map((l, i) => `<button class="difficulty" data-level="${i}" aria-pressed="${i === chosen}"><span class="eyebrow">Level ${i + 1}${l.poison ? ' · Poison' : ''}</span><strong>${esc(l.name)}</strong><span class="quiet">${esc(l.blurb)}</span><span class="difficulty-count">${l.people} people · ${l.impostors} ${l.impostors === 1 ? 'impostor' : 'impostors'}</span></button>`).join('');
        $('difficulty-grid').querySelectorAll('button').forEach(b => b.onclick = () => {
            chosen = Number(b.dataset.level); save();
            $('difficulty-grid').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        });
        $('resume-case').hidden = !state || state.ended;
        $('saved-record').textContent = records.played ? `${records.solved} of ${records.played} completed cases solved on this device` : 'Start at any level. Stay there for as many cases as you like.';
    }
    function begin() {
        const button = $('start-case'); button.disabled = true;
        try {
            const seed = crypto.getRandomValues(new Uint32Array(1))[0];
            puzzle = L.generate(chosen, seed);
            state = { seed, level: chosen, revealed: [], notes: Array(puzzle.people.length).fill(''), hints: 0, ended: false, won: false };
            selected = 0; save(); showCase();
        } catch (e) { showToast('This case could not be created. Please try again.', 'error'); }
        finally { button.disabled = false; }
    }
    const bad = i => puzzle.solution.impostors.includes(i);
    const mistakes = () => state.revealed.filter(i => !bad(i)).length;
    const found = () => state.revealed.filter(bad).length;
    function showCase() {
        document.body.classList.add('case-open');
        $('setup').hidden = true; $('play').hidden = false;
        $('feedback').textContent = ''; $('hint-panel').hidden = true;
        $('case-title').textContent = L.LEVELS[puzzle.level].name;
        $('case-number').textContent = `Level ${puzzle.level + 1} · Case ${puzzle.seed.toString(36).toUpperCase()}`;
        const config = L.LEVELS[puzzle.level];
        $('case-rules').innerHTML = `<strong>${config.impostors} ${config.impostors === 1 ? 'impostor' : 'impostors'} in this circle.</strong> ${config.poison ? 'Exactly one is a Poisoner: the next seat clockwise has unreliable information if that person is good. Role claims of good players remain true.' : 'All good players tell the truth. Impostors may lie about their role and information.'} <strong>Only one genuine player per role.</strong>`;
        $('role-reference').innerHTML = config.roles.map(r => `<article><h4><i class="ph-bold ${L.ROLES[r].icon}" aria-hidden="true"></i> ${L.ROLES[r].name}</h4><p>${L.ROLES[r].ability}</p></article>`).join('');
        render(); $('case-title').focus({ preventScroll: true });
        $('play').scrollIntoView({ block: 'start', behavior: 'instant' });
    }
    function status(i) {
        if (state.ended || state.revealed.includes(i)) return bad(i) ? 'Confirmed impostor' : 'Confirmed good';
        return state.notes[i] === 'suspect' ? 'Your note: suspect' : state.notes[i] === 'good' ? 'Your note: likely good' : 'Not yet revealed';
    }
    function render() {
        const config = L.LEVELS[puzzle.level];
        $('impostor-count').textContent = `${found()} / ${config.impostors} impostors found`;
        $('lives-count').textContent = `♥ ${3 - mistakes()} ${3 - mistakes() === 1 ? 'life' : 'lives'} left`;
        $('hint-button').disabled = state.ended;
        $('circle').innerHTML = `<div class="circle-centre" aria-hidden="true"><i class="ph-bold ph-lighthouse"></i><span>Select a person</span></div>` + puzzle.people.map((p, i) => {
            const theta = i * 2 * Math.PI / config.people - Math.PI / 2;
            const reveal = state.ended || state.revealed.includes(i);
            const mark = reveal ? (bad(i) ? '!' : '✓') : state.notes[i] === 'suspect' ? '?' : state.notes[i] === 'good' ? '✓?' : '';
            return `<button class="seat" data-seat="${i}" style="left:${50 + 40 * Math.cos(theta)}%;top:${50 + 40 * Math.sin(theta)}%" aria-pressed="${i === selected}" aria-label="Seat ${i + 1}, ${p.name}, claims ${L.ROLES[p.claim.role].name}. ${status(i)}"><div class="seat-portrait"><img src="${portrait(p.name)}" alt="" draggable="false"><span class="seat-number">${i + 1}</span>${mark ? `<span class="seat-state ${reveal ? bad(i) ? 'bad' : 'good' : ''}" aria-hidden="true">${mark}</span>` : ''}</div><span class="seat-name">${p.name}</span><span class="seat-role">${reveal && bad(i) ? 'Impostor' : L.ROLES[p.claim.role].name}</span></button>`;
        }).join('');
        $('circle').querySelectorAll('[data-seat]').forEach(b => {
            b.onclick = () => select(Number(b.dataset.seat));
            b.onkeydown = e => {
                if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
                e.preventDefault();
                const n = puzzle.people.length, i = Number(b.dataset.seat);
                const next = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + n) % n;
                select(next); $('circle').querySelector(`[data-seat="${next}"]`).focus({ preventScroll: true });
            };
        });
        $('claim-list').innerHTML = puzzle.people.map((p, i) => `<article class="claim-card ${i === selected ? 'selected' : ''}"><button class="claim-person" data-inspect="${i}" aria-label="Inspect ${p.name}, seat ${i + 1}"><img src="${portrait(p.name)}" alt=""><span><strong>${i + 1}. ${p.name}</strong><small>Claims ${L.ROLES[p.claim.role].name}</small></span></button><p>“${esc(L.statement(puzzle, i))}”</p><p class="claim-note">${state.ended || state.revealed.includes(i) || state.notes[i] ? status(i) : ''}</p></article>`).join('');
        $('claim-list').querySelectorAll('button').forEach(b => b.onclick = () => { select(Number(b.dataset.inspect)); $('inspector-name').focus(); });
        renderInspector(); renderResult();
    }
    function select(i) {
        selected = i;
        $('circle').querySelectorAll('[data-seat]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.seat) === i)));
        $('claim-list').querySelectorAll('.claim-card').forEach((el, j) => el.classList.toggle('selected', i === j));
        renderInspector();
    }
    function actualRole(i) {
        if (!bad(i)) return L.ROLES[puzzle.people[i].claim.role].name;
        if (puzzle.solution.poisoner === i) return 'Poisoner';
        const others = puzzle.solution.impostors.filter(j => j !== puzzle.solution.poisoner);
        return ['Mimic', 'Shade', 'Trickster'][others.indexOf(i)];
    }
    function renderInspector() {
        const p = puzzle.people[selected], role = L.ROLES[p.claim.role], revealed = state.ended || state.revealed.includes(selected);
        $('inspector').innerHTML = `<div class="person-heading"><img src="${portrait(p.name)}" alt=""><div><span class="eyebrow">Seat ${selected + 1}</span><h3 id="inspector-name" tabindex="-1">${p.name}</h3><span class="claimed-role">Claims ${role.name}</span></div></div><p class="ability">${esc(role.ability)}</p><blockquote class="claim-quote">“${esc(L.statement(puzzle, selected))}”</blockquote>${Speech.supported() ? '<button class="listen-btn" id="read-claim"><i class="ph-bold ph-speaker-high" aria-hidden="true"></i> Read this claim aloud</button>' : ''}${revealed ? `<p class="reveal-badge"><strong>${bad(selected) ? 'Impostor' : 'Good'} · ${actualRole(selected)}</strong><br>${state.ended && L.poisoned(puzzle.solution, puzzle.people.length) === selected ? 'This good player was poisoned. Their role is genuine; their information was unreliable.' : bad(selected) ? 'Their role claim was a disguise. Their information could be true or false.' : 'Their role is genuine.'}</p>` : `<p class="eyebrow notes-label">Your notes</p><div class="note-controls">${[['', 'Unmarked'], ['suspect', 'Suspect'], ['good', 'Likely good']].map(([value, label]) => `<button class="note-btn" data-note="${value}" aria-pressed="${state.notes[selected] === value}">${label}</button>`).join('')}</div><button class="btn accuse-btn" id="accuse">Accuse ${p.name} <i class="ph-bold ph-arrow-right" aria-hidden="true"></i></button><p class="accuse-note">Reveals their side. A good player costs one life.</p>`}`;
        if ($('read-claim')) $('read-claim').onclick = () => Speech.say(`${p.name} claims to be the ${role.name}. ${role.ability} Their information: ${L.statement(puzzle, selected)}`);
        $('inspector').querySelectorAll('[data-note]').forEach(b => b.onclick = () => { const note = b.dataset.note; state.notes[selected] = note; save(); render(); $('inspector').querySelector(`[data-note="${note}"]`).focus({ preventScroll: true }); });
        if ($('accuse')) $('accuse').onclick = accuse;
    }
    function accuse() {
        if (state.ended || state.revealed.includes(selected)) return;
        const i = selected; state.revealed.push(i);
        state.won = found() === L.LEVELS[puzzle.level].impostors;
        state.ended = state.won || mistakes() >= 3;
        if (state.ended) { records.played++; if (state.won) records.solved++; }
        save(); render();
        $('feedback').classList.toggle('good', bad(i));
        $('feedback').textContent = bad(i) ? `${puzzle.people[i].name} is an impostor (${actualRole(i)}). No life lost.${state.won ? ' You found them all.' : ' Keep comparing the remaining claims.'}` : `${puzzle.people[i].name} is good. One life lost.${state.ended ? ' The case has ended; the explanation is below.' : ` ${3 - mistakes()} lives remain. Their claimed role is genuine${L.LEVELS[puzzle.level].poison ? ', but poison may affect their information' : ''}.`}`;
        if (state.ended) $('result-title').focus();
        else $('inspector-name').focus({ preventScroll: true });
    }
    function hypothesis(w) {
        return `${w.impostors.map(i => L.person(puzzle, i)).join(' and ')} ${w.impostors.length === 1 ? 'is the only impostor' : 'are the impostors'}${w.poisoner !== null ? `, with ${L.person(puzzle, w.poisoner)} as the Poisoner` : ''}`;
    }
    function hint() {
        if (state.ended) return;
        const alternatives = L.worlds(puzzle.level).filter(w => state.revealed.every(i => w.impostors.includes(i) === bad(i))).map(w => ({ w, issue: L.contradiction(puzzle, w) })).filter(x => x.issue);
        $('hint-panel').hidden = false;
        if (!alternatives.length) { $('hint-panel').textContent = 'Your confirmed reveals now leave just one possible group of impostors. Compare the remaining people with the exact impostor count.'; return; }
        const { w, issue } = alternatives[state.hints % alternatives.length];
        state.hints++; save();
        $('hint-panel').innerHTML = `<strong>Try a possibility, then look for a contradiction.</strong><p>Suppose ${esc(hypothesis(w))}.</p><p>${esc(L.reason(puzzle, w, issue))}</p><p><strong>So that exact arrangement cannot be the answer.</strong> It does not rule out each named person individually. Try another combination.</p>`;
    }
    function renderResult() {
        $('case-result').hidden = !state.ended;
        if (!state.ended) return;
        const poison = L.poisoned(puzzle.solution, puzzle.people.length);
        const explanation = puzzle.people.map((p, i) => {
            if (bad(i)) return `<li><strong>${p.name}: ${actualRole(i)} (impostor).</strong> Claimed ${L.ROLES[p.claim.role].name}. Their information was ${L.value(p.claim, i, puzzle.solution, puzzle.people.length) === p.claim.says ? 'true, but that does not make their role claim genuine' : 'false'}.</li>`;
            return `<li><strong>${p.name}: genuine ${L.ROLES[p.claim.role].name}${i === poison ? ', poisoned' : ''}.</strong> ${i === poison ? `Sits immediately clockwise from ${puzzle.people[puzzle.solution.poisoner].name}, the Poisoner. Their information need not be true. Actual information: ` : 'Their information checks out: '}“${esc(L.statement(puzzle, i, L.value(p.claim, i, puzzle.solution, puzzle.people.length)))}”</li>`;
        }).join('');
        $('case-result').innerHTML = `<p class="eyebrow">Case closed</p><h2 id="result-title" tabindex="-1">${state.won ? 'The circle is clear.' : 'Every story has an answer.'}</h2><p>${state.won ? 'You found every impostor.' : 'You used all three lives. Take a moment to follow the explanation, then try another case.'} ${state.hints ? `You used ${state.hints} reasoning ${state.hints === 1 ? 'hint' : 'hints'}.` : ''}</p><p><strong>The impostors:</strong> ${puzzle.solution.impostors.map(i => `${puzzle.people[i].name} (${actualRole(i)})`).join(', ')}.</p><details><summary>Why this solution fits</summary><p>Every unpoisoned good player’s information is true, and all genuine roles are unique. Every other possible arrangement contradicts at least one of those rules.</p><ul class="solution-list">${explanation}</ul></details><div class="btn-row"><button class="btn lantern-primary" id="next-case">Another case at this level</button><button class="btn btn-ghost" id="result-levels">Choose a difficulty</button></div>`;
        $('next-case').onclick = () => { chosen = puzzle.level; begin(); };
        $('result-levels').onclick = () => { setup(); $('start-case').focus(); };
    }
    // Restore the seed, not arbitrary generated content. Reject malformed saves.
    try {
        const c = saved.case;
        if (c && Number.isInteger(c.seed) && Number.isInteger(c.level) && L.LEVELS[c.level]) {
            const restored = L.generate(c.level, c.seed), n = restored.people.length;
            if (Array.isArray(c.revealed) && new Set(c.revealed).size === c.revealed.length && c.revealed.every(i => Number.isInteger(i) && i >= 0 && i < n) && Array.isArray(c.notes) && c.notes.length === n && c.notes.every(v => ['', 'suspect', 'good'].includes(v))) {
                puzzle = restored; state = c; state.hints = Math.max(0, Math.floor(Number(c.hints) || 0));
                state.won = found() === L.LEVELS[c.level].impostors; state.ended = state.won || mistakes() >= 3;
            }
        }
    } catch { state = null; puzzle = null; }
    $('start-case').onclick = begin;
    $('resume-case').onclick = () => { if (state && puzzle) showCase(); };
    $('change-level').onclick = () => { if (Speech.supported()) window.speechSynthesis.cancel(); setup(); $('start-case').focus(); };
    $('hint-button').onclick = hint;
    setup();
})();
