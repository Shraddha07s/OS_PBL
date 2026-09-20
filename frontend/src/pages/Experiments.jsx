import React, { useState } from 'react';
import { FlaskConical, Play, RefreshCw, AlertTriangle, CheckCircle2, Sliders, ArrowRight } from 'lucide-react';
import api from '../services/api';
import MetricCard from '../components/MetricCard';

export default function Experiments({ setActivePage }) {
  const [vSpace, setVSpace] = useState(65536);
  const [pMem, setPMem] = useState(32768);
  const [pageSize, setPageSize] = useState(1024);
  const [refCount, setRefCount] = useState(1000);
  const [workloadType, setWorkloadType] = useState('Locality');
  const [seed, setSeed] = useState(42);
  const [algo, setAlgo] = useState('LRU');
  const [enableTlb, setEnableTlb] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [experimentResult, setExperimentResult] = useState(null);

  // Preset experiment sweeps
  const applyPreset = (preset) => {
    if (preset === 'algo-fifo') {
      setAlgo('FIFO');
      setWorkloadType('Locality');
    } else if (preset === 'algo-optimal') {
      setAlgo('Optimal');
      setWorkloadType('Locality');
    } else if (preset === 'page-small') {
      setPageSize(512);
    } else if (preset === 'page-large') {
      setPageSize(2048);
    } else if (preset === 'random-stress') {
      setWorkloadType('Random');
      setRefCount(1500);
    }
  };

  const handleRunExperiment = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await api.runExperiment({
        virtual_address_space: Number(vSpace),
        physical_memory_size: Number(pMem),
        page_size: Number(pageSize),
        reference_count: Number(refCount),
        workload_type: workloadType,
        seed: Number(seed),
        replacement_algorithm: algo,
        enable_tlb: enableTlb,
        tlb_size: 4
      });
      setExperimentResult(data);
    } catch (err) {
      setError(err.message || 'Experiment execution failed');
    } finally {
      setLoading(false);
    }
  };

  const comp = experimentResult?.comparison || {};
  const paging = experimentResult?.paging?.metrics || {};
  const seg = experimentResult?.segmentation?.metrics || {};

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Configurable Experiments</h1>
            <p className="page-description">
              Run controlled simulations across varying memory sizes, page granularities, and replacement algorithms.
            </p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={handleRunExperiment}
            disabled={loading}
          >
            {loading ? <RefreshCw size={16} className="spin" /> : <Play size={16} />}
            {loading ? 'Running Simulation Engine...' : 'RUN EXPERIMENT'}
          </button>
        </div>
      </div>

      {/* Preset Sweep Scenarios */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Quick Experiment Scenarios:</span>
        <button className="btn btn-outline btn-sm" onClick={() => applyPreset('algo-fifo')}>
          FIFO Policy Sweep
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => applyPreset('algo-optimal')}>
          Optimal Lookahead Benchmark
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => applyPreset('page-small')}>
          Fine Page Size (512 B)
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => applyPreset('page-large')}>
          Coarse Page Size (2048 B)
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => applyPreset('random-stress')}>
          Random Access Stress Test
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertTriangle size={18} />
          <div>{error}</div>
        </div>
      )}

      <div className="grid-2">
        {/* Config Form */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Sliders size={18} /> Experiment Parameters
            </div>
          </div>

          <form onSubmit={handleRunExperiment}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Virtual Address Space</label>
                <select 
                  className="form-select"
                  value={vSpace}
                  onChange={(e) => setVSpace(Number(e.target.value))}
                >
                  <option value={32768}>32 KB (32,768 B)</option>
                  <option value={65536}>64 KB (65,536 B - Default)</option>
                  <option value={131072}>128 KB (131,072 B)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Physical Memory (RAM)</label>
                <select 
                  className="form-select"
                  value={pMem}
                  onChange={(e) => setPMem(Number(e.target.value))}
                >
                  <option value={16384}>16 KB (16,384 B)</option>
                  <option value={32768}>32 KB (32,768 B - Default)</option>
                  <option value={65536}>64 KB (65,536 B)</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Page Size</label>
                <select 
                  className="form-select"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  <option value={512}>512 Bytes</option>
                  <option value={1024}>1024 Bytes (1 KB)</option>
                  <option value={2048}>2048 Bytes (2 KB)</option>
                  <option value={4096}>4096 Bytes (4 KB)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Replacement Algorithm</label>
                <select 
                  className="form-select"
                  value={algo}
                  onChange={(e) => setAlgo(e.target.value)}
                >
                  <option value="LRU">LRU (Least Recently Used)</option>
                  <option value="FIFO">FIFO (First-In First-Out)</option>
                  <option value="Optimal">Optimal (Belady's Algorithm)</option>
                </select>
              </div>
            </div>

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
                  min="100"
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

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="checkbox"
                id="exp-tlb"
                checked={enableTlb}
                onChange={(e) => setEnableTlb(e.target.checked)}
              />
              <label htmlFor="exp-tlb" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                Enable 4-entry TLB fast lookup cache
              </label>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              <Play size={16} /> RUN EXPERIMENT
            </button>
          </form>
        </div>

        {/* Experiment Results Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              Experiment Execution Summary
            </div>
            {experimentResult && (
              <span className="badge badge-green mono">{experimentResult.experiment_id}</span>
            )}
          </div>

          {experimentResult ? (
            <div>
              <div className="grid-2" style={{ marginBottom: '1rem' }}>
                <MetricCard 
                  label="Paging Cost" 
                  value={`${paging.total_cost || 0} u`} 
                  detail={`Avg: ${paging.avg_cost || 0} u/ref`}
                />
                <MetricCard 
                  label="Segmentation Cost" 
                  value={`${seg.total_cost || 0} u`} 
                  detail={`Avg: ${seg.avg_cost || 0} u/ref`}
                />
              </div>

              <div className="grid-2" style={{ marginBottom: '1rem' }}>
                <MetricCard 
                  label="Page Faults" 
                  value={paging.page_faults ?? 0} 
                  detail={`Rate: ${((paging.page_fault_rate || 0) * 100).toFixed(1)}%`}
                />
                <MetricCard 
                  label="External Frag" 
                  value={`${seg.external_fragmentation_bytes ?? 0} B`} 
                  detail={`Free Gaps: ${seg.free_bytes ?? 0} B`}
                />
              </div>

              <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>Automated Interpretation:</div>
                <div style={{ fontSize: '0.825rem', color: '#334155', lineHeight: 1.5 }}>
                  {comp.interpretation}
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-info">
              Configure parameters on the left and click <strong>"RUN EXPERIMENT"</strong> to execute the simulation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
