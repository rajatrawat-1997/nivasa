"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  BadgeCheck,
  Briefcase,
  Heart,
  MapPin,
  RotateCcw,
  Sparkles,
  Star,
  X,
} from "lucide-react";

import { formatINR } from "@/lib/constants";
import { Button } from "@/components/ui/button";

type DemoPerson = {
  name: string;
  age: number;
  profession: string;
  locality: string;
  budgetMin: number;
  budgetMax: number;
  compatibility: number;
  image: string;
  tags: string[];
  bio: string;
};

const demoPeople: DemoPerson[] = [
  {
    name: "Aanya Sharma",
    age: 25,
    profession: "Product Designer",
    locality: "Indiranagar, Bengaluru",
    budgetMin: 12000,
    budgetMax: 18000,
    compatibility: 94,
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85",
    tags: ["Clean", "Vegetarian", "Early bird", "Non-smoker"],
    bio: "Early riser, filter coffee loyalist, and a very tidy flatmate.",
  },
  {
    name: "Ishaan Verma",
    age: 28,
    profession: "Software Engineer",
    locality: "Koramangala, Bengaluru",
    budgetMin: 20000,
    budgetMax: 28000,
    compatibility: 88,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=85",
    tags: ["Works from home", "Non-smoker", "Night owl"],
    bio: "Big on weekend football and cooking experiments.",
  },
  {
    name: "Meera Nair",
    age: 24,
    profession: "UX Researcher",
    locality: "HSR Layout, Bengaluru",
    budgetMin: 15000,
    budgetMax: 22000,
    compatibility: 86,
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=85",
    tags: ["Pet friendly", "Very tidy", "Quiet evenings"],
    bio: "Researcher by day, clay-potter by night. Comes with a polite cat.",
  },
];

export function HeroDeck() {
  const [index, setIndex] = useState(0);
  const [exit, setExit] = useState<{ x: number; rotate: number } | null>(null);

  const person = demoPeople[index % demoPeople.length];
  const nextPerson = demoPeople[(index + 1) % demoPeople.length];

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-14, 14]);
  const likeOpacity = useTransform(x, [40, 150], [0, 1]);
  const passOpacity = useTransform(x, [-150, -40], [1, 0]);

  const advance = (direction: 1 | -1) => {
    setExit({ x: direction * 520, rotate: direction * 18 });
    window.setTimeout(() => {
      setIndex((value) => (value + 1) % demoPeople.length);
      setExit(null);
      x.set(0);
    }, 260);
  };

  const reset = useMemo(
    () => () => {
      setIndex(0);
      setExit(null);
      x.set(0);
    },
    [x],
  );

  return (
    <div className="relative mx-auto w-full max-w-[400px]">
      <div className="absolute -left-4 top-10 hidden rotate-[-8deg] rounded-2xl border border-border bg-card px-3.5 py-2.5 shadow-sm sm:block">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Shared interests
        </p>
        <p className="mt-0.5 text-[13px] font-semibold">Design, coffee, quiet mornings</p>
      </div>
      <div className="absolute -right-3 bottom-28 z-20 hidden rotate-[6deg] rounded-2xl border border-border bg-card px-3.5 py-2.5 shadow-sm sm:block">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Mutual match
        </p>
        <p className="mt-0.5 text-[13px] font-semibold">It&apos;s a match with Aanya</p>
      </div>

      <div className="relative aspect-[4/5] select-none">
        <div className="absolute inset-x-4 top-5 h-full rounded-[28px] border border-border bg-card/70" />
        <div className="absolute inset-x-2 top-2.5 h-full rounded-[30px] border border-border bg-card">
          <div className="relative m-2 h-[calc(100%-16px)] overflow-hidden rounded-[24px]">
            <Image
              src={nextPerson.image}
              alt=""
              fill
              sizes="400px"
              className="object-cover blur-[2px] brightness-90"
            />
          </div>
        </div>

        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          style={{ x, rotate }}
          animate={exit ? { x: exit.x, rotate: exit.rotate, opacity: 0 } : { x: 0, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          onDragEnd={(_, info) => {
            if (info.offset.x > 120) advance(1);
            else if (info.offset.x < -120) advance(-1);
          }}
          className="absolute inset-0 cursor-grab overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_24px_60px_-24px_rgba(37,37,37,0.35)] active:cursor-grabbing"
        >
          <Image
            src={person.image}
            alt={`${person.name}, ${person.age}`}
            fill
            priority
            sizes="(max-width: 768px) 90vw, 400px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/20" />

          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute left-4 top-5 rotate-[-9deg] rounded-lg border-[3px] border-[#299D70] px-3 py-1 text-[20px] font-extrabold uppercase tracking-[0.06em] text-[#299D70]"
          >
            Like
          </motion.div>
          <motion.div
            style={{ opacity: passOpacity }}
            className="absolute right-4 top-5 rotate-[9deg] rounded-lg border-[3px] border-white px-3 py-1 text-[20px] font-extrabold uppercase tracking-[0.06em] text-white"
          >
            Pass
          </motion.div>

          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1.5 text-[11.5px] font-bold text-[#252525] shadow-sm backdrop-blur">
              <Sparkles className="size-3.5 text-primary" />
              {person.compatibility}% match
            </span>
            <span className="flex items-center gap-1 rounded-full bg-black/30 px-2 py-1.5 text-[11px] font-medium text-white backdrop-blur">
              <BadgeCheck className="size-3.5" /> Verified
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <p className="flex items-center gap-1 text-[11.5px] font-medium text-white/80">
              <MapPin className="size-3.5" /> {person.locality}
            </p>
            <h3 className="mt-1 font-display text-[25px] font-bold tracking-[-0.04em]">
              {person.name}, {person.age}
            </h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-white/85">
              <Briefcase className="size-3.5" /> {person.profession}
            </p>
            <p className="mt-2.5 line-clamp-2 max-w-[95%] text-[12.5px] leading-relaxed text-white/80">
              {person.bio}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {person.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[10.5px] font-medium text-white backdrop-blur"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-3.5 flex items-center justify-between border-t border-white/15 pt-3">
              <p className="text-[12px] text-white/70">Monthly budget</p>
              <p className="text-[13.5px] font-semibold">
                {formatINR(person.budgetMin)}–{formatINR(person.budgetMax)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => advance(-1)}
          className="flex size-14 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-transform hover:scale-105 active:scale-95"
          aria-label="Pass on this profile"
        >
          <X className="size-6" strokeWidth={2.2} />
        </button>
        <button
          type="button"
          onClick={() => advance(1)}
          className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-[#E6A23C] shadow-sm transition-transform hover:scale-105 active:scale-95"
          aria-label="Super like this profile"
        >
          <Star className="size-5" strokeWidth={2.2} />
        </button>
        <button
          type="button"
          onClick={() => advance(1)}
          className="flex size-16 items-center justify-center rounded-full bg-primary text-white shadow-[0_12px_28px_-10px_rgba(242,107,91,0.8)] transition-transform hover:scale-105 active:scale-95"
          aria-label="Like this profile"
        >
          <Heart className="size-7" fill="currentColor" />
        </button>
        <button
          type="button"
          onClick={reset}
          className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-transform hover:scale-105 active:scale-95"
          aria-label="Reset demo"
        >
          <RotateCcw className="size-4.5" />
        </button>
        <Button
          asChild
          variant="ghost"
          className="hidden rounded-full text-muted-foreground sm:inline-flex"
        >
          <a href="/signup">Try it properly</a>
        </Button>
      </div>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Interactive product preview · demo profiles
      </p>
    </div>
  );
}
