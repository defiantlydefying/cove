export interface AvatarDef {
  key: string;
  label: string;
  category: "starter" | "nature" | "space" | "rare" | "legendary";
  unlockType: "default" | "xp" | "achievement";
  unlockThreshold?: number;
}

// DiceBear style per category — each unlock tier gets a different art style
const CATEGORY_STYLES: Record<string, string> = {
  starter: "adventurer",
  nature: "adventurer",
  space: "bottts",
  rare: "fun-emoji",
  legendary: "lorelei",
};

export function getAvatarUrl(key: string, category?: string, size = 64): string {
  const style = CATEGORY_STYLES[category ?? "starter"] ?? "adventurer";
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(key)}&size=${size}`;
}

export const AVATARS: AvatarDef[] = [
  // Starter set (available to all)
  { key: "fox", label: "Fox", category: "starter", unlockType: "default" },
  { key: "owl", label: "Owl", category: "starter", unlockType: "default" },
  { key: "rabbit", label: "Rabbit", category: "starter", unlockType: "default" },
  { key: "bear", label: "Bear", category: "starter", unlockType: "default" },
  { key: "cat", label: "Cat", category: "starter", unlockType: "default" },
  { key: "dog", label: "Dog", category: "starter", unlockType: "default" },
  { key: "deer", label: "Deer", category: "starter", unlockType: "default" },
  { key: "penguin", label: "Penguin", category: "starter", unlockType: "default" },
  { key: "butterfly", label: "Butterfly", category: "starter", unlockType: "default" },
  { key: "turtle", label: "Turtle", category: "starter", unlockType: "default" },
  { key: "whale", label: "Whale", category: "starter", unlockType: "default" },
  { key: "octopus", label: "Octopus", category: "starter", unlockType: "default" },
  { key: "mushroom", label: "Mushroom", category: "starter", unlockType: "default" },
  { key: "cactus", label: "Cactus", category: "starter", unlockType: "default" },
  { key: "sunflower", label: "Sunflower", category: "starter", unlockType: "default" },
  { key: "leaf", label: "Leaf", category: "starter", unlockType: "default" },
  { key: "star", label: "Star", category: "starter", unlockType: "default" },
  { key: "cloud", label: "Cloud", category: "starter", unlockType: "default" },
  { key: "rainbow", label: "Rainbow", category: "starter", unlockType: "default" },
  { key: "moon", label: "Moon", category: "starter", unlockType: "default" },
  // Nature pack (100 XP)
  { key: "cherry_blossom", label: "Cherry Blossom", category: "nature", unlockType: "xp", unlockThreshold: 100 },
  { key: "herb", label: "Herb", category: "nature", unlockType: "xp", unlockThreshold: 100 },
  { key: "seedling", label: "Seedling", category: "nature", unlockType: "xp", unlockThreshold: 100 },
  { key: "rose", label: "Rose", category: "nature", unlockType: "xp", unlockThreshold: 100 },
  { key: "hibiscus", label: "Hibiscus", category: "nature", unlockType: "xp", unlockThreshold: 100 },
  // Space pack (500 XP)
  { key: "rocket", label: "Rocket", category: "space", unlockType: "xp", unlockThreshold: 500 },
  { key: "saturn", label: "Saturn", category: "space", unlockType: "xp", unlockThreshold: 500 },
  { key: "comet", label: "Comet", category: "space", unlockType: "xp", unlockThreshold: 500 },
  { key: "alien", label: "Alien", category: "space", unlockType: "xp", unlockThreshold: 500 },
  { key: "ufo", label: "UFO", category: "space", unlockType: "xp", unlockThreshold: 500 },
];

export const STARTER_AVATARS = AVATARS.filter((a) => a.category === "starter");

export function getAvatarByKey(key: string): AvatarDef | undefined {
  return AVATARS.find((a) => a.key === key);
}

export function getRandomStarterKey(): string {
  const idx = Math.floor(Math.random() * STARTER_AVATARS.length);
  return STARTER_AVATARS[idx].key;
}
