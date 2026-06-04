import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// GET /api/auth/setup — Check if the application has no registered users
export async function GET() {
  try {
    const count = await db.user.count();
    return NextResponse.json({ needsSetup: count === 0 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check setup status" },
      { status: 500 }
    );
  }
}

// POST /api/auth/setup — Register the first administrator user
export async function POST(request: NextRequest) {
  try {
    const count = await db.user.count();
    if (count > 0) {
      return NextResponse.json(
        { error: "Setup already completed" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "All fields are required (name, email, password)" },
        { status: 400 }
      );
    }

    // Email format validation
    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        passwordHash,
        role: "ADMIN",
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Create system log
    await db.systemLog.create({
      data: {
        action: "USER_CREATE",
        userId: user.id,
        details: `Initial setup: Created administrator ${email}`,
      },
    });

    return NextResponse.json(
      { success: true, message: "Administrator created successfully", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Failed to create administrator account" },
      { status: 500 }
    );
  }
}
