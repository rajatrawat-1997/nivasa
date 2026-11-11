import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";
import type { HousingPreferences, Lifestyle, PlanId } from "./types";

export * from "./auth-schema";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

export const profiles = pgTable(
  "profiles",
  {
    id: id(),
    userId: text("user_id")
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    age: integer("age").notNull(),
    gender: text("gender").notNull().default("prefer-not-to-say"),
    city: text("city").notNull(),
    locality: text("locality").notNull().default(""),
    profession: text("profession").notNull().default(""),
    company: text("company"),
    bio: text("bio").notNull().default(""),
    avatarUrl: text("avatar_url").notNull().default(""),
    photos: jsonb("photos").$type<string[]>().notNull().default([]),
    budgetMin: integer("budget_min").notNull().default(0),
    budgetMax: integer("budget_max").notNull().default(0),
    moveInDate: text("move_in_date").notNull().default(""),
    distanceKm: integer("distance_km").notNull().default(0),
    languages: jsonb("languages").$type<string[]>().notNull().default([]),
    lifestyle: jsonb("lifestyle").$type<Lifestyle>().notNull(),
    housing: jsonb("housing").$type<HousingPreferences>().notNull(),
    verified: boolean("verified").notNull().default(false),
    phoneVerified: boolean("phone_verified").notNull().default(false),
    idVerified: boolean("id_verified").notNull().default(false),
    role: text("role").notNull().default("seeker"),
    isAdmin: boolean("is_admin").notNull().default(false),
    plan: text("plan").$type<PlanId>().notNull().default("free"),
    planInterval: text("plan_interval").$type<"monthly" | "yearly">(),
    planRenewsAt: timestamp("plan_renews_at", { withTimezone: true }),
    onboardingComplete: boolean("onboarding_complete").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("profiles_user_id_idx").on(table.userId),
    index("profiles_city_idx").on(table.city),
  ],
);

export const swipes = pgTable(
  "swipes",
  {
    id: id(),
    fromProfileId: text("from_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    toProfileId: text("to_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    action: text("action").$type<"like" | "pass" | "superlike">().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("swipes_from_to_unique").on(table.fromProfileId, table.toProfileId),
    index("swipes_to_profile_idx").on(table.toProfileId),
  ],
);

export const matches = pgTable(
  "matches",
  {
    id: id(),
    profileAId: text("profile_a_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    profileBId: text("profile_b_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    compatibility: integer("compatibility").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("matches_pair_unique").on(table.profileAId, table.profileBId),
    index("matches_profile_a_idx").on(table.profileAId),
    index("matches_profile_b_idx").on(table.profileBId),
  ],
);

export const conversations = pgTable("conversations", {
  id: id(),
  matchId: text("match_id")
    .notNull()
    .unique()
    .references(() => matches.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }).notNull().defaultNow(),
});

export const messages = pgTable(
  "messages",
  {
    id: id(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderProfileId: text("sender_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    readAt: timestamp("read_at", { withTimezone: true }),
  },
  (table) => [index("messages_conversation_idx").on(table.conversationId)],
);

export const listings = pgTable(
  "listings",
  {
    id: id(),
    providerProfileId: text("provider_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    propertyType: text("property_type").notNull().default("apartment"),
    roomType: text("room_type").notNull().default("private-room"),
    rent: integer("rent").notNull(),
    deposit: integer("deposit").notNull().default(0),
    city: text("city").notNull(),
    locality: text("locality").notNull(),
    address: text("address").notNull().default(""),
    description: text("description").notNull().default(""),
    amenities: jsonb("amenities").$type<string[]>().notNull().default([]),
    furnishing: text("furnishing").notNull().default("furnished"),
    availableFrom: text("available_from").notNull(),
    houseRules: jsonb("house_rules").$type<string[]>().notNull().default([]),
    occupancy: integer("occupancy").notNull().default(1),
    photos: jsonb("photos").$type<string[]>().notNull().default([]),
    verified: boolean("verified").notNull().default(false),
    status: text("status")
      .$type<"pending" | "active" | "paused" | "rented" | "rejected">()
      .notNull()
      .default("pending"),
    featured: boolean("featured").notNull().default(false),
    views: integer("views").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("listings_city_idx").on(table.city),
    index("listings_provider_idx").on(table.providerProfileId),
  ],
);

export const savedProfiles = pgTable(
  "saved_profiles",
  {
    id: id(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    targetProfileId: text("target_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("saved_profiles_unique").on(table.profileId, table.targetProfileId),
  ],
);

export const savedListings = pgTable(
  "saved_listings",
  {
    id: id(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    listingId: text("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("saved_listings_unique").on(table.profileId, table.listingId),
  ],
);

export const inquiries = pgTable(
  "inquiries",
  {
    id: id(),
    listingId: text("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    fromProfileId: text("from_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    status: text("status")
      .$type<"new" | "replied" | "closed">()
      .notNull()
      .default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("inquiries_listing_idx").on(table.listingId)],
);

export const notifications = pgTable(
  "notifications",
  {
    id: id(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    href: text("href"),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("notifications_profile_idx").on(table.profileId)],
);

export const reports = pgTable("reports", {
  id: id(),
  reporterProfileId: text("reporter_profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  targetType: text("target_type").$type<"profile" | "listing" | "message">().notNull(),
  targetId: text("target_id").notNull(),
  reason: text("reason").notNull(),
  details: text("details").notNull().default(""),
  status: text("status")
    .$type<"open" | "reviewing" | "resolved" | "dismissed">()
    .notNull()
    .default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const blockedUsers = pgTable(
  "blocked_users",
  {
    id: id(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    blockedProfileId: text("blocked_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("blocked_users_unique").on(table.profileId, table.blockedProfileId),
  ],
);

export const subscriptions = pgTable("subscriptions", {
  id: id(),
  profileId: text("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  plan: text("plan").$type<Exclude<PlanId, "free">>().notNull(),
  interval: text("interval").$type<"monthly" | "yearly">().notNull(),
  amount: integer("amount").notNull(),
  status: text("status")
    .$type<"active" | "cancelled" | "past_due">()
    .notNull()
    .default("active"),
  provider: text("provider").notNull().default("manual"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  renewsAt: timestamp("renews_at", { withTimezone: true }),
});

export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const auditLogs = pgTable("audit_logs", {
  id: id(),
  actorProfileId: text("actor_profile_id").references(() => profiles.id, {
    onDelete: "set null",
  }),
  action: text("action").notNull(),
  target: text("target").notNull(),
  detail: text("detail").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(user, {
    fields: [profiles.userId],
    references: [user.id],
  }),
  listings: many(listings),
}));

export const listingsRelations = relations(listings, ({ one }) => ({
  provider: one(profiles, {
    fields: [listings.providerProfileId],
    references: [profiles.id],
  }),
}));

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
