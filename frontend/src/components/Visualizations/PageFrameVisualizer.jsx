import React, { useState } from 'react';
import { Cpu, Check, X, RefreshCw, Zap } from 'lucide-react';

export default function PageFrameVisualizer({ simulationData }) {
  const [activeTab, setActiveTab] = useState('frames'); // 'frames' | 'page_table'

  if (!simulationData) {
    return (
      <div className="alert alert-info">
        Run the Paging Simulator to view live physical frame allocations and page table state.
      </div>
    );
  }

  const { frame_table_state = [], page_table_state = [], metrics = {}, config = {} } = simulationData;
  const numFrames = config.num_frames || frame_table_state.length;
  const numPages = config.num_pages || page_table_state.length;

  return (
    <div>
      {/* Top summary stats */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn btn-sm ${activeTab === 'frames' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('frames')}
          >
            Physical Frames ({metrics.allocated_frames || 0}/{numFrames} Allocated)
          </button>
          <button 
            className={`btn btn-sm ${activeTab === 'page_table' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('page_table')}
          >
            Page Table ({numPages} Virtual Pages)
          </button>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Page Size: <strong className="mono">{config.page_size}B</strong> | Physical RAM: <strong className="mono">{config.physical_memory_size}B</strong>
        </div>
      </div>

      {/* Tab 1: Physical Frames Grid */}
      {activeTab === 'frames' && (
        <div>
          <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span>Physical Memory Frame Allocation:</span>
            <span>
              <span className="badge badge-green" style={{ marginRight: '6px' }}>Free: {metrics.free_frames || 0}</span>
              <span className="badge badge-blue">Allocated: {metrics.allocated_frames || 0}</span>
            </span>
          </div>

          <div className="frame-grid">
            {frame_table_state.map((frame) => {
              const isOccupied = !frame.is_free && frame.page_number !== null;
              return (
                <div 
                  key={frame.frame_number} 
                  className={`frame-cell ${isOccupied ? 'occupied' : 'free'}`}
                  title={`Frame #${frame.frame_number}: ${isOccupied ? `Occupied by Page #${frame.page_number}` : 'Free Frame'}`}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>Frame {frame.frame_number}</div>
                  <div style={{ marginTop: '0.2rem', fontSize: '0.75rem' }}>
                    {isOccupied ? (
                      <span className="mono" style={{ color: '#1d4ed8', fontWeight: 600 }}>Page {frame.page_number}</span>
                    ) : (
                      <span style={{ color: '#059669' }}>Free</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Utilization progress bar */}
          <div style={{ marginTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              <span>Memory Utilization:</span>
              <span className="mono" style={{ fontWeight: 600 }}>{metrics.memory_utilization_pct || 0}%</span>
            </div>
            <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${metrics.memory_utilization_pct || 0}%`, 
                  height: '100%', 
                  background: '#2563eb', 
                  transition: 'width 0.3s ease' 
                }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Page Table Mapping */}
      {activeTab === 'page_table' && (
        <div className="table-wrapper" style={{ maxHeight: '380px' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Page #</th>
                <th>Frame #</th>
                <th>Valid Bit</th>
                <th>Referenced</th>
                <th>Modified</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {page_table_state.slice(0, 64).map((entry) => (
                <tr key={entry.page_number}>
                  <td className="mono" style={{ fontWeight: 600 }}>Page {entry.page_number}</td>
                  <td className="mono">
                    {entry.valid && entry.frame_number !== null ? (
                      <span className="badge badge-blue">Frame {entry.frame_number}</span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>-</span>
                    )}
                  </td>
                  <td>
                    {entry.valid ? (
                      <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Check size={14} /> 1 (In Memory)
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <X size={14} /> 0 (Page Fault)
                      </span>
                    )}
                  </td>
                  <td className="mono">{entry.referenced ? '1' : '0'}</td>
                  <td className="mono">{entry.modified ? '1' : '0'}</td>
                  <td>
                    {entry.valid ? (
                      <span className="badge badge-green">Resident</span>
                    ) : (
                      <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>Unmapped</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {page_table_state.length > 64 && (
            <div style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', background: '#f8fafc' }}>
              Showing first 64 pages of {page_table_state.length} total pages.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
