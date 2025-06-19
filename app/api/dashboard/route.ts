import { connectToDatabase } from "@/lib/mongo";
import { NextResponse } from "next/server"

/**
 * GET /api/dashboard
 * Obtiene los datos para el dashboard
 */
export async function GET() {
  try {
    const db = await connectToDatabase();

    const dashboardData = {
      totalCattle: await db.collection('cattle').countDocuments(),
      connectedCattle: await db.collection('cattle').countDocuments({ connected: true }),
      totalZones: await db.collection('zones').countDocuments(),
      alerts: 0,
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json(
      {
        success: true,
        data: dashboardData,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error al obtener datos del dashboard:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener datos del dashboard",
      },
      { status: 500 },
    )
  }
}
