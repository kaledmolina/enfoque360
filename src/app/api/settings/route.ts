import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/settings — get all settings as key-value object (public)
export async function GET() {
  try {
    const settings = await db.siteSettings.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }
    return NextResponse.json(settingsMap);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT /api/settings — update settings (ADMIN only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Support single { key, value } or batch { settings: Record<string, string> }
    if (body.key && body.value !== undefined) {
      // Single setting update
      const result = await db.siteSettings.upsert({
        where: { key: body.key },
        update: { value: body.value },
        create: { key: body.key, value: body.value },
      });
      return NextResponse.json({ key: result.key, value: result.value });
    }

    if (body.settings && typeof body.settings === "object") {
      // Batch setting update
      const entries = Object.entries(body.settings) as [string, string][];
      const results = await Promise.all(
        entries.map(([key, value]) =>
          db.siteSettings.upsert({
            where: { key },
            update: { value },
            create: { key, value },
          })
        )
      );
      const settingsMap: Record<string, string> = {};
      for (const r of results) {
        settingsMap[r.key] = r.value;
      }
      return NextResponse.json(settingsMap);
    }

    return NextResponse.json(
      { error: "Provide { key, value } or { settings: { key: value } }" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
