function parseFormation(raw: string | undefined, fallback: number[]): number[] {
  if (!raw?.trim()) return fallback;
  const parts = raw.split('-').map((p) => Number.parseInt(p, 10));
  if (parts.length === 0 || parts.some((n) => !Number.isFinite(n) || n < 1 || n > 11)) {
    return fallback;
  }
  return parts;
}

function linePositions(
  counts: number[],
  xStart: number,
  xEnd: number,
  yTop: number,
  yBot: number,
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const lines = counts.length;
  for (let i = 0; i < lines; i++) {
    const t = lines === 1 ? 0.5 : i / (lines - 1);
    const x = xStart + (xEnd - xStart) * t;
    const n = counts[i];
    for (let j = 0; j < n; j++) {
      const u = n === 1 ? 0.5 : (j + 1) / (n + 1);
      const y = yTop + (yBot - yTop) * u;
      points.push({ x, y });
    }
  }
  return points;
}

export function renderFootballFieldFromProps(props: Record<string, string>): string {
  const home = parseFormation(props.home, [4, 3, 3]);
  const away = parseFormation(props.away, [4, 4, 2]);
  const W = 800;
  const H = 520;
  const pad = 36;
  const pitchX = pad;
  const pitchY = pad;
  const pitchW = W - pad * 2;
  const pitchH = H - pad * 2;

  const homePts = linePositions([1, ...home], pitchX + 28, pitchX + pitchW * 0.42, pitchY, pitchY + pitchH);
  const awayPts = linePositions([1, ...away], pitchX + pitchW - 28, pitchX + pitchW * 0.58, pitchY, pitchY + pitchH);

  const players = [
    ...homePts.map((p, i) => ({ ...p, fill: '#AA0000', r: i === 0 ? 14 : 11 })),
    ...awayPts.map((p, i) => ({ ...p, fill: '#1a3a8a', r: i === 0 ? 14 : 11 })),
  ];

  const cx = pitchX + pitchW / 2;
  const cy = pitchY + pitchH / 2;
  const boxW = pitchW * 0.16;
  const boxH = pitchH * 0.44;
  const sixW = pitchW * 0.06;
  const sixH = pitchH * 0.2;

  return `<svg xmlns="http://www.w3.org/2000/svg" class="diagram-football-field" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Football pitch ${home.join('-')} versus ${away.join('-')}">
  <rect width="${W}" height="${H}" fill="#e7efe4"/>
  <rect x="${pitchX}" y="${pitchY}" width="${pitchW}" height="${pitchH}" fill="#3a8f4a" stroke="#f4f4f4" stroke-width="3"/>
  <line x1="${cx}" y1="${pitchY}" x2="${cx}" y2="${pitchY + pitchH}" stroke="#f4f4f4" stroke-width="2"/>
  <circle cx="${cx}" cy="${cy}" r="${pitchH * 0.14}" fill="none" stroke="#f4f4f4" stroke-width="2"/>
  <circle cx="${cx}" cy="${cy}" r="4" fill="#f4f4f4"/>
  <rect x="${pitchX}" y="${cy - boxH / 2}" width="${boxW}" height="${boxH}" fill="none" stroke="#f4f4f4" stroke-width="2"/>
  <rect x="${pitchX + pitchW - boxW}" y="${cy - boxH / 2}" width="${boxW}" height="${boxH}" fill="none" stroke="#f4f4f4" stroke-width="2"/>
  <rect x="${pitchX}" y="${cy - sixH / 2}" width="${sixW}" height="${sixH}" fill="none" stroke="#f4f4f4" stroke-width="2"/>
  <rect x="${pitchX + pitchW - sixW}" y="${cy - sixH / 2}" width="${sixW}" height="${sixH}" fill="none" stroke="#f4f4f4" stroke-width="2"/>
  ${players.map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.r}" fill="${p.fill}" stroke="#fff" stroke-width="2"/>`).join('\n  ')}
  <text x="${pitchX + 8}" y="${pitchY - 10}" fill="#AA0000" font-size="16" font-family="Georgia, serif">${home.join('-')}</text>
  <text x="${pitchX + pitchW - 8}" y="${pitchY - 10}" text-anchor="end" fill="#1a3a8a" font-size="16" font-family="Georgia, serif">${away.join('-')}</text>
</svg>`;
}
