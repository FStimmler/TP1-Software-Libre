import { connectToDatabase } from "@/lib/mongo";
import { NextResponse, type NextRequest } from "next/server"

/**
 * GET /api/zones
 * Obtiene la lista de zonas
 */
export async function GET(request: NextRequest) {
  try {

    let zones: {
    id: string;
    name: string;
    description: string;
    bounds: number[][];
    color: string;
    }[]
    // Conectar a la base de datos y obtener las zonas
    const searchParams = request.nextUrl.searchParams
    const cattle = searchParams.get("cattle") || ""
    const db = await connectToDatabase();

    if (!cattle.length) {
      zones = (await db.collection('zones').find().toArray()).map((doc: any) => ({
        id: doc._id?.toString() ?? "",
        name: doc.name ?? "",
        description: doc.description ?? "",
        bounds: doc.bounds ?? [0, 0],
        color: doc.color ?? "",
      }));
    } else {
      // Si se especifica un ganado, filtrar las zonas por el ID del ganado   
      const point = (await db.collection('cattle').findOne({ id: "cow-"+cattle }))?.position;
      if (!point || point.length !== 2) {
        return NextResponse.json(
          {
            success: false,
            error: "Ganado no encontrado o sin posición válida",
          },
          { status: 404 },
        )
      }
      zones = (await db.collection('zones').find({ bounds: { $geoIntersects: {$geometry: { type: "Point", coordinates: [point[1], point[0]] } }} }).toArray()).map((doc: any) => ({
        id: doc._id?.toString() ?? "",
        name: doc.name ?? "",
        description: doc.description ?? "",
        bounds: doc.bounds ?? [0, 0],
        color: doc.color ?? "",
      }));
    }

    return NextResponse.json(
      {
        success: true,
        data: zones,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error al obtener zonas:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener zonas",
      },
      { status: 500 },
    )
  }
}
