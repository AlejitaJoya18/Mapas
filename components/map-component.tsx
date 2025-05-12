"use client"

import { useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Componente para actualizar la vista del mapa cuando cambia la ubicación
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, 13)
  }, [center, map])
  return null
}

interface MapComponentProps {
  selectedLocation: { lat: number; lng: number } | null
  mapLayer: string
}

export default function MapComponent({ selectedLocation, mapLayer }: MapComponentProps) {
  // Ubicación predeterminada (Madrid, España)
  const defaultPosition: [number, number] = [40.416775, -3.70379]
  const [position, setPosition] = useState<[number, number]>(defaultPosition)
  const isClient = useRef(false)

  useEffect(() => {
    isClient.current = true
  }, [])

  useEffect(() => {
    if (!isClient.current) return

    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    })
  }, [isClient.current])

  // Actualizar la posición cuando cambia la ubicación seleccionada
  useEffect(() => {
    if (selectedLocation) {
      setPosition([selectedLocation.lat, selectedLocation.lng])
    }
  }, [selectedLocation])

  // Determinar la URL de la capa del mapa según la selección
  const getTileUrl = () => {
    switch (mapLayer) {
      case "satellite":
        return "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
      case "terrain":
        return "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
      case "streets":
      default:
        return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    }
  }

  return (
    <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url={getTileUrl()}
        subdomains={mapLayer === "satellite" ? ["mt0", "mt1", "mt2", "mt3"] : ["a", "b", "c"]}
      />
      <Marker position={position}>
        <Popup>
          Ubicación seleccionada <br />
          Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
        </Popup>
      </Marker>
      <ChangeView center={position} />
    </MapContainer>
  )
}
