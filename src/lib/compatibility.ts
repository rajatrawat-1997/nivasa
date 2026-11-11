import type {
  CompatibilityBreakdown,
  CompatibilityWeights,
  HousingPreferences,
  Lifestyle,
} from "./types";

export const DEFAULT_WEIGHTS: CompatibilityWeights = {
  cleanliness: 15,
  sleep: 12,
  budget: 15,
  location: 15,
  food: 8,
  smoking: 10,
  guests: 8,
  social: 7,
  work: 5,
  pets: 5,
};

type CompatibleProfile = {
  lifestyle: Lifestyle;
  housing: HousingPreferences;
  city: string;
  locality: string;
  budgetMin: number;
  budgetMax: number;
};

const scoreSame = (a: string, b: string, partial: string[], partialScore = 78) => {
  if (a === b) return 100;
  if (partial.includes(a) || partial.includes(b)) return partialScore;
  return 55;
};

function budgetScore(a: CompatibleProfile, b: CompatibleProfile) {
  const overlap = Math.min(a.budgetMax, b.budgetMax) - Math.max(a.budgetMin, b.budgetMin);
  if (overlap > 0) {
    const span = Math.max(a.budgetMax, b.budgetMax) - Math.min(a.budgetMin, b.budgetMin);
    return Math.round(82 + Math.min(18, (overlap / Math.max(span, 1)) * 28));
  }
  const gap = Math.max(a.budgetMin, b.budgetMin) - Math.min(a.budgetMax, b.budgetMax);
  const reference = Math.max(a.budgetMax, b.budgetMax, 1);
  return Math.max(18, Math.round(70 - (gap / reference) * 100));
}

function locationScore(a: CompatibleProfile, b: CompatibleProfile) {
  if (a.city.toLowerCase() !== b.city.toLowerCase()) return 30;
  const aAreas = [a.locality, ...a.housing.neighbourhoods].filter(Boolean).map((x) => x.toLowerCase());
  const bAreas = [b.locality, ...b.housing.neighbourhoods].filter(Boolean).map((x) => x.toLowerCase());
  const shared = aAreas.some((area) => bAreas.some((other) => other.includes(area) || area.includes(other)));
  return shared ? 100 : 74;
}

export function calculateCompatibility(
  a: CompatibleProfile,
  b: CompatibleProfile,
  weights: CompatibilityWeights = DEFAULT_WEIGHTS,
): CompatibilityBreakdown {
  const lifeA = a.lifestyle;
  const lifeB = b.lifestyle;

  const categoryScores = {
    cleanliness: scoreSame(lifeA.cleanliness, lifeB.cleanliness, ["moderately-tidy"], 82),
    sleep: scoreSame(lifeA.sleep, lifeB.sleep, ["flexible"], 86),
    budget: budgetScore(a, b),
    location: locationScore(a, b),
    food: scoreSame(lifeA.food, lifeB.food, ["flexible"], 88),
    smoking: lifeA.smoking === lifeB.smoking ? 100 : 32,
    guests: scoreSame(lifeA.guests, lifeB.guests, ["occasionally"], 80),
    social: scoreSame(lifeA.parties, lifeB.parties, ["occasionally"], 76),
    work: scoreSame(lifeA.work, lifeB.work, ["hybrid", "office"], 84),
    pets: scoreSame(lifeA.pets, lifeB.pets, ["comfortable"], 86),
  } satisfies Record<keyof CompatibilityWeights, number>;

  const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0) || 1;
  const overall = Math.round(
    (Object.entries(categoryScores) as [keyof CompatibilityWeights, number][]).reduce(
      (sum, [key, score]) => sum + score * weights[key],
      0,
    ) / totalWeight,
  );

  const lifestyleWeight =
    totalWeight - weights.budget - weights.location || 1;
  const lifestyle = Math.round(
    (
      (["cleanliness", "sleep", "food", "smoking", "guests", "social", "work", "pets"] as const).reduce(
        (sum, key) => sum + categoryScores[key] * weights[key],
        0,
      )
    ) / lifestyleWeight,
  );

  const labels: Record<keyof CompatibilityWeights, string> = {
    cleanliness: "Cleanliness",
    sleep: "Sleep schedule",
    budget: "Budget",
    location: "Location",
    food: "Food",
    smoking: "Smoking",
    guests: "Guests",
    social: "Social life",
    work: "Work routine",
    pets: "Pets",
  };

  const reasons: string[] = [];
  if (categoryScores.cleanliness >= 82) reasons.push("Similar standards for keeping the home tidy.");
  if (categoryScores.sleep >= 82) reasons.push("Your daily routines line up.");
  if (categoryScores.budget >= 82) reasons.push("Your monthly budgets overlap comfortably.");
  if (categoryScores.location >= 82) reasons.push("You're looking in the same neighbourhood.");
  if (categoryScores.smoking === 100) reasons.push(lifeA.smoking ? "You're both smokers." : "You both prefer a smoke-free home.");
  if (categoryScores.food >= 82) reasons.push("Food preferences are compatible.");
  if (categoryScores.guests >= 82) reasons.push("You agree on how often guests visit.");
  if (categoryScores.work >= 82) reasons.push("Your work-from-home patterns match.");
  if (categoryScores.pets >= 82) reasons.push("You're aligned on pets at home.");
  if (reasons.length < 3) reasons.push("You share similar social preferences and house expectations.");

  const shared: string[] = [];
  if (lifeA.cleanliness === lifeB.cleanliness) shared.push(labels.cleanliness);
  if (lifeA.sleep === lifeB.sleep) shared.push(labels.sleep);
  if (lifeA.food === lifeB.food) shared.push(labels.food);
  if (lifeA.smoking === lifeB.smoking) shared.push(lifeA.smoking ? "Smoker household" : "Smoke-free home");
  if (lifeA.work === lifeB.work) shared.push(labels.work);
  if (lifeA.pets === lifeB.pets) shared.push(labels.pets);
  if (a.city === b.city) shared.push(`${a.city} local`);

  return {
    overall: Math.max(0, Math.min(100, overall)),
    lifestyle: Math.max(0, Math.min(100, lifestyle)),
    budget: categoryScores.budget,
    location: categoryScores.location,
    shared: shared.slice(0, 4),
    reasons: reasons.slice(0, 4),
    categories: (Object.keys(categoryScores) as (keyof CompatibilityWeights)[]).map((key) => ({
      key,
      label: labels[key],
      score: categoryScores[key],
    })),
  };
}

export function lifestyleTags(lifestyle: Lifestyle): string[] {
  const tags: string[] = [];
  if (lifestyle.smoking === false) tags.push("Non-smoker");
  else tags.push("Smoker");
  tags.push(
    lifestyle.food === "non-vegetarian"
      ? "Non-veg"
      : lifestyle.food === "vegetarian"
        ? "Vegetarian"
        : lifestyle.food === "vegan"
          ? "Vegan"
          : "Flexible eater",
  );
  tags.push(
    lifestyle.sleep === "early-bird"
      ? "Early bird"
      : lifestyle.sleep === "night-owl"
        ? "Night owl"
        : "Flexible hours",
  );
  tags.push(
    lifestyle.cleanliness === "very-tidy"
      ? "Very tidy"
      : lifestyle.cleanliness === "moderately-tidy"
        ? "Tidy"
        : "Relaxed",
  );
  return tags;
}
