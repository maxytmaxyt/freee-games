import { USER_AGENT } from './constants.js';

/**
 * GamerPower – alle Plattformen.
 */
export async function scanGamerPower() {
  const treffer = [];
  try {
    const res = await fetch('https://www.gamerpower.com/api/giveaways?sort-by=value');
    const data = await res.json();
    if (Array.isArray(data)) {
      for (const item of data) {
        treffer.push({
          titel: item.title.replace(/\s*\(.*?\)\s*Giveaway/i, '').trim(),
          plattform: item.platforms,
          quelle: 'GamerPower',
          preis: item.worth !== 'N/A' ? item.worth : 'Kostenpflichtig',
          ende:
            item.end_date !== 'N/A'
              ? new Date(item.end_date).toLocaleString('de-DE')
              : 'Solange Vorrat reicht',
          link: item.open_giveaway_url,
          bild: item.image ?? '',
          art: /dlc/i.test(item.type ?? '') ? 'DLC' : 'Spiel',
        });
      }
    }
  } catch (e) {
    console.warn('GamerPower-Scan übersprungen:', e.message);
  }
  return treffer;
}

/**
 * GamerPower – Prime Gaming Filter (für Prime Gaming Scanner).
 */
export async function scanGamerPowerPrime() {
  const treffer = [];
  try {
    const res = await fetch(
      'https://www.gamerpower.com/api/giveaways?platform=prime-gaming&sort-by=value'
    );
    const data = await res.json();
    if (Array.isArray(data)) {
      for (const item of data) {
        treffer.push({
          titel: item.title.replace(/\s*\(.*?\)\s*Giveaway/i, '').trim(),
          plattform: 'Amazon Prime Gaming',
          quelle: 'GamerPower (Prime Gaming)',
          preis: item.worth !== 'N/A' ? item.worth : 'Kostenpflichtig',
          ende:
            item.end_date !== 'N/A'
              ? new Date(item.end_date).toLocaleString('de-DE')
              : 'Solange Vorrat reicht',
          link: item.open_giveaway_url,
          bild: item.image ?? '',
        });
      }
    }
  } catch (e) {
    console.warn('Prime-Gaming-Scan übersprungen:', e.message);
  }
  return treffer;
}

/**
 * GamerPower – Humble Bundle Filter (platform=steam, description enthält humble).
 */
export async function scanGamerPowerHumble() {
  const treffer = [];
  try {
    const res = await fetch(
      'https://www.gamerpower.com/api/giveaways?platform=steam&sort-by=value'
    );
    const data = await res.json();
    if (!Array.isArray(data)) return treffer;
    for (const item of data) {
      if (!/humble/i.test((item.description ?? '') + (item.platforms ?? ''))) continue;
      treffer.push({
        titel: item.title.replace(/\s*\(.*?\)\s*Giveaway/i, '').trim(),
        plattform: 'Humble Bundle',
        quelle: 'GamerPower (Humble Bundle)',
        preis: item.worth !== 'N/A' ? item.worth : 'Kostenpflichtig',
        ende:
          item.end_date !== 'N/A'
            ? new Date(item.end_date).toLocaleString('de-DE')
            : 'Solange Vorrat reicht',
        link: item.open_giveaway_url,
        bild: item.image ?? '',
      });
    }
  } catch (e) {
    console.warn('Humble-Scan übersprungen:', e.message);
  }
  return treffer;
}
