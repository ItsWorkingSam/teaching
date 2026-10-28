/* Reusable SVG diagrams. All descriptions convey the visible information. */
const MathsDiagrams = (() => {
    const esc = Widgets.esc;
    const point = (cx, cy, r, degrees) => [cx + r * Math.cos(degrees * Math.PI / 180), cy + r * Math.sin(degrees * Math.PI / 180)];
    const text = (x, y, value, extra = '') => `<text x="${x}" y="${y}" ${extra}>${esc(value)}</text>`;
    const line = (x1, y1, x2, y2, extra = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${extra}/>`;
    const svg = (body, description, width = 320, height = 250) => `<svg class="maths-diagram" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(description)}">${body}</svg>`;
    function clock(hour, minute) {
        let body = '<circle cx="160" cy="125" r="112" class="face"/>';
        for (let i = 0; i < 60; i++) {
            const a = point(160, 125, i % 5 ? 105 : 100, i * 6 - 90), b = point(160, 125, 109, i * 6 - 90);
            body += line(...a, ...b, i % 5 ? 'class="minor"' : '');
        }
        for (let i = 1; i <= 12; i++) { const p = point(160, 125, 86, i * 30 - 90); body += text(...p, i); }
        body += line(160, 125, ...point(160, 125, 54, hour * 30 + minute / 2 - 90), 'class="hour-hand"');
        body += line(160, 125, ...point(160, 125, 76, minute * 6 - 90), 'class="minute-hand"');
        body += '<circle cx="160" cy="125" r="5" class="dot"/>';
        return svg(body, `Clock: the short hand is ${minute ? 'between ' + hour + ' and ' + (hour % 12 + 1) : 'at ' + hour}; the long hand is ${minute % 5 ? minute % 5 + ' small ticks after ' + (Math.floor(minute / 5) || 12) : 'at ' + (minute / 5 || 12)}.`);
    }
    function pizza(n, d) {
        let body = '<circle cx="160" cy="125" r="103" class="crust"/>';
        for (let i = 0; i < d; i++) {
            const a = point(160, 125, 95, i * 360 / d - 90), b = point(160, 125, 95, (i + 1) * 360 / d - 90);
            body += `<path d="M160 125 L${a.join(' ')} A95 95 0 ${360 / d > 180 ? 1 : 0} 1 ${b.join(' ')} Z" class="${i < n ? 'pizza-filled' : 'pizza-empty'}"/>`;
            if (i < n) { const p = point(160, 125, 60, (i + .5) * 360 / d - 90); body += `<circle cx="${p[0]}" cy="${p[1]}" r="6" class="topping"/>`; }
        }
        return svg(body, `Pizza divided into ${d} equal slices; ${n} slices have shading and a topping, ${d - n} are plain.`);
    }
    function angle(degrees, protractor = false, missing = false) {
        const cx = 160, cy = 195, radius = 125;
        let body = '';
        if (protractor) {
            body += '<path d="M35 195 A125 125 0 0 1 285 195" class="guide"/>';
            for (let a = 0; a <= 180; a += 10) {
                body += line(...point(cx, cy, radius - 7, -a), ...point(cx, cy, radius, -a), 'class="minor"');
                body += text(...point(cx, cy, radius + 19, -a), a, 'class="small-label"');
            }
        }
        if (missing) body += line(35, cy, cx, cy);
        body += line(cx, cy, 285, cy) + line(cx, cy, ...point(cx, cy, radius, -degrees));
        body += `<path d="M198 195 A38 38 0 0 0 ${point(cx, cy, 38, -degrees).join(' ')}" class="angle-arc"/>`;
        if (missing) body += text(...point(cx, cy, 65, -degrees / 2), `${degrees}°`, 'class="small-label"') + text(...point(cx, cy, 65, -(180 + degrees) / 2), '?');
        return svg(body, missing ? `A straight line split into two adjacent angles: ${degrees} degrees and an unknown angle.` : protractor ? `Protractor with a baseline pointing right at 0 degrees. The other ray crosses the ${degrees} degree mark.` : `Two rays form ${degrees < 90 ? 'less than a quarter turn' : degrees === 90 ? 'a quarter turn' : degrees < 180 ? 'more than a quarter turn but less than a half turn' : 'a half turn'}.`);
    }
    function numberLine(start, step, index, jump = null) {
        let body = line(25, 110, 345, 110);
        for (let i = 0; i <= 8; i++) {
            const x = 25 + i * 40;
            body += line(x, 104, x, 116) + text(x, 140, i === index && jump === null ? '?' : Number((start + step * i).toFixed(2)), 'class="small-label"');
        }
        if (jump !== null) {
            const from = 25 + index * 40, to = 25 + (index + jump) * 40;
            body += `<path d="M${from} 92 Q${(from + to) / 2} 20 ${to} 92" class="angle-arc"/>`;
            body += `<path d="M${to - 5} 82 L${to} 92 L${to + 5} 82" class="angle-arc"/>`;
            body += text(from, 70, 'Start', 'class="small-label"');
        }
        return svg(body, `Number line from ${start} to ${start + 8 * step}, in steps of ${step}. ${jump === null ? 'The mark ' + index + ' intervals after the start has a question mark.' : 'Start at ' + (start + index * step) + ' and move ' + Math.abs(jump) + ' intervals ' + (jump > 0 ? 'right' : 'left') + '.'}`, 370, 180);
    }
    function rectangle(w, h, grid = false, hideHeight = false) {
        const scale = Math.min(230 / w, 150 / h), width = w * scale, height = h * scale, x = (320 - width) / 2, y = 40;
        let body = `<rect x="${x}" y="${y}" width="${width}" height="${height}" class="face"/>`;
        if (grid) {
            for (let i = 1; i < w; i++) body += line(x + i * scale, y, x + i * scale, y + height, 'class="minor"');
            for (let i = 1; i < h; i++) body += line(x, y + i * scale, x + width, y + i * scale, 'class="minor"');
        }
        body += text(160, y + height + 25, `${w} cm`) + text(160, 20, `${hideHeight ? "?" : h} cm high`);
        return svg(body, `Rectangle ${w} centimetres wide and ${hideHeight ? "an unknown height" : h + " centimetres high"}.${grid ? ' Divided into ' + h + ' rows of ' + w + ' unit squares.' : ''}`);
    }
    return { clock, pizza, angle, numberLine, rectangle };
})();
