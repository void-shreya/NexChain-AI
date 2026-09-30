import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export const SupplyMap = ({
  suppliers = [],
  warehouses = [],
  shipments = [],
  disruptions = [],
  onSelectEntity,
  height = '540px',
  center = [20.5937, 78.9629],
  zoom = 5,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
        attributionControl: false,
      });

      // CartoDB Dark Matter tiles for modern dark cyber-room aesthetic
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    // 1. Draw Warehouses (Cyan Hexagon Markers)
    warehouses.forEach((wh) => {
      if (!wh.latitude || !wh.longitude) return;

      const icon = L.divIcon({
        className: 'custom-map-marker-wh',
        html: `
          <div style="
            width: 26px; 
            height: 26px; 
            background: #0d1b2a; 
            border: 2px solid #06b6d4; 
            border-radius: 6px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 0 10px rgba(6, 182, 212, 0.6);
            color: #38bdf8;
            font-size: 11px;
            font-weight: bold;
          ">
            WH
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([wh.latitude, wh.longitude], { icon }).addTo(markersGroup);
      marker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; color: #0f172a; padding: 4px;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700;">${wh.name}</h4>
          <div style="font-size: 12px; color: #475569;">${wh.city}, ${wh.state}</div>
          <div style="font-size: 12px; margin-top: 6px;">
            <b>Capacity:</b> ${wh.utilized_capacity_units?.toLocaleString()} / ${wh.total_capacity_units?.toLocaleString()} units
          </div>
          <div style="font-size: 11px; color: #059669; font-weight: 600; margin-top: 4px;">
            Status: ${wh.operational_status}
          </div>
        </div>
      `);
      marker.on('click', () => onSelectEntity && onSelectEntity({ type: 'WAREHOUSE', data: wh }));
    });

    // 2. Draw Suppliers (Green for Normal, Red for Critical Shutdown)
    suppliers.forEach((sup) => {
      if (!sup.latitude || !sup.longitude) return;

      const isCritical = sup.status === 'CRITICAL_SHUTDOWN' || sup.risk_level === 'CRITICAL';
      const isWarning = sup.risk_level === 'HIGH' || sup.status === 'WARNING';
      const color = isCritical ? '#f43f5e' : isWarning ? '#f59e0b' : '#10b981';

      const icon = L.divIcon({
        className: 'custom-map-marker-sup',
        html: `
          <div style="
            width: 24px; 
            height: 24px; 
            background: #070b14; 
            border: 2px solid ${color}; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 0 12px ${color};
            ${isCritical ? 'animation: pulseRadar 1.5s infinite;' : ''}
          ">
            <span style="width: 8px; height: 8px; background: ${color}; border-radius: 50%;"></span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([sup.latitude, sup.longitude], { icon }).addTo(markersGroup);
      marker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; color: #0f172a; padding: 4px;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700;">${sup.name}</h4>
          <div style="font-size: 12px; color: #475569;">${sup.city} (${sup.category})</div>
          <div style="font-size: 12px; margin-top: 4px;">
            <b>Reliability:</b> ${sup.reliability_score}% | <b>Lead Time:</b> ${sup.avg_lead_time_days}d
          </div>
          <div style="font-size: 11px; color: ${color}; font-weight: 700; margin-top: 4px;">
            RISK: ${sup.risk_level} (${sup.status})
          </div>
        </div>
      `);
      marker.on('click', () => onSelectEntity && onSelectEntity({ type: 'SUPPLIER', data: sup }));
    });

    // 3. Draw Disruption Radius Halos
    disruptions.forEach((dis) => {
      if (dis.latitude && dis.longitude && dis.status === 'ACTIVE') {
        L.circle([dis.latitude, dis.longitude], {
          radius: (dis.radius_km || 40) * 1000,
          color: '#f43f5e',
          fillColor: '#f43f5e',
          fillOpacity: 0.22,
          weight: 2,
          dashArray: '6, 6',
        }).addTo(markersGroup);
      }
    });

    // 4. Draw Active Shipments (Animated GPS markers)
    shipments.forEach((shp) => {
      if (!shp.current_latitude || !shp.current_longitude) return;

      const isDelayed = shp.status === 'DELAYED' || shp.status === 'AT_RISK';
      const color = isDelayed ? '#f43f5e' : '#38bdf8';

      const icon = L.divIcon({
        className: 'custom-map-marker-shp',
        html: `
          <div style="
            width: 22px; 
            height: 22px; 
            background: ${color}; 
            border: 2px solid #ffffff; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 0 10px ${color};
          ">
            <span style="font-size: 10px; color: #000; font-weight: bold;">🚛</span>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const marker = L.marker([shp.current_latitude, shp.current_longitude], { icon }).addTo(markersGroup);
      marker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; color: #0f172a; padding: 4px;">
          <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700;">${shp.tracking_number}</h4>
          <div style="font-size: 11px; color: #475569;">Carrier: ${shp.carrier_name}</div>
          <div style="font-size: 11px; margin-top: 4px;"><b>Route:</b> ${shp.origin_name} ➔ ${shp.destination_name}</div>
          <div style="font-size: 11px; color: ${color}; font-weight: 700; margin-top: 4px;">
            Status: ${shp.status} (${shp.speed_kmh} km/h)
          </div>
        </div>
      `);
      marker.on('click', () => onSelectEntity && onSelectEntity({ type: 'SHIPMENT', data: shp }));
    });
  }, [suppliers, warehouses, shipments, disruptions]);

  return (
    <div className="leaflet-map-wrapper" style={{ height }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
