import React, { useState, useEffect } from 'react';
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Activity,
  Search,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { suppliersApi } from '../services/api';

export const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const res = await suppliersApi.getAll();
      if (res.data?.success) {
        setSuppliers(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = suppliers.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.city.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || s.risk_level === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Building2 size={24} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.4rem' }}>Supplier Intelligence & Risk Scoring</h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Real-time evaluation across 12 domestic & global semiconductor, automotive, and electronics suppliers.
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by supplier or city..."
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
              }}
            />
          </div>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '0.82rem',
              outline: 'none',
            }}
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Grid of Supplier Intelligence Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {filtered.map((sup) => {
          const isCritical = sup.risk_level === 'CRITICAL';
          const isHigh = sup.risk_level === 'HIGH';
          const isLow = sup.risk_level === 'LOW';

          return (
            <div
              key={sup.id}
              className="glass-panel"
              style={{
                padding: '1.4rem',
                borderColor: isCritical ? 'rgba(244, 63, 94, 0.4)' : isHigh ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {sup.code} • {sup.tier}
                    </span>
                    <h3 style={{ fontSize: '1.1rem', marginTop: '2px' }}>{sup.name}</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {sup.city}, {sup.state} ({sup.category})
                    </div>
                  </div>

                  <span
                    className={isCritical ? 'badge badge-critical' : isHigh ? 'badge badge-warning' : 'badge badge-success'}
                    style={{ fontSize: '0.68rem' }}
                  >
                    {sup.risk_level} RISK
                  </span>
                </div>

                {/* Measurable Performance Metrics */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.5rem',
                    margin: '1rem 0',
                    backgroundColor: 'var(--bg-elevated)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Reliability</span>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: sup.reliability_score > 90 ? 'var(--accent-emerald)' : '#fb7185' }}>
                      {sup.reliability_score}%
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Avg Lead Time</span>
                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>
                      {sup.avg_lead_time_days} days
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Capacity/Mo</span>
                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>
                      {(sup.capacity_units_per_month / 1000).toFixed(0)}k units
                    </div>
                  </div>
                </div>

                {/* 5-Factor Risk Breakdown Formula Summary (Prompt Section 15) */}
                {sup.risk_factors && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                      Risk Assessment Factors:
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '4px', marginBottom: '6px' }}>
                      <span className="badge" style={{ fontSize: '0.62rem', backgroundColor: 'rgba(255,255,255,0.06)' }}>
                        Delivery: {sup.risk_factors.delivery_risk}%
                      </span>
                      <span className="badge" style={{ fontSize: '0.62rem', backgroundColor: 'rgba(255,255,255,0.06)' }}>
                        Weather: {sup.risk_factors.weather_climate_risk}%
                      </span>
                      <span className="badge" style={{ fontSize: '0.62rem', backgroundColor: 'rgba(255,255,255,0.06)' }}>
                        Capacity: {sup.risk_factors.capacity_constraint_risk}%
                      </span>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {sup.risk_factors.summary}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  {sup.products_supplied_count || 4} Products Supplied
                </span>
                <span style={{ color: isCritical ? '#fb7185' : 'var(--accent-emerald)', fontWeight: 600 }}>
                  ● {sup.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
