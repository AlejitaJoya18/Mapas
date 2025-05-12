import LocationSearchMap from "@/components/location-search-map"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Buscador de Ubicaciones</h1>
      <div className="max-w-6xl mx-auto">
        <LocationSearchMap />
      </div>
    </main>
  )
}
