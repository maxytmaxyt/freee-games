import { USER_AGENT } from './constants.js';

export async function scanStove() {
  const treffer = [];
  try {
    const res = await fetch(
      'https://www.onstove.com/event/list?category=GAME_GIVE_AWAY&page=1&pageSize=10',
      { headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' } }
    );
    if (res.ok && res.headers.get('content-type')?.includes('json')) {
      const data = await res.json();
      for (const item of (data?.list ?? data?.data ?? []).slice(0, 10)) {
        const titel = item.title ?? item.eventName ?? item.name;
        if (!titel) continue;
        treffer.push({
          titel,
          plattform: 'STOVE',
          quelle: 'STOVE Giveaways',
          preis: 'Gratis',
          ende: item.endDate
            ? new Date(item.endDate).toLocaleString('de-DE')
            : 'Zeitlich begrenzt',
          link: item.url ?? 'https://www.onstove.com/event',
          bild: item.imageUrl ?? item.thumbnail ?? '',
        });
      }
    }
  } catch (e) {
    console.warn('STOVE-Scan übersprungen:', e.message);
  }
  return treffer;
}
