import type { Cattle, Zone } from "@/lib/cattle-context"

// Centro de la granja (coordenadas de ejemplo)
const FARM_CENTER: [number, number] = [40.7128, -74.006]

// Colores para las zonas
const ZONE_COLORS = [
  "#3b82f6", // Granja (azul)
  "#ef4444", // Establos (rojo)
  "#f97316", // Comederos (naranja)
  "#22c55e", // Bebederos (verde)
  "#a855f7", // Áreas de ordeño (púrpura)
  "#ec4899", // Maternidades (rosa)
  "#84cc16", // Áreas de pastoreo (verde lima)
]

// Nombres de vacas
const COW_NAMES = [
  "Bella",
  "Luna",
  "Estrella",
  "Manchas",
  "Flor",
  "Dulce",
  "Canela",
  "Lucero",
  "Princesa",
  "Margarita",
  "Violeta",
  "Rosa",
  "Azucena",
  "Perla",
  "Diamante",
  "Esmeralda",
  "Rubí",
  "Zafiro",
  "Ámbar",
  "Topacio",
]

// Descripciones de vacas
const COW_DESCRIPTIONS = [
  "Holstein de 5 años, alta productora de leche",
  "Jersey de 3 años, excelente calidad de leche",
  "Angus de 4 años, buena para carne",
  "Hereford de 6 años, madre de 4 terneros",
  "Brahman de 2 años, resistente al calor",
  "Charolais de 7 años, gran tamaño",
  "Limousin de 3 años, buena musculatura",
  "Simmental de 4 años, doble propósito",
  "Gyr de 5 años, adaptable a climas cálidos",
  "Normando de 6 años, buena para leche y carne",
]

// URLs de imágenes de vacas
const COW_IMAGES = [
  "/placeholder.svg?height=200&width=200",
  "/placeholder.svg?height=200&width=200",
  "/placeholder.svg?height=200&width=200",
  "/placeholder.svg?height=200&width=200",
  "/placeholder.svg?height=200&width=200",
]

export function generateMockZones(): Zone[] {
  // Crear zona general de la granja
  const farmZone: Zone = {
    id: "farm",
    name: "Granja Completa",
    description: "Perímetro completo de la granja",
    bounds:boundsToGeoJSON([
      [FARM_CENTER[0] - 0.01, FARM_CENTER[1] - 0.01],
      [FARM_CENTER[0] + 0.01, FARM_CENTER[1] + 0.01],
    ]),
    color: ZONE_COLORS[0],
  }

  // Crear zonas específicas dentro de la granja
  const zones: Zone[] = [
    farmZone,
    {
      id: "stables",
      name: "Establos",
      description: "Área de descanso para el ganado",
      bounds:boundsToGeoJSON( [
        [FARM_CENTER[0] - 0.008, FARM_CENTER[1] - 0.008],
        [FARM_CENTER[0] - 0.004, FARM_CENTER[1] - 0.004],
      ]),
      color: ZONE_COLORS[1],
    },
    {
      id: "feeders",
      name: "Comederos",
      description: "Área de alimentación",
      bounds: boundsToGeoJSON([
        [FARM_CENTER[0] - 0.008, FARM_CENTER[1] + 0.004],
        [FARM_CENTER[0] - 0.004, FARM_CENTER[1] + 0.008],
      ]),
      color: ZONE_COLORS[2],
    },
    {
      id: "waterers",
      name: "Bebederos",
      description: "Área de hidratación",
      bounds: boundsToGeoJSON([
        [FARM_CENTER[0] + 0.004, FARM_CENTER[1] - 0.008],
        [FARM_CENTER[0] + 0.008, FARM_CENTER[1] - 0.004],
      ]),
      color: ZONE_COLORS[3],
    },
    {
      id: "milking",
      name: "Áreas de Ordeño",
      description: "Zona de producción de leche",
      bounds: boundsToGeoJSON([
        [FARM_CENTER[0] + 0.004, FARM_CENTER[1] + 0.004],
        [FARM_CENTER[0] + 0.008, FARM_CENTER[1] + 0.008],
      ]),
      color: ZONE_COLORS[4],
    },
    {
      id: "maternity",
      name: "Maternidades",
      description: "Área para vacas preñadas y recién paridas",
      bounds: boundsToGeoJSON([
        [FARM_CENTER[0] - 0.002, FARM_CENTER[1] - 0.002],
        [FARM_CENTER[0] + 0.002, FARM_CENTER[1] + 0.002],
      ]),
      color: ZONE_COLORS[5],
    },
    {
      id: "pasture",
      name: "Áreas de Pastoreo",
      description: "Zonas de alimentación natural",
      bounds: boundsToGeoJSON([
        [FARM_CENTER[0] - 0.006, FARM_CENTER[1] - 0.001],
        [FARM_CENTER[0] - 0.001, FARM_CENTER[1] + 0.006],
      ]),
      color: ZONE_COLORS[6],
    },
  ]

  return zones
}

export function generateMockCattle(zones: Zone[]): Cattle[] {
  const cattle: Cattle[] = []

  // Generar 20 vacas
  for (let i = 0; i < 20; i++) {
    // Posición aleatoria dentro de la granja
    const farmZone = zones[0]

    const bounds = farmZone.bounds.coordinates[0]


    const [[minLat, minLng], [maxLat, maxLng]] = [
      [bounds[0][1], bounds[0][0]],  // esquina SW (lat, lon)
      [bounds[2][1], bounds[2][0]],  // esquina NE (lat, lon)
    ]

    const randomLat = minLat + Math.random() * (maxLat - minLat)
    const randomLng = minLng + Math.random() * (maxLng - minLng)

    // Determinar en qué zona está
    let zoneId: string | null = null

    for (const zone of zones) {
      let boundszone = zone.bounds.coordinates[0]
      const [[zMinLat, zMinLng], [zMaxLat, zMaxLng]] = [
        [boundszone[0][1], boundszone[0][0]],  // esquina SW (lat, lon)
        [boundszone[2][1], boundszone[2][0]],  // esquina NE (lat, lon)
      ]

      if (randomLat >= zMinLat && randomLat <= zMaxLat && randomLng >= zMinLng && randomLng <= zMaxLng) {
        zoneId = zone.id
        break
      }
    }

    // Crear vaca
    cattle.push({
      id: `cow-${i + 1}`,
      name: COW_NAMES[i % COW_NAMES.length],
      description: COW_DESCRIPTIONS[i % COW_DESCRIPTIONS.length],
      imageUrl: COW_IMAGES[i % COW_IMAGES.length],
      position: [randomLat, randomLng],
      connected: Math.random() > 0.1, // 90% de probabilidad de estar conectada
      zoneId,
    })
  }

  return cattle
}

type User = {
  id: string
  name: string
  email: string
  role: string
  password: string
  createdAt: string
}

export function generateMockUsers(): User[] {
  // Simulación de datos de usuarios
  const users = [
    {
      id: "1",
      name: "Administrador",
      email: "admin@ejemplo.com",
      role: "Administrador",
      password: "$2a$10$Ytso9RDVSnDF3NJ.bkedhOKdS/dhU0igQ1ny75bBTVEKfux0Ql05K", // Contraseña: "password"
      createdAt: "2023-01-15",
    },
    {
      id: "2",
      name: "Juan Pérez",
      email: "juan@ejemplo.com",
      role: "Supervisor",
      password: "$2a$10$Ytso9RDVSnDF3NJ.bkedhOKdS/dhU0igQ1ny75bBTVEKfux0Ql05K", // Contraseña: "password"
      createdAt: "2023-02-20",
    },
    {
      id: "3",
      name: "María López",
      email: "maria@ejemplo.com",
      role: "Operador",
      password: "$2a$10$Ytso9RDVSnDF3NJ.bkedhOKdS/dhU0igQ1ny75bBTVEKfux0Ql05K", // Contraseña: "password"
      createdAt: "2023-03-10",
    },
    // Otros usuarios se agregarían aquí
  ]

  return users
}

function boundsToGeoJSON(bounds: number[][]): { type: "Polygon"; coordinates: [[[number, number], [number, number], [number, number], [number, number], [number, number]]] } {
  const [[lat1, lon1], [lat2, lon2]] = bounds;

  const minLat = Math.min(lat1, lat2);
  const maxLat = Math.max(lat1, lat2);
  const minLon = Math.min(lon1, lon2);
  const maxLon = Math.max(lon1, lon2);

  return {
    type: "Polygon",
    coordinates: [[
      [minLon, minLat],
      [minLon, maxLat],
      [maxLon, maxLat],
      [maxLon, minLat],
      [minLon, minLat]
    ]]
  };
}
