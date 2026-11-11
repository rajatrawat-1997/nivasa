import type { CompatibilityBreakdown } from "@/lib/types";

export type DiscoverPerson = {
  id: string;
  name: string;
  age: number;
  profession: string;
  city: string;
  locality: string;
  distanceKm: number;
  budgetMin: number;
  budgetMax: number;
  moveInDate: string;
  bio: string;
  avatarUrl: string;
  photos: string[];
  verified: boolean;
  languages: string[];
  tags: string[];
  lifestyle: { label: string; value: string }[];
  compatibility: CompatibilityBreakdown;
};

export type MatchCelebration = {
  name: string;
  avatarUrl: string;
  conversationId: string;
  compatibility: number;
  myAvatarUrl: string;
};
