import React, { useState, useEffect } from 'react';
import {
  Flame,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PlusCircle,
  Zap,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { disruptionsApi } from '../services/api';
import { useDisruption } from '../context/DisruptionContext';
import { subscribeToTable } from '../services/supabaseRealtime';
import { useNavigate } from 'react-router-dom';

export const DisruptionsPage = () => {
  const [disruptions, setDisruptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSupplierName, setNewSupplierName] = useState('Tata AutoComp Systems Ltd');
  const [newType, setNewType] = useState('SUPPLIER_SHUTDOWN');
  const [newDuration, setNewDuration] = useState(5);
  const { triggerDemoDisruption, isDemoRunning, showToast } = useDisruption();
  const navigate = useNavigate();

  useEffect(() => {
    loadDisruptions();

    // Subscribe to real-time disruptions changes directly in the table view
    const unsubscribe = subscribeToTable({
      table: 'disruptions',
      channelName: 'realtime-page-disruptions-table',
      event: '*',
      onInsert: (newRow) => {
        console.log('⚡ [DisruptionsPage Realtime INSERT]:', newRow);
        setDisruptions((prev) => {
          const exists = prev.some((d) => d.id === newRow.id);
          if (exists) return prev.map((d) => (d.id === newRow.id ? newRow : d));
          return [newRow, ...prev];
        });
      },
      onUpdate: (updatedRow) => {
        console.log('⚡ [DisruptionsPage Realtime UPDATE]:', updatedRow);
        setDisruptions((prev) =>
          prev.map((d) => (d.id === updatedRow.id ? updatedRow : d))
        );
      },
      onDelete: (deletedRow) => {
        setDisruptions((prev) => prev.filter((d) => d.id !== deletedRow.id));
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadDisruptions = async () => {
    try {
      setLoading(true);
      const res = await disruptionsApi.getAll();
      if (res.data?.success) {
        setDisruptions(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      const res = await disruptionsApi.resolve(id);
      if (res.data?.success) {
        showToast({
          title: 'Disruption Resolved',
          message: 'Incident status marked as RESOLVED.',
          type: 'success',
        });
        loadDisruptions();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateDisruption = async () => {
    if (!newTitle) return;
    try {
      const res = await disruptionsApi.create({
        title: newTitle,
        affected_entity_name: newSupplierName,
        type: newType,
        expected_duration_days: Number(newDuration),
        severity: 'HIGH',
      });
      if (res.data?.success) {
        showToast({
          title: 'Disruption Ingested',
          message: 'Telemetry incident logged into control tower.',
          type: 'warning',
        });
        setShowCreateModal(false);
        setNewTitle('');
        loadDisruptions();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const active = disruptions.filter((d) => d.status === 'ACTIVE');
  const historical = disruptions.filter((d) => d.status !== 'ACTIVE');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Flame size={24} color="#f43f5e" />
            <h2 style={{ fontSize: '1.4rem' }}>Supply Chain Disruption Radar</h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Real-time incident ingestion, impact assessment, and automated containment actions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-secondary"
          >
            <PlusCircle size={15} />
            <span>Report Incident</span>
          </button>

          <button
            onClick={triggerDemoDisruption}
            disabled={isDemoRunning}
            className="btn btn-demo-trigger"
          >
            <Zap size={16} />
            <span>{isDemoRunning ? 'Simulating...' : 'Demo Disruption'}</span>
          </button>
        </div>
      </div>

      {/* Active Disruptions Section */}
      <div>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Active Disruption Incidents</span>
          <span className="badge badge-critical">{active.length} ACTIVE</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {active.map((dis) => (
            <div
              key={dis.id}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.08), rgba(13, 21, 39, 0.85))',
                boxShadow: 'var(--shadow-glow-rose)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <span className="badge badge-critical">{dis.severity} SEVERITY</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{dis.code}</span>
                </div>

                <h4 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>{dis.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Target Node: <b>{dis.affected_entity_name}</b> ({dis.type})
                </p>

                {dis.details && (
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-elevated)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '1rem' }}>
                    <div><b>Root Cause:</b> {dis.details.cause}</div>
                    <div style={{ marginTop: '4px' }}><b>At Risk:</b> {dis.details.affected_order_count || 18} orders (₹{((dis.details.affected_revenue_inr || 24500000) / 10000000).toFixed(2)} Cr)</div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button
                  onClick={() => navigate('/decisions')}
                  className="btn btn-primary"
                  style={{ flex: 1, fontSize: '0.8rem' }}
                >
                  <span>Autonomous Response</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => handleResolve(dis.id)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem' }}
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Incidents Archive */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Historical Disruption Archive</h3>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Incident Code</th>
              <th>Incident Title</th>
              <th>Affected Node</th>
              <th>Type</th>
              <th>Expected Delay</th>
              <th>Status</th>
              <th>Resolution Date</th>
            </tr>
          </thead>
          <tbody>
            {historical.map((dis) => (
              <tr key={dis.id}>
                <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{dis.code}</td>
                <td>{dis.title}</td>
                <td>{dis.affected_entity_name}</td>
                <td>{dis.type}</td>
                <td>{dis.expected_duration_days} days</td>
                <td>
                  <span className="badge badge-success">RESOLVED</span>
                </td>
                <td style={{ fontSize: '0.78rem' }}>
                  {dis.resolved_at ? new Date(dis.resolved_at).toLocaleDateString() : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Report Incident Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Report Disruption Incident</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Simulate an ad-hoc disruption across suppliers or logistics corridors.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Incident Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cyclone Advisory at Chennai Harbour"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: '100%', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.6rem 0.8rem', borderRadius: '6px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Affected Supplier / Corridor
                </label>
                <input
                  type="text"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  style={{ width: '100%', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.6rem 0.8rem', borderRadius: '6px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    style={{ width: '100%', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.6rem', borderRadius: '6px', outline: 'none' }}
                  >
                    <option value="SUPPLIER_SHUTDOWN">Supplier Shutdown</option>
                    <option value="PORT_CONGESTION">Port Congestion</option>
                    <option value="HIGHWAY_BLOCKAGE">Highway Blockage</option>
                    <option value="WEATHER_CYCLONE">Weather Event</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Estimated Delay (Days)
                  </label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    style={{ width: '100%', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.6rem', borderRadius: '6px', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleCreateDisruption} className="btn btn-primary">
                Ingest Disruption
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
