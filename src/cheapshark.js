/**
 * CheapShark API – trackt 35+ PC-Spielestores und liefert alle aktuellen 100%-Rabatte.
 * Kein API-Key erforderlich. Preise in USD.
 * Docs: https://apidocs.cheapshark.com/
 */
export async function scanCheapShark() {
  try {
    // Nur Deals mit 100% Rabatt (upperPrice=0) und mindestens einer Bewertung
    const url = 'https://www.cheapshark.com/api/1.0/deals?upperPrice=0&pageSize=60&sortBy=Recent';
    const res = await fetch(url);
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((deal) => ({
      titel: deal.title,
      plattform: storeIdZuName(deal.storeID),
      quelle: 'CheapShark API (35+ Stores)',
      preis: `${parseFloat(deal.normalPrice).toFixed(2)} $`,
      ende: 'Zeitlich begrenzt',
      link: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
      bild: deal.thumb || '',
    }));
  } catch (e) {
    console.warn('CheapShark-Scan übersprungen:', e.message);
    return [];
  }
}

/** Bekannte CheapShark Store-IDs → lesbarer Name */
function storeIdZuName(id) {
  const stores = {
    '1':  'Steam',
    '2':  'GamersGate',
    '3':  'GreenManGaming',
    '7':  'GOG',
    '8':  'Humble Store',
    '11': 'Fanatical',
    '13': 'Gamesplanet',
    '15': 'GameBillet',
    '21': 'IndieGala',
    '24': '2Game',
    '28': 'WinGameStore',
    '36': 'Epic Games Store',
  };
  return stores[String(id)] ?? `Store #${id}`;
}
