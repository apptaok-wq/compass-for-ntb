import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { DesaGeoData } from '@/types/poverty'

// Fix Leaflet icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon as string,
  shadowUrl: iconShadow as string,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

L.Marker.prototype.options.icon = DefaultIcon

interface GISMapProps {
  data: DesaGeoData[]
  loading?: boolean
}

/**
 * GISMap Component
 * Displays an interactive map with poverty data visualization
 * Uses Leaflet for mapping and OpenStreetMap for base tiles
 */
export function GISMap({ data, loading = false }: GISMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return

    // Create map centered on NTB (Nusa Tenggara Barat)
    mapInstanceRef.current = L.map(mapRef.current).setView([-8.5, 116.5], 8)

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current)

    // Cleanup on unmount
    return () => {
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Update markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !data.length || loading) return

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      mapInstanceRef.current?.removeLayer(marker)
    })
    markersRef.current = []

    // Create color function based on poverty percentage
    const getMarkerColor = (percentage: number): string => {
      if (percentage > 20) return '#ef4444' // Red - High poverty
      if (percentage > 10) return '#eab308' // Yellow - Medium poverty
      return '#22c55e' // Green - Low poverty
    }

    // Add new markers
    data.forEach((desa) => {
      const marker = L.circleMarker([desa.latitude, desa.longitude], {
        radius: 8,
        fillColor: getMarkerColor(desa.percentage),
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      })

      // Bind popup with desa information
      const popupContent = `
        <div class="text-sm">
          <strong class="text-base">${desa.name}</strong><br/>
          <hr class="my-1" />
          <div class="space-y-1">
            <div><span class="font-medium">Kabupaten:</span> ${desa.kabupatenName || 'N/A'}</div>
            <div><span class="font-medium">Total Miskin:</span> ${desa.totalPoor.toLocaleString('id-ID')}</div>
            <div><span class="font-medium">Persentase:</span> <span class="font-bold text-lg">${desa.percentage}%</span></div>
            <div><span class="font-medium">Tahun:</span> ${desa.year}</div>
            ${desa.month ? `<div><span class="font-medium">Bulan:</span> ${desa.month}</div>` : ''}
          </div>
        </div>
      `

      marker.bindPopup(popupContent, {
        maxWidth: 250,
        className: 'custom-popup',
      })

      marker.addTo(mapInstanceRef.current!)
      markersRef.current.push(marker)
    })

    // Fit map bounds to show all markers
    if (data.length > 0) {
      const bounds = L.latLngBounds(
        data.map((d) => [d.latitude, d.longitude] as [number, number])
      )
      mapInstanceRef.current?.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 12,
      })
    }
  }, [data, loading])

  if (loading) {
    return (
      <div className="h-[600px] w-full bg-muted animate-pulse rounded-lg border border-border flex items-center justify-center">
        <span className="text-muted-foreground">Memuat peta...</span>
      </div>
    )
  }

  return (
    <div className="relative w-full rounded-lg border border-border overflow-hidden bg-background">
      <div ref={mapRef} className="h-[600px] w-full" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur border border-border rounded-lg p-4 text-sm space-y-2 shadow-lg">
        <div className="font-semibold">Tingkat Kemiskinan</div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
          <span>Tinggi (&gt; 20%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#eab308' }}></div>
          <span>Sedang (10-20%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#22c55e' }}></div>
          <span>Rendah (&lt; 10%)</span>
        </div>
      </div>

      {/* Data info */}
      {data.length === 0 && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur">
          <div className="text-center">
            <p className="text-muted-foreground">Tidak ada data desa untuk filter yang dipilih</p>
          </div>
        </div>
      )}
    </div>
  )
}
