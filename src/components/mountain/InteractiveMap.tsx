'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { StartingPoint } from '@/types/database';

interface InteractiveMapProps {
  startingPoints: StartingPoint[];
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export function InteractiveMap({
  startingPoints,
  center,
  zoom = 12,
  className = '',
}: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Set Mapbox access token
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error('NEXT_PUBLIC_MAPBOX_TOKEN not set');
      return;
    }

    mapboxgl.accessToken = token;

    // Calculate center from starting points if not provided
    const mapCenter = center || calculateCenter(startingPoints);

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [mapCenter[1], mapCenter[0]], // [lng, lat]
      zoom: zoom,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Cleanup
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [center, zoom]);

  // Add markers when map is loaded
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Add markers for each starting point
    startingPoints.forEach((point) => {
      if (!point.latitude || !point.longitude) return;

      // Create a custom marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.backgroundImage = 'url(https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png)';
      el.style.width = '32px';
      el.style.height = '40px';
      el.style.backgroundSize = '100%';
      el.style.cursor = 'pointer';

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `
          <div class="p-2">
            <h3 class="font-bold text-lg mb-1">${point.name}</h3>
            ${point.description ? `<p class="text-sm text-gray-600 mb-2">${point.description}</p>` : ''}
            ${point.difficulty ? `<p class="text-xs"><strong>Difficulty:</strong> ${point.difficulty}</p>` : ''}
            ${point.google_maps_url ? `<a href="${point.google_maps_url}" target="_blank" class="text-blue-600 text-sm hover:underline">View in Google Maps →</a>` : ''}
          </div>
        `
      );

      // Add marker to map
      new mapboxgl.Marker(el)
        .setLngLat([point.longitude, point.latitude])
        .setPopup(popup)
        .addTo(map.current!);
    });
  }, [mapLoaded, startingPoints]);

  if (startingPoints.length === 0 || !startingPoints.some(p => p.latitude && p.longitude)) {
    return (
      <div className={`bg-slate-800/50 rounded-lg p-8 text-center ${className}`}>
        <p className="text-slate-400">No starting point locations available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="text-2xl font-bold text-white mb-4">Starting Points Map</h3>
      <div
        ref={mapContainer}
        className="w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden border border-slate-700"
      />
      <p className="text-slate-400 text-sm mt-2">
        Click markers to view starting point details
      </p>
    </div>
  );
}

/**
 * Calculate the center point from an array of starting points
 */
function calculateCenter(points: StartingPoint[]): [number, number] {
  const validPoints = points.filter(p => p.latitude && p.longitude);

  if (validPoints.length === 0) {
    // Default to Mourne Mountains center
    return [54.1693, -5.9193];
  }

  const avgLat = validPoints.reduce((sum, p) => sum + (p.latitude || 0), 0) / validPoints.length;
  const avgLng = validPoints.reduce((sum, p) => sum + (p.longitude || 0), 0) / validPoints.length;

  return [avgLat, avgLng];
}
