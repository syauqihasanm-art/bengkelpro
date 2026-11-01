import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "healthy";

  try {
    // Check if database store is accessible
    const workshops = db.getWorkshops();
    if (!Array.isArray(workshops)) {
      dbStatus = "degraded";
    }
  } catch (err) {
    dbStatus = "unreachable";
  }

  const responseTimeMs = Date.now() - startTime;
  const isHealthy = dbStatus === "healthy";

  return NextResponse.json(
    {
      status: isHealthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      service: "BengkelPro Workshop Management System",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      uptime: process.uptime ? Math.floor(process.uptime()) : 0,
      checks: {
        database: dbStatus,
        api: "healthy",
      },
      responseTimeMs,
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
