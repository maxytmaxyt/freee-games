/**
 * bundle.mjs – baut alle JS-Dateien in eine einzige all.js zusammen.
 */

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const DATEIEN = [
  'src/constants.js',
  'src/meta.js',
  'src/styles.js',
  'src/client.js',
  'src/html.js',
  'src/gamerpower.js',
  'src/cheapshark.js',
  'src/epic.js',
  'src/fanatical.js',
  'src/freetogame.js',
  'src/gamesplanet.js',
  'src/gog.js',
  'src/greenmangaming.js',
  'src/indiegala.js',
  'src/itch.js',
  'src/rockstar.js',
  'src/steam.js',
  'src/stove.js',
  'src/ubisoft.js',
  'src/freestuff.js',
  'server.js',
];

const externeImports = new Set();

function verarbeite(dateiPfad) {
  const inhalt = fs.readFileSync(path.join(ROOT, dateiPfad), 'utf-8');
  const ausgabe = [];
  const zeilen = inhalt.split('\n');
  let i = 0;

  while (i < zeilen.length) {
    const zeile = zeilen[i];
    const trimmed = zeile.trim();

    // Einzeiliger Import: import X from '...'  oder  import { X } from '...'
    if (/^import\s/.test(trimmed) && trimmed.includes('from')) {
      const quelle = (trimmed.match(/from\s+['"]([^'"]+)['"]/) || [])[1];
      if (quelle) {
        if (!quelle.startsWith('.')) externeImports.add(zeile.trimEnd());
        i++;
        continue;
      }
    }

    // Mehrzeiliger Import: import {\n  a,\n  b,\n} from '...'
    if (/^import\s*\{/.test(trimmed) && !trimmed.includes('from')) {
      let block = zeile;
      i++;
      while (i < zeilen.length) {
        block += '\n' + zeilen[i];
        if (zeilen[i].includes('from')) break;
        i++;
      }
      const quelle = (block.match(/from\s+['"]([^'"]+)['"]/) || [])[1];
      if (quelle && !quelle.startsWith('.')) {
        // Mehrzeiligen externen Import einzeilig normalisieren
        const names = block.match(/\{([^}]+)\}/)?.[1]
          .split(',').map(s => s.trim()).filter(Boolean).join(', ');
        externeImports.add(`import { ${names} } from '${quelle}';`);
      }
      // lokale mehrzeilige Imports einfach weglassen
      i++;
      continue;
    }

    // export-Keyword entfernen
    ausgabe.push(zeile.replace(/^export\s+default\s+/, '').replace(/^export\s+/, ''));
    i++;
  }

  return ausgabe.join('\n');
}

const sektionen = DATEIEN.map((datei) => {
  const inhalt = verarbeite(datei);
  const banner = `\n// ${'─'.repeat(70)}\n// 📄 ${datei}\n// ${'─'.repeat(70)}\n`;
  return banner + inhalt;
});

const header = `// ============================================================
// all.js – automatisch gebündelt aus allen Quelldateien
// Generiert: ${new Date().toLocaleString('de-DE')}
// Quelldateien: ${DATEIEN.join(', ')}
// ============================================================

`;

const ausgabe = header + [...externeImports].sort().join('\n') + '\n\n' + sektionen.join('\n');
fs.writeFileSync(path.join(ROOT, 'all.js'), ausgabe, 'utf-8');

const zeilen = ausgabe.split('\n').length;
const kb = (Buffer.byteLength(ausgabe, 'utf-8') / 1024).toFixed(1);
console.log(`✅ all.js erstellt – ${zeilen} Zeilen, ${kb} KB`);
console.log(`   Externe Imports: ${externeImports.size}`);
console.log(`   Gebündelte Dateien: ${DATEIEN.length}`);
