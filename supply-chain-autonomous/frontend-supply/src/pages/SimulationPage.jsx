import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Play,
  TrendingDown,
  Clock,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { simulationApi, suppliersApi, agentApi } from '../services/api';
import { useDisruption } from '../context/DisruptionContext';
import { useNavigate } from 'react-router-dom';

export const SimulationPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [scenarioType, setScenarioType] = useState('SUPPLIER_SHUTDOWN');
  const [selectedSupplierId, setSelectedSupplierId] = useState('sup-01');
  const [delayDays, setDelayDays] = useState(5);
  const [demandSurgePercent, setDemandSurgePercent] = useState(25);
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const { showToast } = useDisruption();
  const navigate = useNavigate();

  useEffect(() => {
    loadSuppliers();
    handleRunSimulation();
  }, []);

  const loadSuppliers = async () => {
    try {
      const res = await suppliersApi.getAll();
      if (res.data?.success) {
        setSuppliers(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const res = await simulationApi.run({
        scenarioType,
        supplierId: selectedSupplierId,
        delayDays: Number(delayDays),
        demandSurgePercent: Number(demandSurgePercent),
      });

      if (res.data?.success) {
        setSimulationResult(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeployOption = async (option) => {
    setIsDeploying(true);
    try {
      showToast({
        title: 'Deploying Strategy',
        message: `Activating ${option.title}...`,
        type: 'info',
      });
      setTimeout(() => {
        setIsDeploying(false);
        navigate('/decisions');
      }, 1000);
    } catch (e) {
      setIsDeploying(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FlaskConical size={22} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.4rem' }}>What-If Disruption Simulation Engine</h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Stress test supply chains against port blockades, supplier shutdowns, and demand shocks. Compare unmitigated outcomes with autonomous recovery.
          </p>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={loading}
          className="btn btn-primary"
          style={{ padding: '0.65rem 1.4rem' }}
        >
          <Play size={16} fill="#ffffff" />
          <span>{loading ? 'Simulating Engine...' : 'Run What-If Simulation'}</span>
        </button>
      </div>

      {/* Simulation Parameter Controls Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={16} color="var(--accent-cyan)" />
          <span>Scenario Modeling Parameters</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {/* Scenario Type */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Disruption Scenario Type
            </label>
            <select
              value={scenarioType}
              onChange={(e) => setScenarioType(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--border-radius-md)',
                outline: 'none',
              }}
            >
              <option value="SUPPLIER_SHUTDOWN">Major Supplier Factory Shutdown</option>
              <option value="PORT_CONGESTION">Port Berth Congestion & Customs Jam</option>
              <option value="TRANSPORTATION_DELAY">Highway Express Corridor Blockade</option>
              <option value="DEMAND_SPIKE">Surge Demand Spike (+25% to +100%)</option>
              <option value="WAREHOUSE_FAILURE">Regional Warehouse Cold-Chain Failure</option>
            </select>
          </div>

          {/* Supplier Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Target Supplier Node
            </label>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--border-radius-md)',
                outline: 'none',
              }}
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.city}) - Tier {s.tier}
                </option>
              ))}
            </select>
          </div>

          {/* Delay Days Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Disruption Duration
              </label>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-rose)' }}>
                {delayDays} Days
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="14"
              value={delayDays}
              onChange={(e) => setDelayDays(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--accent-rose)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              <span>1 Day (Minor)</span>
              <span>7 Days (Severe)</span>
              <span>14 Days (Catastrophic)</span>
            </div>
          </div>

          {/* Demand Surge Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Seasonal Demand Fluctuation
              </label>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                +{demandSurgePercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={demandSurgePercent}
              onChange={(e) => setDemandSurgePercent(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              <span>Baseline (0%)</span>
              <span>+50% Spike</span>
              <span>+100% Extreme</span>
            </div>
          </div>
        </div>
      </div>

      {simulationResult && (
        <>
          {/* DELTA METRICS BAR (Prompt Section 12) */}
          <div
            className="glass-panel"
            style={{
              padding: '1.25rem 1.75rem',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(16, 185, 129, 0.15))',
              borderColor: 'rgba(6, 182, 212, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Delay Reduction
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                -{simulationResult.deltaMetrics.delayReductionPercentage}%
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Saved {simulationResult.deltaMetrics.delayReductionHours}h per shipment
              </span>
            </div>

            <div style={{ width: '1px', height: '50px', backgroundColor: 'var(--border-color)' }} />

            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Orders Protected
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                {simulationResult.deltaMetrics.ordersProtectedCount} Orders
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Zero factory line stoppage
              </span>
            </div>

            <div style={{ width: '1px', height: '50px', backgroundColor: 'var(--border-color)' }} />

            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Net Financial Savings
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>
                ₹{(simulationResult.deltaMetrics.netFinancialSavingsInr / 100000).toFixed(2)} Lakhs
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Penalties and downtime avoided
              </span>
            </div>

            <div style={{ width: '1px', height: '50px', backgroundColor: 'var(--border-color)' }} />

            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Intervention ROI
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {simulationResult.deltaMetrics.roiMultiplier}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Capital recovery multiplier
              </span>
            </div>
          </div>

          {/* SIDE-BY-SIDE COMPARISON: CURRENT SCENARIO VS RECOVERY SCENARIO */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {/* CURRENT SCENARIO (Passive / Inaction) */}
            <div
              className="glass-panel"
              style={{
                padding: '1.5rem',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                background: 'rgba(244, 63, 94, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span className="badge badge-critical">CURRENT SCENARIO (INACTION)</span>
                <AlertTriangle size={18} color="#f43f5e" />
              </div>

              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>Passive Delay Absorption</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Awaiting supplier restart without rerouting or backup vendor allocation
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Average Delivery Delay</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f43f5e' }}>
                    {simulationResult.baselineScenario.averageDelayHours} Hours ({delayDays} Days)
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Customer Orders Impacted</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f43f5e' }}>
                    {simulationResult.baselineScenario.affectedOrdersCount} Orders
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>SLA Breach Penalties</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f43f5e' }}>
                    ₹{(simulationResult.baselineScenario.slaPenaltiesInr / 100000).toFixed(2)} Lakhs
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Inventory Value at Risk</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                    ₹{(simulationResult.baselineScenario.revenueAtRiskInr / 10000000).toFixed(2)} Cr
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Customer Satisfaction Index</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f43f5e' }}>
                    {simulationResult.baselineScenario.customerSatisfactionScore} / 100 (Eroded)
                  </span>
                </div>
              </div>
            </div>

            {/* RECOVERY SCENARIO (Autonomous Response) */}
            <div
              className="glass-panel"
              style={{
                padding: '1.5rem',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                background: 'rgba(16, 185, 129, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span className="badge badge-success">RECOVERY SCENARIO (OPTION B)</span>
                <CheckCircle2 size={18} color="#10b981" />
              </div>

              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>Autonomous Multi-Modal Pivot</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Emergency secondary procurement (Bharat Silicon BLR) + Priority Air Freight Flight BDA-91
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Average Delivery Delay</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399' }}>
                    {simulationResult.recoveryScenario.averageDelayHours} Hours (85% reduction)
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Customer Orders Impacted</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399' }}>
                    0 SLA breaches ({simulationResult.recoveryScenario.affectedOrdersCount} minor buffer delay)
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Direct Recovery Cost</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    ₹{(simulationResult.recoveryScenario.recoveryCostInr / 100000).toFixed(2)} Lakhs
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Residual SLA Penalties</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399' }}>
                    ₹{(simulationResult.recoveryScenario.slaPenaltiesInr / 100000).toFixed(2)} Lakhs (95% avoided)
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Customer Satisfaction Index</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399' }}>
                    {simulationResult.recoveryScenario.customerSatisfactionScore} / 100 (Optimal)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* COMPARATIVE OPTIONS MATRIX (A through F) (Prompt Section 13) */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Autonomous Candidate Recovery Strategies (Options A to F)</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Multi-criteria decision analysis evaluation across costs, customer priority, and delay trade-offs
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {simulationResult.comparativeOptions.map((opt) => (
                <div
                  key={opt.option_id}
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'var(--bg-elevated)',
                    borderRadius: 'var(--border-radius-md)',
                    border: opt.option_id === 'OPTION_B' ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: opt.option_id === 'OPTION_B' ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                        {opt.option_id}
                      </span>
                      {opt.option_id === 'OPTION_B' && (
                        <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>AI RECOMMENDED</span>
                      )}
                    </div>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>{opt.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                      {opt.customer_impact}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.75rem', marginBottom: '1rem' }}>
                      <div><b>Cost:</b> ₹{(opt.cost_inr / 100000).toFixed(2)}L</div>
                      <div><b>Delay:</b> +{opt.delay_hours}h</div>
                      <div><b>Penalty:</b> ₹{(opt.penalty_inr / 100000).toFixed(2)}L</div>
                      <div><b>Risk Score:</b> {opt.risk_score}/100</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeployOption(opt)}
                    disabled={isDeploying}
                    className={opt.option_id === 'OPTION_B' ? 'btn btn-primary' : 'btn btn-secondary'}
                    style={{ width: '100%', fontSize: '0.75rem', padding: '0.45rem' }}
                  >
                    <span>{opt.option_id === 'OPTION_B' ? 'Deploy Recommended Action' : 'Select Option'}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
