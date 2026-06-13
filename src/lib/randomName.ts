const adjectives = [
  "calm", "quiet", "gentle", "warm", "bright", "soft", "kind", "steady",
  "clear", "still", "misty", "bold", "swift", "wild", "deep", "light",
  "crisp", "cozy", "dusk", "dawn",
];

const nouns = [
  "river", "fern", "stone", "cloud", "leaf", "moon", "meadow", "ridge",
  "brook", "pine", "coral", "ember", "moss", "cliff", "wave", "spark",
  "bloom", "frost", "sage", "dune",
];

export function generateRandomName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 99) + 1;
  return `${adj}_${noun}_${num}`;
}
