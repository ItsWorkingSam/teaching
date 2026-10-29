/* Detective Town: pure puzzle rules, seeded generation and exhaustive solver.
   No DOM or storage dependencies. Both the UI and tests use these rules. */
const Lantern = (() => {
    const LEVELS = [
        { name: 'First light', people: 4, impostors: 1, poison: false, blurb: 'Four neighbours. One hidden impostor. Learn to compare claims.', roles: ['watcher', 'scout', 'keeper', 'reader'] },
        { name: 'Village whispers', people: 6, impostors: 1, poison: false, blurb: 'A bigger circle. Follow the connections between people.', roles: ['watcher', 'scout', 'keeper', 'reader', 'tracker', 'lookout'] },
        { name: 'Two faces', people: 8, impostors: 2, poison: false, blurb: 'Two impostors can support each other’s stories.', roles: ['watcher', 'scout', 'keeper', 'reader', 'tracker', 'lookout', 'bellkeeper', 'surveyor'] },
        { name: 'A drop of doubt', people: 9, impostors: 2, poison: true, blurb: 'One impostor is a Poisoner. One good person may have unreliable information.', roles: ['watcher', 'scout', 'keeper', 'reader', 'tracker', 'lookout', 'bellkeeper', 'surveyor', 'herbalist'] },
        { name: 'Midnight council', people: 10, impostors: 3, poison: true, blurb: 'Three impostors, a Poisoner, and a web of connected clues.', roles: ['watcher', 'scout', 'keeper', 'reader', 'tracker', 'lookout', 'bellkeeper', 'surveyor', 'herbalist'] }
    ];
    const ROLES = {
        watcher: { name: 'Watchkeeper', icon: 'ph-eye', ability: 'Learns how many of their two immediate neighbours are impostors.' },
        scout: { name: 'Investigator', icon: 'ph-magnifying-glass', ability: 'Checks whether one named person is good or an impostor.' },
        keeper: { name: 'Innkeeper', icon: 'ph-key', ability: 'Learns how many impostors are among two named people.' },
        reader: { name: 'Matchmaker', icon: 'ph-link', ability: 'Learns whether two named people are on the same side: both good or both impostors.' },
        tracker: { name: 'Tracker', icon: 'ph-footprints', ability: 'Learns the distance to the nearest impostor, counting seats in either direction around the circle.' },
        lookout: { name: 'Lookout', icon: 'ph-binoculars', ability: 'Counts impostors in the next three seats clockwise. Does not count their own seat.' },
        bellkeeper: { name: 'Bellkeeper', icon: 'ph-bell', ability: 'Counts neighbouring pairs that are both impostors, including the last and first seats. Each pair counts once.' },
        surveyor: { name: 'Surveyor', icon: 'ph-compass', ability: 'Counts impostors in odd-numbered seats: 1, 3, 5, and so on.' },
        herbalist: { name: 'Herbalist', icon: 'ph-leaf', ability: 'Checks whether one named person is poisoned. The Herbalist’s own information can also be poisoned.' }
    };
    const PEOPLE = ['Mara', 'Ellis', 'Tomas', 'Inez', 'Rowan', 'Ada', 'Felix', 'Nora', 'Leon', 'Sana', 'Hugo', 'Vera'];
    function random(seed) {
        let a = seed >>> 0;
        return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    }
    function shuffle(items, rng) {
        const a = [...items];
        for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
        return a;
    }
    function combinations(n, k, start = 0, path = [], out = []) {
        if (!k) { out.push([...path]); return out; }
        for (let i = start; i <= n - k; i++) { path.push(i); combinations(n, k - 1, i + 1, path, out); path.pop(); }
        return out;
    }
    const poisoned = (world, n) => world.poisoner === null || world.impostors.includes((world.poisoner + 1) % n) ? null : (world.poisoner + 1) % n;
    function value(claim, seat, world, n) {
        const bad = i => world.impostors.includes(i), count = xs => xs.filter(bad).length;
        switch (claim.role) {
            case 'watcher': return count([(seat + n - 1) % n, (seat + 1) % n]);
            case 'scout': return Number(bad(claim.targets[0]));
            case 'keeper': return count(claim.targets);
            case 'reader': return Number(bad(claim.targets[0]) === bad(claim.targets[1]));
            case 'tracker': return Math.min(...world.impostors.map(i => Math.min(Math.abs(i - seat), n - Math.abs(i - seat))));
            case 'lookout': return count([1, 2, 3].map(d => (seat + d) % n));
            case 'bellkeeper': return world.impostors.filter(i => bad((i + 1) % n)).length;
            case 'surveyor': return count(Array.from({ length: n }, (_, i) => i).filter(i => i % 2 === 0));
            case 'herbalist': return Number(poisoned(world, n) === claim.targets[0]);
            default: throw Error('Unknown role');
        }
    }
    function worlds(level) {
        const config = LEVELS[level];
        return combinations(config.people, config.impostors).flatMap(impostors =>
            (config.poison ? impostors : [null]).map(poisoner => ({ impostors, poisoner })));
    }
    function contradiction(puzzle, world) {
        const seen = new Map(), n = puzzle.people.length, poison = poisoned(world, n);
        for (let i = 0; i < n; i++) {
            if (world.impostors.includes(i)) continue;
            const role = puzzle.people[i].claim.role;
            if (seen.has(role)) return { type: 'duplicate', seats: [seen.get(role), i], role };
            seen.set(role, i);
        }
        for (let i = 0; i < n; i++) {
            if (world.impostors.includes(i) || i === poison) continue;
            const c = puzzle.people[i].claim, actual = value(c, i, world, n);
            if (actual !== c.says) return { type: 'information', seat: i, actual, says: c.says };
        }
        return null;
    }
    const solve = puzzle => worlds(puzzle.level).filter(w => !contradiction(puzzle, w));
    function makeClaim(role, seat, world, n, rng) {
        const targets = shuffle(Array.from({ length: n }, (_, i) => i).filter(i => i !== seat), rng).slice(0, 2);
        const claim = { role, targets, says: 0 };
        const truth = value(claim, seat, world, n);
        const unreliable = world.impostors.includes(seat) || poisoned(world, n) === seat;
        const max = ['reader', 'scout', 'herbalist'].includes(role) ? 1 : role === 'tracker' ? Math.floor(n / 2) : role === 'lookout' ? Math.min(3, world.impostors.length) : role === 'surveyor' ? world.impostors.length : role === 'bellkeeper' ? Math.max(1, world.impostors.length - 1) : Math.min(2, world.impostors.length);
        const alternatives = Array.from({ length: max + 1 }, (_, i) => i).filter(i => i !== truth && (role !== 'tracker' || i > 0));
        claim.says = unreliable && alternatives.length && rng() < .85 ? alternatives[Math.floor(rng() * alternatives.length)] : truth;
        return claim;
    }
    function generate(level, seed) {
        if (!Number.isInteger(level) || !LEVELS[level]) throw Error('Invalid difficulty');
        const config = LEVELS[level], rng = random(seed), n = config.people;
        for (let attempt = 0; attempt < 5000; attempt++) {
            const seats = shuffle(Array.from({ length: n }, (_, i) => i), rng);
            const impostors = seats.slice(0, config.impostors).sort((a, b) => a - b);
            const world = { impostors, poisoner: config.poison ? impostors[Math.floor(rng() * impostors.length)] : null };
            if (config.poison && poisoned(world, n) === null) continue;
            const goodRoles = shuffle(config.roles, rng), names = shuffle(PEOPLE, rng);
            let ri = 0;
            const people = Array.from({ length: n }, (_, i) => ({ name: names[i], claim: null }));
            for (let i = 0; i < n; i++) {
                const role = impostors.includes(i) ? config.roles[Math.floor(rng() * config.roles.length)] : goodRoles[ri++];
                people[i].claim = makeClaim(role, i, world, n, rng);
            }
            const puzzle = { version: 1, level, seed: seed >>> 0, people, solution: world };
            const possible = solve(puzzle);
            if (possible.length === 1) return puzzle;
        }
        throw Error('Could not create a unique puzzle. Try a new case.');
    }
    const person = (p, i) => `${p.people[i].name} (${i + 1})`;
    function statement(p, i, override) {
        const c = p.people[i].claim, v = override === undefined ? c.says : override;
        const target = j => person(p, c.targets[j]);
        switch (c.role) {
            case 'watcher': return `${v} of my two neighbours ${v === 1 ? 'is an impostor' : 'are impostors'}.`;
            case 'scout': return `${target(0)} is ${v ? 'an impostor' : 'good'}.`;
            case 'keeper': return `Among ${target(0)} and ${target(1)}, there ${v === 1 ? 'is 1 impostor' : `are ${v} impostors`}.`;
            case 'reader': return `${target(0)} and ${target(1)} are on ${v ? 'the same side' : 'different sides'}.`;
            case 'tracker': return `The nearest impostor is ${v} ${v === 1 ? 'seat' : 'seats'} away from me.`;
            case 'lookout': return `There ${v === 1 ? 'is 1 impostor' : `are ${v} impostors`} in the next three seats clockwise.`;
            case 'bellkeeper': return `There ${v === 1 ? 'is 1 neighbouring pair' : `are ${v} neighbouring pairs`} of impostors in the circle.`;
            case 'surveyor': return `There ${v === 1 ? 'is 1 impostor' : `are ${v} impostors`} in the odd-numbered seats.`;
            case 'herbalist': return `${target(0)} is ${v ? '' : 'not '}poisoned.`;
        }
    }
    function reason(p, w, issue) {
        if (issue.type === 'duplicate') return `${person(p, issue.seats[0])} and ${person(p, issue.seats[1])} would both be genuine ${ROLES[issue.role].name}s. Only one of each role can be in play, even with poison.`;
        return `${person(p, issue.seat)} would be good${LEVELS[p.level].poison ? ' and not poisoned' : ''}, so their information must be true. Their claim is “${statement(p, issue.seat)}” But this arrangement would mean: “${statement(p, issue.seat, issue.actual)}”`;
    }
    return { LEVELS, ROLES, PEOPLE, generate, solve, worlds, contradiction, poisoned, value, statement, reason, person };
})();
if (typeof module !== 'undefined') module.exports = Lantern;
