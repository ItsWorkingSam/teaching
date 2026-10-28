/* Optional browser smoke test: node tools/check-maths-browser.mjs.
   Uses installed Chrome and Node's built-in DevTools/WebSocket support. */
import { createServer } from 'node:http';
import { readFile, mkdtemp, writeFile } from 'node:fs/promises';
import { join, resolve, extname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
const root = resolve('.'), profile = await mkdtemp(join(tmpdir(), 'maths-qa-'));
const server = createServer(async (req, res) => {
    try {
        const path = resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
        if (!path.startsWith(root + '\\') && !path.startsWith(root + '/')) { res.writeHead(403).end(); return; }
        const body = await readFile(path);
        res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' })[extname(path)] || 'application/octet-stream');
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
    const correct = async () => {
        await evaluate(`(() => { const q = window.testQuestion; if(q.choices) { [...document.querySelectorAll('.option')].find(b => b.textContent === String(q.answer)).click(); } else { const input = document.querySelector('.answer-row input'); input.value = q.answer; input.form.requestSubmit(); } })()`);
        assert.equal(await evaluate(`document.querySelector('[data-ref="result"]').classList.contains('good')`), true);
    };
    const next = async () => { await click('[data-ref="result"] button'); await pause(30); };
    await visit('maths.html');
    assert.equal(await evaluate(`document.querySelectorAll('#maths-topics a').length`), 5);
    for (const key of ['clocks', 'fractions', 'angles', 'number-lines', 'shapes']) {
        for (let level = 1; level <= 4; level++) {
            await visit(`maths-activity.html?topic=${key}`);
            await evaluate(`(() => { const t = MathsTopics[${JSON.stringify(key)}], make = t.make; t.make = l => (window.testQuestion = make(l)); })()`);
            await click(`[data-level="${level}"]`); await click('[data-mode="practice"]'); await click('.start-btn'); await pause(30);
            assert.equal(await evaluate(`document.querySelectorAll('.maths-diagram').length`), 1);
            await correct(); await next();
            await evaluate(`(() => { const q = window.testQuestion; if(q.choices) { [...document.querySelectorAll('.option')].find(b => b.textContent !== String(q.answer)).click(); } else { const input = document.querySelector('.answer-row input'); input.value = q.answer + 1; input.form.requestSubmit(); } })()`);
            assert.equal(await evaluate(`document.querySelector('[data-ref="result"]').classList.contains('good')`), false);
            assert.equal(await evaluate(`document.querySelector('[data-ref="result"]').classList.contains('show')`), true);
            await next();
            await click('[data-ref="skip"]');
            assert.equal(await evaluate(`document.querySelector('[data-ref="result"]').classList.contains('show')`), true);
            await next(); await click('[data-ref="finish"]');
            assert.equal(await evaluate(`document.querySelector('[data-screen="summary"]').style.display`), 'block');
            await click('[data-ref="again"]');
            assert.equal(await evaluate(`document.querySelector('[data-screen="start"]').classList.contains('active')`), true);
        }
    }
    await visit('maths-activity.html?topic=clocks');
    await evaluate(`(() => { const make = MathsTopics.clocks.make; MathsTopics.clocks.make = l => (window.testQuestion = make(l)); })()`);
    await click('[data-level="1"]'); await click('[data-mode="levelup"]'); await click('.start-btn'); await pause(30);
    for (let i = 0; i < 5; i++) { await correct(); await next(); }
    assert.match(await evaluate(`document.querySelector('[data-ref="level"]').textContent`), /Level 2/);
    await visit('maths-activity.html?topic=fractions');
    await click('[data-mode="challenge"]'); await click('.start-btn'); await pause(30);
    for (let i = 0; i < 3; i++) { await click('[data-ref="skip"]'); await next(); }
    assert.equal(await evaluate(`document.querySelector('[data-screen="summary"]').style.display`), 'block');
    // Exercise long sessions through the real engine and each real question generator.
    const mathsPages = [
        ...['clocks', 'fractions', 'angles', 'number-lines', 'shapes'].map(key => [`maths-activity.html?topic=${key}`, 'js/maths.js']),
        ['numberbee.html', 'js/numberbee.js'], ['money.html', 'js/money.js']
    ];
    for (const [page, source] of mathsPages) {
        await visit(page);
        await evaluate(`localStorage.clear()`);
        await visit(page);
        assert.equal(await evaluate(`document.querySelector('[data-mode="practice"]').getAttribute('aria-pressed')`), 'true');
        assert.equal(await evaluate(`document.querySelectorAll('[data-mode]').length`), 3);
        await evaluate(`(() => {
            const create = LevelGame.create;
            LevelGame.create = cfg => {
                const render = cfg.render;
                cfg.render = (q, area, ui) => { window.testUI = ui; window.testRenderedQuestion = q; render(q, area, ui); };
                return create(cfg);
            };
        })()`);
        await evaluate(await readFile(source, 'utf8'));
        await click('[data-level="2"]'); await click('.start-btn'); await pause(30);
        await evaluate(`(async () => {
            for (let i = 0; i < 200; i++) {
                if (!window.testRenderedQuestion.id) throw Error('Missing generated question');
                window.testUI.correct({ note: 'Test feedback' });
                document.querySelector('[data-ref="next"]').click();
                await Promise.resolve();
                if (!document.querySelector('[data-ref="level"]').textContent.startsWith('Level 2 ')) throw Error('Practice changed level after ' + (i + 1) + ' answers');
            }
        })()`);
        assert.equal(await evaluate(`document.querySelector('[data-ref="done"]').textContent`), '200');
        assert.equal(await evaluate(`document.querySelector('[data-ref="dots"]').children.length`), 0);
        for (let i = 0; i < 4; i++) { await click('[data-ref="skip"]'); await next(); }
        assert.match(await evaluate(`document.querySelector('[data-ref="level"]').textContent`), /Level 2/);
        await click('[data-ref="finish"]'); await click('[data-ref="again"]');
        await click('[data-mode="levelup"]'); await click('.start-btn'); await pause(30);
        for (let i = 0; i < 5; i++) { await evaluate(`window.testUI.correct({ note: 'Test feedback' })`); await next(); }
        assert.match(await evaluate(`document.querySelector('[data-ref="level"]').textContent`), /Level 3/);
        await visit(page);
        assert.equal(await evaluate(`document.querySelector('[data-mode="levelup"]').getAttribute('aria-pressed')`), 'true', 'Mode preference survives reload');
    }
    await visit('word-detective.html');
    assert.equal(await evaluate(`document.querySelectorAll('[data-mode]').length`), 2, 'Non-maths modes unchanged');
    await visit('maths-activity.html?topic=unknown');
    assert.match(await evaluate(`document.getElementById('game').textContent`), /Choose an activity/);
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await visit('maths-activity.html?topic=shapes'); await click('[data-level="4"]'); await click('.start-btn'); await pause(30);
    assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true, 'No horizontal overflow on mobile');
    await evaluate(`applyTheme('dark')`); await pause(500);
    await writeFile(join(profile, 'mobile-dark.png'), Buffer.from((await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })).data, 'base64'));
    await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 950, deviceScaleFactor: 1, mobile: false });
    await visit('maths-activity.html?topic=fractions'); await click('[data-level="1"]'); await click('[data-mode="practice"]'); await click('.start-btn'); await pause(30); await evaluate(`applyTheme('light')`); await pause(500);
    await writeFile(join(profile, 'desktop-light.png'), Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
    await visit('scam.html');
    assert.equal(await evaluate(`(() => { const q = SCENARIOS.find(q => q.message.fromName === 'Netflix'); const el = document.createElement('div'); el.innerHTML = renderMessage(q.message); return el.querySelector('.url').textContent.includes('.invalid/payment') && !el.querySelector('a'); })()`), true);
    assert.deepEqual(errors, []);
    console.log('Passed browser checks: 20 levels, 200-question fixed sessions in all 7 maths games, no demotion on mistakes, saved modes, non-maths regression, correct/skip/finish/replay, level-up, challenge end, invalid topic, mobile overflow, themes and non-clickable Netflix URL.');
    console.log('Screenshots: ' + profile);
} finally {
    ws?.close(); chrome.kill(); server.close();
    // Keep screenshots for visual inspection; the profile is isolated in the OS temp directory.
}
