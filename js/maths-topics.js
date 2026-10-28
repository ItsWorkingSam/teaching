/* Topic definitions and generated questions, independent of page/game state.
   A question supplies prompt, diagram, answer, explanation and optional choices.
   Add a topic here to include it automatically in the maths hub. */
const MathsTopics = (() => {
    const D = MathsDiagrams, { int, pick, shuffle } = Rand;
    const level = (name, blurb) => ({ name, blurb });
    const time = total => `${Math.floor(((total % 720) + 720) % 720 / 60) || 12}:${String(total % 60).padStart(2, '0')}`;
    const question = (prompt, diagram, answer, explain, extra = {}) => ({ prompt, diagram, answer, explain, ...extra });
    const choices = values => shuffle([...new Set(values.map(String))]);
    const topics = {
        clocks: {
            title: 'Reading Clocks', icon: 'ph-clock', description: 'Tell the time, from whole hours to minutes and elapsed time.',
            hint: 'The short, thick hand shows hours. The long, thin hand shows minutes. Each number around the clock is another 5 minutes.',
            levels: [level('Whole hours', 'Read times such as 3:00'), level('Halves & quarters', 'Half past, quarter past and quarter to'), level('Minutes', 'Read any minute on the clock'), level('Time passing', 'Work out the time after a wait')],
            make(l) {
                const h = int(1, 12), m = l === 1 ? 0 : l === 2 ? pick([0, 15, 30, 45]) : int(0, 59), start = h * 60 + m;
                const wait = l === 4 ? pick([15, 25, 40, 50, 75, 90]) : 0, answer = time(start + wait);
                return question(wait ? `This is the time now. What time will it be in ${wait} minutes?` : 'What time does the clock show?', D.clock(h, m), answer,
                    wait ? `Start at ${time(start)}. Add ${wait} minutes, carrying every 60 minutes into the next hour. The time is ${answer}.` : `The short hand shows ${h}${m ? ' and is moving towards ' + (h % 12 + 1) : ''}. The long hand shows ${m} minutes past the hour: ${answer}.`,
                    { choices: choices([answer, time(start + wait + 60), time(start + wait + (l === 1 ? 120 : 15)), time(start + wait + (l === 1 ? 180 : 30))]), caption: 'Short, thick hand = hours · Long, thin hand = minutes', review: `Clock at ${time(start)}${wait ? ' + ' + wait + ' minutes' : ''}` });
            }
        },
        fractions: {
            title: 'Pizza Fractions', icon: 'ph-chart-pie-slice', description: 'See parts of a whole, equivalent fractions and percentages.',
            hint: 'The bottom number counts all the equal slices. The top number counts the slices with toppings. Equal fractions describe the same amount.',
            levels: [level('Halves & quarters', 'Name the shaded part'), level('More slices', 'Thirds, fifths, sixths and eighths'), level('Equal fractions', 'Find an equivalent fraction'), level('Percentages', 'Turn a fraction into a percentage')],
            make(l) {
                const d = pick(l === 1 ? [2, 4] : l === 4 ? [2, 4, 5, 10] : [3, 5, 6, 8]), n = int(1, d - 1), fraction = `${n}/${d}`;
                if (l === 3) {
                    const factor = pick([2, 3]), answer = `${n * factor}/${d * factor}`;
                    return question('Which fraction is equal to the part with toppings?', D.pizza(n, d), answer,
                        `There are ${n} slices with toppings out of ${d}: ${fraction}. Multiply both numbers by ${factor}: ${fraction} = ${answer}.`,
                        { choices: choices([answer, `${n * factor + 2}/${d * factor}`, `${n * factor + 1}/${d * factor}`, `${n * factor - 1}/${d * factor}`]), review: `Equivalent to ${fraction}` });
                }
                if (l === 4) return question('What percentage of the pizza has toppings?', D.pizza(n, d), n / d * 100,
                    `${fraction} means ${n} ÷ ${d}. Multiply by 100 to get ${n / d * 100}%.`, { unit: '%', review: `${fraction} as a percentage` });
                return question('What fraction of the pizza has toppings?', D.pizza(n, d), fraction,
                    `${n} of the ${d} equal slices have toppings, so the fraction is ${fraction}.`,
                    { choices: choices([fraction, `${d - n === n ? d : d - n}/${d}`, `${n}/${d + 1}`, `${n + 1}/${d + 1}`]), review: `${n} out of ${d} slices` });
            }
        },
        angles: {
            title: 'Angles', icon: 'ph-angle', description: 'Recognise turns, read a protractor and work out missing angles.',
            hint: 'A right angle is a quarter turn (90°). A straight line is a half turn (180°). A full turn is 360°. Start at 0 on the right of the protractor.',
            levels: [level('Recognise angles', 'Acute, right, obtuse and straight'), level('Read degrees', 'Use a labelled protractor'), level('On a straight line', 'Find the missing angle'), level('Around a point', 'Complete a full turn')],
            make(l) {
                const a = pick([30, 40, 50, 60, 70, 90, 110, 120, 130, 140, 150, 180]);
                if (l === 1) {
                    const answer = a < 90 ? 'Acute' : a === 90 ? 'Right' : a < 180 ? 'Obtuse' : 'Straight';
                    return question('What kind of angle is shown?', D.angle(a), answer,
                        `${answer}: ${a < 90 ? 'less than 90°' : a === 90 ? 'exactly 90°' : a < 180 ? 'more than 90° and less than 180°' : 'exactly 180°'}.`,
                        { choices: choices(['Acute', 'Right', 'Obtuse', 'Straight']), review: `${a}° angle` });
                }
                if (l === 2) return question('How many degrees is the angle? Read from 0 on the right.', D.angle(a, true), a, `Follow the scale from 0 on the right to where the other ray meets ${a}°.`, { unit: 'degrees', review: `Protractor at ${a}°` });
                const known = a === 180 ? 90 : a;
                if (l === 3) return question('What is the missing angle marked ? on the straight line?', D.angle(known, false, true), 180 - known, `Angles on a straight line add to 180°. Subtract the known angle: 180 − ${known} = ${180 - known}°.`, { unit: 'degrees', review: `Straight line with ${known}°` });
                return question(`The smaller turn is ${known}°. How many degrees is the remaining turn back to the start?`, D.angle(known), 360 - known, `A full turn is 360°. The remaining turn is 360 − ${known} = ${360 - known}°.`, { unit: 'degrees', caption: `The small arc is ${known}°. Find the rest of the full turn.`, review: `Full turn minus ${known}°` });
            }
        },
        'number-lines': {
            title: 'Number Lines', icon: 'ph-arrows-left-right', description: 'Count along a scale, use negative numbers and read decimals.',
            hint: 'Each gap is the same size. Move right to add and left to subtract. Check two neighbouring labels to find the size of one step.',
            levels: [level('Count in ones', 'Find a missing number'), level('Equal steps', 'Count in twos, fives and tens'), level('Below zero', 'Move along negative numbers'), level('Decimals', 'Read tenths and halves')],
            make(l) {
                const step = l === 1 || l === 3 ? 1 : l === 2 ? pick([2, 5, 10]) : pick([.1, .5]);
                const start = l === 3 ? -int(3, 8) : l === 4 ? int(0, 3) : int(0, 3) * step;
                const index = int(1, 7), jump = l === 3 ? pick([-1, 1]) * int(1, Math.min(index, 8 - index)) : null;
                const answer = Number((start + (index + (jump || 0)) * step).toFixed(2));
                return question(jump === null ? 'What number belongs at the question mark?' : `Start at ${start + index}. Move ${Math.abs(jump)} ${Math.abs(jump) === 1 ? 'step' : 'steps'} ${jump > 0 ? 'right' : 'left'}. Where do you finish?`, D.numberLine(start, step, index, jump), answer,
                    jump === null ? `Each gap is ${step}. Count ${index} gaps from ${start}: ${start} + ${index} × ${step} = ${answer}.` : `Moving ${jump > 0 ? 'right adds' : 'left subtracts'} ${Math.abs(jump)}: ${start + index} ${jump > 0 ? '+' : '−'} ${Math.abs(jump)} = ${answer}.`, { review: `Number line from ${start}, steps of ${step}, mark ${index}${jump ? ', move ' + jump : ''}` });
            }
        },
        shapes: {
            title: 'Shape Measurements', icon: 'ph-grid-four', description: 'Count squares, measure around shapes and calculate area.',
            hint: 'Area measures the space inside a shape, in square units. Perimeter measures the distance all the way around the outside.',
            levels: [level('Count squares', 'Find area by counting'), level('Around the edge', 'Add sides to find perimeter'), level('Rectangle area', 'Multiply width by height'), level('Missing side', 'Use area to find a length')],
            make(l) {
                const w = int(2, l === 1 ? 5 : 12), h = int(2, l === 1 ? 4 : 9), diagram = D.rectangle(w, h, l === 1);
                if (l === 1 || l === 3) return question(l === 1 ? 'Each small square is 1 cm². What is the total area?' : 'What is the area of this rectangle?', diagram, w * h,
                    `${h} rows of ${w} square centimetres: ${w} × ${h} = ${w * h} cm².`, { unit: 'cm²', review: `Area of ${w} cm × ${h} cm` });
                if (l === 2) return question('What is the perimeter (distance all the way around)?', diagram, 2 * (w + h), `Opposite sides are equal. Add all four sides: ${w} + ${h} + ${w} + ${h} = ${2 * (w + h)} cm.`, { unit: 'cm', review: `Perimeter of ${w} cm × ${h} cm` });
                return question(`The area is ${w * h} cm². The width is ${w} cm. What is the height?`, D.rectangle(w, h, false, true), h,
                    `Area = width × height, so height = area ÷ width. ${w * h} ÷ ${w} = ${h} cm.`, { unit: 'cm', caption: 'Use the measurements, not the size of the drawing.', review: `Area ${w * h} cm², width ${w} cm` });
            }
        }
    };
    // Stable IDs include the underlying diagram, not only the repeated prompt.
    for (const [key, topic] of Object.entries(topics)) {
        const make = topic.make;
        topic.make = l => {
            const q = make(l);
            q.id = `${key}:${l}:${q.review}:${q.answer}`;
            return q;
        };
    }
    return topics;
})();
