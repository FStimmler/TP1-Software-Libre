"use client"

import { useState } from "react"
import { Search, MapPin, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Dialog } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useCattle } from "@/lib/cattle-context"

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

export default function CattleList() {
  const { cattle, zones, selectedCattleId, setSelectedCattleId } = useCattle()
  const { toast } = useToast();
  // Estado para el modal de agregar vaca
  const [showAddCow, setShowAddCow] = useState(false)
  const [newCow, setNewCow] = useState({
    name: "",
    description: "",
    imageUrl: "",
    latitude: "",
    longitude: ""
  })
  const [adding, setAdding] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [radius, setRadius] = useState("")
  const [isLocationSearchActive, setIsLocationSearchActive] = useState(false)

  // Botón destacado para buscar vacas por radio usando geosearch
  const [showGeoSearchModal, setShowGeoSearchModal] = useState(false);
  const [geoLat, setGeoLat] = useState("");
  const [geoLng, setGeoLng] = useState("");
  const [geoRadius, setGeoRadius] = useState("");

  // Estado para mostrar resultados de geosearch en el mapa
  const [geoSearchResults, setGeoSearchResults] = useState<string[]>([]);

  // Filtrar vacas por término de búsqueda
  let filteredCattle = cattle.filter(
    (cow) =>
      cow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cow.zoneId &&
        zones
          .find((z) => z.id === cow.zoneId)
          ?.name.toLowerCase()
          .includes(searchTerm.toLowerCase())),
  )

  // Filtrar por ubicación si la búsqueda avanzada está activa
  if (isLocationSearchActive && latitude && longitude && radius) {
    const lat = Number.parseFloat(latitude)
    const lng = Number.parseFloat(longitude)
    const rad = Number.parseFloat(radius)

    if (!isNaN(lat) && !isNaN(lng) && !isNaN(rad)) {
      filteredCattle = filteredCattle.filter((cow) => {
        const distance = calculateDistance(lat, lng, cow.position[0], cow.position[1])
        return distance <= rad
      })
    }
  }

  const handleAdvancedSearch = () => {
    if (latitude && longitude && radius) {
      setIsLocationSearchActive(true)
    }
  }

  const clearAdvancedSearch = () => {
    setLatitude("")
    setLongitude("")
    setRadius("")
    setIsLocationSearchActive(false)
  }

  return (
    <div className="space-y-4">
      {/* Botón para agregar vaca */}
      <Button className="w-full mb-2" onClick={() => setShowAddCow(true)}>
        + Agregar vaca
      </Button>
      {/* Modal para agregar vaca */}
      {showAddCow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Agregar nueva vaca</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setAdding(true);
                try {
                  const res = await fetch("/api/cattle", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: newCow.name,
                      description: newCow.description,
                      imageUrl: newCow.imageUrl,
                      position: [parseFloat(newCow.latitude), parseFloat(newCow.longitude)]
                    })
                  });
                  if (res.ok) {
                    toast({ title: "Vaca agregada", description: "La vaca fue agregada correctamente", variant: "success" });
                    setShowAddCow(false);
                    setNewCow({ name: "", description: "", imageUrl: "", latitude: "", longitude: "" });
                    // Recargar la página para ver la vaca nueva
                    window.location.reload();
                  } else {
                    const data = await res.json();
                    toast({ title: "Error", description: data.error || "No se pudo agregar la vaca", variant: "destructive" });
                  }
                } catch (err) {
                  toast({ title: "Error", description: "No se pudo agregar la vaca", variant: "destructive" });
                } finally {
                  setAdding(false);
                }
              }}
            >
              <div className="mb-2">
                <Label>Nombre</Label>
                <Input required value={newCow.name} onChange={e => setNewCow({ ...newCow, name: e.target.value })} />
              </div>
              <div className="mb-2">
                <Label>Descripción</Label>
                <Input required value={newCow.description} onChange={e => setNewCow({ ...newCow, description: e.target.value })} />
              </div>
              <div className="mb-2">
                <Label>Imagen (URL)</Label>
                <Input value={newCow.imageUrl} onChange={e => setNewCow({ ...newCow, imageUrl: e.target.value })} />
              </div>
              <div className="mb-2 grid grid-cols-2 gap-2">
                <div>
                  <Label>Latitud</Label>
                  <Input required type="number" value={newCow.latitude} onChange={e => setNewCow({ ...newCow, latitude: e.target.value })} />
                </div>
                <div>
                  <Label>Longitud</Label>
                  <Input required type="number" value={newCow.longitude} onChange={e => setNewCow({ ...newCow, longitude: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button type="submit" className="w-full" disabled={adding}>{adding ? "Agregando..." : "Agregar"}</Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => setShowAddCow(false)} disabled={adding}>Cancelar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Buscar ganado..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1 h-7 w-7 px-0"
          onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
        >
          <MapPin className="h-4 w-4" />
          <span className="sr-only">Búsqueda avanzada</span>
        </Button>
      </div>

      {/* Búsqueda avanzada */}
      {showAdvancedSearch && (
        <div className="rounded-md border p-3 bg-gray-50">
          <div className="text-sm font-medium mb-2 flex justify-between items-center">
            <span>Búsqueda por coordenadas</span>
            {isLocationSearchActive && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Filtro activo
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <Label htmlFor="latitude" className="text-xs">
                Latitud
              </Label>
              <Input
                id="latitude"
                type="number"
                placeholder="Ej: 40.7128"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="longitude" className="text-xs">
                Longitud
              </Label>
              <Input
                id="longitude"
                type="number"
                placeholder="Ej: -74.0060"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div className="mb-3">
            <Label htmlFor="radius" className="text-xs">
              Radio (km)
            </Label>
            <Input
              id="radius"
              type="number"
              placeholder="Ej: 5"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="w-full"
              onClick={handleAdvancedSearch}
              disabled={!latitude || !longitude || !radius}
            >
              Buscar
            </Button>
            <Button size="sm" variant="outline" className="w-full" onClick={clearAdvancedSearch}>
              Limpiar
            </Button>
          </div>
        </div>
      )}

      {isLocationSearchActive && (
        <div className="flex items-center justify-between bg-green-50 p-2 rounded-md">
          <span className="text-xs text-green-700">Mostrando ganado en un radio de {radius} km</span>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={clearAdvancedSearch}>
            <X className="h-4 w-4" />
            <span className="sr-only">Limpiar filtro</span>
          </Button>
        </div>
      )}

      {/* Botón destacado para buscar vacas por radio usando geosearch */}
      <div className="mb-4">
        <Button
          className="w-full text-lg py-4 bg-green-600 hover:bg-green-700 text-white font-bold mb-2"
          onClick={() => setShowGeoSearchModal(true)}
        >
          Buscar vacas
        </Button>
        {showGeoSearchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Buscar vacas por radio (geosearch)</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!geoLat || !geoLng || !geoRadius) {
                    toast({ title: "Error", description: "Completa latitud, longitud y radio", variant: "destructive" });
                    return;
                  }
                  try {
                    const res = await fetch(`/api/cattle-geosearch?lat=${geoLat}&lng=${geoLng}&radius=${geoRadius}`);
                    const data = await res.json();
                    if (data.success && data.data.length > 0) {
                      setGeoSearchResults(data.data.map((c: any) => c.id));
                      toast({
                        title: `Vacas encontradas (${data.data.length})`,
                        description: data.data.map((c: any) => c.name).join(", ") || "Sin vacas en el radio",
                        variant: "success"
                      });
                    } else {
                      setGeoSearchResults([]);
                      toast({
                        title: "Sin vacas en el radio",
                        description: "No se encontraron vacas en ese radio",
                        variant: "destructive"
                      });
                    }
                  } catch (err) {
                    setGeoSearchResults([]);
                    toast({ title: "Error", description: "No se pudo buscar vacas por radio (geosearch)", variant: "destructive" });
                  } finally {
                    setShowGeoSearchModal(false);
                    setGeoLat("");
                    setGeoLng("");
                    setGeoRadius("");
                  }
                }}
              >
                <div className="mb-2">
                  <Label>Latitud</Label>
                  <Input required type="number" value={geoLat} onChange={e => setGeoLat(e.target.value)} />
                </div>
                <div className="mb-2">
                  <Label>Longitud</Label>
                  <Input required type="number" value={geoLng} onChange={e => setGeoLng(e.target.value)} />
                </div>
                <div className="mb-2">
                  <Label>Radio (km)</Label>
                  <Input required type="number" value={geoRadius} onChange={e => setGeoRadius(e.target.value)} />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button type="submit" className="w-full">Buscar</Button>
                  <Button type="button" variant="outline" className="w-full" onClick={() => setShowGeoSearchModal(false)}>Cancelar</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-1">
        {filteredCattle.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No se encontraron resultados</p>
        ) : (
          filteredCattle.map((cow) => (
            <div
              key={cow.id}
              className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                selectedCattleId === cow.id ? "bg-green-50" : geoSearchResults.includes(cow.id) ? "bg-yellow-100 border-2 border-yellow-400" : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedCattleId(cow.id)}
            >
              <div className="flex-shrink-0 mr-3">
                <div className="relative">
                  <img
                    src={cow.imageUrl || "/placeholder.svg"}
                    alt={cow.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      cow.connected ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{cow.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {cow.zoneId ? (
                    <span>Zona: {zones.find((z) => z.id === cow.zoneId)?.name || "Desconocida"}</span>
                  ) : (
                    <span className="text-yellow-600">Sin zona</span>
                  )}
                </p>
              </div>
              {!cow.connected && (
                <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200">
                  Offline
                </Badge>
              )}
            </div>
          ))
        )}
      </div>

      {/* Botón para consultar zona de la vaca seleccionada */}
      {selectedCattleId && (
        <Button
          className="w-full mb-2"
          variant="outline"
          onClick={async () => {
            const cow = cattle.find((c) => c.id === selectedCattleId);
            if (!cow) return;
            try {
              const res = await fetch(`/api/zones?cattle=${encodeURIComponent(selectedCattleId.replace(/^cow-/, ""))}`);
              const data = await res.json();
              if (data.success && data.data.length > 0) {
                toast({
                  title: `Zona de ${cow.name}`,
                  description: data.data.map((z) => z.name).join(", ") || "Sin zona",
                  variant: "success"
                });
              } else {
                toast({
                  title: `Zona de ${cow.name}`,
                  description: "Sin zona encontrada",
                  variant: "destructive"
                });
              }
            } catch (err) {
              toast({ title: "Error", description: "No se pudo consultar la zona", variant: "destructive" });
            }
          }}
        >
          Consultar zona de la vaca seleccionada
        </Button>
      )}

      {/* Botón para consultar zonas por geosearch de la vaca seleccionada */}
      {selectedCattleId && (
        <Button
          className="w-full mb-2"
          variant="secondary"
          onClick={async () => {
            const cow = cattle.find((c) => c.id === selectedCattleId);
            if (!cow) return;
            try {
              const res = await fetch(`/api/zones?cattle=${encodeURIComponent(selectedCattleId.replace(/^cow-/, ""))}`);
              const data = await res.json();
              if (data.success && data.data.length > 0) {
                toast({
                  title: `Zonas (geosearch) de ${cow.name}`,
                  description: data.data.map((z) => z.name).join(", ") || "Sin zona",
                  variant: "success"
                });
              } else {
                toast({
                  title: `Zonas (geosearch) de ${cow.name}`,
                  description: "Sin zona encontrada",
                  variant: "destructive"
                });
              }
            } catch (err) {
              toast({ title: "Error", description: "No se pudo consultar la zona (geosearch)", variant: "destructive" });
            }
          }}
        >
          Ver zonas por geosearch
        </Button>
      )}
    </div>
  )
}
