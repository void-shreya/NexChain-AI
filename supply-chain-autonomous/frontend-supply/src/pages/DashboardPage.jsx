import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  AlertTriangle,
  Flame,
  Boxes,
  Building2,
  Truck,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { dashboardApi, suppliersApi, shipmentsApi, disruptionsApi } from '../services/api';
import { SupplyMap } from '../maps/SupplyMap';
import { HologramSphere } from '../components/HologramSphere';
import { useDisruption } from '../context/DisruptionContext';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [shipments, setShipments] = useState([]);
  const { activeDisruptions, triggerDemoDisruption, isDemoRunning } = useDisruption();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, supRes, shpRes] = await Promise.all([
        dashboardApi.getMetrics(),
        suppliersApi.getAll(),
        shipmentsApi.getAll(),
      ]);

      if (dashRes.data?.success) setData(dashRes.data.data);
      if (supRes.data?.success) setSuppliers(supRes.data.data);
      if (shpRes.data?.success) setShipments(shpRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--accent-cyan)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="voice-waves" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
            <div className="wave-bar" />
            <div className="wave-bar" />
            <div className="wave-bar" />
            <div className="wave-bar" />
            <div className="wave-bar" />
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>INITIALIZING CONTROL TOWER TELEMETRY...</span>
        </div>
      </div>
    );
  }

  const { kpis, charts, timeline } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Hero / Active Disruption Banner */}
      {activeDisruptions.length > 0 ? (
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
                width: '46px',
                height: '46px',
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
                <span className="badge badge-critical">CRITICAL DISRUPTION IN PROGRESS</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Detected: Chakan Industrial Area (Pune)
                </span>
              </div>
              <h3 style={{ fontSize: '1.1rem', marginTop: '0.2rem' }}>
                Flash Flood & Substation Failure: Tata AutoComp Assembly Halted
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                18 Customer orders flagged with SLA delivery breach risk. ₹3.82 Cr inventory exposed.
              </p>
            </div>
          </div>

          {/* 3D Animated Hologram Telemetry Graphic */}
          <div style={{ minWidth: '220px' }}>
            <HologramSphere size={50} label="DISRUPTION RADAR" subtitle="CHAKAN ANOMALY" />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => navigate('/decisions')}
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #f43f5e, #be123c)' }}
            >
              <span>Review AI Action (Option B)</span>
              <ArrowUpRight size={15} />
            </button>
            <button
              onClick={() => navigate('/simulation')}
              className="btn btn-secondary"
            >
              <span>What-If Simulator</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(13, 21, 39, 0.8))',
            borderColor: 'rgba(6, 182, 212, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <Sparkles size={16} color="var(--accent-cyan)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                AI Autonomous Control Tower Ready
              </span>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>SupplyChain Guardian Monitoring 12 Suppliers & 5 Mega Warehouses</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              15-step autonomous recovery sequence armed. Continuous Indian logistics corridor spatial telemetry active.
            </p>
          </div>

          {/* 3D Animated Hologram Telemetry Graphic */}
          <div style={{ minWidth: '220px' }}>
            <HologramSphere size={50} label="3D SUPPLY MESH" subtitle="REAL-TIME TELEMETRY" />
          </div>

          <button
            onClick={triggerDemoDisruption}
            disabled={isDemoRunning}
            className="btn btn-demo-trigger"
          >
            <Zap size={16} />
            <span>{isDemoRunning ? 'Simulating...' : 'Launch Demo Disruption'}</span>
          </button>
        </div>
      )}

      {/* KPI METRIC CARDS (Prompt Section 9) */}
      <div className="kpi-grid">
        {/* Total Orders */}
        <div className="glass-panel kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Orders</span>
            <ShoppingBag size={18} color="var(--accent-cyan)" />
          </div>
          <div className="kpi-value">{kpis.totalOrders}</div>
          <div className="kpi-footer">
            <span style={{ color: 'var(--accent-emerald)' }}>● Active pipeline</span>
          </div>
        </div>

        {/* At-Risk Orders */}
        <div className="glass-panel kpi-card" style={{ borderColor: kpis.atRiskOrdersCount > 0 ? 'rgba(244, 63, 94, 0.4)' : undefined }}>
          <div className="kpi-header">
            <span className="kpi-title">At-Risk Orders</span>
            <AlertTriangle size={18} color="#f43f5e" />
          </div>
          <div className="kpi-value" style={{ color: '#fb7185' }}>{kpis.atRiskOrdersCount}</div>
          <div className="kpi-footer">
            <span>₹{(kpis.totalRevenueAtRiskInr / 10000000).toFixed(2)} Cr inventory value</span>
          </div>
        </div>

        {/* Active Disruptions */}
        <div className="glass-panel kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Active Disruptions</span>
            <Flame size={18} color="#f59e0b" />
          </div>
          <div className="kpi-value" style={{ color: '#fbbf24' }}>{kpis.activeDisruptionsCount}</div>
          <div className="kpi-footer">
            <span>{kpis.activeDisruptionsCount > 0 ? 'Chakan Substation Outage' : 'All hubs operational'}</span>
          </div>
        </div>

        {/* Low Inventory Items */}
        <div className="glass-panel kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Low Inventory SKUs</span>
            <Boxes size={18} color="#f97316" />
          </div>
          <div className="kpi-value">{kpis.lowInventoryCount}</div>
          <div className="kpi-footer">
            <span>&lt;3 days stock remaining</span>
          </div>
        </div>

        {/* High Risk Suppliers */}
        <div className="glass-panel kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">High-Risk Suppliers</span>
            <Building2 size={18} color="#ec4899" />
          </div>
          <div className="kpi-value">{kpis.highRiskSuppliersCount}</div>
          <div className="kpi-footer">
            <span>Tata AutoComp Pune (88.5/100)</span>
          </div>
        </div>

        {/* Active Shipments */}
        <div className="glass-panel kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Active Shipments</span>
            <Truck size={18} color="var(--accent-cyan)" />
          </div>
          <div className="kpi-value">{kpis.activeShipmentsCount}</div>
          <div className="kpi-footer">
            <span>{kpis.delayedShipmentsCount} delayed on corridor</span>
          </div>
        </div>

        {/* Estimated Recovery Cost */}
        <div className="glass-panel kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Recovery Plan Cost</span>
            <TrendingUp size={18} color="var(--accent-emerald)" />
          </div>
          <div className="kpi-value" style={{ color: '#34d399' }}>
            ₹{(kpis.estimatedRecoveryCostInr / 100000).toFixed(2)}L
          </div>
          <div className="kpi-footer">
            <span>Saves ₹1.04 Cr in OEM penalties</span>
          </div>
        </div>

        {/* Service Level % */}
        <div className="glass-panel kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Service Level SLA</span>
            <ShieldCheck size={18} color="var(--accent-cyan)" />
          </div>
          <div className="kpi-value">{kpis.serviceLevelRate}</div>
          <div className="kpi-footer">
            <span>On-Time: {kpis.onTimeDeliveryRate}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Control Tower Map & Decision Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Live GIS Map */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem' }}>Live Indian Logistics Corridor GIS</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Real-time tracking of Warehouses, Suppliers, Shipments & Disruption Halos
              </p>
            </div>
            <button
              onClick={() => navigate('/control-tower')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
            >
              <span>Full Screen Radar</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
          <SupplyMap
            suppliers={suppliers}
            warehouses={data.warehouses || []}
            shipments={shipments}
            disruptions={activeDisruptions}
            height="460px"
          />
        </div>

        {/* Disruption Timeline */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem' }}>Disruption Timeline</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Autonomous Incident Sequence
              </p>
            </div>
            <Clock size={16} color="var(--accent-cyan)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', flex: 1 }}>
            {timeline.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.85rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: item.status === 'done' ? '#10b981' : '#f59e0b',
                      boxShadow: item.status === 'done' ? '0 0 8px #10b981' : '0 0 8px #f59e0b',
                    }}
                  />
                  {idx !== timeline.length - 1 && (
                    <div style={{ width: '2px', flex: 1, backgroundColor: 'var(--border-color)', margin: '4px 0' }} />
                  )}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                      {item.time}
                    </span>
                    <span
                      className="badge"
                      style={{
                        fontSize: '0.62rem',
                        padding: '0.1rem 0.4rem',
                        backgroundColor: item.badge === 'CRITICAL' ? 'rgba(244,63,94,0.15)' : 'rgba(6,182,212,0.15)',
                        color: item.badge === 'CRITICAL' ? '#fb7185' : '#38bdf8',
                      }}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/decisions')}
            className="btn btn-primary"
            style={{ marginTop: '1rem', width: '100%', fontSize: '0.8rem' }}
          >
            <span>Inspect Autonomous Decision Engine</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* Analytics Charts Grid (Prompt Section 9) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Delivery Performance Chart */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '0.35rem' }}>On-Time Delivery Performance Trend</h4>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Historical SLA delivery adherence % vs Target 95.0%
          </p>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.deliveryPerformanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
                <YAxis domain={[90, 100]} stroke="var(--text-muted)" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="onTimeRate" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="target" stroke="#64748b" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Health Chart */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '0.35rem' }}>Inventory Health Breakdown</h4>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            50+ SKUs categorized by days of remaining supply
          </p>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.inventoryHealth} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={10} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {charts.inventoryHealth.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recovery Cost ROI Comparison */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '0.35rem' }}>Recovery Financial Impact (₹ Lakhs)</h4>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Cost of passive inaction vs Autonomous Option B
          </p>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.recoveryCostComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="scenario" stroke="var(--text-muted)" fontSize={10} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="amountLakhs" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  <Cell fill="#f43f5e" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#06b6d4" />
                  <Cell fill="#10b981" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
