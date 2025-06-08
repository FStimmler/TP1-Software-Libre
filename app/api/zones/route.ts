import { connectToDatabase } from "@/lib/mongo";
import { NextResponse } from "next/server"

/**
 * GET /api/zones
 * Obtiene la lista de zonas
 */
export async function GET() {
  try {

    let zones: {
    id: string;
    name: string;
    description: string;
    bounds: number[][];
    color: string;
    }[]
    // Conectar a la base de datos y obtener las zonas
    const db = await connectToDatabase();
    zones = (await db.collection('zones').find().toArray()).map((doc: any) => ({
      id: doc._id?.toString() ?? "",
      name: doc.name ?? "",
      description: doc.description ?? "",
      bounds: doc.bounds ?? [0, 0],
      color: doc.color ?? "",
    }));


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
