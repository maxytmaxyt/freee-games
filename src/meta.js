/**
 * Gemeinsame Metadaten-Helfer: Typ/Art bestimmen, DLC-Erkennung, Normalisierung.
 */

const DLC_MUSTER = /dlc|add[- ]?on|addon|erweiterung|season pass|skin pack|costume pack|item pack|map pack/i;
const BUNDLE_MUSTER = /bundle|collection|komplettpaket|paket/i;
const F2P_MUSTER = /free[- ]?to[- ]?play|f2p/i;

export function bestimmeArt(eintrag) {
  const text = `${eintrag.titel ?? ''} ${eintrag.quelle ?? ''} ${eintrag.plattform ?? ''} ${eintrag.preis ?? ''}`.toLowerCase();
  if (DLC_MUSTER.test(text)) return 'DLC';
  if (F2P_MUSTER.test(text) || /free-to-play/i.test(eintrag.preis ?? '')) return 'Free-to-Play';
  if (BUNDLE_MUSTER.test(text)) return 'Bundle';
  if (/giveaway/i.test(text)) return 'Giveaway';
  return 'Spiel';
}

export function istDlc(eintrag) {
  return bestimmeArt(eintrag) === 'DLC';
}

export function endeTimestamp(ende) {
  if (!ende) return 0;
  const s = String(ende).toLowerCase();
  if (/dauerhaft|solange vorrat|unbegrenzt|permanent/i.test(s)) return Number.MAX_SAFE_INTEGER;
  // Versuche deutsche Datumsangabe zu parsen
  const m = s.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})(?:.*?(\d{1,2}):(\d{2}))?/);
  if (m) {
    const [, d, mo, y, h = '0', mi = '0'] = m;
    const ts = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi)).getTime();
    if (!isNaN(ts)) return ts;
  }
  const parsed = Date.parse(ende);
  return isNaN(parsed) ? 0 : parsed;
}

export function normalisiere(eintrag) {
  const art = eintrag.art ?? bestimmeArt(eintrag);
  return {
    ...eintrag,
    art,
    istDlc: eintrag.istDlc ?? (art === 'DLC'),
    endeTs: eintrag.endeTs ?? endeTimestamp(eintrag.ende),
  };
}

export const QUELLEN_LINKS = {
  'Epic Games Store': 'https://store.epicgames.com/de/free-games',
  'Steam': 'https://store.steampowered.com/search/?specials=1&maxprice=free',
  'GOG': 'https://www.gog.com/games?priceRange=0,0',
  'Rockstar Games Launcher': 'https://www.rockstargames.com',
  'Ubisoft Connect': 'https://www.ubisoft.com/de-de/games',
  'Amazon Prime Gaming': 'https://gaming.amazon.com/home',
  'Humble Bundle': 'https://www.humblebundle.com/store',
  'Itch.io': 'https://itch.io/games/on-sale',
  'IndieGala': 'https://www.indiegala.com/freebies',
  'STOVE': 'https://www.onstove.com',
  'Fanatical': 'https://www.fanatical.com/de/free-games',
  'Green Man Gaming': 'https://www.greenmangaming.com/de/free-games/',
  'Gamesplanet': 'https://de.gamesplanet.com/games?price=0',
  'FreeToGame': 'https://www.freetogame.com',
};
