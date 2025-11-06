import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue with webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
}

const Map = ({ latitude, longitude, zoom = 14 }: MapProps) => {
  useEffect(() => {
    // Create map
    const map = L.map('map').setView([latitude, longitude], zoom);

    // Add OpenStreetMap tiles (free!)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add marker with custom color
    const marker = L.marker([latitude, longitude]).addTo(map);
    marker.bindPopup('<b>Property Location</b>').openPopup();

    // Cleanup
    return () => {
      map.remove();
    };
  }, [latitude, longitude, zoom]);

  return <div id="map" className="w-full h-[400px] rounded-lg shadow-lg border-2 border-gray-200" />;
};

export default Map;
