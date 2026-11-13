import { scanRockstar } from './rockstar.js';
import { scanUbisoft } from './ubisoft.js';

export async function scanHersteller() {
  const ergebnisse = await Promise.all([scanRockstar(), scanUbisoft()]);
  return ergebnisse.flat();
}
