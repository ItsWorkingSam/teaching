/* Optional browser smoke test: node tools/check-detective-town-browser.mjs.
   Uses installed Chrome and Node's built-in DevTools/WebSocket support. */
import { createServer } from 'node:http';
import { readFile, mkdtemp, writeFile } from 'node:fs/promises';
import { join, resolve, extname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
const root = resolve('.'), profile = await mkdtemp(join(tmpdir(), 'lantern-qa-'));
const server = createServer(async (req, res) => {
    try {
        const path = resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
        if (!path.startsWith(root + '\\') && !path.startsWith(root + '/')) { res.writeHead(403).end(); return; }
        const body = await readFile(path);
        res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' })[extname(path)] || 'application/octet-stream');
        res.end(body);
    } catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
const chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
let ws;
const pause = ms => new Promise(r => setTimeout(r, ms));
try {
    let port;
    for (let i = 0; i < 100; i++) { try { port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; } catch { await pause(100); } }
    assert.ok(port, 'Chrome must start');
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
    await new Promise((r, reject) => { ws.onopen = r; ws.onerror = reject; });
    let serial = 0; const pending = new Map(), errors = [];
    ws.onmessage = event => { const m = JSON.parse(event.data); if (m.id) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(m.error) : p.resolve(m.result); } else if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text); };
    const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++serial; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
    const evaluate = async expression => { const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw Error(r.exceptionDetails.text + ': ' + r.result.description); return r.result.value; };
    await send('Runtime.enable'); await send('Page.enable');
    const visit = async page => { await send('Page.navigate', { url: base + '/' + page }); for (let i = 0; i < 100; i++) { if (await evaluate(`document.readyState === 'complete' && location.href === ${JSON.stringify(base + '/' + page)}`)) return; await pause(50); } throw Error('Page load timeout'); };
    const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    const nextTick = () => pause(50);
    const current = () => evaluate(`(() => { const state = Store.getJSON('lantern-circle-v1', {}).case; return { state, puzzle: Lantern.generate(state.level, state.seed) }; })()`);
    await visit('detective-town.html');
    assert.equal(await evaluate(`document.querySelectorAll('.difficulty').length`), 5);
    assert.equal(await evaluate(`[...document.images].every(i => i.complete && i.naturalWidth)`), true);
    await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 1000, deviceScaleFactor: 1, mobile: false });
    await evaluate(`applyTheme('light')`); await pause(350);
    await writeFile(join(profile, 'setup.png'), Buffer.from((await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })).data, 'base64'));
    for (let level = 0; level < 5; level++) {
        await visit('detective-town.html');
        await click(`[data-level="${level}"]`); await click('#start-case'); await nextTick();
        let { state, puzzle } = await current();
        assert.equal(puzzle.level, level);
        assert.equal(await evaluate(`document.querySelectorAll('.seat').length`), puzzle.people.length);
        assert.equal(await evaluate(`document.querySelectorAll('.claim-card').length`), puzzle.people.length);
        assert.equal(await evaluate(`[...document.images].every(i => i.complete && i.naturalWidth)`), true);
        await click('[data-note="suspect"]');
        assert.equal((await current()).state.notes[0], 'suspect');
        assert.equal((await current()).state.revealed.length, 0);
        await click('#hint-button');
        assert.equal(await evaluate(`document.getElementById('hint-panel').hidden`), false);
        await visit('detective-town.html'); await click('#resume-case');
        assert.equal((await current()).state.seed, state.seed);
        assert.equal((await current()).state.notes[0], 'suspect');
        await evaluate(`document.querySelector('[data-seat="0"]').dispatchEvent(new KeyboardEvent('keydown', {key:'ArrowRight',bubbles:true}))`);
        assert.equal(await evaluate(`document.activeElement.dataset.seat`), '1');
        const good = puzzle.people.map((_, i) => i).find(i => !puzzle.solution.impostors.includes(i));
        await click(`[data-seat="${good}"]`); await click('#accuse');
        assert.match(await evaluate(`document.getElementById('lives-count').textContent`), /2 lives/);
        assert.equal(await evaluate(`document.querySelector('#accuse') === null`), true, 'Cannot accuse a revealed person again');
        for (const i of puzzle.solution.impostors) { await click(`[data-seat="${i}"]`); await click('#accuse'); }
        assert.equal((await current()).state.won, true);
        assert.equal(await evaluate(`document.getElementById('case-result').hidden`), false);
        assert.match(await evaluate(`document.getElementById('case-result').textContent`), /Why this solution fits/);
        assert.equal(await evaluate(`document.getElementById('hint-button').disabled`), true);
        await click('#next-case');
        ({ puzzle } = await current());
        assert.equal(puzzle.level, level, 'Next case stays at selected level');
        for (const i of puzzle.people.map((_, i) => i).filter(i => !puzzle.solution.impostors.includes(i)).slice(0, 3)) {
            await click(`[data-seat="${i}"]`); await click('#accuse');
        }
        assert.equal((await current()).state.ended, true);
        assert.equal((await current()).state.won, false);
        assert.match(await evaluate(`document.getElementById('lives-count').textContent`), /0 lives/);
        assert.equal(await evaluate(`document.querySelector('#accuse') === null`), true);
    }
    await visit('detective-town.html'); await click('[data-level="4"]'); await click('#start-case'); await nextTick();
    await click('[data-seat="3"]'); await pause(350);
    await writeFile(join(profile, 'desktop.png'), Buffer.from((await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })).data, 'base64'));
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await evaluate(`applyTheme('dark')`); await pause(350);
    assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true);
    const overlap = await evaluate(`(() => {
        const seats = [...document.querySelectorAll('.seat')].map(b => b.getBoundingClientRect());
        return seats.some((a,i) => seats.some((b,j) => i !== j && Math.min(a.right,b.right) > Math.max(a.left,b.left) && Math.min(a.bottom,b.bottom) > Math.max(a.top,b.top)));
    })()`);
    assert.equal(overlap, false, 'Ten mobile seats must not overlap');
    for (const width of [320, 360, 768, 900, 1100]) {
        await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
        assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true, `No overflow at ${width}px`);
        assert.equal(await evaluate(`(() => { const seats = [...document.querySelectorAll('.seat')].map(b => b.getBoundingClientRect()); return seats.some((a,i) => seats.some((b,j) => i !== j && Math.min(a.right,b.right) > Math.max(a.left,b.left) && Math.min(a.bottom,b.bottom) > Math.max(a.top,b.top))); })()`), false, `No seat overlap at ${width}px`);
    }
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await writeFile(join(profile, 'mobile.png'), Buffer.from((await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })).data, 'base64'));
    await visit('exercises.html');
    assert.equal(await evaluate(`Boolean(document.querySelector('a[href="detective-town.html"]'))`), true);
    assert.deepEqual(errors, []);
    console.log('Passed all five difficulties: portraits, selection, notes, hints, resume, keyboard navigation, correct and incorrect accusations, win/loss, repeat cases and mobile layout.');
    console.log('Screenshots: ' + profile);
} finally { ws?.close(); chrome.kill(); server.close(); }
