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
  const [displayMode, setDisplayMode] = useState('MAP'); // 'MAP' | 'HOLOGRAM'
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
            <span>Decision Engine</span>
            <ChevronRight size={14} />
          </button>
          <button onClick={() => navigate('/simulation')} className="btn btn-secondary">
            <span>Simulate Disruption</span>
          </button>
        </div>
      </div>

      {/* Control Tower 5 Critical Questions Panel (Prompt Section 8) */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: 'rgba(13, 21, 39, 0.85)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <HelpCircle size={16} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Operations Tower Intelligence Synthesis
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {/* Question 1 */}
          <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: '#fb7185', fontWeight: 700, textTransform: 'uppercase' }}>
              1. What is happening?
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.4 }}>
              {activeDisruptions.length > 0
                ? 'Severe flash flooding and substation power loss halted microchip production at Tata AutoComp Systems (Pune Chakan Hub).'
                : 'All nationwide logistics corridors operating within standard tolerance. Nominal transit speeds.'}
            </p>
          </div>

          {/* Question 2 */}
          <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>
              2. What is at risk?
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.4 }}>
              18 customer orders across Maruti Suzuki, Mahindra, and Ather Energy. ₹3.82 Cr inventory exposed; Bhiwandi buffer &lt;2 days.
            </p>
          </div>

          {/* Question 3 */}
          <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
              3. What will happen next?
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.4 }}>
              Without intervention, average arrival delay will reach 120 hours, triggering ₹1.25 Cr in SLA penalties and assembly halts.
            </p>
          </div>

          {/* Question 4 */}
          <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase' }}>
              4. What should we do?
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.4 }}>
              Activate Option B: Procure 28k units from Bharat Silicon (Bengaluru) and dispatch via Blue Dart Aviation Cargo (Flight BDA-91).
            </p>
          </div>

          {/* Question 5 */}
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

      {/* Main Interactive Map & Telemetry Inspector Split */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedEntity ? '2.2fr 1fr' : '1fr', gap: '1.5rem' }}>
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

            {/* View Switcher: GIS Map vs 3D Holographic Core */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => setDisplayMode('MAP')}
                className={`btn ${displayMode === 'MAP' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.72rem', padding: '0.35rem 0.75rem' }}
              >
                🗺️ GIS Map
              </button>
              <button
                onClick={() => setDisplayMode('HOLOGRAM')}
                className={`btn ${displayMode === 'HOLOGRAM' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.72rem', padding: '0.35rem 0.75rem' }}
              >
                🔮 3D Hologram Net
              </button>
            </div>
          </div>

          {displayMode === 'MAP' ? (
            <SupplyMap
              suppliers={suppliers}
              warehouses={warehouses}
              shipments={shipments}
              disruptions={activeDisruptions}
              onSelectEntity={(entity) => setSelectedEntity(entity)}
              height="580px"
            />
          ) : (
            <div style={{ padding: '0.5rem 0' }}>
              <HologramCore compact={false} />
            </div>
          )}
        </div>

        {/* Selected Entity Inspector Panel */}
        {selectedEntity && (
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1.1rem' }}>Node Telemetry</h3>
              </div>
              <button
                onClick={() => setSelectedEntity(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-elevated)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {selectedEntity.type}
                </span>
                <h4 style={{ fontSize: '1.1rem', marginTop: '2px' }}>
                  {selectedEntity.data.name || selectedEntity.data.tracking_number}
                </h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {selectedEntity.data.city || selectedEntity.data.carrier_name}
                </div>
              </div>

              {selectedEntity.type === 'SUPPLIER' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-elevated)', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Reliability Score</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {selectedEntity.data.reliability_score}%
                      </div>
                    </div>
                    <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-elevated)', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Lead Time</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700 }}>
                        {selectedEntity.data.avg_lead_time_days} days
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <b>Risk Assessment:</b> {selectedEntity.data.risk_factors?.summary || 'Stable supply node with active multi-shift production.'}
                  </div>
                  <button
                    onClick={() => navigate('/suppliers')}
                    className="btn btn-secondary"
                    style={{ marginTop: 'auto', fontSize: '0.78rem' }}
                  >
                    <span>View Supplier Profile</span>
                    <ExternalLink size={13} />
                  </button>
                </>
              )}

              {selectedEntity.type === 'SHIPMENT' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.78rem' }}><b>Route:</b> {selectedEntity.data.origin_name} ➔ {selectedEntity.data.destination_name}</div>
                    <div style={{ fontSize: '0.78rem' }}><b>Carrier:</b> {selectedEntity.data.carrier_name} ({selectedEntity.data.vehicle_type})</div>
                    <div style={{ fontSize: '0.78rem' }}><b>Speed:</b> {selectedEntity.data.speed_kmh} km/h</div>
                    <div style={{ fontSize: '0.78rem' }}><b>Cargo Temp:</b> {selectedEntity.data.cargo_temperature_celsius}°C</div>
                    <div style={{ fontSize: '0.78rem' }}><b>Status:</b> <span className={selectedEntity.data.status === 'AT_RISK' ? 'badge badge-critical' : 'badge badge-info'}>{selectedEntity.data.status}</span></div>
                  </div>
                  <button
                    onClick={() => navigate('/tracking')}
                    className="btn btn-secondary"
                    style={{ marginTop: 'auto', fontSize: '0.78rem' }}
                  >
                    <span>Track on Live Corridor</span>
                    <ExternalLink size={13} />
                  </button>
                </>
              )}

              {selectedEntity.type === 'WAREHOUSE' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.78rem' }}><b>Location:</b> {selectedEntity.data.city}, {selectedEntity.data.state}</div>
                    <div style={{ fontSize: '0.78rem' }}><b>Capacity:</b> {selectedEntity.data.utilized_capacity_units?.toLocaleString()} / {selectedEntity.data.total_capacity_units?.toLocaleString()} units</div>
                    <div style={{ fontSize: '0.78rem' }}><b>Status:</b> {selectedEntity.data.operational_status}</div>
                  </div>
                  <button
                    onClick={() => navigate('/inventory')}
                    className="btn btn-secondary"
                    style={{ marginTop: 'auto', fontSize: '0.78rem' }}
                  >
                    <span>Inspect Warehouse Inventory</span>
                    <ExternalLink size={13} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
