const fs = require('node:fs/promises');
const names = ['mara','ellis','tomas','inez','rowan','ada','felix','nora','leon','sana','hugo','vera'];
(async () => {
 await Promise.all(names.map(async name => {
  const url = `https://api.dicebear.com/9.x/adventurer/svg?seed=${name}&backgroundColor=b6c7b6`;
  const r = await fetch(url); if (!r.ok) throw Error(`${name}: ${r.status}`);
  await fs.writeFile(`assets/detective-town/${name}.svg`, await r.text());
 }));
 console.log('Downloaded 12 locally hosted character portraits.');
})().catch(e => { console.error(e); process.exitCode = 1; });
