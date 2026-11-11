import "dotenv/config";

import { eq } from "drizzle-orm";

import { auth } from "./auth";
import { user } from "./auth-schema";
import { calculateCompatibility, DEFAULT_WEIGHTS } from "./compatibility";
import { db } from "./db";
import {
  appSettings,
  conversations,
  inquiries,
  listings,
  matches,
  messages,
  notifications,
  profiles,
  reports,
  savedListings,
  savedProfiles,
  subscriptions,
  swipes,
} from "./schema";
import type { HousingPreferences, Lifestyle } from "./types";

const baseLifestyle: Lifestyle = {
  cleanliness: "moderately-tidy",
  sleep: "flexible",
  smoking: false,
  drinking: "occasionally",
  pets: "comfortable",
  guests: "occasionally",
  parties: "occasionally",
  work: "hybrid",
  food: "flexible",
  noise: "moderate",
  responsibilities: "shared",
};

const baseHousing: HousingPreferences = {
  city: "Bengaluru",
  neighbourhoods: ["Indiranagar", "Koramangala"],
  budgetMin: 18000,
  budgetMax: 26000,
  moveInDate: "2026-12-01",
  stayDuration: "12 months",
  roomType: "private-room",
  furnishing: "furnished",
  genderPreference: "any",
  requirements: "",
};

function lifestyle(overrides: Partial<Lifestyle>): Lifestyle {
  return { ...baseLifestyle, ...overrides };
}

function housing(overrides: Partial<HousingPreferences>): HousingPreferences {
  return { ...baseHousing, ...overrides };
}

const people = [
  {
    id: "demo-riya",
    name: "Riya Kapoor",
    age: 26,
    gender: "woman",
    city: "Bengaluru",
    locality: "Indiranagar",
    profession: "Product Designer",
    company: "Lumen Studio",
    bio: "Designer, weekend baker and a sucker for a well-lit apartment. Looking for someone who treats home as a calm reset button.",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
    photos: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    ],
    budgetMin: 18000,
    budgetMax: 26000,
    moveInDate: "2026-12-01",
    distanceKm: 0,
    languages: ["English", "Hindi"],
    lifestyle: lifestyle({
      cleanliness: "moderately-tidy",
      sleep: "early-bird",
      drinking: "occasionally",
      pets: "no-pets",
      guests: "occasionally",
      parties: "occasionally",
      work: "hybrid",
      food: "flexible",
    }),
    housing: housing({ requirements: "A balcony or good natural light would be lovely." }),
    verified: true,
    phoneVerified: true,
    idVerified: true,
    isAdmin: true,
    plan: "plus" as const,
    planInterval: "monthly" as const,
  },
  {
    id: "p-ananya",
    name: "Aanya Sharma",
    age: 25,
    gender: "woman",
    city: "Bengaluru",
    locality: "Indiranagar",
    profession: "Product Designer",
    company: "Northstar",
    bio: "Early riser, filter coffee loyalist, and a very tidy flatmate. I cook most evenings and would love someone who shares the occasional dinner.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
    photos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    ],
    budgetMin: 12000,
    budgetMax: 18000,
    moveInDate: "2026-12-05",
    distanceKm: 2,
    languages: ["English", "Hindi", "Kannada"],
    lifestyle: lifestyle({
      cleanliness: "very-tidy",
      sleep: "early-bird",
      drinking: "never",
      guests: "rarely",
      parties: "quiet",
      food: "vegetarian",
      noise: "quiet",
    }),
    housing: housing({
      budgetMin: 12000,
      budgetMax: 18000,
      neighbourhoods: ["Indiranagar", "Koramangala"],
      moveInDate: "2026-12-05",
    }),
    verified: true,
    phoneVerified: true,
    idVerified: true,
  },
  {
    id: "p-ishaan",
    name: "Ishaan Verma",
    age: 28,
    gender: "man",
    city: "Bengaluru",
    locality: "Koramangala",
    profession: "Software Engineer",
    company: "Flowbase",
    bio: "I work from home most days, so decent Wi-Fi and a quiet corner matter. Big on weekend football and cooking experiments.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80",
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
    ],
    budgetMin: 20000,
    budgetMax: 28000,
    moveInDate: "2026-12-15",
    distanceKm: 4,
    languages: ["English", "Hindi"],
    lifestyle: lifestyle({
      sleep: "night-owl",
      work: "wfh",
      food: "non-vegetarian",
      guests: "occasionally",
      noise: "moderate",
    }),
    housing: housing({
      budgetMin: 20000,
      budgetMax: 28000,
      neighbourhoods: ["Koramangala", "HSR Layout"],
      moveInDate: "2026-12-15",
    }),
    verified: true,
    phoneVerified: true,
  },
  {
    id: "p-meera",
    name: "Meera Nair",
    age: 24,
    gender: "woman",
    city: "Bengaluru",
    locality: "HSR Layout",
    profession: "UX Researcher",
    company: "Curio Labs",
    bio: "Researcher by day, clay-potter by night. I come with a very polite cat named Mochi.",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    photos: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80",
    ],
    budgetMin: 15000,
    budgetMax: 22000,
    moveInDate: "2027-01-01",
    distanceKm: 5,
    languages: ["English", "Malayalam"],
    lifestyle: lifestyle({
      cleanliness: "very-tidy",
      sleep: "flexible",
      pets: "has-pets",
      work: "office",
      food: "vegetarian",
      noise: "quiet",
    }),
    housing: housing({
      budgetMin: 15000,
      budgetMax: 22000,
      neighbourhoods: ["HSR Layout", "Koramangala"],
      moveInDate: "2027-01-01",
    }),
    verified: true,
    phoneVerified: true,
  },
  {
    id: "p-kabir",
    name: "Kabir Shah",
    age: 27,
    gender: "man",
    city: "Mumbai",
    locality: "Bandra West",
    profession: "Data Analyst",
    company: "Meridian",
    bio: "Bandstand runs, vinyl records, and friends over on Fridays. Looking for someone who enjoys a lively home.",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
    photos: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80",
    ],
    budgetMin: 25000,
    budgetMax: 35000,
    moveInDate: "2026-12-20",
    distanceKm: 14,
    languages: ["English", "Hindi", "Marathi"],
    lifestyle: lifestyle({
      cleanliness: "relaxed",
      sleep: "night-owl",
      smoking: true,
      drinking: "socially",
      guests: "frequently",
      parties: "social",
      work: "office",
      food: "non-vegetarian",
      noise: "lively",
      responsibilities: "separate",
    }),
    housing: housing({
      city: "Mumbai",
      neighbourhoods: ["Bandra West", "Andheri West"],
      budgetMin: 25000,
      budgetMax: 35000,
      moveInDate: "2026-12-20",
    }),
    verified: false,
  },
  {
    id: "p-naina",
    name: "Naina Desai",
    age: 26,
    gender: "woman",
    city: "Mumbai",
    locality: "Powai",
    profession: "Marketing Manager",
    company: "Aster",
    bio: "Marketer, sea-face walker, and an excellent host for low-key Sunday brunches.",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    photos: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    ],
    budgetMin: 20000,
    budgetMax: 30000,
    moveInDate: "2027-01-10",
    distanceKm: 12,
    languages: ["English", "Hindi", "Gujarati"],
    lifestyle: lifestyle({
      cleanliness: "moderately-tidy",
      sleep: "early-bird",
      pets: "comfortable",
      guests: "occasionally",
      parties: "occasionally",
      work: "hybrid",
    }),
    housing: housing({
      city: "Mumbai",
      neighbourhoods: ["Powai", "Andheri West"],
      budgetMin: 20000,
      budgetMax: 30000,
      moveInDate: "2027-01-10",
    }),
    verified: true,
  },
  {
    id: "p-rohan",
    name: "Rohan Iyer",
    age: 30,
    gender: "man",
    city: "Pune",
    locality: "Baner",
    profession: "Architect",
    company: "Studio Terra",
    bio: "Architect with a soft spot for quiet mornings and good coffee. Home is where I recharge.",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
    photos: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
    ],
    budgetMin: 18000,
    budgetMax: 25000,
    moveInDate: "2026-12-10",
    distanceKm: 18,
    languages: ["English", "Hindi", "Tamil"],
    lifestyle: lifestyle({
      cleanliness: "very-tidy",
      sleep: "early-bird",
      drinking: "never",
      guests: "rarely",
      parties: "quiet",
      work: "wfh",
      food: "vegetarian",
      noise: "quiet",
    }),
    housing: housing({
      city: "Pune",
      neighbourhoods: ["Baner", "Koregaon Park"],
      budgetMin: 18000,
      budgetMax: 25000,
      moveInDate: "2026-12-10",
    }),
    verified: true,
  },
  {
    id: "p-aditi",
    name: "Aditi Bose",
    age: 23,
    gender: "woman",
    city: "Delhi",
    locality: "Hauz Khas",
    profession: "Design Student",
    company: "NID",
    bio: "Final-year design student. I'm out at studio most days and love a lively shared flat.",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80",
    photos: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80",
    ],
    budgetMin: 10000,
    budgetMax: 16000,
    moveInDate: "2026-12-01",
    distanceKm: 9,
    languages: ["English", "Hindi", "Bengali"],
    lifestyle: lifestyle({
      cleanliness: "relaxed",
      sleep: "night-owl",
      guests: "frequently",
      parties: "social",
      work: "student",
      food: "non-vegetarian",
      noise: "lively",
      responsibilities: "flexible",
    }),
    housing: housing({
      city: "Delhi",
      neighbourhoods: ["Hauz Khas", "Saket"],
      budgetMin: 10000,
      budgetMax: 16000,
      moveInDate: "2026-12-01",
    }),
    verified: false,
  },
  {
    id: "p-dev",
    name: "Dev Malhotra",
    age: 29,
    gender: "man",
    city: "Hyderabad",
    locality: "Gachibowli",
    profession: "Product Manager",
    company: "Kite",
    bio: "PM, amateur chef and a decent doubles partner. I travel often and keep things low-key at home.",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80",
    photos: [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80",
    ],
    budgetMin: 22000,
    budgetMax: 32000,
    moveInDate: "2027-01-05",
    distanceKm: 8,
    languages: ["English", "Hindi", "Telugu"],
    lifestyle: lifestyle({
      sleep: "flexible",
      drinking: "socially",
      pets: "comfortable",
      guests: "occasionally",
      work: "hybrid",
    }),
    housing: housing({
      city: "Hyderabad",
      neighbourhoods: ["Gachibowli", "Madhapur"],
      budgetMin: 22000,
      budgetMax: 32000,
      moveInDate: "2027-01-05",
    }),
    verified: true,
  },
  {
    id: "p-tara",
    name: "Tara Menon",
    age: 27,
    gender: "woman",
    city: "Bengaluru",
    locality: "Whitefield",
    profession: "Content Strategist",
    company: "Paper & Ink",
    bio: "Writer, plant parent, early riser. I'm looking for a calm home with someone who respects quiet hours.",
    avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&q=80",
    photos: [
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&q=80",
    ],
    budgetMin: 16000,
    budgetMax: 24000,
    moveInDate: "2026-12-18",
    distanceKm: 11,
    languages: ["English", "Malayalam"],
    lifestyle: lifestyle({
      cleanliness: "very-tidy",
      sleep: "early-bird",
      drinking: "never",
      guests: "rarely",
      parties: "quiet",
      work: "office",
      food: "vegan",
      noise: "quiet",
    }),
    housing: housing({
      neighbourhoods: ["Whitefield", "Indiranagar"],
      budgetMin: 16000,
      budgetMax: 24000,
      moveInDate: "2026-12-18",
    }),
    verified: true,
  },
  {
    id: "p-arjun",
    name: "Arjun Sethi",
    age: 26,
    gender: "man",
    city: "Gurugram",
    locality: "DLF Phase 3",
    profession: "Consultant",
    company: "Bain",
    bio: "Consultant, five-a-side regular, and a reliable source of restaurant recommendations.",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=900&q=80",
    photos: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=900&q=80",
    ],
    budgetMin: 25000,
    budgetMax: 35000,
    moveInDate: "2027-01-15",
    distanceKm: 20,
    languages: ["English", "Hindi", "Punjabi"],
    lifestyle: lifestyle({
      sleep: "night-owl",
      drinking: "socially",
      guests: "frequently",
      parties: "social",
      work: "office",
      food: "non-vegetarian",
      noise: "lively",
      responsibilities: "separate",
    }),
    housing: housing({
      city: "Gurugram",
      neighbourhoods: ["DLF Phase 3", "Golf Course Road"],
      budgetMin: 25000,
      budgetMax: 35000,
      moveInDate: "2027-01-15",
    }),
    verified: true,
  },
  {
    id: "p-sana",
    name: "Sana Qureshi",
    age: 25,
    gender: "woman",
    city: "Chennai",
    locality: "Adyar",
    profession: "Doctor",
    company: "Apollo",
    bio: "Junior doctor on rotating shifts. Tidy, quiet, and always up for a chai between shifts.",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=900&q=80",
    photos: [
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=900&q=80",
    ],
    budgetMin: 18000,
    budgetMax: 26000,
    moveInDate: "2026-12-22",
    distanceKm: 16,
    languages: ["English", "Hindi", "Urdu"],
    lifestyle: lifestyle({
      cleanliness: "very-tidy",
      sleep: "early-bird",
      drinking: "never",
      pets: "comfortable",
      guests: "rarely",
      parties: "quiet",
      work: "office",
      food: "vegetarian",
      noise: "quiet",
    }),
    housing: housing({
      city: "Chennai",
      neighbourhoods: ["Adyar", "Velachery"],
      budgetMin: 18000,
      budgetMax: 26000,
      moveInDate: "2026-12-22",
    }),
    verified: true,
  },
  {
    id: "p-vikram",
    name: "Vikram Rao",
    age: 34,
    gender: "man",
    city: "Bengaluru",
    locality: "Indiranagar",
    profession: "Property owner",
    company: "Rao Homes",
    bio: "I manage a small set of well-kept homes in central Bengaluru. Verified listings only.",
    avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80",
    photos: [
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80",
    ],
    budgetMin: 0,
    budgetMax: 0,
    moveInDate: "",
    distanceKm: 0,
    languages: ["English", "Hindi", "Kannada"],
    lifestyle: lifestyle({}),
    housing: housing({ neighbourhoods: ["Indiranagar"] }),
    verified: true,
    phoneVerified: true,
    idVerified: true,
    role: "provider",
    plan: "provider" as const,
    planInterval: "monthly" as const,
  },
];

const propertyPhotos = {
  indiranagar: [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80",
  ],
  koramangala: [
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1400&q=80",
  ],
  hsr: [
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80",
  ],
  bandra: [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=80",
  ],
  powai: [
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80",
  ],
  baner: [
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80",
  ],
  delhi: [
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
  ],
  hyderabad: [
    "https://images.unsplash.com/photo-1600566753051-f0b89df2dd90?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=80",
  ],
};

const listingRows = [
  {
    id: "l-indiranagar",
    providerProfileId: "p-vikram",
    title: "Sunlit private room in a quiet Indiranagar 3BHK",
    propertyType: "apartment",
    roomType: "private-room",
    rent: 22000,
    deposit: 44000,
    city: "Bengaluru",
    locality: "Indiranagar",
    address: "12th Main Road, Indiranagar (exact address shared after inquiry)",
    description:
      "A bright, fully furnished room in a calm 3BHK shared with two working professionals. The flat has a large living room, a balcony full of plants, and a kitchen that actually gets used. Five minutes from the metro and a short walk to the cafés on 12th Main.",
    amenities: ["Wi-Fi", "Air conditioning", "Attached bathroom", "Washing machine", "Kitchen access", "Balcony", "Parking"],
    furnishing: "furnished",
    availableFrom: "2026-12-01",
    houseRules: ["No smoking indoors", "Guests before 10pm", "Quiet hours after 11pm"],
    occupancy: 1,
    photos: propertyPhotos.indiranagar,
    verified: true,
    status: "active" as const,
    featured: true,
    views: 284,
  },
  {
    id: "l-koramangala",
    providerProfileId: "p-vikram",
    title: "Shared room for a creative professional in Koramangala",
    propertyType: "apartment",
    roomType: "shared-room",
    rent: 14500,
    deposit: 29000,
    city: "Bengaluru",
    locality: "Koramangala",
    address: "5th Block, Koramangala",
    description:
      "A spacious shared room in a 2BHK with one other person. Great natural light, a reading nook, and a kitchen stocked with every spice you could need. Ideal for someone who is out during the day.",
    amenities: ["Wi-Fi", "Kitchen access", "Washing machine", "Lift", "Power backup"],
    furnishing: "semi-furnished",
    availableFrom: "2026-12-10",
    houseRules: ["Vegetarian kitchen preferred", "No overnight guests without notice"],
    occupancy: 1,
    photos: propertyPhotos.koramangala,
    verified: true,
    status: "active" as const,
    featured: false,
    views: 162,
  },
  {
    id: "l-hsr",
    providerProfileId: "p-vikram",
    title: "Furnished studio with a work corner in HSR Layout",
    propertyType: "apartment",
    roomType: "studio",
    rent: 26000,
    deposit: 52000,
    city: "Bengaluru",
    locality: "HSR Layout",
    address: "Sector 2, HSR Layout",
    description:
      "A private studio with a dedicated work desk, fast internet and a small balcony. Perfect for someone moving to Bengaluru for work who wants their own space without buying furniture.",
    amenities: ["Wi-Fi", "Air conditioning", "Attached bathroom", "Kitchen access", "Gym", "Lift"],
    furnishing: "furnished",
    availableFrom: "2027-01-01",
    houseRules: ["No smoking indoors", "No pets"],
    occupancy: 1,
    photos: propertyPhotos.hsr,
    verified: true,
    status: "active" as const,
    featured: true,
    views: 341,
  },
  {
    id: "l-bandra",
    providerProfileId: "p-vikram",
    title: "Sea-breeze room in a Bandra West apartment",
    propertyType: "apartment",
    roomType: "private-room",
    rent: 32000,
    deposit: 64000,
    city: "Mumbai",
    locality: "Bandra West",
    address: "Pali Hill, Bandra West",
    description:
      "A private room in a bright Bandra apartment, a ten-minute walk from Bandstand. Shared with one calm, tidy flatmate. Most of the day the flat is quiet, and the balcony is the best part.",
    amenities: ["Wi-Fi", "Air conditioning", "Attached bathroom", "Kitchen access", "Balcony", "Lift"],
    furnishing: "semi-furnished",
    availableFrom: "2026-12-15",
    houseRules: ["No smoking indoors", "Quiet hours after 11pm"],
    occupancy: 1,
    photos: propertyPhotos.bandra,
    verified: true,
    status: "active" as const,
    featured: false,
    views: 208,
  },
  {
    id: "l-powai",
    providerProfileId: "p-vikram",
    title: "Lake-side private room in Powai",
    propertyType: "apartment",
    roomType: "private-room",
    rent: 24000,
    deposit: 48000,
    city: "Mumbai",
    locality: "Powai",
    address: "Hiranandani Gardens, Powai",
    description:
      "Quiet, furnished room in a 2BHK overlooking the lake. Ideal for a working professional. The building has a gym, 24-hour security and covered parking.",
    amenities: ["Wi-Fi", "Air conditioning", "Gym", "Parking", "Lift", "Power backup", "Housekeeping"],
    furnishing: "furnished",
    availableFrom: "2027-01-05",
    houseRules: ["No pets", "No smoking indoors"],
    occupancy: 1,
    photos: propertyPhotos.powai,
    verified: true,
    status: "active" as const,
    featured: false,
    views: 119,
  },
  {
    id: "l-baner",
    providerProfileId: "p-vikram",
    title: "Big room in a Baner flat with a balcony",
    propertyType: "apartment",
    roomType: "private-room",
    rent: 17000,
    deposit: 34000,
    city: "Pune",
    locality: "Baner",
    address: "Baner Road, Pune",
    description:
      "A generously sized room in a friendly 3BHK. Two flatmates who work in design and tech. We share cooking duties a few nights a week and keep the flat calm and clean.",
    amenities: ["Wi-Fi", "Kitchen access", "Washing machine", "Balcony", "Parking"],
    furnishing: "semi-furnished",
    availableFrom: "2026-12-20",
    houseRules: ["Vegetarian preferred", "Guests before 10pm"],
    occupancy: 1,
    photos: propertyPhotos.baner,
    verified: true,
    status: "active" as const,
    featured: false,
    views: 96,
  },
  {
    id: "l-hauzkhas",
    providerProfileId: "p-vikram",
    title: "Student-friendly shared room in Hauz Khas",
    propertyType: "pg",
    roomType: "shared-room",
    rent: 12000,
    deposit: 24000,
    city: "Delhi",
    locality: "Hauz Khas",
    address: "Hauz Khas Village",
    description:
      "A cheerful shared room in a well-maintained co-living flat. Bills and Wi-Fi included. Five minutes from the metro and surrounded by cafés, galleries and bookshops.",
    amenities: ["Wi-Fi", "Kitchen access", "Washing machine", "Housekeeping", "Power backup"],
    furnishing: "furnished",
    availableFrom: "2026-12-01",
    houseRules: ["No smoking indoors", "Guests allowed until 11pm"],
    occupancy: 2,
    photos: propertyPhotos.delhi,
    verified: true,
    status: "active" as const,
    featured: true,
    views: 273,
  },
  {
    id: "l-gachibowli",
    providerProfileId: "p-vikram",
    title: "Modern private room near Gachibowli tech park",
    propertyType: "apartment",
    roomType: "private-room",
    rent: 21000,
    deposit: 42000,
    city: "Hyderabad",
    locality: "Gachibowli",
    address: "Financial District, Gachibowli",
    description:
      "Newly furnished room in a 3BHK with two engineers. Fast internet, a big common balcony, and a kitchen that gets weekend use. Fifteen minutes from the financial district.",
    amenities: ["Wi-Fi", "Air conditioning", "Attached bathroom", "Gym", "Parking", "Lift", "Power backup"],
    furnishing: "furnished",
    availableFrom: "2027-01-05",
    houseRules: ["No smoking indoors", "Quiet hours after 11pm"],
    occupancy: 1,
    photos: propertyPhotos.hyderabad,
    verified: true,
    status: "active" as const,
    featured: false,
    views: 87,
  },
  {
    id: "l-riya-room",
    providerProfileId: "demo-riya",
    title: "Calm private room in my Indiranagar 3BHK",
    propertyType: "apartment",
    roomType: "private-room",
    rent: 19000,
    deposit: 38000,
    city: "Bengaluru",
    locality: "Indiranagar",
    address: "Indiranagar 2nd Stage",
    description:
      "The spare room in my 3BHK is available from December. It gets morning light, has a built-in wardrobe and a shared balcony. I'm looking for someone who wants a peaceful home.",
    amenities: ["Wi-Fi", "Kitchen access", "Washing machine", "Balcony", "Parking"],
    furnishing: "semi-furnished",
    availableFrom: "2026-12-01",
    houseRules: ["No smoking indoors", "Guests before 10pm"],
    occupancy: 1,
    photos: propertyPhotos.indiranagar,
    verified: true,
    status: "active" as const,
    featured: false,
    views: 64,
  },
];

async function main() {
  console.log("Seeding Nivasa…");

  let demoUser = (
    await db.select().from(user).where(eq(user.email, "demo@nivasa.app")).limit(1)
  )[0];

  if (!demoUser) {
    await auth.api.signUpEmail({
      body: {
        name: "Riya Kapoor",
        email: "demo@nivasa.app",
        password: "Nivasa123!",
      },
    });
    demoUser = (
      await db.select().from(user).where(eq(user.email, "demo@nivasa.app")).limit(1)
    )[0]!;
    console.log("Created demo account demo@nivasa.app");
  }

  for (const person of people) {
    const values = {
      ...person,
      userId: person.id === "demo-riya" ? demoUser.id : null,
      onboardingComplete: true,
      phoneVerified: person.phoneVerified ?? true,
      idVerified: person.idVerified ?? false,
      verified: person.verified ?? false,
      role: person.role ?? "seeker",
      plan: person.plan ?? "free",
      planInterval: person.planInterval ?? null,
      planRenewsAt:
        person.id === "demo-riya"
          ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 24)
          : null,
      photos: person.photos,
    };
    await db
      .insert(profiles)
      .values(values as never)
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          userId: values.userId,
          name: values.name,
          avatarUrl: values.avatarUrl,
          plan: (values.plan ?? "free") as "free" | "plus" | "provider",
          isAdmin: values.isAdmin ?? false,
          onboardingComplete: true,
        },
      });
  }

  for (const listing of listingRows) {
    await db
      .insert(listings)
      .values(listing)
      .onConflictDoUpdate({
        target: listings.id,
        set: {
          title: listing.title,
          rent: listing.rent,
          status: listing.status,
          featured: listing.featured,
        },
      });
  }

  const demo = people.find((p) => p.id === "demo-riya")!;
  const demoCompat = (id: string) => {
    const other = people.find((p) => p.id === id)!;
    return calculateCompatibility(demo as never, other as never, DEFAULT_WEIGHTS).overall;
  };

  const swipeRows = [
    { fromProfileId: "demo-riya", toProfileId: "p-ananya", action: "like" },
    { fromProfileId: "demo-riya", toProfileId: "p-ishaan", action: "like" },
    { fromProfileId: "demo-riya", toProfileId: "p-kabir", action: "pass" },
    { fromProfileId: "p-ananya", toProfileId: "demo-riya", action: "like" },
    { fromProfileId: "p-ishaan", toProfileId: "demo-riya", action: "like" },
    { fromProfileId: "p-naina", toProfileId: "demo-riya", action: "like" },
    { fromProfileId: "p-tara", toProfileId: "demo-riya", action: "like" },
    { fromProfileId: "p-dev", toProfileId: "demo-riya", action: "like" },
    { fromProfileId: "p-meera", toProfileId: "p-ananya", action: "like" },
  ] as const;

  for (const swipe of swipeRows) {
    await db
      .insert(swipes)
      .values(swipe as never)
      .onConflictDoNothing();
  }

  const matchRows = [
    {
      id: "m-ananya",
      profileAId: "demo-riya",
      profileBId: "p-ananya",
      compatibility: demoCompat("p-ananya"),
    },
    {
      id: "m-ishaan",
      profileAId: "demo-riya",
      profileBId: "p-ishaan",
      compatibility: demoCompat("p-ishaan"),
    },
    {
      id: "m-meera-ananya",
      profileAId: "p-meera",
      profileBId: "p-ananya",
      compatibility: 81,
    },
  ];

  for (const match of matchRows) {
    await db.insert(matches).values(match).onConflictDoNothing();
  }

  await db
    .insert(conversations)
    .values({ id: "c-ananya", matchId: "m-ananya" })
    .onConflictDoNothing();
  await db
    .insert(conversations)
    .values({ id: "c-ishaan", matchId: "m-ishaan" })
    .onConflictDoNothing();

  const messageRows = [
    {
      id: "msg-a1",
      conversationId: "c-ananya",
      senderProfileId: "p-ananya",
      body: "Hey Riya! We matched — I loved that you're also in Indiranagar. Are you looking at 2BHKs or 3BHKs?",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      readAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    },
    {
      id: "msg-a2",
      conversationId: "c-ananya",
      senderProfileId: "demo-riya",
      body: "Hi Aanya! Mostly 3BHKs — I'd love a proper work corner. Your place sounds lovely, is the balcony shared?",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
      readAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    },
    {
      id: "msg-a3",
      conversationId: "c-ananya",
      senderProfileId: "p-ananya",
      body: "Yes, shared and full of plants. Want to do a video call this week and see if it feels right?",
      createdAt: new Date(Date.now() - 1000 * 60 * 42),
      readAt: null,
    },
    {
      id: "msg-i1",
      conversationId: "c-ishaan",
      senderProfileId: "p-ishaan",
      body: "Hey! Fellow Koramangala searcher here. I work from home too — how do you usually split the common areas?",
      createdAt: new Date(Date.now() - 1000 * 60 * 90),
      readAt: null,
    },
  ];

  for (const message of messageRows) {
    await db.insert(messages).values(message).onConflictDoNothing();
  }

  for (const conversation of ["c-ananya", "c-ishaan"]) {
    const last = messageRows
      .filter((m) => m.conversationId === conversation)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    await db
      .update(conversations)
      .set({ lastMessageAt: last?.createdAt ?? new Date() })
      .where(eq(conversations.id, conversation));
  }

  const notificationRows = [
    {
      id: "n-like-naina",
      profileId: "demo-riya",
      type: "like",
      title: "Naina liked your profile",
      body: "You're both looking in Mumbai and share a similar budget.",
      href: "/app/likes",
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 20),
    },
    {
      id: "n-match-ishaan",
      profileId: "demo-riya",
      type: "match",
      title: "It's a match with Ishaan",
      body: "You and Ishaan are interested in living together. Say hello.",
      href: "/app/matches",
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 80),
    },
    {
      id: "n-msg-ananya",
      profileId: "demo-riya",
      type: "message",
      title: "New message from Aanya",
      body: "Want to do a video call this week and see if it feels right?",
      href: "/app/messages/c-ananya",
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 42),
    },
    {
      id: "n-listing",
      profileId: "demo-riya",
      type: "listing",
      title: "Your listing is live",
      body: "Calm private room in my Indiranagar 3BHK passed review.",
      href: "/app/provider/listings",
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
    },
  ];

  for (const notification of notificationRows) {
    await db.insert(notifications).values(notification).onConflictDoNothing();
  }

  for (const saved of [
    { id: "s-meera", profileId: "demo-riya", targetProfileId: "p-meera" },
    { id: "s-rohan", profileId: "demo-riya", targetProfileId: "p-rohan" },
  ]) {
    await db.insert(savedProfiles).values(saved).onConflictDoNothing();
  }

  for (const saved of [
    { id: "sl-l1", profileId: "demo-riya", listingId: "l-indiranagar" },
    { id: "sl-l3", profileId: "demo-riya", listingId: "l-hsr" },
  ]) {
    await db.insert(savedListings).values(saved).onConflictDoNothing();
  }

  const inquiryRows = [
    {
      id: "i-1",
      listingId: "l-riya-room",
      fromProfileId: "p-ananya",
      message: "Hi Riya, I'm also in Indiranagar and looking from December. Is the room still available?",
      status: "new" as const,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    },
    {
      id: "i-2",
      listingId: "l-riya-room",
      fromProfileId: "p-tara",
      message: "Hello! I loved the balcony. Would it be okay to visit this weekend?",
      status: "replied" as const,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
    },
  ];

  for (const inquiry of inquiryRows) {
    await db.insert(inquiries).values(inquiry).onConflictDoNothing();
  }

  await db
    .insert(reports)
    .values({
      id: "r-1",
      reporterProfileId: "p-sana",
      targetType: "profile",
      targetId: "p-kabir",
      reason: "Misleading profile details",
      details: "The budget and move-in date did not match the listing description.",
      status: "open",
    })
    .onConflictDoNothing();

  await db
    .insert(subscriptions)
    .values({
      id: "sub-riya",
      profileId: "demo-riya",
      plan: "plus",
      interval: "monthly",
      amount: 499,
      status: "active",
      provider: "manual",
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
      renewsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 24),
    })
    .onConflictDoNothing();

  for (const setting of [
    { key: "compatibility_weights", value: DEFAULT_WEIGHTS },
    {
      key: "plans",
      value: {
        plusMonthly: 499,
        plusYearly: 3990,
        providerMonthly: 999,
        providerYearly: 7990,
      },
    },
  ]) {
    await db
      .insert(appSettings)
      .values(setting)
      .onConflictDoUpdate({ target: appSettings.key, set: { value: setting.value } });
  }

  console.log("Seed complete. Demo login: demo@nivasa.app / Nivasa123!");
  process.exit(0);
}


main().catch((error) => {
  console.error(error);
  process.exit(1);
});
