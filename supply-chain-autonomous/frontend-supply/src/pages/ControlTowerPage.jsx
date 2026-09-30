import React, { useState, useEffect } from 'react';
import {
  Radio,
  Layers,
  Activity,
  Flame,
  AlertCircle,
  Truck,
  Building2,
  Boxes,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { SupplyMap } from '../maps/SupplyMap';
import { HologramCore } from '../components/HologramCore';
import { suppliersApi, shipmentsApi, disruptionsApi, dashboardApi } from '../services/api';
import { useDisruption } from '../context/DisruptionContext';
import { useNavigate } from 'react-router-dom';

export const ControlTowerPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [loading, setLoading] = useState(true);
  const { activeDisruptions } = useDisruption();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [supRes, shpRes, dashRes] = await Promise.all([
        suppliersApi.getAll(),
        shipmentsApi.getAll(),
        dashboardApi.getMetrics(),
      ]);

      if (supRes.data?.success) setSuppliers(supRes.data.data);
      if (shpRes.data?.success) setShipments(shpRes.data.data);
      if (dashRes.data?.data?.warehouses) {
        setWarehouses(dashRes.data.data.warehouses);
      } else {
        // Fallback default warehouses coordinates
        setWarehouses([
          { id: 'wh-01', code: 'WH-BHIWANDI', name: 'Western Hub Mega DC', city: 'Bhiwandi (Mumbai)', state: 'Maharashtra', latitude: 19.2967, longitude: 73.0631, utilized_capacity_units: 245000, total_capacity_units: 300000, operational_status: 'OPERATIONAL' },
          { id: 'wh-02', code: 'WH-WHITEFIELD', name: 'Southern Tech Logistics Park', city: 'Bengaluru', state: 'Karnataka', latitude: 12.9698, longitude: 77.7500, utilized_capacity_units: 162000, total_capacity_units: 200000, operational_status: 'OPERATIONAL' },
          { id: 'wh-03', code: 'WH-SRIPERUMBUDUR', name: 'Chennai Auto Depot', city: 'Sriperumbudur', state: 'Tamil Nadu', latitude: 12.9700, longitude: 79.9400, utilized_capacity_units: 195000, total_capacity_units: 220000, operational_status: 'CONGESTED' },
          { id: 'wh-04', code: 'WH-MANESAR', name: 'Northern NCR Distribution Hub', city: 'Manesar (Gurugram)', state: 'Haryana', latitude: 28.3588, longitude: 76.9388, utilized_capacity_units: 180000, total_capacity_units: 250000, operational_status: 'OPERATIONAL' },
          { id: 'wh-05', code: 'WH-SHAMSHABAD', name: 'Deccan Aerospace Depot', city: 'Hyderabad', state: 'Telangana', latitude: 17.2403, longitude: 78.4294, utilized_capacity_units: 110000, total_capacity_units: 180000, operational_status: 'OPERATIONAL' },
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Helper to map entity to place ID
  const getPlaceIdFromEntity = (entity) => {
    if (!entity || !entity.data) return 'PUNE';
    const text = (
      (entity.data.city || '') + ' ' +
      (entity.data.name || '') + ' ' +
      (entity.data.origin_name || '') + ' ' +
      (entity.data.destination_name || '')
    ).toLowerCase();

    if (text.includes('pune') || text.includes('chakan') || text.includes('tata')) return 'PUNE';
    if (text.includes('bengaluru') || text.includes('bangalore') || text.includes('bharat') || text.includes('whitefield')) return 'BLR';
    if (text.includes('bhiwandi') || text.includes('mumbai') || text.includes('western')) return 'BOM';
    if (text.includes('manesar') || text.includes('delhi') || text.includes('gurugram') || text.includes('ncr')) return 'DEL';
    if (text.includes('sriperumbudur') || text.includes('chennai') || text.includes('foxconn')) return 'MAA';
    if (text.includes('hyderabad') || text.includes('shamshabad')) return 'HYD';
    if (text.includes('ahmedabad') || text.includes('sanand') || text.includes('gujarat')) return 'AMD';
    return 'PUNE';
  };

  const [selectedPlaceId, setSelectedPlaceId] = useState('PUNE');

  const handleEntitySelect = (entity) => {
    setSelectedEntity(entity);
    const placeId = getPlaceIdFromEntity(entity);
    setSelectedPlaceId(placeId);
  };

  const handlePlaceSelect = (place) => {
    setSelectedPlaceId(place.id);
    const matchSupplier = suppliers.find((s) => s.city?.toLowerCase().includes(place.city.toLowerCase().split(' ')[0]));
    const matchWarehouse = warehouses.find((w) => w.city?.toLowerCase().includes(place.city.toLowerCase().split(' ')[0]));
    if (matchSupplier) {
      setSelectedEntity({ type: 'SUPPLIER', data: matchSupplier });
    } else if (matchWarehouse) {
      setSelectedEntity({ type: 'WAREHOUSE', data: matchWarehouse });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Radio size={20} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.4rem' }}>AI Supply Chain Control Tower</h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Real-time pan-India geospatial monitoring, IoT telematics radar & autonomous disruption resolution
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/decisions')} className="btn btn-primary">
            <span>Autonomous Decisions</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Disruption Alert Banner */}
      {activeDisruptions.length > 0 && (
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(13, 21, 39, 0.9))',
            borderColor: 'rgba(244, 63, 94, 0.4)',
            boxShadow: 'var(--shadow-glow-rose)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(244, 63, 94, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Flame size={24} color="#f43f5e" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="badge badge-critical">DISRUPTION EPICENTER: PUNE CHAKAN</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Triggered 10:42 AM IST</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', marginTop: '0.2rem' }}>
                Substation 220kV Grid Explosion & Flash Floods: Tata AutoComp Assembly Halted
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                18 Customer orders at risk. Option B recommended: Reroute 28,000 units from Bharat Silicon (Bengaluru).
              </p>
            </div>
          </div>

          <button onClick={() => navigate('/decisions')} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #f43f5e, #be123c)' }}>
            <span>Review AI Recovery Plan</span>
          </button>
        </div>
      )}

      {/* 5 Core Operational Questions */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HelpCircle size={18} color="var(--accent-cyan)" />
          <span>The 5 Core Operational Questions (Real-Time Situational Awareness)</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
          <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: '#f43f5e', fontWeight: 700, textTransform: 'uppercase' }}>
              1. What is happening?
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.4 }}>
              {activeDisruptions.length > 0
                ? 'Severe flash flooding and substation power loss halted microchip production at Tata AutoComp Systems (Pune Chakan Hub).'
                : 'All nationwide logistics corridors operating within standard tolerance. Nominal transit speeds.'}
            </p>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>
              2. What is at risk?
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.4 }}>
              18 customer orders across Maruti Suzuki, Mahindra, and Ather Energy. ₹3.82 Cr inventory exposed; Bhiwandi buffer &lt;2 days.
            </p>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
              3. What will happen next?
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.4 }}>
              Without intervention, average arrival delay will reach 120 hours, triggering ₹1.25 Cr in SLA penalties and assembly halts.
            </p>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase' }}>
              4. What should we do?
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.4 }}>
              Activate Option B: Procure 28k units from Bharat Silicon (Bengaluru) and dispatch via Blue Dart Aviation Cargo (Flight BDA-91).
            </p>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>
              5. What has the AI done?
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.4 }}>
              Generated 6 recovery options, drafted PO-REC-901 for ₹18.45L, and dispatched human-in-the-loop approval ticket #DEC-01.
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Map & 3D Spatial Matrix Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(360px, 1.1fr)', gap: '1.5rem', alignItems: 'start' }}>
        {/* Full Interactive Map */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Active Nodes:</span>
              <span className="badge badge-info">{warehouses.length} Warehouses</span>
              <span className="badge badge-success">{suppliers.length} Suppliers</span>
              <span className="badge badge-warning">{shipments.length} Active Shipments</span>
              {activeDisruptions.length > 0 && <span className="badge badge-critical">1 Disruption Zone</span>}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Click any node on map to orient 3D Hologram
            </span>
          </div>

          <SupplyMap
            suppliers={suppliers}
            warehouses={warehouses}
            shipments={shipments}
            disruptions={activeDisruptions}
            onSelectEntity={handleEntitySelect}
            height="620px"
          />
        </div>

        {/* Right Side: 3D Holographic Spatial Telemetry Matrix & Deep Node Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Radio size={16} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1rem' }}>3D Holographic Spatial Matrix</h3>
              </div>
              <span className="badge badge-success">3D MESH LIVE</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Real-time 3D vector projection of Indian supply corridors, warehouse buffer thresholds, and live disruption targeting.
            </p>

            <HologramCore
              compact={false}
              selectedPlaceId={selectedPlaceId}
              onSelectPlace={handlePlaceSelect}
            />
          </div>

          {/* Inspected Entity Card (if clicked) */}
          {selectedEntity && (
            <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={18} color="var(--accent-cyan)" />
                  <h3 style={{ fontSize: '1rem' }}>Selected Map Entity Telemetry</h3>
                </div>
                <button
                  onClick={() => setSelectedEntity(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-elevated)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {selectedEntity.type}
                </span>
                <h4 style={{ fontSize: '1.05rem', marginTop: '2px' }}>
                  {selectedEntity.data.name || selectedEntity.data.tracking_number}
                </h4>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {selectedEntity.data.city || selectedEntity.data.carrier_name}
                </div>
              </div>

              {selectedEntity.type === 'SUPPLIER' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div style={{ padding: '0.55rem', backgroundColor: 'var(--bg-elevated)', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Reliability Score</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {selectedEntity.data.reliability_score}%
                      </div>
                    </div>
                    <div style={{ padding: '0.55rem', backgroundColor: 'var(--bg-elevated)', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Lead Time</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                        {selectedEntity.data.avg_lead_time_days} days
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    <b>Risk Assessment:</b> {selectedEntity.data.risk_factors?.summary || 'Stable supply node with active multi-shift production.'}
                  </div>
                  <button
                    onClick={() => navigate('/suppliers')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.45rem' }}
                  >
                    <span>View Supplier Profile</span>
                    <ExternalLink size={13} />
                  </button>
                </>
              )}

              {selectedEntity.type === 'SHIPMENT' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem' }}>
                    <div><b>Route:</b> {selectedEntity.data.origin_name} ➔ {selectedEntity.data.destination_name}</div>
                    <div><b>Carrier:</b> {selectedEntity.data.carrier_name} ({selectedEntity.data.vehicle_type})</div>
                    <div><b>Speed:</b> {selectedEntity.data.speed_kmh} km/h • <b>Temp:</b> {selectedEntity.data.cargo_temperature_celsius}°C</div>
                    <div><b>Status:</b> <span className={selectedEntity.data.status === 'AT_RISK' ? 'badge badge-critical' : 'badge badge-info'}>{selectedEntity.data.status}</span></div>
                  </div>
                  <button
                    onClick={() => navigate('/tracking')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.45rem' }}
                  >
                    <span>Track on Live Corridor</span>
                    <ExternalLink size={13} />
                  </button>
                </>
              )}

              {selectedEntity.type === 'WAREHOUSE' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem' }}>
                    <div><b>Location:</b> {selectedEntity.data.city}, {selectedEntity.data.state}</div>
                    <div><b>Capacity:</b> {selectedEntity.data.utilized_capacity_units?.toLocaleString()} / {selectedEntity.data.total_capacity_units?.toLocaleString()} units</div>
                    <div><b>Status:</b> {selectedEntity.data.operational_status}</div>
                  </div>
                  <button
                    onClick={() => navigate('/inventory')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.45rem' }}
                  >
                    <span>Inspect Warehouse Inventory</span>
                    <ExternalLink size={13} />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
