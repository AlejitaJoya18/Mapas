"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Tipos para las ubicaciones
interface Location {
  display_name: string
  lat: string
  lon: string
  place_id?: number
}

// Componente para manejar eventos del mapa
function MapEventHandler({ onMapClick }: { onMapClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng
      onMapClick(lat, lng)
    },
  })
  return null
}

export default function LocationSearchMap() {
  // Estados
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.416775, -3.70379]) // Madrid por defecto
  const [zoom, setZoom] = useState(13)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const mapRef = useRef(null)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

  // Efecto para arreglar los íconos de Leaflet
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    })
  }, [])

  // Función para buscar ubicaciones usando Nominatim API
  const searchLocations = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([])
      return
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      )
      const data = await response.json()
      setSuggestions(data)
      setShowSuggestions(true)
    } catch (error) {
      console.error("Error buscando ubicaciones:", error)
      setSuggestions([])
    }
  }

  // Manejar cambios en el campo de búsqueda con debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    // Implementar debounce para evitar demasiadas solicitudes
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    searchTimeout.current = setTimeout(() => {
      searchLocations(query)
    }, 300)
  }

  // Seleccionar una ubicación de las sugerencias
  const handleSelectLocation = (location: Location) => {
    setSelectedLocation(location)
    setSearchQuery(location.display_name)
    setMapCenter([Number.parseFloat(location.lat), Number.parseFloat(location.lon)])
    setZoom(16)
    setShowSuggestions(false)
  }

  // Manejar clic en el mapa
  const handleMapClick = async (lat: number, lon: number) => {
    try {
      // Realizar búsqueda inversa para obtener información de la ubicación
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      )
      const data = await response.json()

      if (data) {
        const location: Location = {
          display_name: data.display_name,
          lat: lat.toString(),
          lon: lon.toString(),
        }

        setSelectedLocation(location)
        setSearchQuery(location.display_name)
        setMapCenter([lat, lon])
      }
    } catch (error) {
      console.error("Error en búsqueda inversa:", error)
    }
  }

  return (
    <div className="flex flex-col h-[80vh]">
      {/* Campo de búsqueda con sugerencias */}
      <div className="relative mb-4">
        <div className="flex">
          <Input
            type="text"
            placeholder="Buscar ubicación..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="flex-1"
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          />
          <Button className="ml-2" onClick={() => searchLocations(searchQuery)}>
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
        </div>

        {/* Lista de sugerencias */}
        {showSuggestions && suggestions.length > 0 && (
          <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-auto">
            <ul className="py-1">
              {suggestions.map((suggestion, index) => (
                <li
                  key={suggestion.place_id || index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectLocation(suggestion)}
                >
                  {suggestion.display_name}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* Mapa interactivo */}
      <div className="flex-1 border rounded-lg overflow-hidden">
        <MapContainer center={mapCenter} zoom={zoom} style={{ height: "100%", width: "100%" }} ref={mapRef}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {selectedLocation && (
            <Marker position={[Number.parseFloat(selectedLocation.lat), Number.parseFloat(selectedLocation.lon)]}>
              <Popup>{selectedLocation.display_name}</Popup>
            </Marker>
          )}

          {/* Componente para manejar eventos del mapa */}
          <MapEventHandler onMapClick={handleMapClick} />

          {/* Componente para actualizar la vista del mapa */}
          <UpdateMapView center={mapCenter} zoom={zoom} />
        </MapContainer>
      </div>
    </div>
  )
}

// Componente para actualizar la vista del mapa cuando cambian las coordenadas
function UpdateMapView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMapEvents({
    // Este evento es solo para tener una referencia al mapa
    load: () => {},
  })

  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])

  return null
}
