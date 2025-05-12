"use client"

import type React from "react"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Search, Layers, ZoomIn, ZoomOut, MapPin, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Importar Leaflet dinámicamente ya que es una biblioteca del lado del cliente
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-[500px] bg-gray-100">
      <p className="text-gray-500">Cargando mapa...</p>
    </div>
  ),
})

export default function MapInterface() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mapLayer, setMapLayer] = useState("streets")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // En una implementación real, aquí se conectaría con un servicio de geocodificación
    console.log("Buscando:", searchQuery)
    // Simulación de búsqueda exitosa
    if (searchQuery.toLowerCase().includes("madrid")) {
      setSelectedLocation({ lat: 40.416775, lng: -3.70379 })
    } else if (searchQuery.toLowerCase().includes("barcelona")) {
      setSelectedLocation({ lat: 41.385064, lng: 2.173404 })
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-[700px]">
      {/* Panel lateral */}
      <div className="w-full md:w-80 p-4 border-b md:border-r md:border-b-0 border-gray-200">
        <form onSubmit={handleSearch} className="flex space-x-2 mb-6">
          <Input
            placeholder="Buscar ubicación..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <Tabs defaultValue="layers" className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="layers">Capas</TabsTrigger>
            <TabsTrigger value="markers">Marcadores</TabsTrigger>
          </TabsList>
          <TabsContent value="layers" className="space-y-2 mt-2">
            <Button
              variant={mapLayer === "streets" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setMapLayer("streets")}
            >
              <Layers className="mr-2 h-4 w-4" />
              Calles
            </Button>
            <Button
              variant={mapLayer === "satellite" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setMapLayer("satellite")}
            >
              <Layers className="mr-2 h-4 w-4" />
              Satélite
            </Button>
            <Button
              variant={mapLayer === "terrain" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setMapLayer("terrain")}
            >
              <Layers className="mr-2 h-4 w-4" />
              Terreno
            </Button>
          </TabsContent>
          <TabsContent value="markers" className="space-y-2 mt-2">
            <Card className="p-3">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-red-500" />
                <span className="text-sm">Madrid, España</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">40.416775, -3.703790</div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                <span className="text-sm">Barcelona, España</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">41.385064, 2.173404</div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="space-y-4">
          <h3 className="font-medium">Ubicaciones recientes</h3>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setSelectedLocation({ lat: 40.416775, lng: -3.70379 })}
            >
              <Navigation className="mr-2 h-4 w-4" />
              Madrid, España
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setSelectedLocation({ lat: 41.385064, lng: 2.173404 })}
            >
              <Navigation className="mr-2 h-4 w-4" />
              Barcelona, España
            </Button>
          </div>
        </div>
      </div>

      {/* Área del mapa */}
      <div className="flex-1 relative">
        <MapComponent selectedLocation={selectedLocation} mapLayer={mapLayer} />

        {/* Controles del mapa */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <Button size="icon" variant="secondary">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary">
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
