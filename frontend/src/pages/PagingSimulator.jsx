import React, { useState, useEffect } from 'react';
import { Cpu, Play, RefreshCw, AlertTriangle, CheckCircle2, History } from 'lucide-react';
import api from '../services/api';
import MetricCard from '../components/MetricCard';
import PageFrameVisualizer from '../components/Visualizations/PageFrameVisualizer';

export default function PagingSimulator() {
  const [pageSize, setPageSize] = useState(1024);
  const [replacementAlgo, setReplacementAlgo] = useState('LRU');
  const [enableTlb, setEnableTlb] = useState(true);
  const [tlbSize, setTlbSize] = useState(4);
  const [workloadType, setWorkloadType] = useState('Locality');
  const [refCount, setRefCount] = useState(500);
  const [seed, setSeed] = useState(42);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [simulationData, setSimulationData] = useState(null);

  // Auto-run baseline simulation on mount
  useEffect(() => {
    handleRunSimulation();
  }, []);

  const handleRunSimulation = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await api.simulatePaging({
        virtual_address_space: 65536,
        physical_memory_size: 32768,
        page_size: Number(pageSize),
        replacement_algorithm: replacementAlgo,
        enable_tlb: enableTlb,
        tlb_size: Number(tlbSize),
        workload_type: workloadType,
        reference_count: Number(refCount),
        seed: Number(seed)
      });
      setSimulationData(data);
    } catch (err) {
      setError(err.message || 'Paging simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const metrics = simulationData?.metrics || {};

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Paging Simulator</h1>
            <p className="page-description">
              Simulate fixed-size page-to-frame mapping, page faults, and replacement policies (FIFO, LRU, Optimal).
            </p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={handleRunSimulation}
            disabled={loading}
          >
            {loading ? <RefreshCw size={16} className="spin" /> : <Play size={16} />}
            {loading ? 'Simulating...' : 'Run Paging Simulation'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertTriangle size={18} />
          <div>{error}</div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
        <MetricCard 
          label="Page Faults" 
          value={metrics.page_faults ?? '-'} 
          detail={`Fault Rate: ${metrics.page_fault_rate ? (metrics.page_fault_rate * 100).toFixed(1) : 0}%`}
          badge={`${metrics.total_references || 0} Refs`}
          badgeType="amber"
        />
        <MetricCard 
          label="Simulated Cost" 
          value={metrics.total_cost ? `${metrics.total_cost} u` : '-'} 
          detail={`Avg Cost: ${metrics.avg_cost ?? 0} units/ref`}
          badge="Cost Model"
          badgeType="blue"
        />
        <MetricCard 
          label="TLB Hit Rate" 
          value={metrics.tlb_hit_rate ? `${(metrics.tlb_hit_rate * 100).toFixed(1)}%` : '0%'} 
          detail={`${metrics.tlb_hits ?? 0} hits out of ${metrics.valid_accesses ?? 0}`}
          badge={enableTlb ? 'TLB On' : 'TLB Off'}
          badgeType={enableTlb ? 'green' : 'amber'}
        />
        <MetricCard 
          label="Internal Frag." 
          value={`${metrics.internal_fragmentation_bytes ?? 0} B`} 
          detail="External Frag: 0 Bytes" 
          badge="No Ext Frag"
          badgeType="green"
        />
      </div>

      <div className="grid-2">
        {/* Simulation Configuration Form */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Cpu size={18} /> Simulator Parameters
            </div>
          </div>

          <form onSubmit={handleRunSimulation}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Replacement Algorithm</label>
                <select 
                  className="form-select"
                  value={replacementAlgo}
                  onChange={(e) => setReplacementAlgo(e.target.value)}
                >
                  <option value="LRU">Least Recently Used (LRU)</option>
                  <option value="FIFO">First-In First-Out (FIFO)</option>
                  <option value="Optimal">Optimal (Belady's Lookahead)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Page Size (Bytes)</label>
                <select 
                  className="form-select"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  <option value={512}>512 Bytes (64 Frames)</option>
                  <option value={1024}>1024 Bytes (32 Frames)</option>
                  <option value={2048}>2048 Bytes (16 Frames)</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Workload Pattern</label>
                <select 
                  className="form-select"
                  value={workloadType}
                  onChange={(e) => setWorkloadType(e.target.value)}
                >
                  <option value="Locality">Locality (80/20 Rule)</option>
                  <option value="Sequential">Sequential Scan</option>
                  <option value="Random">Pure Random</option>
                  <option value="Mixed">Mixed Loop + Noise</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Reference Count</label>
                <input 
                  type="number"
                  className="form-input"
                  value={refCount}
                  onChange={(e) => setRefCount(e.target.value)}
                  min="50"
                  max="5000"
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Random Seed</label>
                <input 
                  type="number"
                  className="form-input"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">TLB Cache Slots</label>
                <input 
                  type="number"
                  className="form-input"
                  value={tlbSize}
                  onChange={(e) => setTlbSize(e.target.value)}
                  min="1"
                  max="16"
                  disabled={!enableTlb}
                />
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="checkbox"
                id="enable-tlb-page"
                checked={enableTlb}
                onChange={(e) => setEnableTlb(e.target.checked)}
              />
              <label htmlFor="enable-tlb-page" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                Enable Translation Lookaside Buffer (TLB) (0.2 cost unit hit)
              </label>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              <Play size={16} /> Run Paging Simulation
            </button>
          </form>
        </div>

        {/* Memory Visualizer */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              Physical Memory &amp; Page Table State
            </div>
          </div>

          <PageFrameVisualizer simulationData={simulationData} />
        </div>
      </div>

      {/* Reference History Log */}
      {simulationData?.history && simulationData.history.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <History size={18} /> Step-by-Step Reference Stream Log (First 50 References)
            </div>
          </div>
          <div className="table-wrapper" style={{ maxHeight: '280px' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Step #</th>
                  <th>Virtual Address</th>
                  <th>Page #</th>
                  <th>Offset</th>
                  <th>Frame #</th>
                  <th>TLB Hit?</th>
                  <th>Page Fault?</th>
                  <th>Evicted Page</th>
                  <th>Cost (Units)</th>
                </tr>
              </thead>
              <tbody>
                {simulationData.history.slice(0, 50).map((h) => (
                  <tr key={h.step}>
                    <td className="mono">{h.step + 1}</td>
                    <td className="mono" style={{ fontWeight: 600 }}>{h.virtual_address}</td>
                    <td className="mono">Page {h.page_number}</td>
                    <td className="mono">{h.offset}</td>
                    <td className="mono">Frame {h.frame_number}</td>
                    <td>
                      {h.tlb_hit ? (
                        <span className="badge badge-green">TLB Hit</span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>-</span>
                      )}
                    </td>
                    <td>
                      {h.page_fault ? (
                        <span className="badge badge-red">FAULT</span>
                      ) : (
                        <span className="badge badge-blue">Hit</span>
                      )}
                    </td>
                    <td className="mono">
                      {h.evicted_page !== null && h.evicted_page !== undefined ? (
                        <span className="badge badge-amber">Page {h.evicted_page}</span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>-</span>
                      )}
                    </td>
                    <td className="mono">{h.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
