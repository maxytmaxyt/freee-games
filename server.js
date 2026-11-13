import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

import { scanEpicGames }     from './src/epic.js';
import { scanSteam }         from './src/steam.js';
import { scanGOG }           from './src/gog.js';
import { scanCheapShark }    from './src/cheapshark.js';
import { scanFreeStuff }     from './src/freestuff.js';
import { scanFreeToGame }    from './src/freetogame.js';
import { scanItch }          from './src/itch.js';
import { scanIndieGala }     from './src/indiegala.js';
import { scanStove }         from './src/stove.js';
import { scanFanatical }     from './src/fanatical.js';
import { scanGreenManGaming } from './src/greenmangaming.js';
import { scanGamesplanet }   from './src/gamesplanet.js';
import { scanRockstar }      from './src/rockstar.js';
import { scanUbisoft }       from './src/ubisoft.js';
import {
  scanGamerPower,
  scanGamerPowerPrime,
  scanGamerPowerHumble,
} from './src/gamerpower.js';
import { baueHtml }          from './src/html.js';

const PORT                = parseInt(process.env.PORT               ?? '3000', 10);
const SCAN_INTERVAL_HOURS = parseInt(process.env.SCAN_INTERVAL_HOURS ?? '6',    10);
const HTML_PATH           = path.resolve('gratis-spiele.html');

// ── Scanner ────────────────────────────────────────────────────────────────

async function runScan() {
  console.log(`[${timestamp()}] 🔍 Starte Scan...`);
  try {
    const ergebnisse = await Promise.all([
      // Offizielle Store-APIs
      scanEpicGames(),
      scanSteam(),
      scanGOG(),
      // Aggregatoren / Datenbanken
      scanCheapShark(),
      scanFreeStuff(),
      scanGamerPower(),
      scanGamerPowerPrime(),
      scanGamerPowerHumble(),
      scanFreeToGame(),
      // Direkter Store-Scan
      scanItch(),
      scanIndieGala(),
      scanStove(),
      scanFanatical(),
      scanGreenManGaming(),
      scanGamesplanet(),
      scanRockstar(),
      scanUbisoft(),
    ]);

    const rohListe = ergebnisse.flat();

    // Duplikate anhand des Titels bereinigen (case-insensitive, bidirektional)
    const finaleListe = [];
    for (const eintrag of rohListe) {
      const titelNorm = eintrag.titel.toLowerCase();
      const doppelt = finaleListe.some((x) => {
        const xNorm = x.titel.toLowerCase();
        return xNorm.includes(titelNorm) || titelNorm.includes(xNorm);
      });
      if (!doppelt) finaleListe.push(eintrag);
    }

    fs.writeFileSync(HTML_PATH, baueHtml(finaleListe), 'utf-8');
    console.log(`[${timestamp()}] ✅ Scan fertig – ${finaleListe.length} Angebote gefunden.`);
  } catch (err) {
    console.error(`[${timestamp()}] ❌ Scan-Fehler:`, err.message);
  }
}

// ── HTTP-Server ────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/status') {
    const stat = fs.existsSync(HTML_PATH) ? fs.statSync(HTML_PATH) : null;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      letzterScan:   stat ? stat.mtime.toLocaleString('de-DE') : 'noch kein Scan',
      naechsterScan: `in ca. ${SCAN_INTERVAL_HOURS}h`,
      port: PORT,
    }));
    return;
  }

  if (url.pathname === '/scan') {
    runScan();
    res.writeHead(202, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Scan gestartet – Seite in ~30 Sekunden aktuell.\n');
    return;
  }

  if (!fs.existsSync(HTML_PATH)) {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Scan läuft noch, bitte kurz warten…');
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'public, max-age=300',
  });
  fs.createReadStream(HTML_PATH).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[${timestamp()}] 🚀 Server läuft auf Port ${PORT}`);
  console.log(`[${timestamp()}] 🔄 Scan-Intervall: alle ${SCAN_INTERVAL_HOURS} Stunden`);
  console.log(`[${timestamp()}]    Routen: /  →  HTML-Seite | /status  →  JSON | /scan  →  Scan starten`);
});

runScan();
setInterval(runScan, SCAN_INTERVAL_HOURS * 60 * 60 * 1000);

function timestamp() {
  return new Date().toLocaleString('de-DE');
}
