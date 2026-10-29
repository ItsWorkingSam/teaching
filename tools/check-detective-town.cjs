/* Independent rule checks, including every possible impostor/Poisoner placement. */
const assert = require('node:assert/strict');
const L = require('../js/detective-town-engine.js');
function independentSolutions(p) {
    const n = p.people.length, cfg = L.LEVELS[p.level], found = [];
    for (let mask = 0; mask < 2 ** n; mask++) {
        const evil = Array.from({ length: n }, (_, i) => i).filter(i => mask & (1 << i));
        if (evil.length !== cfg.impostors) continue;
        for (const poisoner of cfg.poison ? evil : [null]) {
            const isBad = i => evil.includes(i), next = poisoner === null ? null : (poisoner + 1) % n;
            const poison = next !== null && !isBad(next) ? next : null;
            const good = Array.from({ length: n }, (_, i) => i).filter(i => !isBad(i));
            if (new Set(good.map(i => p.people[i].claim.role)).size !== good.length) continue;
            const valid = good.every(i => {
                if (i === poison) return true;
                const c = p.people[i].claim, [a, b] = c.targets;
                const bit = j => Number(isBad((j + n) % n));
                let actual;
                switch (c.role) {
                    case 'watcher': actual = bit(i - 1) + bit(i + 1); break;
                    case 'scout': actual = bit(a); break;
                    case 'keeper': actual = bit(a) + bit(b); break;
                    case 'reader': actual = Number(bit(a) === bit(b)); break;
                    case 'tracker': for (let d = 1; d <= n; d++) { if (bit(i - d) || bit(i + d)) { actual = d; break; } } break;
                    case 'lookout': actual = bit(i + 1) + bit(i + 2) + bit(i + 3); break;
                    case 'bellkeeper': actual = Array.from({ length: n }, (_, j) => bit(j) * bit(j + 1)).reduce((a, b) => a + b, 0); break;
                    case 'surveyor': actual = Array.from({ length: n }, (_, j) => j % 2 === 0 ? bit(j) : 0).reduce((a, b) => a + b, 0); break;
                    case 'herbalist': actual = Number(a === poison); break;
                    default: throw Error('Unexpected role');
                }
                return actual === c.says;
            });
            if (valid) found.push({ impostors: evil, poisoner });
        }
    }
    return found;
}
let checked = 0;
for (let level = 0; level < L.LEVELS.length; level++) {
    for (let seed = 1; seed <= 500; seed++) {
        const p = L.generate(level, seed), solution = p.solution;
        assert.equal(p.people.length, L.LEVELS[level].people);
        assert.equal(new Set(p.people.map(p => p.name)).size, p.people.length);
        for (let i = 0; i < p.people.length; i++) {
            assert.ok(L.statement(p, i));
            assert.equal(new Set(p.people[i].claim.targets).size, 2);
            assert.ok(!p.people[i].claim.targets.includes(i));
        }
        delete p.solution; // Public information alone must determine the answer.
        assert.deepEqual(independentSolutions(p), [solution]);
        assert.deepEqual(L.solve(p), [solution]);
        assert.deepEqual(L.generate(level, seed).solution, solution, 'Saved seeds reproduce their case');
        checked++;
    }
}
assert.equal(L.poisoned({ impostors: [3], poisoner: 3 }, 4), 0, 'Poison wraps clockwise');
assert.equal(L.poisoned({ impostors: [3, 0], poisoner: 3 }, 4), null, 'No poisoned good player when next seat is evil');
assert.throws(() => L.generate(-1, 0));
console.log(`Passed ${checked} generated puzzles against an independent exhaustive solver, reproducible seeds and poison wraparound.`);
