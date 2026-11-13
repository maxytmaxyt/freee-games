export const STYLES = `
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: #0f1115;
      color: #e6e8ec;
      margin: 0;
      padding: 2rem 1rem;
    }
    header { text-align: center; margin-bottom: 2rem; }
    h1 { margin: 0 0 0.5rem; font-size: 2rem; color: #ffffff; }
    .meta { color: #8b949e; font-size: 0.88rem; margin-bottom: 1rem; }
    .plattformen { display: flex; flex-wrap: wrap; gap: 0.4rem; justify-content: center; margin-bottom: 1.5rem; }
    .plattform-badge {
      font-size: 0.72rem;
      padding: 0.2rem 0.65rem;
      border-radius: 999px;
      background: #21262d;
      border: 1px solid #30363d;
      color: #c9d1d9;
      text-decoration: none;
    }
    .plattform-badge:hover { border-color: #58a6ff; color: #58a6ff; }

    /* ── Toolbar ─────────────────────────────────────────────────── */
    .toolbar {
      max-width: 1400px;
      margin: 0 auto 1.5rem;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: center;
    }
    .toolbar-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
      align-items: center;
      width: 100%;
    }
    .toolbar label { font-size: 0.82rem; color: #8b949e; white-space: nowrap; }
    .toolbar select, .toolbar input[type="text"] {
      background: #0f1115;
      color: #e6e8ec;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 0.4rem 0.65rem;
      font-size: 0.85rem;
      outline: none;
      cursor: pointer;
      min-width: 130px;
    }
    .toolbar select:focus, .toolbar input[type="text"]:focus {
      border-color: #58a6ff;
    }
    .toolbar input[type="text"] { min-width: 200px; }
    .toolbar input[type="text"]::placeholder { color: #484f58; }
    .toggle-wrap {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: #0f1115;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 0.4rem 0.65rem;
      cursor: pointer;
      font-size: 0.82rem;
      color: #c9d1d9;
      user-select: none;
    }
    .toggle-wrap input[type="checkbox"] { accent-color: #1f6feb; cursor: pointer; }
    .toggle-wrap:has(input:checked) { border-color: #1f6feb; color: #58a6ff; }
    .counter-badge {
      margin-left: auto;
      font-size: 0.82rem;
      color: #3fb950;
      font-weight: 600;
      white-space: nowrap;
    }
    .reset-btn {
      background: none;
      border: 1px solid #30363d;
      border-radius: 6px;
      color: #8b949e;
      font-size: 0.82rem;
      padding: 0.4rem 0.65rem;
      cursor: pointer;
      white-space: nowrap;
    }
    .reset-btn:hover { border-color: #58a6ff; color: #58a6ff; }

    /* ── Grid & Cards ────────────────────────────────────────────── */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
      gap: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    .card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, border-color 0.2s;
    }
    .card:hover { transform: translateY(-4px); border-color: #58a6ff; }
    .card.dlc   { border-left: 4px solid #f0883e; }
    .card img {
      width: 100%;
      height: 165px;
      object-fit: cover;
      background: #21262d;
      display: block;
    }
    .no-img {
      height: 165px;
      background: linear-gradient(135deg, #1f2937, #111827);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #8b949e;
      font-size: 1.1rem;
    }
    .body { padding: 1.25rem; display: flex; flex-direction: column; flex-grow: 1; }
    .tags { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
    .tag { font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 999px; font-weight: 600; }
    .store     { background: #238636; color: #fff; }
    .source    { background: #30363d; color: #c9d1d9; }
    .art       { background: #1f6feb; color: #fff; }
    .dlc-badge { background: #f0883e; color: #fff; }
    h2 { font-size: 1.1rem; margin: 0 0 0.75rem; line-height: 1.35; }
    p  { margin: 0.25rem 0; font-size: 0.88rem; color: #8b949e; }
    .free { color: #3fb950; font-weight: bold; }
    .btn {
      display: block;
      text-align: center;
      background: #1f6feb;
      color: #fff;
      text-decoration: none;
      padding: 0.75rem;
      border-radius: 8px;
      font-weight: 600;
      margin-top: auto;
      transition: background 0.15s;
    }
    .btn:hover { background: #388bfd; }
    .empty { text-align: center; grid-column: 1 / -1; color: #8b949e; padding: 3rem; }

    /* ── Quellen-Footer ─────────────────────────────────────────── */
    .sources {
      max-width: 1400px;
      margin: 2rem auto 0;
      padding: 1.25rem;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
    }
    .sources h3 { margin: 0 0 0.75rem; color: #fff; font-size: 1rem; }
    .sources ul { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .sources a {
      font-size: 0.78rem;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      background: #21262d;
      border: 1px solid #30363d;
      color: #c9d1d9;
      text-decoration: none;
    }
    .sources a:hover { border-color: #58a6ff; color: #58a6ff; }
    footer { text-align: center; color: #8b949e; font-size: 0.78rem; margin-top: 2rem; }
  `;
