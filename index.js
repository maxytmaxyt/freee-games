import fs from 'node:fs';
import open from 'open';

import { scanEpicGames } from './src/epic.js';
import { scanSteam } from './src/steam.js';
import { scanGOG } from './src/gog.js';
import { scanHersteller } from './src/hersteller.js';
import { scanCommunityDeals } from './src/community.js';
import { baueHtml } from './src/html.js';

async function main() {
  console.log('🎮 Starte Multi-Scanner (Epic, Steam, GOG, Itch.io, Rockstar, Ubisoft, GamerPower & Reddit)...\n');

  const ergebnisse = await Promise.all([
    scanEpicGames(),
    scanSteam(),
    scanGOG(),
    scanHersteller(),
    scanCommunityDeals(),
  ]);

  const rohListe = ergebnisse.flat();

  // Duplikate anhand des Titels bereinigen (case-insensitive)
  const finaleListe = [];
  for (const eintrag of rohListe) {
    const doppelt = finaleListe.some(
      (x) =>
        x.titel.toLowerCase().includes(eintrag.titel.toLowerCase()) ||
        eintrag.titel.toLowerCase().includes(x.titel.toLowerCase())
    );
    if (!doppelt) {
      finaleListe.push(eintrag);
    }
  }

  const dateiName = 'gratis-spiele.html';
  fs.writeFileSync(dateiName, baueHtml(finaleListe), 'utf-8');
  console.log(`✅ Fertig! ${finaleListe.length} Angebote in "${dateiName}" gespeichert. Öffne Browser...`);
  await open(dateiName);
}

main();
