export const brickColors = ["red", "yellow", "orange", "blue", "green", "purple"] as const;
export type BrickColor = (typeof brickColors)[number];

export type BrickPlacement = {
  color: BrickColor;
  x: number;
  y: number;
  layer: number;
  rotation: 0 | 90;
};

export type BuildIdea = {
  slug: string;
  name: string;
  difficulty: "Easy" | "Medium";
  label: "Quick Build" | "Build Challenge" | "Creative Build";
  story: string;
  steps: string[];
  remix: string;
  placements: BrickPlacement[];
};

export const brickBuddyInventory = {
  plate: { studsWide: 10, studsDeep: 6, quantity: 1 },
  bricks: Object.fromEntries(brickColors.map((color) => [color, 2])) as Record<BrickColor, number>,
};

const build = (
  slug: BuildIdea["slug"],
  name: BuildIdea["name"],
  difficulty: BuildIdea["difficulty"],
  label: BuildIdea["label"],
  story: string,
  steps: string[],
  remix: string,
  placements: BrickPlacement[],
): BuildIdea => ({ slug, name, difficulty, label, story, steps, remix, placements });

export const buildIdeas: BuildIdea[] = [
  build(
    "buddy-chair",
    "Buddy Chair",
    "Easy",
    "Quick Build",
    "Give your Surprise Buddy a colorful place to sit.",
    [
      "Place the red and yellow bricks side by side as the base.",
      "Add the orange brick across the middle to make the seat.",
      "Stack the blue and green bricks at the back to make a tall backrest.",
    ],
    "Move the backrest, swap the colors, or turn it into a tiny throne.",
    [
      { color: "red", x: 1, y: 2, layer: 0, rotation: 90 },
      { color: "yellow", x: 5, y: 2, layer: 0, rotation: 90 },
      { color: "orange", x: 3, y: 2, layer: 1, rotation: 0 },
      { color: "blue", x: 3, y: 4, layer: 1, rotation: 0 },
      { color: "green", x: 3, y: 4, layer: 2, rotation: 0 },
    ],
  ),
  build(
    "color-steps",
    "Color Steps",
    "Easy",
    "Quick Build",
    "Build a bright staircase for your Buddy to climb.",
    [
      "Place one red brick as the first step.",
      "Stack yellow and orange bricks beside it for the second step.",
      "Stack blue, green, and purple bricks beside those for the tallest step.",
    ],
    "Try reversing the staircase or changing which colors go on top.",
    [
      { color: "red", x: 0, y: 1, layer: 0, rotation: 90 },
      { color: "yellow", x: 3, y: 1, layer: 0, rotation: 90 },
      { color: "orange", x: 3, y: 1, layer: 1, rotation: 90 },
      { color: "blue", x: 6, y: 1, layer: 0, rotation: 90 },
      { color: "green", x: 6, y: 1, layer: 1, rotation: 90 },
      { color: "purple", x: 6, y: 1, layer: 2, rotation: 90 },
    ],
  ),
  build(
    "tiny-bridge",
    "Tiny Bridge",
    "Easy",
    "Quick Build",
    "Make a simple bridge your Buddy can stand beside or walk under.",
    [
      "Place the red and blue bricks parallel as supports.",
      "Lay the yellow and green bricks across the tops to form the bridge span.",
    ],
    "Move the supports farther apart and see how the shape changes.",
    [
      { color: "red", x: 1, y: 1, layer: 0, rotation: 90 },
      { color: "blue", x: 7, y: 1, layer: 0, rotation: 90 },
      { color: "yellow", x: 2, y: 1, layer: 1, rotation: 0 },
      { color: "green", x: 4, y: 1, layer: 1, rotation: 0 },
    ],
  ),
  build(
    "buddy-bench",
    "Buddy Bench",
    "Easy",
    "Quick Build",
    "Build a small resting spot for your Surprise Buddy.",
    [
      "Place the red and purple bricks underneath as bench supports.",
      "Put the yellow and blue bricks across them to create the seat.",
      "Add the green brick behind the seat as a backrest.",
    ],
    "Make it taller, remove the backrest, or turn it into a tiny table.",
    [
      { color: "red", x: 1, y: 2, layer: 0, rotation: 90 },
      { color: "purple", x: 7, y: 2, layer: 0, rotation: 90 },
      { color: "yellow", x: 2, y: 2, layer: 1, rotation: 0 },
      { color: "blue", x: 4, y: 2, layer: 1, rotation: 0 },
      { color: "green", x: 3, y: 4, layer: 2, rotation: 0 },
    ],
  ),
  build(
    "rainbow-tower",
    "Rainbow Tower",
    "Easy",
    "Build Challenge",
    "Stack six colors into one tall, twisty tower.",
    [
      "Place the red brick near the center of the plate.",
      "Stack the remaining colors one by one, alternating the direction each layer.",
    ],
    "Can you make another tower that looks completely different but stays just as tall?",
    [
      { color: "red", x: 3, y: 2, layer: 0, rotation: 0 },
      { color: "yellow", x: 4, y: 1, layer: 1, rotation: 90 },
      { color: "orange", x: 3, y: 2, layer: 2, rotation: 0 },
      { color: "blue", x: 4, y: 1, layer: 3, rotation: 90 },
      { color: "green", x: 3, y: 2, layer: 4, rotation: 0 },
      { color: "purple", x: 4, y: 1, layer: 5, rotation: 90 },
    ],
  ),
  build(
    "buddy-hideout",
    "Buddy Hideout",
    "Medium",
    "Creative Build",
    "Create three colorful walls that make a tiny hideout for your Buddy.",
    [
      "Place red and yellow bricks along the back of the plate.",
      "Build a two-brick-high wall on the left using orange and blue.",
      "Build a matching wall on the right using green and purple.",
    ],
    "Change the opening, widen the walls, or turn the hideout into a tiny stage.",
    [
      { color: "red", x: 1, y: 4, layer: 0, rotation: 0 },
      { color: "yellow", x: 5, y: 4, layer: 0, rotation: 0 },
      { color: "orange", x: 0, y: 0, layer: 0, rotation: 90 },
      { color: "blue", x: 0, y: 0, layer: 1, rotation: 90 },
      { color: "green", x: 8, y: 0, layer: 0, rotation: 90 },
      { color: "purple", x: 8, y: 0, layer: 1, rotation: 90 },
    ],
  ),
];

export function validateBuildIdea(buildIdea: BuildIdea): string[] {
  const errors: string[] = [];

  if (buildIdea.placements.length > 12) {
    errors.push("uses more than 12 bricks");
  }

  const perColor = new Map<BrickColor, number>();

  for (const brick of buildIdea.placements) {
    perColor.set(brick.color, (perColor.get(brick.color) ?? 0) + 1);

    if (brick.x < 0 || brick.y < 0 || brick.layer < 0) {
      errors.push("contains a negative coordinate or layer");
      continue;
    }

    const width = brick.rotation === 0 ? 4 : 2;
    const depth = brick.rotation === 0 ? 2 : 4;
    if (brick.x + width > brickBuddyInventory.plate.studsWide || brick.y + depth > brickBuddyInventory.plate.studsDeep) {
      errors.push(`places ${brick.color} outside the 6×10 plate`);
    }
  }

  for (const color of brickColors) {
    if ((perColor.get(color) ?? 0) > brickBuddyInventory.bricks[color]) {
      errors.push(`uses more than two ${color} bricks`);
    }
  }

  return errors;
}
