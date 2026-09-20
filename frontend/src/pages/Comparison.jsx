import React, { useState, useEffect } from 'react';
import { Scale, Play, RefreshCw, AlertTriangle, CheckCircle2, FileText, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../services/api';
import MetricCard from '../components/MetricCard';

export default function Comparison() {
  const [workloadType, setWorkloadType] = useState('Locality');
  const [refCount, setRefCount] = useState(1000);
  const [seed, setSeed] = useState(42);
  const [pageSize, setPageSize] = useState(1024);
  const [replacementAlgo, setReplacementAlgo] = useState('LRU');
  const [enableTlb, setEnableTlb] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    handleRunComparison();
  }, []);

  const handleRunComparison = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await api.runComparison({
        virtual_address_space: 65536,
        physical_memory_size: 32768,
        page_size: Number(pageSize),
        reference_count: Number(refCount),
        workload_type: workloadType,
        seed: Number(seed),
        replacement_algorithm: replacementAlgo,
        enable_tlb: enableTlb,
        tlb_size: 4
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Head-to-head comparison failed');
    } finally {
      setLoading(false);
    }
  };

  const paging = result?.paging?.metrics || {};
  const seg = result?.segmentation?.metrics || {};
  const comp = result?.comparison || {};

  // Chart dataset for translation costs
  const costChartData = [
    {
      metric: 'Avg Cost (units/ref)',
      Paging: paging.avg_cost || 0,
      Segmentation: seg.avg_cost || 0,
    },
    {
      metric: 'Fault Rate (%)',
      Paging: paging.page_fault_rate ? Number((paging.page_fault_rate * 100).toFixed(1)) : 0,
      Segmentation: seg.fault_rate ? Number((seg.fault_rate * 100).toFixed(1)) : 0,
    }
  ];

  // Chart dataset for memory fragmentation & utilization
  const memoryChartData = [
    {
      metric: 'Utilization (%)',
      Paging: paging.memory_utilization_pct || 0,
      Segmentation: seg.memory_utilization_pct || 0,
    },
    {
      metric: 'External Frag (KB)',
      Paging: 0,
      Segmentation: seg.external_fragmentation_bytes ? Math.round(seg.external_fragmentation_bytes / 1024) : 0,
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Paging vs Segmentation: Head-to-Head Comparison</h1>
            <p className="page-description">
              Experimental comparison of address-translation overhead and fragmentation using the <strong>EXACT SAME WORKLOAD</strong>.
            </p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={handleRunComparison}
            disabled={loading}
          >
            {loading ? <RefreshCw size={16} className="spin" /> : <Play size={16} />}
            {loading ? 'Running Experiment...' : 'Run Head-to-Head Comparison'}
          </button>
        </div>
      </div>

      {/* Verification principle alert */}
      <div className="alert alert-info">
        <Info size={18} />
        <div>
          <strong>Strict Experimental Principle:</strong> Both Paging and Segmentation receive the exact same sequence of {refCount} memory references generated from Seed #{seed} under the {workloadType} pattern.
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertTriangle size={18} />
          <div>{error}</div>
        </div>
      )}

      {/* Controls Bar */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <form onSubmit={handleRunComparison}>
          <div className="grid-4">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Workload Pattern</label>
              <select 
                className="form-select"
                value={workloadType}
                onChange={(e) => setWorkloadType(e.target.value)}
              >
                <option value="Locality">Locality (80/20)</option>
                <option value="Sequential">Sequential</option>
                <option value="Random">Random</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Reference Count</label>
              <input 
                type="number"
                className="form-input"
                value={refCount}
                onChange={(e) => setRefCount(e.target.value)}
                min="100"
                max="5000"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Page Size (Bytes)</label>
              <select 
                className="form-select"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <option value={512}>512 B</option>
                <option value={1024}>1024 B (1 KB)</option>
                <option value={2048}>2048 B (2 KB)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Replacement Algorithm</label>
              <select 
                className="form-select"
                value={replacementAlgo}
                onChange={(e) => setReplacementAlgo(e.target.value)}
              >
                <option value="LRU">LRU</option>
                <option value="FIFO">FIFO</option>
                <option value="Optimal">Optimal</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Summary Interpretation Box */}
      {comp.interpretation && (
        <div className="card" style={{ background: '#f8fafc', borderLeft: '4px solid #2563eb', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.35rem' }}>
            <FileText size={18} color="#2563eb" /> Experimental Finding &amp; Interpretation
          </div>
          <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
            {comp.interpretation}
          </p>
        </div>
      )}

      {/* Side-by-Side Metrics Table */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-header">
          <div className="card-title">
            <Scale size={18} /> Side-by-Side Metric Comparison Table
          </div>
          <span className="badge badge-blue mono">Identical {paging.total_references || refCount} References</span>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Evaluation Metric</th>
                <th style={{ color: '#2563eb' }}>Paging Simulator</th>
                <th style={{ color: '#059669' }}>Segmentation Simulator</th>
                <th>Architectural Reason / Viva Explanation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Total Simulated Cost</strong></td>
                <td className="mono" style={{ fontWeight: 600, color: comp?.cost_comparison?.winner === 'Paging' ? '#059669' : '#0f172a' }}>
                  {paging.total_cost ?? 0} units
                </td>
                <td className="mono" style={{ fontWeight: 600, color: comp?.cost_comparison?.winner === 'Segmentation' ? '#059669' : '#0f172a' }}>
                  {seg.total_cost ?? 0} units
                </td>
                <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Paging benefits from TLB cache hits (0.2 units) but pays 50 units on page faults. Segmentation pays 2.0 units per valid access (table lookup + bounds check).
                </td>
              </tr>
              <tr>
                <td><strong>Average Cost per Reference</strong></td>
                <td className="mono">{paging.avg_cost ?? 0} units/ref</td>
                <td className="mono">{seg.avg_cost ?? 0} units/ref</td>
                <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Normalized overhead per memory instruction executed by the CPU.
                </td>
              </tr>
              <tr>
                <td><strong>Faults Incurred</strong></td>
                <td className="mono">
                  <span className="badge badge-amber">{paging.page_faults ?? 0} Page Faults</span>
                  <span style={{ fontSize: '0.75rem', marginLeft: '6px', color: '#64748b' }}>
                    ({((paging.page_fault_rate || 0) * 100).toFixed(1)}%)
                  </span>
                </td>
                <td className="mono">
                  <span className="badge badge-red">{seg.segmentation_faults ?? 0} Seg Faults</span>
                  <span style={{ fontSize: '0.75rem', marginLeft: '6px', color: '#64748b' }}>
                    ({((seg.fault_rate || 0) * 100).toFixed(1)}%)
                  </span>
                </td>
                <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Paging faults trigger demand paging (bringing page from disk). Segmentation faults indicate illegal bounds access (offset &ge; limit) causing program termination.
                </td>
              </tr>
              <tr>
                <td><strong>External Fragmentation</strong></td>
                <td className="mono" style={{ color: '#059669', fontWeight: 600 }}>0 Bytes</td>
                <td className="mono" style={{ color: '#d97706', fontWeight: 600 }}>{seg.external_fragmentation_bytes ?? 0} Bytes</td>
                <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Paging completely eliminates external fragmentation because pages/frames are uniform. Segmentation suffers from free memory holes between variable-sized segments.
                </td>
              </tr>
              <tr>
                <td><strong>Internal Fragmentation</strong></td>
                <td className="mono">{paging.internal_fragmentation_bytes ?? 0} Bytes</td>
                <td className="mono" style={{ color: '#059669', fontWeight: 600 }}>0 Bytes</td>
                <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Segmentation has zero internal fragmentation since segments fit exact process needs. Paging can lose up to half a page size per allocated boundary.
                </td>
              </tr>
              <tr>
                <td><strong>Memory Utilization</strong></td>
                <td className="mono">{paging.memory_utilization_pct ?? 0}%</td>
                <td className="mono">{seg.memory_utilization_pct ?? 0}%</td>
                <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Percentage of physical RAM (32 KB) actively holding process data.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Charts */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              Translation Cost &amp; Fault Rate Comparison
            </div>
          </div>
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
                <Legend />
                <Bar dataKey="Paging" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Segmentation" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">
              Memory Utilization &amp; Fragmentation Comparison
            </div>
          </div>
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memoryChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
                <Legend />
                <Bar dataKey="Paging" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Segmentation" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
