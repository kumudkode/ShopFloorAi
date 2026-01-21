import { NextResponse } from "next/server";
import { seedDatabase } from "@/backend/seed";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = seedDatabase();

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed database" },
      { status: 500 },
    );
  }
}

// Also support GET for easy browser testing
export async function GET() {
  return POST();
}
