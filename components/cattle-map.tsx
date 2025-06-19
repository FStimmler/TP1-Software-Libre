"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, Rectangle, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useCattle, type Cattle } from "@/lib/cattle-context"

// Icono personalizado para las vacas
const cowIcon = new L.Icon({
  iconUrl: "/cow-icon.jpg",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
})

// Componente para actualizar la vista del mapa
function MapUpdater({ cattle, selectedCattleId }: { cattle: Cattle[]; selectedCattleId: string | null }) {
  const map = useMap()

  useEffect(() => {
    if (selectedCattleId) {
      const selectedCow = cattle.find((cow) => cow.id === selectedCattleId)
      if (selectedCow) {
        map.setView(selectedCow.position, 16)
      }
    }

    // Invalidar tamaño del mapa para asegurar que se renderice correctamente
    setTimeout(() => {
      map.invalidateSize()
    }, 300)
  }, [map, cattle, selectedCattleId])

  return null
}

export default function CattleMap() {
  const { cattle, zones, selectedCattleId, setSelectedCattleId, selectedZoneId } = useCattle()
  const [mapReady, setMapReady] = useState(false)

  // Asegurarse de que el componente de mapa se cargue solo en el cliente
  useEffect(() => {
    setMapReady(true)
  }, [])

  if (!mapReady) {
    return <div className="h-full flex items-center justify-center">Cargando mapa...</div>
  }

  return (
    <MapContainer
      center={[40.7128, -74.006]} // Coordenadas iniciales
      zoom={14}
      style={{ height: "100%", width: "100%" }}
      className="z-0" // Asegurar que el mapa tenga un z-index bajo
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Renderizar zonas */}
      {zones.map((zone) => {
        const coords = zone.bounds.coordinates[0]
        const latLngBounds: L.LatLngBoundsExpression = [
          [coords[0][1], coords[0][0]], // [lat, lon]
          [coords[2][1], coords[2][0]]
        ]

        return (
          <Rectangle
            key={zone.id}
            bounds={latLngBounds}
            pathOptions={{
              color: zone.color,
              weight: 2,
              fillOpacity: selectedZoneId === zone.id ? 0.3 : 0.1,
            }}
          >
            <Popup>
              <div>
                <h3 className="font-semibold">{zone.name}</h3>
                <p>{zone.description}</p>
              </div>
            </Popup>
          </Rectangle>
        )
      })}

      {/* Renderizar vacas */}
      {cattle.map((cow) => (
        <Marker
          key={cow.id}
          position={cow.position}
          icon={cowIcon}
          opacity={cow.connected ? 1 : 0.5}
          eventHandlers={{
            click: () => {
              setSelectedCattleId(cow.id)
            },
            popupclose: () => {
              setSelectedCattleId(null);
            },
          }}
        >
          <Popup>
            <div className="text-center">
              <h3 className="font-semibold">{cow.name}</h3>
              <div className="my-2">
                <img
                  src={cow.imageUrl || "/placeholder.svg"}
                  alt={cow.name}
                  className="w-16 h-16 mx-auto rounded-full object-cover"
                />
              </div>
              <p className="text-sm">{cow.description}</p>
              <p className="text-xs mt-2">
                Estado:{" "}
                {cow.connected ? (
                  <span className="text-green-600 font-semibold">Conectada</span>
                ) : (
                  <span className="text-red-600 font-semibold">Desconectada</span>
                )}
              </p>
              {cow.zoneId && (
                <p className="text-xs">Zona: {zones.find((z) => z.id === cow.zoneId)?.name || "Desconocida"}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      <MapUpdater cattle={cattle} selectedCattleId={selectedCattleId} />
    </MapContainer>
  )
}
