import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Zap,
  Play,
  Send,
  CheckCircle2,
  Clock,
  Sliders,
  Terminal,
  ShieldCheck,
  ChevronRight,
  Cpu,
} from 'lucide-react';
import { agentApi, disruptionsApi, decisionsApi } from '../services/api';
import { useDisruption } from '../context/DisruptionContext';
import { useNavigate } from 'react-router-dom';

const defaultSteps = [
  { step: 1, name: 'Detect Disruption', detail: 'Ingest IoT and telemetry feeds', status: 'COMPLETED', time: '10:42 AM' },
  { step: 2, name: 'Identify Affected Suppliers', detail: 'Map supplier cluster failure (Tata AutoComp Pune)', status: 'COMPLETED', time: '10:43 AM' },
  { step: 3, name: 'Identify Affected Inventory', detail: 'Query regional depots (Bhiwandi, Sriperumbudur)', status: 'COMPLETED', time: '10:43 AM' },
  { step: 4, name: 'Identify Affected Orders', detail: 'Isolate 18 enterprise customer orders with SLA <48h', status: 'COMPLETED', time: '10:44 AM' },
  { step: 5, name: 'Calculate Delivery Impact', detail: 'Average projected delay: 120 hours without action', status: 'COMPLETED', time: '10:44 AM' },
  { step: 6, name: 'Find Alternative Suppliers', detail: 'Discover qualified foundries: Bharat Silicon, Foxconn', status: 'COMPLETED', time: '10:45 AM' },
  { step: 7, name: 'Evaluate Available Options', detail: 'Generate 6 recovery candidate options (A to F)', status: 'COMPLETED', time: '10:45 AM' },
  { step: 8, name: 'Multi-Criteria Weighting', detail: 'Evaluate SLA penalty, expedite fee, reliability index', status: 'COMPLETED', time: '10:46 AM' },
  { step: 9, name: 'Generate Strategy Candidates', detail: 'Draft PO-REC-901 and flight reservation VT-BDA-91', status: 'COMPLETED', time: '10:46 AM' },
  { step: 10, name: 'Select Optimal Action', detail: 'Option B selected with multi-criteria score 94.2/100', status: 'COMPLETED', time: '10:46 AM' },
  { step: 11, name: 'Determine Approval Need', detail: 'Cost (₹18.45L) exceeds ₹5L threshold; approval requested', status: 'COMPLETED', time: '10:47 AM' },
  { step: 12, name: 'Create AI Decision Record', detail: 'Audit record #DEC-01 created with cryptographic hash', status: 'COMPLETED', time: '10:47 AM' },
  { step: 13, name: 'Execute Permitted Actions', detail: 'Awaiting human authorization for purchase order', status: 'IN_PROGRESS', time: '10:48 AM' },
  { step: 14, name: 'Monitor Result', detail: 'Telemetry watchers assigned to Kempegowda & Mumbai hubs', status: 'WAITING', time: 'Pending' },
  { step: 15, name: 'Update Dashboard & Model', detail: 'Real-time telemetry stream listener active', status: 'WAITING', time: 'Pending' },
];

export const AIAgentPage = () => {
  const [steps, setSteps] = useState(defaultSteps);
  const [query, setQuery] = useState('');
  const [commandResponse, setCommandResponse] = useState(null);
  const [isProcessingCommand, setIsProcessingCommand] = useState(false);
  const { currentAgentStep, agentStepLogs, triggerDemoDisruption, isDemoRunning } = useDisruption();
  const navigate = useNavigate();

  useEffect(() => {
    if (agentStepLogs && agentStepLogs.length > 0) {
      setSteps((prev) => {
        const copy = [...prev];
        agentStepLogs.forEach((log) => {
          const idx = copy.findIndex((s) => s.step === log.step);
          if (idx !== -1) {
            copy[idx] = { ...copy[idx], ...log };
          }
        });
        return copy;
      });
    }
  }, [agentStepLogs]);

  const handleSendCommand = async () => {
    if (!query.trim()) return;
    setIsProcessingCommand(true);
    try {
      const res = await agentApi.sendCommand(query);
      if (res.data?.success) {
        setCommandResponse(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessingCommand(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Bot size={24} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.4rem' }}>SupplyChain Guardian - Autonomous Agent Core</h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            The 15-step autonomous agentic workflow: DETECT ➔ UNDERSTAND ➔ PREDICT ➔ SIMULATE ➔ DECIDE ➔ ACT ➔ MONITOR ➔ LEARN
          </p>
        </div>

        <button
          onClick={triggerDemoDisruption}
          disabled={isDemoRunning}
          className="btn btn-demo-trigger"
        >
          <Zap size={16} />
          <span>{isDemoRunning ? 'Executing 15-Step Pipeline...' : 'Run Autonomous Workflow Demo'}</span>
        </button>
      </div>

      {/* Natural Language Command Center (Prompt Section 22) */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="var(--accent-cyan)" />
          <span>Natural Language Operations Command Center</span>
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Interact with SupplyChain Guardian directly. Give instructions like "Tata AutoComp is delayed by 4 days" or ask operational questions.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="e.g. Supplier Tata AutoComp in Pune has informed us of a 5-day shutdown. Evaluate recovery options..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendCommand()}
            style={{
              flex: 1,
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--border-radius-md)',
              padding: '0.75rem 1rem',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
          <button
            onClick={handleSendCommand}
            disabled={isProcessingCommand}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.4rem' }}
          >
            <Send size={16} />
            <span>Execute Copilot</span>
          </button>
        </div>

        {commandResponse && (
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--border-radius-md)',
              backgroundColor: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              animation: 'modalIn 0.3s ease',
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Guardian Autonomous Response:
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {commandResponse.textResponse}
            </p>
          </div>
        )}
      </div>

      {/* 15-STEP AGENTIC WORKFLOW PROGRESSION CONSOLE (Prompt Section 11 & 23) */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem' }}>Autonomous 15-Step Agentic Execution Pipeline</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Auditable sequence executed in real time by SupplyChain Guardian v2.4
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)', fontSize: '0.8rem', fontWeight: 600 }}>
            <span className="pulse-indicator pulse-indicator-green" />
            <span>MCDA Optimization Core Active</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {steps.map((st) => (
            <div
              key={st.step}
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-elevated)',
                borderRadius: '8px',
                border: st.status === 'IN_PROGRESS' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                boxShadow: st.status === 'IN_PROGRESS' ? 'var(--shadow-glow-cyan)' : undefined,
                display: 'flex',
                gap: '0.85rem',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: st.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.2)' : st.status === 'IN_PROGRESS' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.05)',
                  color: st.status === 'COMPLETED' ? '#10b981' : st.status === 'IN_PROGRESS' ? '#06b6d4' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {st.status === 'COMPLETED' ? <CheckCircle2 size={18} /> : st.step}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Step {st.step}: {st.name}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{st.time}</span>
                </div>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {st.detail}
                </p>
                <div style={{ marginTop: '6px' }}>
                  <span
                    className={
                      st.status === 'COMPLETED'
                        ? 'badge badge-success'
                        : st.status === 'IN_PROGRESS'
                        ? 'badge badge-info'
                        : 'badge'
                    }
                    style={{ fontSize: '0.62rem', padding: '0.1rem 0.4rem' }}
                  >
                    {st.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => navigate('/decisions')} className="btn btn-primary">
            <span>Proceed to Decision Authorization</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
