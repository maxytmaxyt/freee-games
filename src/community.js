import { scanGamerPower } from './gamerpower.js';
import { scanIndieGala } from './indiegala.js';
import { scanItch } from './itch.js';
import { scanStove } from './stove.js';
import { scanFanatical } from './fanatical.js';
import { scanGreenManGaming } from './greenmangaming.js';
import { scanGamesplanet } from './gamesplanet.js';

/**
 * Aggregator: Community-Datenbanken + neue Stores.
 */
export async function scanCommunityDeals() {
  const ergebnisse = await Promise.all([
    scanGamerPower(),
    scanIndieGala(),
    scanItch(),
    scanStove(),
    scanFanatical(),
    scanGreenManGaming(),
    scanGamesplanet(),
  ]);
  return ergebnisse.flat();
}
