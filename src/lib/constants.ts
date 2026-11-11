export const CITIES = ["Bengaluru", "Mumbai", "Pune", "Delhi", "Hyderabad", "Chennai", "Gurugram"];

export const NEIGHBOURHOODS: Record<string, string[]> = {
  Bengaluru: ["Indiranagar", "Koramangala", "HSR Layout", "Whitefield", "Jayanagar", "Hebbal"],
  Mumbai: ["Andheri West", "Bandra", "Powai", "Lower Parel", "Malad", "Chembur"],
  Pune: ["Koregaon Park", "Baner", "Kharadi", "Viman Nagar", "Hinjewadi"],
  Delhi: ["Hauz Khas", "Saket", "Greater Kailash", "Lajpat Nagar", "Dwarka"],
  Hyderabad: ["Gachibowli", "Madhapur", "Jubilee Hills", "Kondapur", "Banjara Hills"],
  Chennai: ["Adyar", "Velachery", "Anna Nagar", "T Nagar", "OMR"],
  Gurugram: ["Golf Course Road", "Sector 29", "DLF Phase 3", "Sohna Road", "Cyber City"],
};

export const ROOM_TYPES = [
  { value: "private-room", label: "Private room" },
  { value: "shared-room", label: "Shared room" },
  { value: "entire-flat", label: "Entire flat" },
  { value: "studio", label: "Studio" },
];

export const FURNISHING = [
  { value: "furnished", label: "Fully furnished" },
  { value: "semi-furnished", label: "Semi-furnished" },
  { value: "unfurnished", label: "Unfurnished" },
];

export const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "independent-house", label: "Independent house" },
  { value: "villa", label: "Villa" },
  { value: "pg", label: "PG / Co-living" },
];

export const AMENITIES = [
  "Wi-Fi",
  "Air conditioning",
  "Attached bathroom",
  "Washing machine",
  "Kitchen access",
  "Parking",
  "Balcony",
  "Gym",
  "Power backup",
  "Pet friendly",
  "Housekeeping",
  "Lift",
];

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    yearly: 0,
    description: "Everything you need to start finding your people.",
    features: [
      "Complete lifestyle profile",
      "20 discover cards per day",
      "5 likes per day",
      "Mutual matching",
      "Basic messaging",
      "Browse all rooms",
    ],
  },
  plus: {
    name: "Nivasa Plus",
    price: 499,
    yearly: 3990,
    description: "For people who want to find the right fit, faster.",
    features: [
      "Unlimited discovery",
      "See who liked you",
      "Unlimited likes",
      "3 Super Likes every day",
      "Advanced compatibility insights",
      "Monthly profile boost",
      "Priority support",
    ],
  },
  provider: {
    name: "Provider Pro",
    price: 999,
    yearly: 7990,
    description: "Fill your room with the right person, not just anyone.",
    features: [
      "Up to 10 active listings",
      "Featured listing placement",
      "Full listing analytics",
      "Lead management",
      "Verified provider badge",
      "Priority listing review",
    ],
  },
} as const;

export const LIFESTYLE_OPTIONS = {
  cleanliness: [
    { value: "very-tidy", label: "Very tidy", description: "Everything has its place" },
    { value: "moderately-tidy", label: "Moderately tidy", description: "Clean, but lived in" },
    { value: "relaxed", label: "Relaxed", description: "I get to it eventually" },
  ],
  sleep: [
    { value: "early-bird", label: "Early bird", description: "Asleep by 10:30pm" },
    { value: "night-owl", label: "Night owl", description: "Most alive after 11pm" },
    { value: "flexible", label: "Flexible", description: "Depends on the week" },
  ],
  drinking: [
    { value: "never", label: "Never", description: "I don't drink" },
    { value: "occasionally", label: "Occasionally", description: "A drink now and then" },
    { value: "socially", label: "Socially", description: "Weekends with friends" },
  ],
  pets: [
    { value: "has-pets", label: "Have pets", description: "My pet comes with me" },
    { value: "comfortable", label: "Pet friendly", description: "Happy to live with pets" },
    { value: "no-pets", label: "No pets", description: "Prefer a pet-free home" },
  ],
  guests: [
    { value: "frequently", label: "Often", description: "Friends drop by" },
    { value: "occasionally", label: "Sometimes", description: "The odd dinner guest" },
    { value: "rarely", label: "Rarely", description: "My home is my retreat" },
  ],
  parties: [
    { value: "social", label: "Social", description: "I love hosting" },
    { value: "occasionally", label: "Occasionally", description: "Now and then" },
    { value: "quiet", label: "Quiet", description: "I prefer calm evenings" },
  ],
  work: [
    { value: "wfh", label: "Work from home", description: "Home is my office" },
    { value: "office", label: "At the office", description: "Out most of the day" },
    { value: "hybrid", label: "Hybrid", description: "A mix of both" },
    { value: "student", label: "Student", description: "Studying right now" },
  ],
  food: [
    { value: "vegetarian", label: "Vegetarian", description: "No meat" },
    { value: "non-vegetarian", label: "Non-vegetarian", description: "I eat everything" },
    { value: "vegan", label: "Vegan", description: "Plant-based" },
    { value: "flexible", label: "Flexible", description: "No strong preference" },
  ],
  noise: [
    { value: "quiet", label: "Quiet", description: "Low-key at home" },
    { value: "moderate", label: "Moderate", description: "Some background noise" },
    { value: "lively", label: "Lively", description: "Music and conversation" },
  ],
  responsibilities: [
    { value: "shared", label: "Shared", description: "We split everything" },
    { value: "separate", label: "Separate", description: "We handle our own" },
    { value: "flexible", label: "Flexible", description: "Whatever works" },
  ],
} as const;

export function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function timeAgo(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}
