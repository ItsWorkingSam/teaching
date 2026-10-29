/* Run with node tools/check-maths.cjs. No package dependencies. */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const context = vm.createContext({ console });
for (const file of ['game-engine', 'maths-diagrams', 'maths-topics']) vm.runInContext(fs.readFileSync(`js/${file}.js`, 'utf8'), context);
const topics = vm.runInContext('MathsTopics', context);
const wordNumbers = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty'.split(' ');
function parseNumber(value) {
    if (/^\d+$/.test(value)) return Number(value);
    if (wordNumbers.includes(value)) return wordNumbers.indexOf(value);
    const [tens, ones] = value.split('-');
    return ({ twenty: 20, thirty: 30, forty: 40, fifty: 50 })[tens] + (ones ? wordNumbers.indexOf(ones) : 0);
}
function phraseMinutes(label) {
    if (label.endsWith(" o'clock")) return parseNumber(label.split(' ')[0]) * 60 % 720;
    const [, amount, direction, hour] = label.match(/^(quarter|half|[\w-]+ minutes?) (past|to) ([\w-]+)$/);
    const minutes = amount === 'quarter' ? 15 : amount === 'half' ? 30 : parseNumber(amount.split(' ')[0]);
    return (parseNumber(hour) * 60 + (direction === 'to' ? -minutes : minutes) + 720) % 720;
}
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
                assert.deepEqual(Array.from(q.choiceOptions, o => o.value), Array.from(q.choices));
                for (const option of q.choiceOptions) {
                    assert.ok(['digital', 'phrase', 'words', 'spoken'].includes(option.format));
                    assert.equal(option.html, undefined, 'Clock answers use text only');
                    assert.match(option.value, /^(?:[1-9]|1[0-2]):[0-5]\d$/);
                    const [hour, minute] = option.value.split(':').map(Number);
                    if (option.format === 'digital') assert.equal(option.label, option.value);
                    else if (option.format === 'spoken') {
                        const [hourWord, ...rest] = option.label.split(' ');
                        assert.equal(parseNumber(hourWord), hour);
                        const minuteWords = rest.join(' ');
                        assert.equal(minuteWords === "o'clock" ? 0 : parseNumber(minuteWords.replace(/^oh /, '')), minute);
                        assert.equal(minuteWords.startsWith('oh '), minute > 0 && minute < 10);
                    }
                    else {
                        assert.equal(phraseMinutes(option.label), (hour * 60 + minute) % 720, option.label);
                        if (option.format === 'words') assert.doesNotMatch(option.label, /\d/);
                    }
                }
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
