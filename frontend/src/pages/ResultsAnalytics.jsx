import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Play, RefreshCw, AlertTriangle, FileSpreadsheet, Check, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import api from '../services/api';
import MetricCard from '../components/MetricCard';

export default function ResultsAnalytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.runComparison({
        virtual_address_space: 65536,
        physical_memory_size: 32768,
        page_size: 1024,
        reference_count: 1000,
        workload_type: 'Locality',
        seed: 42,
        replacement_algorithm: 'LRU',
        enable_tlb: true,
        tlb_size: 4
      });
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load analytical results');
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = () => {
    if (!data) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `OS_Simulation_Results_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const paging = data?.paging?.metrics || {};
  const seg = data?.segmentation?.metrics || {};
  const comp = data?.comparison || {};
  const cfg = data?.config || {};

  const chartData = [
    { name: 'Total Cost (units)', Paging: paging.total_cost || 0, Segmentation: seg.total_cost || 0 },
    { name: 'Avg Cost (x10)', Paging: (paging.avg_cost || 0) * 10, Segmentation: (seg.avg_cost || 0) * 10 },
    { name: 'Faults Incurred', Paging: paging.page_faults || 0, Segmentation: seg.segmentation_faults || 0 },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Results &amp; Analytics</h1>
            <p className="page-description">
              In-depth empirical breakdown, scientific interpretation, and exportable research metrics.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-outline" onClick={fetchResults} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh Analytics
            </button>
            <button className="btn btn-primary" onClick={handleExportJSON} disabled={!data}>
              {downloaded ? <Check size={16} /> : <Download size={16} />}
              {downloaded ? 'Exported' : 'Export JSON Report'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertTriangle size={18} />
          <div>{error}</div>
        </div>
      )}

      {/* 3 Central Research Questions Answers */}
      <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            1. What Did We Run?
          </div>
          <div style={{ fontSize: '0.85rem', color: '#334155' }}>
            A workload of <strong>{cfg.reference_count || 1000} memory references</strong> under the <strong>{cfg.workload_type || 'Locality'}</strong> pattern with Seed <strong>{cfg.seed || 42}</strong>, across a 64 KB virtual address space and 32 KB physical memory.
          </div>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            2. What Happened?
          </div>
          <div style={{ fontSize: '0.85rem', color: '#334155' }}>
            Paging incurred <strong>{paging.page_faults ?? 0} page faults</strong> (TLB hit rate: {((paging.tlb_hit_rate || 0) * 100).toFixed(1)}%). Segmentation encountered <strong>{seg.segmentation_faults ?? 0} bounds faults</strong> with <strong>{seg.external_fragmentation_bytes ?? 0} B</strong> in unallocated holes.
          </div>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            3. What Does This Mean?
          </div>
          <div style={{ fontSize: '0.85rem', color: '#334155' }}>
            Paging traded higher one-time fault penalties for fast TLB translation and zero external fragmentation. Segmentation provided direct base-addition but left disjoint free gaps in physical RAM.
          </div>
        </div>
      </div>

      {/* Analytical Narrative Interpretation */}
      {comp.interpretation && (
        <div className="card" style={{ background: '#f8fafc', borderLeft: '4px solid #059669', marginBottom: '1.25rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.35rem', color: '#065f46' }}>
            Descriptive Scientific Interpretation:
          </div>
          <div style={{ fontSize: '0.85rem', color: '#1e293b', lineHeight: 1.6 }}>
            {comp.interpretation}
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
            * Note: These metrics reflect the configured synthetic workload and cost model parameters. In real operating systems, performance varies dynamically based on hardware MMU caches, OS disk swap latency, and process working set dynamics.
          </div>
        </div>
      )}

      {/* Analytical Chart & Summary Table */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <BarChart3 size={18} /> Performance Metrics Comparison
            </div>
          </div>
          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
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
              Detailed Metric Matrix
            </div>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Metric Name</th>
                  <th>Paging</th>
                  <th>Segmentation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total References Evaluated</td>
                  <td className="mono">{paging.total_references ?? 0}</td>
                  <td className="mono">{seg.total_references ?? 0}</td>
                </tr>
                <tr>
                  <td>Total Translation Cost (units)</td>
                  <td className="mono">{paging.total_cost ?? 0}</td>
                  <td className="mono">{seg.total_cost ?? 0}</td>
                </tr>
                <tr>
                  <td>Average Cost per Reference</td>
                  <td className="mono">{paging.avg_cost ?? 0}</td>
                  <td className="mono">{seg.avg_cost ?? 0}</td>
                </tr>
                <tr>
                  <td>Fault Count</td>
                  <td className="mono">{paging.page_faults ?? 0} Page Faults</td>
                  <td className="mono">{seg.segmentation_faults ?? 0} Seg Faults</td>
                </tr>
                <tr>
                  <td>Fault Rate (%)</td>
                  <td className="mono">{((paging.page_fault_rate || 0) * 100).toFixed(2)}%</td>
                  <td className="mono">{((seg.fault_rate || 0) * 100).toFixed(2)}%</td>
                </tr>
                <tr>
                  <td>External Fragmentation</td>
                  <td className="mono" style={{ color: '#059669' }}>0 Bytes</td>
                  <td className="mono" style={{ color: '#d97706' }}>{seg.external_fragmentation_bytes ?? 0} Bytes</td>
                </tr>
                <tr>
                  <td>Memory Utilization</td>
                  <td className="mono">{paging.memory_utilization_pct ?? 0}%</td>
                  <td className="mono">{seg.memory_utilization_pct ?? 0}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
