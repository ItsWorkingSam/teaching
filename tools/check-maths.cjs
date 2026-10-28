/* Run with node tools/check-maths.cjs. No package dependencies. */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const context = vm.createContext({ console });
for (const file of ['game-engine', 'maths-diagrams', 'maths-topics']) vm.runInContext(fs.readFileSync(`js/${file}.js`, 'utf8'), context);
const topics = vm.runInContext('MathsTopics', context);
let count = 0;
for (const [key, topic] of Object.entries(topics)) {
    for (let level = 1; level <= topic.levels.length; level++) {
        for (let i = 0; i < 200; i++) {
            const q = topic.make(level);
            assert.ok(q.id && q.prompt && q.explain && q.review);
            assert.match(q.diagram, /role="img" aria-label="[^"]+"/);
            assert.ok(!/NaN|undefined|Infinity/.test(q.diagram));
            if (q.choices) {
                assert.equal(q.choices.length, 4, `${key} ${level} has four options`);
                assert.equal(new Set(q.choices).size, 4);
                assert.ok(q.choices.includes(String(q.answer)));
                if (key === 'fractions') {
                    const [n, d] = q.answer.split('/').map(Number);
                    assert.equal(q.choices.filter(v => { const [a, b] = v.split('/').map(Number); return a * d === b * n; }).length, 1, 'Only one mathematically correct fraction');
                }
            } else assert.ok(Number.isFinite(q.answer));
            if (key === 'shapes') {
                if (level === 4) {
                    const [, area, width] = q.prompt.match(/area is (\d+) cm²\. The width is (\d+)/);
                    assert.equal(q.answer, Number(area) / Number(width));
                    assert.ok(!q.diagram.includes(`${q.answer} cm high`));
                    assert.ok(!q.diagram.includes(`and ${q.answer} centimetres high`));
                } else {
                    const [, w, h] = q.review.match(/(\d+) cm × (\d+) cm/).map(Number);
                    assert.equal(q.answer, level === 2 ? 2 * (w + h) : w * h);
                }
            }
            if (key === 'fractions') {
                const [, d, n] = q.diagram.match(/divided into (\d+) equal slices; (\d+) slices/).map(Number);
                if (level === 4) assert.equal(q.answer, n / d * 100);
                else { const [a, b] = q.answer.split('/').map(Number); assert.equal(a * d, b * n); }
            }
            if (key === 'clocks') {
                const [, h, m, delay] = q.review.match(/Clock at (\d+):(\d+)(?: \+ (\d+) minutes)?/);
                const total = (Number(h) * 60 + Number(m) + Number(delay || 0)) % 720;
                assert.equal(q.answer, `${Math.floor(total / 60) || 12}:${String(total % 60).padStart(2, '0')}`);
            }
            if (key === 'angles' && level >= 3) {
                const known = Number(q.review.match(/(\d+)°/)[1]);
                assert.equal(q.answer + known, level === 3 ? 180 : 360);
            }
            if (key === 'number-lines') {
                const [, start, step, index, jump] = q.review.match(/from (-?[\d.]+), steps of ([\d.]+), mark (\d+)(?:, move (-?\d+))?/);
                assert.ok(Math.abs(q.answer - (Number(start) + Number(step) * (Number(index) + Number(jump || 0)))) < 1e-8);
            }
            count++;
        }
    }
}
const scam = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync('js/scam-scenarios.js', 'utf8'), scam);
const netflix = scam.window.SCAM_SCENARIOS.find(q => q.message.fromName === 'Netflix');
assert.match(netflix.message.body, /https:\/\/[^\s]+\.invalid\/payment/);
console.log(`Passed ${count} generated questions across 5 topics and 20 levels; Netflix dummy URL verified.`);
