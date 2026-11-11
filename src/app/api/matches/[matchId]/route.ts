import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { matches } from "@/lib/schema";
import { getCurrentProfile } from "@/lib/session";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ matchId: string }> },
) {
  const me = await getCurrentProfile();
  if (!me) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });

  const { matchId } = await params;
  const [match] = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);

  if (!match) return NextResponse.json({ error: "Match not found." }, { status: 404 });
  if (match.profileAId !== me.id && match.profileBId !== me.id) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  await db.delete(matches).where(eq(matches.id, matchId));
  return NextResponse.json({ unmatched: true });
}
