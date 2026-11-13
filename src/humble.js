import { scanGamerPowerHumble } from './gamerpower.js';

export async function scanHumble() {
  const treffer = await scanGamerPowerHumble();

  // Direkter Humble Choice / Trove-Hinweis als statischer Eintrag
  treffer.push({
    titel: 'Humble Choice – Monatliche Gratis-Spiele',
    plattform: 'Humble Bundle',
    quelle: 'Humble Bundle (Direktlink)',
    preis: 'Humble Choice Abo',
    ende: 'Monatlich wechselnd',
    link: 'https://www.humblebundle.com/membership',
    bild: '',
  });

  return treffer;
}
