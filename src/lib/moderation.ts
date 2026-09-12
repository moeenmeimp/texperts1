const BANNED = [
  "fuck",
  "shit",
  "bitch",
  "bastard",
  "asshole",
  "dick",
  "cunt",
  "slut",
  "whore",
  "scam",
  "fraud",
  "haramkhor",
  "kutta",
  "kamina",
  "randi",
  "madarchod",
  "behenchod",
  "chutiya",
  "gandu",
];

/** Returns the first inappropriate word found, or null when the text is clean. */
export function findBannedWord(text: string): string | null {
  const normalized = text.toLowerCase().replace(/[^a-z\s]/g, " ");
  for (const word of BANNED) {
    if (new RegExp(`\\b${word}\\b`).test(normalized)) return word;
  }
  return null;
}

export const DAILY_POST_LIMIT = 10;
