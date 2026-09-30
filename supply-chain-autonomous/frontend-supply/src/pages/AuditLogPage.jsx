import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Shield,
  Clock,
  UserCheck,
  Bot,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { auditApi } from '../services/api';
import { subscribeToTable } from '../services/supabaseRealtime';

export const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    loadAuditLogs();

    // Subscribe to audit_logs INSERT events in real time
    const unsubscribe = subscribeToTable({
      table: 'audit_logs',
      channelName: 'realtime-page-audit-logs-table',
      event: 'INSERT',
      onInsert: (newLog) => {
        console.log('⚡ [AuditLogPage Realtime INSERT]:', newLog);
        setLogs((prev) => [newLog, ...prev]);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [categoryFilter]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      const res = await auditApi.getLogs(params);
      if (res.data?.success) {
        setLogs(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter((l) =>
    (l.event_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.input_context_summary || '').toLowerCase().includes(search.toLowerCase()) ||
    ((l.user_name || l.agent_id || '').toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileCheck2 size={24} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.4rem' }}>Responsible AI Audit Log & Governance</h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Cryptographically sealed and immutable audit logs of all autonomous decisions, human authorizations, and recovery dispatches.
          </p>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '0.5rem 0.85rem 0.5rem 2rem',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '0.82rem',
              outline: 'none',
              width: '240px',
            }}
          />
        </div>
      </div>

      {/* Filter Tabs (Prompt Section 24) */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'ALL', label: 'All Audit Records' },
          { id: 'AI_DECISION', label: 'AI Decisions' },
          { id: 'HUMAN_APPROVAL', label: 'Human Approvals' },
          { id: 'DISRUPTION_TRIGGER', label: 'Disruption Triggers' },
          { id: 'INVENTORY_ADJUSTMENT', label: 'Inventory Changes' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--border-radius-full)',
              fontSize: '0.78rem',
              fontWeight: 600,
              border: categoryFilter === cat.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
              backgroundColor: categoryFilter === cat.id ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-card)',
              color: categoryFilter === cat.id ? '#38bdf8' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Category</th>
              <th>Event Title</th>
              <th>Input Context Snapshot</th>
              <th>Decision Summary</th>
              <th>Approval</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => {
              const actorName = log.user_name || log.agent_id || 'SupplyChain Guardian AI';
              const isAI =
                actorName.toLowerCase().includes('guardian') ||
                actorName.toLowerCase().includes('agent') ||
                actorName.toLowerCase().includes('ai');
              const isApproved = log.approval_status === 'APPROVED' || log.approval_status === 'AUTO_EXECUTED';

              return (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 600 }}>
                      {isAI ? <Bot size={14} color="var(--accent-cyan)" /> : <UserCheck size={14} color="#10b981" />}
                      <span>{actorName}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ fontSize: '0.62rem', backgroundColor: 'var(--bg-elevated)' }}>
                      {log.event_category}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {log.event_name}
                  </td>
                  <td style={{ maxWidth: '280px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {log.input_context_summary}
                  </td>
                  <td style={{ maxWidth: '260px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {log.decision_summary || 'N/A'}
                  </td>
                  <td>
                    <span className={isApproved ? 'badge badge-success' : 'badge badge-warning'}>
                      {log.approval_status || 'PENDING'}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-success">{log.result_status || 'SUCCESS'}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Selected Log Drawer Modal */}
      {selectedLog && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={18} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1.15rem' }}>Audit Evidence Snapshot</h3>
              </div>
              <button onClick={() => setSelectedLog(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.82rem' }}>
              <div><b>Record ID:</b> <span style={{ color: 'var(--accent-cyan)' }}>{selectedLog.id}</span></div>
              <div><b>Timestamp:</b> {new Date(selectedLog.timestamp).toLocaleString()}</div>
              <div><b>Authorized Actor:</b> {selectedLog.user_name || selectedLog.agent_id || 'SupplyChain Guardian AI'} ({selectedLog.agent_id || 'System'})</div>
              <div><b>Event:</b> {selectedLog.event_name}</div>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <b>Input Context Snapshot:</b>
                <p style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>{selectedLog.input_context_summary}</p>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <b>Decision & Reasoning:</b>
                <p style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>{selectedLog.decision_summary}</p>
              </div>
              <div><b>Action Executed:</b> {selectedLog.action_taken}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button onClick={() => setSelectedLog(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
