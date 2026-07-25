import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, ExternalLink, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import locationService from '../services/locationService';

// Custom SVG Icons for Leaflet
const createEmeraldUserIcon = () => {
  return L.divIcon({
    className: 'custom-user-marker',
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(34, 197, 94, 0.3); border: 2px solid rgba(34, 197, 94, 0.8); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 22px; height: 22px; border-radius: 50%; background: #16a34a; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.5); z-index: 10;"></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

const createRedEmergencyIcon = () => {
  return L.divIcon({
    className: 'custom-emergency-marker',
    html: `
      <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(239, 68, 68, 0.35); animation: pulse 2s infinite;"></div>
        <div style="width: 28px; height: 28px; border-radius: 50%; background: #dc2626; border: 2px solid #fef2f2; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; box-shadow: 0 4px 12px rgba(220,38,38,0.6); z-index: 10;">
          ⚡
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19],
  });
};

export default function LiveMap({ height = "420px" }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const eventMarkersRef = useRef([]);

  const [userLocation, setUserLocation] = useState({
    lat: 12.9716, // Default Bangalore
    lng: 77.5946,
    accuracy: null,
    tracking: true,
  });

  const [emergencyPins, setEmergencyPins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch recent emergency locations
  const fetchLocations = async () => {
    try {
      const pins = await locationService.getRecentLocations(20);
      setEmergencyPins(pins);
    } catch (err) {
      console.error('Failed to fetch map pins:', err);
    } finally {
      setLoading(false);
    }
  };

  // Acquire user GPS position
  const acquireGPS = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          tracking: true,
        };
        setUserLocation(coords);

        if (mapInstanceRef.current && userMarkerRef.current) {
          userMarkerRef.current.setLatLng([coords.lat, coords.lng]);
          mapInstanceRef.current.panTo([coords.lat, coords.lng]);
        }
      },
      (err) => console.warn('Live map GPS error:', err),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent re-initialization

    const initialLat = userLocation.lat;
    const initialLng = userLocation.lng;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: false,
    });

    // CartoDB Dark Matter Tiles (High Quality Dark Theme Map)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // User Live Location Marker
    const userMarker = L.marker([initialLat, initialLng], {
      icon: createEmeraldUserIcon(),
    }).addTo(map);

    userMarker.bindPopup(`
      <div style="font-family: Inter, sans-serif; padding: 4px;">
        <div style="font-weight: 700; color: #16a34a; font-size: 13px; margin-bottom: 2px;">Your Live Location</div>
        <div style="font-size: 11px; color: #64748b;">GPS Positioning Active</div>
      </div>
    `);

    userMarkerRef.current = userMarker;
    mapInstanceRef.current = map;

    acquireGPS();
    fetchLocations();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Emergency Event Markers on Map
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear old event markers
    eventMarkersRef.current.forEach((marker) => marker.remove());
    eventMarkersRef.current = [];

    const map = mapInstanceRef.current;

    emergencyPins.forEach((pin) => {
      const marker = L.marker([pin.latitude, pin.longitude], {
        icon: createRedEmergencyIcon(),
      }).addTo(map);

      const timeStr = new Date(pin.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      marker.bindPopup(`
        <div style="font-family: Inter, sans-serif; padding: 6px; min-width: 180px;">
          <div style="font-weight: 800; color: #ef4444; font-size: 13px; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
            🚨 ${pin.emergency_type}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
            Confidence: <strong style="color: #22c55e;">${(pin.confidence_score * 100).toFixed(0)}%</strong> • ${timeStr}
          </div>
          <a href="${pin.google_maps_url}" target="_blank" rel="noreferrer" style="display: inline-block; font-size: 11px; font-weight: 600; color: #3b82f6; text-decoration: none;">
            Open Google Maps →
          </a>
        </div>
      `);

      eventMarkersRef.current.push(marker);
    });
  }, [emergencyPins]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 15, {
        animate: true,
        duration: 1.2,
      });
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 glass-card" style={{ height }}>
      {/* Map Container Element */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Control Bar Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex items-center justify-between pointer-events-none">
        <div className="glass-card px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs flex items-center gap-2 pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-300 font-medium">OpenStreetMap Live</span>
          <span className="text-slate-500 font-mono">({emergencyPins.length} Events Logged)</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => {
              acquireGPS();
              fetchLocations();
            }}
            className="p-2 rounded-xl glass-card hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all shadow-lg"
            title="Refresh Map Pins"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleRecenter}
            className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Recenter</span>
          </button>
        </div>
      </div>

      {/* Legend Footer Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] glass-card px-3.5 py-1.5 rounded-xl border border-slate-800 text-[11px] flex items-center gap-4 text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Your Position</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span>Emergency Pins</span>
        </div>
      </div>
    </div>
  );
}
