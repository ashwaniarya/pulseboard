export interface WeightedEntry<T> {
  value: T;
  weight: number;
}

// xmur3 string hash (public domain)
export function hashStringToSeed(input: string): number {
  let hash = 1779033703 ^ input.length;
  for (let index = 0; index < input.length; index += 1) {
    hash = Math.imul(hash ^ input.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
  hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
  return (hash ^ (hash >>> 16)) >>> 0;
}

// mulberry32 PRNG (public domain)
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

export function createStreamRandom(streamKey: string): () => number {
  return createSeededRandom(hashStringToSeed(streamKey));
}

export function randomIntegerBetween(
  random: () => number,
  minimumInclusive: number,
  maximumInclusive: number,
): number {
  return minimumInclusive + Math.floor(random() * (maximumInclusive - minimumInclusive + 1));
}

export function randomFloatBetween(random: () => number, minimum: number, maximum: number): number {
  return minimum + random() * (maximum - minimum);
}

export function randomGaussian(
  random: () => number,
  mean: number,
  standardDeviation: number,
): number {
  const uniformOne = Math.max(random(), Number.EPSILON);
  const uniformTwo = random();
  const standardNormal = Math.sqrt(-2 * Math.log(uniformOne)) * Math.cos(2 * Math.PI * uniformTwo);
  return mean + standardNormal * standardDeviation;
}

export function pickOne<T>(random: () => number, items: readonly T[]): T {
  const firstItem = items[0];
  if (firstItem === undefined) {
    throw new Error("pickOne requires a non-empty list");
  }
  const index = Math.floor(random() * items.length);
  return items[index] ?? firstItem;
}

export function pickWeighted<T>(random: () => number, entries: readonly WeightedEntry<T>[]): T {
  const positiveEntries = entries.filter((entry) => entry.weight > 0);
  const firstEntry = positiveEntries[0];
  if (firstEntry === undefined) {
    throw new Error("pickWeighted requires at least one positive weight");
  }
  const totalWeight = positiveEntries.reduce((sum, entry) => sum + entry.weight, 0);
  let remaining = random() * totalWeight;
  let selected = firstEntry;
  for (const entry of positiveEntries) {
    selected = entry;
    remaining -= entry.weight;
    if (remaining < 0) {
      break;
    }
  }
  return selected.value;
}
