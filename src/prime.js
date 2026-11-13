import { scanGamerPowerPrime } from './gamerpower.js';
import { scanFreeToGame } from './freetogame.js';

export async function scanPrimeGaming() {
  const ergebnisse = await Promise.all([scanGamerPowerPrime(), scanFreeToGame()]);
  return ergebnisse.flat();
}
