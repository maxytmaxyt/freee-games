import fs from 'node:fs';
import open from 'open';

import { scanEpicGames } from './src/epic.js';
import { scanSteam } from './src/steam.js';
import { scanGOG } from './src/gog.js';
import { scanHersteller } from './src/hersteller.js';
import { scanCommunityDeals } from './src/community.js';
import { scanCheapShark } from './src/cheapshark.js';
import { scanFreeStuff } from './src/freestuff.js';
import { scanPrimeGaming } from './src/prime.js';
import { scanHumble } from './src/humble.js';
import { baueHtml } from './src/html.js';

async function main() {
  console.log('🎮 Starte Multi-Scanner...');
  console.log('   Quellen: Epic, Steam, GOG, Itch.io, CheapShark (35+ Stores),');
  console.log('            FreeStuffBot, Prime Gaming, Humble Bundle, Rockstar, Ubisoft,');
  console.log('            GamerPower, Reddit r/FreeGameFindings\n');

  const ergebnisse = await Promise.all([
    scanEpicGames(),
    scanSteam(),
    scanGOG(),
    scanCheapShark(),
    scanFreeStuff(),
    scanPrimeGaming(),
    scanHumble(),
    scanHersteller(),
    scanCommunityDeals(),
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
