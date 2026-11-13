# 🎮 Free Games Scanner

Scannt automatisch **12 Quellen** nach aktuellen Gratis-Spielen und stellt die Ergebnisse als Webseite bereit.

---

## 🚀 Pterodactyl-Setup (Node.js Egg)

### 1. Egg einrichten

| Einstellung | Wert |
|---|---|
| **Egg** | `Node.js` (beliebige Version ≥ 18) |
| **Startup-Befehl** | `node server.js` |
| **Port** | beliebig – Pterodactyl weist automatisch einen zu |

### 2. Umgebungsvariablen (optional)

Im Pterodactyl-Panel unter **„Startup"** → **„Environment Variables"** eintragen:

| Variable | Standard | Beschreibung |
|---|---|---|
| `PORT` | `3000` | HTTP-Port (Pterodactyl setzt das automatisch) |
| `SCAN_INTERVAL_HOURS` | `6` | Wie oft (in Stunden) neu gescannt wird |

> **Tipp:** Pterodactyl setzt `PORT` automatisch – du musst nichts ändern.

### 3. Dateien hochladen

Alle Dateien aus diesem Repository in den Server-Ordner hochladen (außer `node_modules/`).

### 4. npm install ausführen

Im Pterodactyl-Terminal:
```bash
npm install
```

### 5. Server starten

Einfach den Server im Panel starten. Beim ersten Start scannt er sofort.

---

## 🌐 Routen

| Route | Beschreibung |
|---|---|
| `/` | HTML-Übersichtsseite mit allen Gratis-Spielen |
| `/status` | JSON-Status (letzter Scan, nächster Scan) |
| `/scan` | Manuellen Scan sofort auslösen |

---

## 📦 Quellen (erweitert)

| Quelle | Datei | API-Key? |
|---|---|---|
| Epic Games Store | `src/epic.js` | Nein |
| Steam (100% Rabatt) | `src/steam.js` | Nein |
| GOG | `src/gog.js` | Nein |
| CheapShark (35+ Stores) | `src/cheapshark.js` | Nein |
| FreeStuffBot | `src/freestuff.js` | Nein |
| Amazon Prime Gaming | `src/prime.js` / `src/gamerpower.js` | Nein |
| Humble Bundle | `src/humble.js` | Nein |
| Rockstar | `src/rockstar.js` | Nein |
| Ubisoft | `src/ubisoft.js` | Nein |
| GamerPower | `src/gamerpower.js` | Nein |
| IndieGala | `src/indiegala.js` | Nein |
| Itch.io | `src/itch.js` | Nein |
| STOVE | `src/stove.js` | Nein |
| Fanatical | `src/fanatical.js` | Nein |
| Green Man Gaming | `src/greenmangaming.js` | Nein |
| Gamesplanet | `src/gamesplanet.js` | Nein |
| FreeToGame | `src/freetogame.js` | Nein |

> Alle APIs sind kostenlos und brauchen keinen API-Key.

---

## 📁 Dateistruktur

```
freee-games/
├── server.js         ← Pterodactyl-Einstiegspunkt (HTTP-Server + Scheduler)
├── index.js          ← Lokaler Einmal-Scan (öffnet Browser)
├── package.json
├── README.md
└── src/
    ├── meta.js
    ├── styles.js
    ├── client.js
    ├── html.js
    ├── constants.js
    ├── epic.js
    ├── steam.js
    ├── gog.js
    ├── cheapshark.js
    ├── freestuff.js
    ├── prime.js
    ├── humble.js
    ├── hersteller.js
    ├── community.js
    ├── gamerpower.js
    ├── indiegala.js
    ├── itch.js
    ├── stove.js
    ├── fanatical.js
    ├── greenmangaming.js
    ├── gamesplanet.js
    ├── rockstar.js
    ├── ubisoft.js
    └── freetogame.js
```

---

## 💻 Lokal testen

```bash
npm install
npm run scan    # einmaliger Scan, öffnet Browser
npm start       # startet den Web-Server lokal auf Port 3000
```
