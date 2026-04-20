const KNOWN_SERVICES = [
  "Adobe Creative Cloud",
  "Amazon Prime",
  "Apple Arcade",
  "Apple iCloud",
  "Apple Music",
  "Apple One",
  "Apple TV+",
  "Canva",
  "ChatGPT",
  "Claude",
  "Cursor",
  "Disney+",
  "Dropbox",
  "Duolingo",
  "Figma",
  "GitHub",
  "Google Drive",
  "Google One",
  "HBO Max",
  "Hulu",
  "iCloud",
  "Linear",
  "LinkedIn Premium",
  "Max",
  "Microsoft 365",
  "Netflix",
  "Notion",
  "Paramount+",
  "Peacock",
  "Slack",
  "Spotify",
  "YouTube Premium",
  "Zoom",
];

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function wordPrefixes(service: string): string[] {
  const words = service.split(" ");
  return words.map((_, i) => words.slice(0, i + 1).join(" "));
}

export function suggestService(input: string): string | null {
  if (!input.trim()) return null;
  const lower = input.toLowerCase();
  let best: string | null = null;
  let bestScore = Infinity;
  for (const service of KNOWN_SERVICES) {
    if (service.toLowerCase() === lower) return null;
    const candidates = wordPrefixes(service);
    const minDist = Math.min(
      ...candidates.map((c) => levenshtein(lower, c.toLowerCase()))
    );
    const threshold = Math.max(2, Math.floor(lower.length * 0.4));
    if (minDist < bestScore && minDist <= threshold) {
      bestScore = minDist;
      best = service;
    }
  }
  return best;
}
