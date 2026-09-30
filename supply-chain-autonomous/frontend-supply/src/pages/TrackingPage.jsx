import React, { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  Clock,
  Thermometer,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Radio,
  Search,
} from 'lucide-react';
import { shipmentsApi } from '../services/api';
import { SupplyMap } from '../maps/SupplyMap';
import { socketService } from '../services/socket';

export const TrackingPage = () => {
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadShipments();

    // Listen to live GPS telemetry ticks
    socketService.on('shipment:telemetry_tick', (tickData) => {
      setShipments((prev) =>
        prev.map((s) => (s.id === tickData.id ? { ...s, ...tickData } : s))
      );
    });

    return () => {
      socketService.off('shipment:telemetry_tick');
    };
  }, []);

  const loadShipments = async () => {
    try {
      setLoading(true);
      const res = await shipmentsApi.getAll();
      if (res.data?.success) {
        setShipments(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedShipment(res.data.data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = shipments.filter((s) => {
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesSearch = s.tracking_number.toLowerCase().includes(search.toLowerCase()) ||
      s.carrier_name.toLowerCase().includes(search.toLowerCase()) ||
      s.destination_name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Truck size={24} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.4rem' }}>Live Freight Delivery Telemetry</h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Real-time GPS vehicle tracking across national highway spines and express air cargo routes.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)', fontSize: '0.8rem', fontWeight: 600 }}>
          <span className="pulse-indicator pulse-indicator-green" />
          <span>GPS Sensor Stream Active</span>
        </div>
      </div>

      {/* Main Split: Left Shipments Feed & Right Live Map */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 2fr', gap: '1.5rem' }}>
        {/* Left Side: Shipment Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['ALL', 'IN_TRANSIT', 'DELAYED', 'AT_RISK', 'DELIVERED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--border-radius-full)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  border: statusFilter === st ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                  backgroundColor: statusFilter === st ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-elevated)',
                  color: statusFilter === st ? '#38bdf8' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Shipment Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '680px', overflowY: 'auto' }}>
            {filtered.map((shp) => {
              const isSelected = selectedShipment?.id === shp.id;
              const isDelayed = shp.status === 'DELAYED' || shp.status === 'AT_RISK';

              return (
                <div
                  key={shp.id}
                  onClick={() => setSelectedShipment(shp)}
                  className="glass-panel"
                  style={{
                    padding: '1rem',
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--accent-cyan)' : isDelayed ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-color)',
                    backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.08)' : 'var(--bg-card)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {shp.tracking_number}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        ({shp.vehicle_registration || 'VT-CARGO'})
                      </span>
                    </div>

                    <span
                      className={
                        shp.status === 'DELIVERED'
                          ? 'badge badge-success'
                          : isDelayed
                          ? 'badge badge-critical'
                          : 'badge badge-info'
                      }
                      style={{ fontSize: '0.62rem' }}
                    >
                      {shp.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                    <b>Carrier:</b> {shp.carrier_name}
                  </div>

                  {/* Route */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                    <span>{shp.origin_name}</span>
                    <span>➔</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{shp.destination_name}</span>
                  </div>

                  {/* Telemetry Stats */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                    <span>Speed: {shp.speed_kmh} km/h</span>
                    <span>Temp: {shp.cargo_temperature_celsius}°C</span>
                    <span>ETA: {new Date(shp.estimated_arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Interactive Tracking Map & Live Waypoint Corridor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <SupplyMap
              shipments={filtered}
              disruptions={[]}
              height="480px"
              center={selectedShipment ? [selectedShipment.current_latitude, selectedShipment.current_longitude] : [20.5937, 78.9629]}
              zoom={selectedShipment ? 7 : 5}
            />
          </div>

          {selectedShipment && (
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '0.95rem' }}>Active Telemetry Sensor Stream: {selectedShipment.tracking_number}</h4>
                <span className="badge badge-info">{selectedShipment.vehicle_type}</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Corridor: {selectedShipment.route_corridor || 'Golden Quadrilateral Express Link'}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-elevated)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>GPS Position</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    {selectedShipment.current_latitude}, {selectedShipment.current_longitude}
                  </div>
                </div>
                <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-elevated)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Telemetry Latency</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>
                    &lt;400ms Real-Time
                  </div>
                </div>
                <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-elevated)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Delay Margin</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: selectedShipment.delay_hours > 0 ? '#fb7185' : 'var(--accent-emerald)' }}>
                    {selectedShipment.delay_hours > 0 ? `+${selectedShipment.delay_hours}h` : 'On Schedule'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
