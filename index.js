import fs from 'node:fs';
import open from 'open';

import { scanEpicGames }      from './src/epic.js';
import { scanSteam }          from './src/steam.js';
import { scanGOG }            from './src/gog.js';
import { scanCheapShark }     from './src/cheapshark.js';
import { scanFreeStuff }      from './src/freestuff.js';
import { scanFreeToGame }     from './src/freetogame.js';
import { scanItch }           from './src/itch.js';
import { scanIndieGala }      from './src/indiegala.js';
import { scanStove }          from './src/stove.js';
import { scanFanatical }      from './src/fanatical.js';
import { scanGreenManGaming }  from './src/greenmangaming.js';
import { scanGamesplanet }    from './src/gamesplanet.js';
import { scanRockstar }       from './src/rockstar.js';
import { scanUbisoft }        from './src/ubisoft.js';
import {
  scanGamerPower,
  scanGamerPowerPrime,
  scanGamerPowerHumble,
} from './src/gamerpower.js';
import { baueHtml } from './src/html.js';

async function main() {
  console.log('🎮 Starte Einmal-Scan...\n');

  const ergebnisse = await Promise.all([
    scanEpicGames(), scanSteam(), scanGOG(),
    scanCheapShark(), scanFreeStuff(),
    scanGamerPower(), scanGamerPowerPrime(), scanGamerPowerHumble(),
    scanFreeToGame(), scanItch(), scanIndieGala(), scanStove(),
    scanFanatical(), scanGreenManGaming(), scanGamesplanet(),
    scanRockstar(), scanUbisoft(),
  ]);

  const rohListe = ergebnisse.flat();
  const finaleListe = [];
  for (const eintrag of rohListe) {
    const titelNorm = eintrag.titel.toLowerCase();
    const doppelt = finaleListe.some((x) => {
      const xNorm = x.titel.toLowerCase();
      return xNorm.includes(titelNorm) || titelNorm.includes(xNorm);
    });
    if (!doppelt) finaleListe.push(eintrag);
  }

  const dateiName = 'gratis-spiele.html';
  fs.writeFileSync(dateiName, baueHtml(finaleListe), 'utf-8');
  console.log(`✅ Fertig! ${finaleListe.length} Angebote in "${dateiName}" gespeichert.`);
  await open(dateiName);
}

main();
