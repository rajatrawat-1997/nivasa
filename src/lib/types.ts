export type Cleanliness = "very-tidy" | "moderately-tidy" | "relaxed";
export type SleepSchedule = "early-bird" | "night-owl" | "flexible";
export type Drinking = "never" | "occasionally" | "socially";
export type Pets = "has-pets" | "comfortable" | "no-pets";
export type Guests = "frequently" | "occasionally" | "rarely";
export type Parties = "social" | "occasionally" | "quiet";
export type WorkStyle = "wfh" | "office" | "hybrid" | "student";
export type FoodPreference = "vegetarian" | "non-vegetarian" | "vegan" | "flexible";
export type NoiseLevel = "quiet" | "moderate" | "lively";
export type Responsibilities = "shared" | "separate" | "flexible";

export type Lifestyle = {
  cleanliness: Cleanliness;
  sleep: SleepSchedule;
  smoking: boolean;
  drinking: Drinking;
  pets: Pets;
  guests: Guests;
  parties: Parties;
  work: WorkStyle;
  food: FoodPreference;
  noise: NoiseLevel;
  responsibilities: Responsibilities;
};

export type HousingPreferences = {
  city: string;
  neighbourhoods: string[];
  budgetMin: number;
  budgetMax: number;
  moveInDate: string;
  stayDuration: string;
  roomType: string;
  furnishing: string;
  genderPreference: string;
  requirements: string;
};

export type CompatibilityWeights = {
  cleanliness: number;
  sleep: number;
  budget: number;
  location: number;
  food: number;
  smoking: number;
  guests: number;
  social: number;
  work: number;
  pets: number;
};

export type CompatibilityBreakdown = {
  overall: number;
  lifestyle: number;
  budget: number;
  location: number;
  shared: string[];
  reasons: string[];
  categories: { key: keyof CompatibilityWeights; label: string; score: number }[];
};

export type PlanId = "free" | "plus" | "provider";

export type ProfileSummary = {
  id: string;
  name: string;
  age: number;
  city: string;
  locality: string;
  profession: string;
  avatarUrl: string;
  budgetMin: number;
  budgetMax: number;
  verified: boolean;
  lifestyle: Lifestyle;
  compatibility: number;
};

export const LIFESTYLE_LABELS: Record<string, string> = {
  "very-tidy": "Very tidy",
  "moderately-tidy": "Moderately tidy",
  relaxed: "Relaxed",
  "early-bird": "Early bird",
  "night-owl": "Night owl",
  flexible: "Flexible hours",
  never: "Doesn't drink",
  occasionally: "Drinks occasionally",
  socially: "Social drinker",
  "has-pets": "Has pets",
  comfortable: "Pet friendly",
  "no-pets": "No pets",
  frequently: "Hosts often",
  rarely: "Rarely hosts",
  social: "Social",
  quiet: "Prefers quiet",
  wfh: "Works from home",
  office: "Works at office",
  hybrid: "Hybrid work",
  student: "Student",
  vegetarian: "Vegetarian",
  "non-vegetarian": "Non-vegetarian",
  vegan: "Vegan",
  moderate: "Moderate noise",
  lively: "Lively home",
  shared: "Shares chores",
  separate: "Separate routines",
};
