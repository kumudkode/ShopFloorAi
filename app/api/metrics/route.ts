import { NextResponse } from "next/server";
import { getDashboardData } from "@/backend/metrics";
import { getWorkerCount } from "@/backend/database";
import { seedDatabase } from "@/backend/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Auto-seed if database is empty
    if (getWorkerCount() === 0) {
      seedDatabase();
    }

    const data = getDashboardData();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch metrics",
        stack: error.stack,
      },
      { status: 500 },
    );
  }
}
