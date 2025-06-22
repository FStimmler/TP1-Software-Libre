import { connectToDatabase } from "@/lib/mongo";
import { NextResponse, type NextRequest } from "next/server";

/**
 * GET /api/cattle-geosearch?lat=...&lng=...&radius=...
 * Busca vacas por radio usando geosearch de MongoDB
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get("lat") ? Number.parseFloat(searchParams.get("lat") || "") : null;
    const lng = searchParams.get("lng") ? Number.parseFloat(searchParams.get("lng") || "") : null;
    const radius = searchParams.get("radius") ? Number.parseFloat(searchParams.get("radius") || "") : null;

    if (lat === null || lng === null || radius === null) {
      return NextResponse.json({ success: false, error: "Faltan parámetros de búsqueda" }, { status: 400 });
    }

    const db = await connectToDatabase();
    // Busca vacas dentro del radio usando $geoWithin y $centerSphere
    // Radio en radianes: km / 6371
    const cattle = await db.collection("cattle").find({
      position: {
        $geoWithin: {
          $centerSphere: [[lat, lng], radius / 6371]
        }
      }
    }).toArray();

    return NextResponse.json({ success: true, data: cattle }, { status: 200 });
  } catch (error) {
    console.error("Error en geosearch de vacas:", error);
    return NextResponse.json({ success: false, error: "Error al buscar vacas por radio" }, { status: 500 });
  }
}
