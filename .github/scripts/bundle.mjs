/**
 * bundle.mjs – baut alle JS-Dateien in eine einzige all.js zusammen.
 *
 * Reihenfolge (Abhängigkeiten zuerst, Einstiegspunkt zuletzt):
 *   0. src/constants.js   – gemeinsame Konstanten (USER_AGENT usw.)
 *   1. src/html.js        – HTML-Generator
 *   2. src/epic.js        – Scanner
 *   3. src/steam.js       – Scanner
 *   4. src/gog.js         – Scanner
 *   5. src/cheapshark.js  – Scanner
 *   6. src/freestuff.js   – Scanner
 *   7. src/prime.js       – Scanner
 *   8. src/humble.js      – Scanner
 *   9. src/hersteller.js  – Scanner (braucht cheerio)
 *  10. src/community.js   – Scanner
 *  11. server.js          – HTTP-Server + Scheduler (Einstiegspunkt)
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
  'src/indiegala.js',
  'src/itch.js',
  'src/stove.js',
  'src/fanatical.js',
  'src/greenmangaming.js',
  'src/gamesplanet.js',
  'src/rockstar.js',
  'src/ubisoft.js',
  'src/freetogame.js',
  'src/epic.js',
  'src/steam.js',
  'src/gog.js',
  'src/cheapshark.js',
  'src/freestuff.js',
  'src/prime.js',
  'src/humble.js',
  'src/hersteller.js',
  'src/community.js',
  'server.js',
];

// Externe Imports sammeln (node:*, cheerio, open) – lokale weglassen
const externeImports = new Set();

function verarbeite(dateiPfad) {
  const inhalt = fs.readFileSync(path.join(ROOT, dateiPfad), 'utf-8');
  const ausgabe = [];

  for (const zeile of inhalt.split('\n')) {
    const trimmed = zeile.trim();

    if (/^import\s/.test(trimmed)) {
      const match = trimmed.match(/from\s+['"]([^'"]+)['"]/);
      if (match) {
        if (match[1].startsWith('.')) {
          continue; // lokaler Import → inline gebündelt, weglassen
        } else {
          externeImports.add(zeile.trimEnd()); // externer Import → oben sammeln
          continue;
        }
      }
    }

    // export-Keyword entfernen
    ausgabe.push(zeile.replace(/^export\s+default\s+/, '').replace(/^export\s+/, ''));
  }

  return ausgabe.join('\n');
}

// Alle Dateien verarbeiten
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

const externalBlock = [...externeImports].sort().join('\n') + '\n\n';
const ausgabe = header + externalBlock + sektionen.join('\n');

fs.writeFileSync(path.join(ROOT, 'all.js'), ausgabe, 'utf-8');

const zeilen = ausgabe.split('\n').length;
const kb = (Buffer.byteLength(ausgabe, 'utf-8') / 1024).toFixed(1);
console.log(`✅ all.js erstellt – ${zeilen} Zeilen, ${kb} KB`);
console.log(`   Externe Imports: ${externeImports.size}`);
console.log(`   Gebündelte Dateien: ${DATEIEN.length}`);
