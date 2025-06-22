import { initDatabase } from "@/lib/init-db";
import { connectToDatabase } from "@/lib/mongo";
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import Fuse from "fuse.js"

await initDatabase();
/**
 * GET /api/cattle
 * Obtiene la lista de ganado con opciones de filtrado
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de búsqueda de la URL
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const zoneId = searchParams.get("zoneId")
    const connected = searchParams.get("connected")
    const lat = searchParams.get("lat") ? Number.parseFloat(searchParams.get("lat") || "") : null
    const lng = searchParams.get("lng") ? Number.parseFloat(searchParams.get("lng") || "") : null
    const radius = searchParams.get("radius") ? Number.parseFloat(searchParams.get("radius") || "") : null

    let cattle: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    position: [number, number];
    connected: boolean;
    zoneId: string;
    } []

    const db = await connectToDatabase();
    cattle = (await db.collection('cattle').find().toArray()).map((doc: any) => ({
      id: doc.id?.toString() ?? "",
      name: doc.name ?? "",
      description: doc.description ?? "",
      imageUrl: doc.imageUrl ?? "",
      position: doc.position ?? [0, 0],
      connected: doc.connected ?? false,
      zoneId: doc.zoneId ?? "",
    }));

    // Función para calcular la distancia entre dos puntos (Haversine formula)
    function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
      const R = 6371 // Radio de la Tierra en km
      const dLat = ((lat2 - lat1) * Math.PI) / 180
      const dLon = ((lon2 - lon1) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c // Distancia en km
    }

    // Aplicar filtros
    let filteredCattle = cattle

    // Filtrar por término de búsqueda usando Fuse.js
    if (search) {
      let fuse = new Fuse(filteredCattle, {
        keys: ["name", "description"],
        threshold: 0.25, // Ajusta la sensibilidad de la búsqueda
      })
      filteredCattle = fuse.search(search).map(result => result.item)
    }

    // Filtrar por zona
    if (zoneId) {
      let fuse = new Fuse(filteredCattle, {
        keys: ["zoneId", "description"],
        threshold: 0.25, // Ajusta la sensibilidad de la búsqueda
      })
      filteredCattle = fuse.search(zoneId).map(result => result.item)
    }

    // Filtrar por estado de conexión
    if (connected !== null) {
      const isConnected = connected === "true"
      filteredCattle = filteredCattle.filter((cow) => cow.connected === isConnected)
    }

    // Filtrar por ubicación (coordenadas y radio)
    if (lat !== null && lng !== null && radius !== null) {
      filteredCattle = filteredCattle.filter((cow) => {
        const distance = calculateDistance(lat, lng, cow.position[0], cow.position[1])
        return distance <= radius
      })
    }

    return NextResponse.json(
      {
        success: true,
        data: filteredCattle,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error al obtener ganado:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener ganado",
      },
      { status: 500 },
    )
  }
}

/**
 * POST /api/cattle
 * Crea una nueva vaca
 */
export async function POST(request: NextRequest) {
  try {
    const db = await connectToDatabase();
    const body = await request.json();
    const { name, description, imageUrl, position } = body;

    // Validaciones básicas
    if (!name || !description || !position || position.length !== 2) {
      return NextResponse.json({ success: false, error: "Faltan datos obligatorios" }, { status: 400 });
    }

    // Buscar zona por geosearch (opcional, si quieres asignar zona automáticamente)
    let zoneId: string | null = null;
    const zone = await db.collection("zones").findOne({
      bounds: {
        $geoIntersects: {
          $geometry: {
            type: "Point",
            coordinates: [position[1], position[0]], // [lng, lat]
          },
        },
      },
    });
    if (zone) zoneId = zone._id?.toString() ?? null;

    // Crear vaca
    const newCow = {
      id: `cow-${Date.now()}`,
      name,
      description,
      imageUrl: imageUrl || "",
      position,
      connected: true,
      zoneId,
    };
    await db.collection("cattle").insertOne(newCow);
    return NextResponse.json({ success: true, data: newCow, message: "Vaca creada correctamente" }, { status: 201 });
  } catch (error) {
    console.error("Error al crear vaca:", error);
    return NextResponse.json({ success: false, error: "Error al crear vaca" }, { status: 500 });
  }
}
