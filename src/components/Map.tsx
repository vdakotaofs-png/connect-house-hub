import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
}

const Map = ({ latitude, longitude, zoom = 14 }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // You'll need to add your Mapbox token
    mapboxgl.accessToken = 'pk.eyJ1IjoiZGhvdXNlYXBwIiwiYSI6ImNtNDVxeXg3ZjBhcjIyanM4dXRwNGxvMGcifQ.placeholder';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [longitude, latitude],
      zoom: zoom,
    });

    // Add marker
    new mapboxgl.Marker({ color: '#6B28A3' })
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, [latitude, longitude, zoom]);

  return (
    <div ref={mapContainer} className="w-full h-[400px] rounded-lg shadow-lg" />
  );
};

export default Map;
