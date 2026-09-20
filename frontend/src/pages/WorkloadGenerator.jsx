import React, { useState, useEffect } from 'react';
import { FlaskConical, Play, RefreshCw, AlertTriangle, Copy, Check, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../services/api';
import MetricCard from '../components/MetricCard';

export default function WorkloadGenerator() {
  const [workloadType, setWorkloadType] = useState('Locality');
  const [referenceCount, setReferenceCount] = useState(1000);
  const [addressSpace, setAddressSpace] = useState(65536);
  const [seed, setSeed] = useState(42);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [workloadData, setWorkloadData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    handleGenerate();
  }, []);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await api.generateWorkload({
        workload_type: workloadType,
        reference_count: Number(referenceCount),
        address_space: Number(addressSpace),
        seed: Number(seed)
      });
      setWorkloadData(data);
    } catch (err) {
      setError(err.message || 'Failed to generate workload');
    } finally {
      setLoading(false);
    }
  };

  const copySample = () => {
    if (!workloadData?.preview) return;
    navigator.clipboard.writeText(JSON.stringify(workloadData.preview));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build histogram buckets for chart visualization
  const getHistogramData = () => {
    if (!workloadData?.references) return [];
    const numBuckets = 16;
    const bucketSize = addressSpace / numBuckets;
    const buckets = Array.from({ length: numBuckets }, (_, i) => ({
      range: `${(i * bucketSize) / 1024}K-${((i + 1) * bucketSize) / 1024}K`,
      count: 0
    }));

    for (const addr of workloadData.references) {
      const bIndex = Math.min(Math.floor(addr / bucketSize), numBuckets - 1);
      if (buckets[bIndex]) {
        buckets[bIndex].count += 1;
      }
    }
    return buckets;
  };

  const stats = workloadData?.stats || {};

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Workload Generator</h1>
            <p className="page-description">
              Generate deterministic, reproducible memory reference streams for comparative experiments.
            </p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? <RefreshCw size={16} className="spin" /> : <Play size={16} />}
            {loading ? 'Generating...' : 'Generate Workload'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertTriangle size={18} />
          <div>{error}</div>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
        <MetricCard 
          label="Total References" 
          value={workloadData?.reference_count ?? 0} 
          detail={`Workload: ${workloadData?.workload_type || workloadType}`}
          badge={`Seed: ${seed}`}
          badgeType="blue"
        />
        <MetricCard 
          label="Unique Addresses" 
          value={stats.unique_addresses ?? 0} 
          detail={`Span: [${stats.min_address ?? 0} &ndash; ${stats.max_address ?? 0}]`}
          badge="Entropy"
          badgeType="green"
        />
        <MetricCard 
          label="Unique 1KB Pages" 
          value={stats.unique_pages_1k ?? 0} 
          detail={`Out of ${addressSpace / 1024} total pages`}
          badge="Footprint"
          badgeType="amber"
        />
        <MetricCard 
          label="Reproducibility" 
          value="Deterministic" 
          detail="Identical seed = Identical refs" 
          badge="Rigorous"
          badgeType="green"
        />
      </div>

      <div className="grid-2">
        {/* Controls Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <FlaskConical size={18} /> Workload Configuration
            </div>
          </div>

          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label className="form-label">Access Pattern / Workload Type</label>
              <select 
                className="form-select"
                value={workloadType}
                onChange={(e) => setWorkloadType(e.target.value)}
              >
                <option value="Locality">Locality (80/20 Rule: 80% refs within 20% address space)</option>
                <option value="Sequential">Sequential (Sequential scans with occasional wrap)</option>
                <option value="Random">Uniform Random (Uniform distribution over address space)</option>
                <option value="Mixed">Mixed (Loops + hot set + random noise)</option>
              </select>
              <div className="form-hint">
                {workloadType === 'Locality' && 'Ideal for demonstrating spatial & temporal cache/TLB hits.'}
                {workloadType === 'Sequential' && 'Models streaming data or linear instruction fetch.'}
                {workloadType === 'Random' && 'Stress test for page replacement policies and miss rates.'}
                {workloadType === 'Mixed' && 'Realistic hybrid simulation mimicking real desktop applications.'}
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Reference Count</label>
                <input 
                  type="number"
                  className="form-input"
                  value={referenceCount}
                  onChange={(e) => setReferenceCount(e.target.value)}
                  min="50"
                  max="10000"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Address Space (Bytes)</label>
                <input 
                  type="number"
                  className="form-input"
                  value={addressSpace}
                  onChange={(e) => setAddressSpace(e.target.value)}
                  min="1024"
                  step="1024"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Random Seed</label>
              <input 
                type="number"
                className="form-input"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                min="0"
              />
              <div className="form-hint">Crucial: Passing the same seed guarantees identical reference strings to both Paging and Segmentation.</div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              <Play size={16} /> Generate Reference Stream
            </button>
          </form>
        </div>

        {/* Distribution Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <BarChart2 size={18} /> Address Space Distribution
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>16 Address Buckets</span>
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getHistogramData()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="range" tick={{ fontSize: 10 }} interval={1} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(val) => [`${val} references`, 'Frequency']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Preview of Generated Reference Stream */}
      {workloadData?.preview && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              Generated References Preview (First {workloadData.preview.length} of {workloadData.reference_count})
            </div>
            <button className="btn btn-outline btn-sm" onClick={copySample}>
              {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy Sample JSON'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', maxHeight: '140px', overflowY: 'auto', padding: '0.5rem', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
            {workloadData.preview.map((ref, idx) => (
              <span key={idx} className="mono" style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.15rem 0.45rem', borderRadius: '3px', fontSize: '0.8rem' }}>
                {ref}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
