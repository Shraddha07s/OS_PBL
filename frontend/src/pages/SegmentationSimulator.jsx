import React, { useState, useEffect } from 'react';
import { Layers, Play, RefreshCw, AlertTriangle, CheckCircle2, History, AlertOctagon } from 'lucide-react';
import api from '../services/api';
import MetricCard from '../components/MetricCard';
import SegmentVisualizer from '../components/Visualizations/SegmentVisualizer';

export default function SegmentationSimulator() {
  const [workloadType, setWorkloadType] = useState('Locality');
  const [refCount, setRefCount] = useState(500);
  const [seed, setSeed] = useState(42);

  // Segment Table definitions
  const [segments, setSegments] = useState([
    { segment_id: 0, name: 'Code', base: 0, limit: 8192, permissions: 'r-x' },
    { segment_id: 1, name: 'Data', base: 8192, limit: 4096, permissions: 'rw-' },
    { segment_id: 2, name: 'Stack', base: 16384, limit: 4096, permissions: 'rw-' },
    { segment_id: 3, name: 'Heap', base: 24576, limit: 6144, permissions: 'rw-' },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [simulationData, setSimulationData] = useState(null);

  useEffect(() => {
    handleRunSimulation();
  }, []);

  const handleRunSimulation = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await api.simulateSegmentation({
        virtual_address_space: 65536,
        physical_memory_size: 32768,
        segments: segments,
        workload_type: workloadType,
        reference_count: Number(refCount),
        seed: Number(seed)
      });
      setSimulationData(data);
    } catch (err) {
      setError(err.message || 'Segmentation simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const updateSegment = (index, field, value) => {
    const updated = [...segments];
    updated[index][field] = field === 'base' || field === 'limit' ? Number(value) : value;
    setSegments(updated);
  };

  const metrics = simulationData?.metrics || {};

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Segmentation Simulator</h1>
            <p className="page-description">
              Simulate logical segment translation, base/limit register checking, and external memory fragmentation.
            </p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={handleRunSimulation}
            disabled={loading}
          >
            {loading ? <RefreshCw size={16} className="spin" /> : <Play size={16} />}
            {loading ? 'Simulating...' : 'Run Segmentation Simulation'}
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
          label="Segmentation Faults" 
          value={metrics.segmentation_faults ?? '-'} 
          detail={`Fault Rate: ${metrics.fault_rate ? (metrics.fault_rate * 100).toFixed(1) : 0}%`}
          badge="Traps"
          badgeType={metrics.segmentation_faults > 0 ? 'red' : 'green'}
        />
        <MetricCard 
          label="External Frag." 
          value={`${metrics.external_fragmentation_bytes ?? 0} B`} 
          detail={`Largest Free Block: ${metrics.largest_free_block ?? 0} B`}
          badge="Free Gaps"
          badgeType="amber"
        />
        <MetricCard 
          label="Memory Utilization" 
          value={`${metrics.memory_utilization_pct ?? 0}%`} 
          detail={`${metrics.allocated_bytes ?? 0}B allocated out of 32KB`}
          badge="RAM In Use"
          badgeType="blue"
        />
        <MetricCard 
          label="Internal Frag." 
          value="0 Bytes" 
          detail="Exact variable allocations" 
          badge="No Int Frag"
          badgeType="green"
        />
      </div>

      <div className="grid-2">
        {/* Segment Table Controls */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Layers size={18} /> Segment Descriptors Table
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Edit Base &amp; Limit</span>
          </div>

          <div className="table-wrapper" style={{ marginBottom: '1rem' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Segment</th>
                  <th>Base (Bytes)</th>
                  <th>Limit (Bytes)</th>
                  <th>Permissions</th>
                </tr>
              </thead>
              <tbody>
                {segments.map((seg, idx) => (
                  <tr key={seg.segment_id}>
                    <td className="mono" style={{ fontWeight: 600 }}>{seg.name}</td>
                    <td>
                      <input 
                        type="number"
                        className="form-input mono"
                        style={{ padding: '0.2rem 0.4rem', width: '90px' }}
                        value={seg.base}
                        onChange={(e) => updateSegment(idx, 'base', e.target.value)}
                        min="0"
                      />
                    </td>
                    <td>
                      <input 
                        type="number"
                        className="form-input mono"
                        style={{ padding: '0.2rem 0.4rem', width: '90px' }}
                        value={seg.limit}
                        onChange={(e) => updateSegment(idx, 'limit', e.target.value)}
                        min="1"
                      />
                    </td>
                    <td>
                      <span className="badge badge-blue mono">{seg.permissions}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form onSubmit={handleRunSimulation}>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Workload Type</label>
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

              <div className="form-group">
                <label className="form-label">References</label>
                <input 
                  type="number"
                  className="form-input"
                  value={refCount}
                  onChange={(e) => setRefCount(e.target.value)}
                  min="50"
                  max="5000"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Seed</label>
                <input 
                  type="number"
                  className="form-input"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  min="0"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              disabled={loading}
            >
              <Play size={16} /> Run Segmentation Simulation
            </button>
          </form>
        </div>

        {/* Physical Segment Layout Visualizer */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              Physical Memory Map &amp; External Fragmentation
            </div>
          </div>

          <SegmentVisualizer simulationData={simulationData} />
        </div>
      </div>

      {/* History Log */}
      {simulationData?.history && simulationData.history.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <History size={18} /> Address Access History &amp; Bounds Validation (First 50 References)
            </div>
          </div>
          <div className="table-wrapper" style={{ maxHeight: '280px' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Step #</th>
                  <th>Logical Address</th>
                  <th>Segment</th>
                  <th>Offset</th>
                  <th>Limit</th>
                  <th>Bounds Check</th>
                  <th>Physical Address</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {simulationData.history.slice(0, 50).map((h) => (
                  <tr key={h.step}>
                    <td className="mono">{h.step + 1}</td>
                    <td className="mono" style={{ fontWeight: 600 }}>{h.logical_address}</td>
                    <td className="mono">{h.segment_name || `Seg #${h.segment_id}`}</td>
                    <td className="mono">{h.offset}</td>
                    <td className="mono">{h.limit}</td>
                    <td>
                      {h.segmentation_fault ? (
                        <span className="badge badge-red">FAULT (Offset &ge; Limit)</span>
                      ) : (
                        <span className="badge badge-green">PASS</span>
                      )}
                    </td>
                    <td className="mono">
                      {h.physical_address !== null ? (
                        <span>{h.physical_address}</span>
                      ) : (
                        <span style={{ color: '#dc2626' }}>Invalid Access</span>
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
