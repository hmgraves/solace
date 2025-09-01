export const runtime = "nodejs"; // force this route to run in the node.js runtime as pg needs node sockets

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { advocates } from "@/db/schema";
import { ilike, or, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url); // parse and sanitize the query params
  const q = (searchParams.get("q") ?? "").trim();

  // limit: default 25, clamp to [1, 100] to protect db and payload size
  const rawLimit = Number(searchParams.get("limit") ?? 25); 
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 25;

  // offset: default 0 to keep non-negative - simple pagination 
  const rawOffset = Number(searchParams.get("offset") ?? 0);
  const offset = Number.isFinite(rawOffset) && rawOffset >= 0 ? rawOffset : 0;

  try {
    // guard: ensure specialties is an array before iterating it.
    // else, substitute '[]' so EXISTS clause doesn't crash.
    const safeSpecialties = sql`
      CASE
        WHEN jsonb_typeof(${advocates.specialties}) = 'array'
        THEN ${advocates.specialties}
        ELSE '[]'::jsonb
      END
    `;

    // if q is empty - no filter (full list, still paginated)
    // otherwise OR a set of case-insensitive "contains" checks across the columns
    const where =
      q === ""
        ? undefined
        : or(
            // text columns: case-insensitive, contains via ILIKE '%q%'
            ilike(advocates.firstName, `%${q}%`),
            ilike(advocates.lastName, `%${q}%`),
            ilike(advocates.city, `%${q}%`),
            ilike(advocates.degree, `%${q}%`),

            // JSONB array contains-like (case-insensitive)
            sql`EXISTS (
              SELECT 1
              FROM jsonb_array_elements_text(${safeSpecialties}) AS s(val)
              WHERE val ILIKE ${"%" + q + "%"}
            )`,

            // Years as text for loose matching; 
            // sql`${advocates.yearsOfExperience} = ${Number(q)}`
            sql`${advocates.yearsOfExperience}::text ILIKE ${"%" + q + "%"}`
          );

    const rows = await db
      .select()
      .from(advocates)
      .where(where as any)
      .orderBy(advocates.id) // ORDER BY using ID will make pagination more stable accross requests
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ data: rows });
  } catch (err: any) {
    console.error("GET /api/advocates failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch advocates", detail: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
