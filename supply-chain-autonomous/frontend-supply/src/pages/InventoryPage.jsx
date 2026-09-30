import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Search,
  Filter,
  PlusCircle,
} from 'lucide-react';
import { inventoryApi } from '../services/api';
import { useDisruption } from '../context/DisruptionContext';
import { subscribeToTable } from '../services/supabaseRealtime';

export const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [adjustModalItem, setAdjustModalItem] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const { showToast } = useDisruption();

  useEffect(() => {
    loadInventory();

    // Subscribe to inventory UPDATE events in real time
    const unsubscribe = subscribeToTable({
      table: 'inventory',
      channelName: 'realtime-page-inventory-table',
      event: 'UPDATE',
      onUpdate: (updatedItem) => {
        console.log('⚡ [InventoryPage Realtime UPDATE]:', updatedItem);
        setInventory((prev) =>
          prev.map((item) => (item.id === updatedItem.id ? { ...item, ...updatedItem } : item))
        );
      },
    });

    return () => {
      unsubscribe();
    };
  }, [filterStatus]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== 'ALL') params.status = filterStatus;
      const res = await inventoryApi.getAll(params);
      if (res.data?.success) {
        setInventory(res.data.data);
        setSummary(res.data.summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async () => {
    if (!adjustModalItem || !adjustQty) return;
    try {
      const res = await inventoryApi.adjustStock(adjustModalItem.id, {
        adjustmentQuantity: Number(adjustQty),
        reason: 'Manual cycle recount',
      });
      if (res.data?.success) {
        showToast({
          title: 'Stock Updated',
          message: `${adjustModalItem.product_name} stock adjusted successfully.`,
          type: 'success',
        });
        setAdjustModalItem(null);
        setAdjustQty('');
        loadInventory();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = inventory.filter((item) =>
    item.product_name.toLowerCase().includes(search.toLowerCase()) ||
    item.product_sku.toLowerCase().includes(search.toLowerCase()) ||
    item.warehouse_city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Boxes size={24} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.4rem' }}>Inventory Intelligence & Stockout Risk</h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Real-time buffer visibility, safety thresholds, and predictive runout curves across 5 national warehouses.
          </p>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search SKU or warehouse..."
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

      {/* Summary KPI Cards */}
      {summary && (
        <div className="kpi-grid">
          <div className="glass-panel kpi-card" onClick={() => setFilterStatus('ALL')} style={{ cursor: 'pointer' }}>
            <div className="kpi-header">
              <span className="kpi-title">Tracked SKUs</span>
              <Boxes size={18} color="var(--accent-cyan)" />
            </div>
            <div className="kpi-value">{summary.totalItems}</div>
            <div className="kpi-footer">Across all depots</div>
          </div>

          <div className="glass-panel kpi-card" onClick={() => setFilterStatus('SAFE')} style={{ cursor: 'pointer' }}>
            <div className="kpi-header">
              <span className="kpi-title">Safe Stock</span>
              <CheckCircle2 size={18} color="var(--accent-emerald)" />
            </div>
            <div className="kpi-value" style={{ color: '#34d399' }}>{summary.safe}</div>
            <div className="kpi-footer">&gt;15 days supply</div>
          </div>

          <div className="glass-panel kpi-card" onClick={() => setFilterStatus('WATCH')} style={{ cursor: 'pointer' }}>
            <div className="kpi-header">
              <span className="kpi-title">Watch List</span>
              <Clock size={18} color="#f59e0b" />
            </div>
            <div className="kpi-value" style={{ color: '#fbbf24' }}>{summary.watch}</div>
            <div className="kpi-footer">7 - 14 days supply</div>
          </div>

          <div className="glass-panel kpi-card" onClick={() => setFilterStatus('STOCKOUT_RISK')} style={{ cursor: 'pointer', borderColor: summary.stockoutRisk > 0 ? 'rgba(244, 63, 94, 0.4)' : undefined }}>
            <div className="kpi-header">
              <span className="kpi-title">Stockout Critical</span>
              <AlertTriangle size={18} color="#f43f5e" />
            </div>
            <div className="kpi-value" style={{ color: '#fb7185' }}>{summary.stockoutRisk}</div>
            <div className="kpi-footer">&lt;3 days stock remaining</div>
          </div>
        </div>
      )}

      {/* Inventory Table (Prompt Section 16) */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>SKU / Product</th>
              <th>Warehouse Depot</th>
              <th>Current Stock</th>
              <th>Reserved</th>
              <th>Available</th>
              <th>Daily Burn</th>
              <th>Days Supply</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const isStockout = item.status === 'STOCKOUT_RISK';
              const isAtRisk = item.status === 'AT_RISK';
              const isWatch = item.status === 'WATCH';

              return (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.product_name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.product_sku}</div>
                  </td>
                  <td>
                    <div>{item.warehouse_name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.warehouse_city}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{item.current_stock.toLocaleString()}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{item.reserved_stock.toLocaleString()}</td>
                  <td style={{ fontWeight: 700, color: item.available_stock > 0 ? 'var(--text-primary)' : '#fb7185' }}>
                    {item.available_stock.toLocaleString()}
                  </td>
                  <td>{item.daily_demand_rate}/day</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: isStockout ? '#f43f5e' : isAtRisk ? '#f97316' : isWatch ? '#f59e0b' : '#10b981' }}>
                        {item.days_of_supply}d
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={
                        isStockout
                          ? 'badge badge-critical'
                          : isAtRisk
                          ? 'badge badge-warning'
                          : isWatch
                          ? 'badge badge-warning'
                          : 'badge badge-success'
                      }
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => setAdjustModalItem(item)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem' }}
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Adjust Stock Modal */}
      {adjustModalItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>Cycle Count Stock Adjustment</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Adjust inventory for SKU <b>{adjustModalItem.product_sku}</b> at {adjustModalItem.warehouse_name}.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Quantity Adjustment (+ or -)
              </label>
              <input
                type="number"
                placeholder="e.g. +250 or -50"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  borderRadius: '6px',
                  padding: '0.6rem 0.85rem',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setAdjustModalItem(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleAdjustStock} className="btn btn-primary">
                Save Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
