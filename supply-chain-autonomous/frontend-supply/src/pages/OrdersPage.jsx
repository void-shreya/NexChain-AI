import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  Shield,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { ordersApi } from '../services/api';
import { useDisruption } from '../context/DisruptionContext';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const { showToast } = useDisruption();

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await ordersApi.getAll({ filter });
      if (res.data?.success) {
        setOrders(res.data.data);
        setSummary(res.data.summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrder = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleReprioritize = async (priorityLevel) => {
    if (selectedOrders.length === 0) return;
    try {
      const res = await ordersApi.reprioritize({
        orderIds: selectedOrders,
        priorityLevel,
        reason: 'High priority fast-track allocation by Operations Manager',
      });
      if (res.data?.success) {
        showToast({
          title: 'Orders Reprioritized',
          message: `${selectedOrders.length} orders escalated to ${priorityLevel} priority.`,
          type: 'success',
        });
        setSelectedOrders([]);
        loadOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={24} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.4rem' }}>Order Intelligence & SLA Prioritization</h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Real-time delivery commitments, SLA penalties, and customer tier prioritization logic.
          </p>
        </div>

        {/* Priority Batch Actions */}
        {selectedOrders.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-elevated)', padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              {selectedOrders.length} Selected
            </span>
            <button
              onClick={() => handleReprioritize('CRITICAL')}
              className="btn btn-primary"
              style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem' }}
            >
              Elevate to Critical
            </button>
            <button
              onClick={() => handleReprioritize('HIGH')}
              className="btn btn-secondary"
              style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem' }}
            >
              Mark High
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs (Prompt Section 17) */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All Orders' },
          { id: 'at_risk', label: 'At Risk' },
          { id: 'delayed', label: 'Delayed' },
          { id: 'critical', label: 'Critical Priority' },
          { id: 'completed', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--border-radius-full)',
              fontSize: '0.78rem',
              fontWeight: 600,
              border: filter === tab.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
              backgroundColor: filter === tab.id ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-card)',
              color: filter === tab.id ? '#38bdf8' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  checked={selectedOrders.length > 0 && selectedOrders.length === orders.length}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedOrders(orders.map((o) => o.id));
                    else setSelectedOrders([]);
                  }}
                />
              </th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Order Value</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Promised Date</th>
              <th>AI Prioritization Reasoning</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((ord) => {
              const isAtRisk = ord.risk_status === 'HIGH_RISK' || ord.risk_status === 'CRITICAL_DELAY';
              const isCritical = ord.priority === 'CRITICAL';

              return (
                <tr key={ord.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(ord.id)}
                      onChange={() => handleSelectOrder(ord.id)}
                    />
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{ord.order_number}</span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {ord.items?.length || 2} SKUs
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{ord.customer_name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {ord.customer_city} ({ord.customer_tier})
                    </div>
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    ₹{(ord.total_amount_inr || 0).toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span
                      className={isCritical ? 'badge badge-critical' : ord.priority === 'HIGH' ? 'badge badge-warning' : 'badge'}
                    >
                      {ord.priority}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        ord.status === 'DELIVERED'
                          ? 'badge badge-success'
                          : ord.status === 'AT_RISK'
                          ? 'badge badge-critical'
                          : 'badge badge-info'
                      }
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem' }}>
                    <div>{new Date(ord.promised_delivery_date).toLocaleDateString()}</div>
                    {ord.delay_hours > 0 && (
                      <div style={{ color: '#fb7185', fontWeight: 600 }}>+{ord.delay_hours}h delay</div>
                    )}
                  </td>
                  <td style={{ maxWidth: '320px', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                      <Sparkles size={13} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{ord.prioritization_reason}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
