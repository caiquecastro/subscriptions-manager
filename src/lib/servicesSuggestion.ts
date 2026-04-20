interface KnownService {
  name: string;
  category: string;
}

export interface ServiceSuggestion {
  name: string;
  category: string;
}

const KNOWN_SERVICES: KnownService[] = [
  { name: "Adobe Creative Cloud", category: "Design" },
  { name: "Amazon Prime", category: "Entertainment" },
  { name: "Apple Arcade", category: "Entertainment" },
  { name: "Apple iCloud", category: "Cloud Storage" },
  { name: "Apple Music", category: "Entertainment" },
  { name: "Apple One", category: "Entertainment" },
  { name: "Apple TV+", category: "Entertainment" },
  { name: "Canva", category: "Design" },
  { name: "ChatGPT", category: "Productivity" },
  { name: "Claude", category: "Productivity" },
  { name: "Cursor", category: "Development" },
  { name: "Disney+", category: "Entertainment" },
  { name: "Dropbox", category: "Cloud Storage" },
  { name: "Duolingo", category: "Education" },
  { name: "Figma", category: "Design" },
  { name: "GitHub", category: "Development" },
  { name: "Google Drive", category: "Cloud Storage" },
  { name: "Google One", category: "Cloud Storage" },
  { name: "HBO Max", category: "Entertainment" },
  { name: "Hulu", category: "Entertainment" },
  { name: "iCloud", category: "Cloud Storage" },
  { name: "Linear", category: "Productivity" },
  { name: "LinkedIn Premium", category: "Professional" },
  { name: "Max", category: "Entertainment" },
  { name: "Microsoft 365", category: "Productivity" },
  { name: "Netflix", category: "Entertainment" },
  { name: "Notion", category: "Productivity" },
  { name: "Paramount+", category: "Entertainment" },
  { name: "Peacock", category: "Entertainment" },
  { name: "Slack", category: "Productivity" },
  { name: "Spotify", category: "Entertainment" },
  { name: "YouTube Premium", category: "Entertainment" },
  { name: "Zoom", category: "Productivity" },
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

function wordPrefixes(name: string): string[] {
  const words = name.split(" ");
  return words.map((_, i) => words.slice(0, i + 1).join(" "));
}

export function suggestService(input: string): ServiceSuggestion | null {
  if (!input.trim()) return null;
  const lower = input.toLowerCase();
  let best: KnownService | null = null;
  let bestScore = Infinity;
  for (const service of KNOWN_SERVICES) {
    if (service.name.toLowerCase() === lower) return null;
    const candidates = wordPrefixes(service.name);
    const minDist = Math.min(
      ...candidates.map((c) => levenshtein(lower, c.toLowerCase()))
    );
    const threshold = Math.max(2, Math.floor(lower.length * 0.4));
    if (minDist < bestScore && minDist <= threshold) {
      bestScore = minDist;
      best = service;
    }
  }
  return best ? { name: best.name, category: best.category } : null;
}
