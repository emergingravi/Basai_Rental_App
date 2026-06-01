import React, { useEffect, useRef } from 'react'

interface MapPickerProps {
  lat?: number
  lng?: number
  onChange?: (lat: number, lng: number) => void
}

export const MapPicker: React.FC<MapPickerProps> = ({ lat = 27.7, lng = 85.33, onChange }) => {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const leafletRef = useRef<any>(null)

  useEffect(() => {
    let map: any
    let marker: any
    let L: any
    const init = async () => {
      try {
        L = await import('leaflet')
        leafletRef.current = L
        // ensure CSS loaded
        const cssId = 'leaflet-css'
        if (!document.getElementById(cssId)) {
          const link = document.createElement('link')
          link.id = cssId
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(link)
        }

        // create map
        map = L.map(mapRef.current).setView([lat, lng], 13)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map)
        marker = L.marker([lat, lng], { draggable: true }).addTo(map)
        marker.on('dragend', () => {
          const p = marker.getLatLng()
          onChange?.(p.lat, p.lng)
        })
      } catch (err) {
        // leaflet not installed; user can install it
        // eslint-disable-next-line no-console
        console.warn('Leaflet not available. Install `leaflet` to enable map picker.', err)
      }
    }

    init()

    return () => {
      try {
        if (map) map.remove()
      } catch (e) {
        // ignore
      }
    }
  }, [lat, lng, onChange])

  return <div ref={mapRef} style={{ height: 300, width: '100%', borderRadius: 12, overflow: 'hidden' }} />
}

export default MapPicker
