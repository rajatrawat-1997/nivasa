import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { user } from "@/lib/auth-schema";
import { getCurrentProfile } from "@/lib/session";

const schema = z.object({ confirm: z.literal("DELETE") });

export async function DELETE(request: Request) {
  const me = await getCurrentProfile();
  if (!me) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Type DELETE exactly to confirm account deletion." },
      { status: 400 },
    );
  }

  if (!me.userId) {
    return NextResponse.json({ error: "Account not linked." }, { status: 400 });
  }

  await db.delete(user).where(eq(user.id, me.userId));

  return NextResponse.json({ deleted: true });
}
