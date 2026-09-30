import React, { useState, useEffect } from 'react';
import {
  Scale,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  TrendingDown,
  Building2,
  DollarSign,
  AlertTriangle,
  Sliders,
  ExternalLink,
  ChevronRight,
  FileCheck2,
} from 'lucide-react';
import { decisionsApi, agentApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useDisruption } from '../context/DisruptionContext';
import { subscribeToTable } from '../services/supabaseRealtime';
import { useNavigate } from 'react-router-dom';

export const DecisionsPage = () => {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMode, setActiveMode] = useState('AUTONOMOUS');
  const [threshold, setThreshold] = useState(500000);
  const [rejectionModalId, setRejectionModalId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const { user } = useAuth();
  const { showToast } = useDisruption();
  const navigate = useNavigate();

  useEffect(() => {
    loadDecisions();

    // Subscribe to ai_decisions changes in real time
    const unsubscribe = subscribeToTable({
      table: 'ai_decisions',
      channelName: 'realtime-page-ai-decisions-table',
      event: '*',
      onInsert: (newDec) => {
        console.log('⚡ [DecisionsPage Realtime INSERT]:', newDec);
        setDecisions((prev) => {
          const exists = prev.some((d) => d.id === newDec.id);
          if (exists) return prev.map((d) => (d.id === newDec.id ? newDec : d));
          return [newDec, ...prev];
        });
      },
      onUpdate: (updatedDec) => {
        console.log('⚡ [DecisionsPage Realtime UPDATE]:', updatedDec);
        setDecisions((prev) =>
          prev.map((d) => (d.id === updatedDec.id ? { ...d, ...updatedDec } : d))
        );
      },
      onDelete: (deletedDec) => {
        setDecisions((prev) => prev.filter((d) => d.id !== deletedDec.id));
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadDecisions = async () => {
    try {
      setLoading(true);
      const res = await decisionsApi.getAll();
      if (res.data?.success) {
        setDecisions(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (decisionId) => {
    setProcessingId(decisionId);
    try {
      const res = await agentApi.approveAction(decisionId, 'Approved by Manager');
      if (res.data?.success) {
        showToast({
          title: 'AI ACTION APPROVED',
          message: 'Purchase order PO-REC-901 dispatched to Bharat Silicon BLR. Air Cargo booked.',
          type: 'success',
        });
        loadDecisions();
      }
    } catch (err) {
      showToast({
        title: 'Approval Error',
        message: err.response?.data?.error || err.message,
        type: 'critical',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectionModalId) return;
    setProcessingId(rejectionModalId);
    try {
      const res = await agentApi.rejectAction(rejectionModalId, rejectionReason || 'Budget threshold exceeded');
      if (res.data?.success) {
        showToast({
          title: 'DECISION REJECTED',
          message: 'Action aborted. Logged in immutable audit trail.',
          type: 'warning',
        });
        setRejectionModalId(null);
        setRejectionReason('');
        loadDecisions();
      }
    } catch (err) {
      showToast({
        title: 'Rejection Error',
        message: err.response?.data?.error || err.message,
        type: 'critical',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleModeChange = async (newMode) => {
    setActiveMode(newMode);
    try {
      await agentApi.setMode(newMode, threshold);
      showToast({
        title: 'Autonomy Policy Updated',
        message: `Agent set to ${newMode} mode.`,
        type: 'info',
      });
    } catch (e) {
      console.error(e);
    }
  };

  const pendingDecision = decisions.find((d) => d.approval_status === 'PENDING') || decisions[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Scale size={22} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.4rem' }}>Autonomous Decision Engine & Governance</h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Human-in-the-loop audit console for evaluating, authorizing, or declining AI supply chain recovery strategies.
          </p>
        </div>

        <button onClick={() => navigate('/audit-log')} className="btn btn-secondary">
          <FileCheck2 size={15} />
          <span>Audit Log Trail</span>
        </button>
      </div>

      {/* Autonomy Mode Switcher (Prompt Section 14) */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Sliders size={18} color="var(--accent-cyan)" />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Autonomous Operating Mode</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Controls how much authority SupplyChain Guardian possesses to trigger transactions.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { id: 'AUTONOMOUS', label: 'AUTONOMOUS', desc: 'Auto-executes below ₹5 Lakhs' },
            { id: 'ASSISTED', label: 'ASSISTED', desc: 'Recommends with 1-click confirmation' },
            { id: 'MANUAL_APPROVAL', label: 'MANUAL APPROVAL', desc: 'Requires strict manager sign-off' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              style={{
                padding: '0.5rem 0.9rem',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: activeMode === mode.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                backgroundColor: activeMode === mode.id ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-elevated)',
                color: activeMode === mode.id ? '#38bdf8' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Pending Decision Card */}
      {pendingDecision ? (
        <div
          className="glass-panel"
          style={{
            padding: '1.75rem',
            border: pendingDecision.approval_status === 'PENDING' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
            boxShadow: pendingDecision.approval_status === 'PENDING' ? 'var(--shadow-glow-cyan)' : undefined,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className={pendingDecision.approval_status === 'PENDING' ? 'badge badge-warning' : 'badge badge-success'}>
                {pendingDecision.approval_status === 'PENDING' ? 'HUMAN APPROVAL REQUIRED' : 'EXECUTED & RESOLVED'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Decision #{pendingDecision.id.toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
              <ShieldCheck size={16} />
              <span>Confidence: {pendingDecision.confidence_score}%</span>
            </div>
          </div>

          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>
            {pendingDecision.selected_action_title}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            {pendingDecision.reasoning_summary}
          </p>

          {/* Key Metrics Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
              backgroundColor: 'var(--bg-elevated)',
              padding: '1rem',
              borderRadius: 'var(--border-radius-md)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Estimated Recovery Cost
              </span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                ₹{(pendingDecision.estimated_cost_inr || 0).toLocaleString('en-IN')}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Arrival Delay Reduction
              </span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                -{((120 - (pendingDecision.estimated_delay_hours || 18)) / 120 * 100).toFixed(0)}% (Saved 102h)
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                SLA Penalties Avoided
              </span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399' }}>
                ₹1,04,75,000
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Protected Orders
              </span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {pendingDecision.affected_orders?.length || 18} Enterprise Orders
              </div>
            </div>
          </div>

          {/* Candidate Options A through F Comparison Grid */}
          {pendingDecision.candidate_actions && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Candidate Strategy Multi-Option Matrix:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                {pendingDecision.candidate_actions.map((act) => (
                  <div
                    key={act.option_id}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '6px',
                      backgroundColor: act.is_recommended ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-elevated)',
                      border: act.is_recommended ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: act.is_recommended ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                        {act.option_id} {act.is_recommended && '★ RECOMMENDED'}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        Cost: ₹{(act.cost_inr / 100000).toFixed(1)}L
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {act.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Delay: +{act.estimated_delay_hours}h | Risk: {act.risk_score}/100
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Decision Buttons */}
          {pendingDecision.approval_status === 'PENDING' ? (
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setRejectionModalId(pendingDecision.id)}
                disabled={processingId === pendingDecision.id}
                className="btn btn-secondary"
                style={{ borderColor: 'rgba(244,63,94,0.4)', color: '#fb7185' }}
              >
                <XCircle size={16} />
                <span>Reject & Request Alternative</span>
              </button>

              <button
                onClick={() => handleApprove(pendingDecision.id)}
                disabled={processingId === pendingDecision.id}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.6rem', fontSize: '0.9rem' }}
              >
                <CheckCircle2 size={18} />
                <span>Authorize & Dispatch Recovery Action</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
              <CheckCircle2 size={18} />
              <span>
                Authorized & Dispatched by {pendingDecision.approved_by_name || 'Supply Chain Manager'}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No decisions pending approval. All supply chain operations are running nominally.
        </div>
      )}

      {/* History of Past Decisions */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Historical Decision Audit Trail</h3>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Decision ID</th>
              <th>Summary</th>
              <th>Cost (₹)</th>
              <th>Delay (hrs)</th>
              <th>Approval</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {decisions.map((dec) => (
              <tr key={dec.id}>
                <td style={{ fontSize: '0.78rem' }}>{new Date(dec.created_at).toLocaleTimeString()}</td>
                <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{dec.id}</td>
                <td style={{ maxWidth: '340px' }}>{dec.selected_action_title}</td>
                <td>₹{(dec.estimated_cost_inr || 0).toLocaleString('en-IN')}</td>
                <td>+{dec.estimated_delay_hours}h</td>
                <td>
                  <span className={dec.approval_status === 'APPROVED' ? 'badge badge-success' : dec.approval_status === 'PENDING' ? 'badge badge-warning' : 'badge badge-critical'}>
                    {dec.approval_status}
                  </span>
                </td>
                <td>
                  <span className={dec.execution_status === 'COMPLETED' ? 'badge badge-success' : 'badge badge-info'}>
                    {dec.execution_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rejection Modal */}
      {rejectionModalId && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Decline AI Recommendation</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Please state why this recommendation was declined. This feedback is ingested by the Guardian learning engine.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Budget ceiling exceeded / Alternative vendor negotiation in progress..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                borderRadius: '8px',
                padding: '0.75rem',
                fontSize: '0.85rem',
                outline: 'none',
                marginBottom: '1rem',
              }}
            />
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setRejectionModalId(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleReject} className="btn btn-danger">
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
