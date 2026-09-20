import React from 'react';
import { Layers, AlertOctagon, HelpCircle } from 'lucide-react';

export default function SegmentVisualizer({ simulationData }) {
  if (!simulationData) {
    return (
      <div className="alert alert-info">
        Run the Segmentation Simulator to view physical segment layout and external fragmentation.
      </div>
    );
  }

  const { memory_layout = {}, segment_table_state = [], metrics = {}, config = {} } = simulationData;
  const totalMem = memory_layout.physical_memory_size || config.physical_memory_size || 32768;
  const allocatedBlocks = memory_layout.allocated_blocks || [];
  const freeHoles = memory_layout.free_holes || [];

  // Combine allocated segments and free holes sorted by start address for visual bar
  const memorySpans = [
    ...allocatedBlocks.map(b => ({ ...b, type: 'allocated' })),
    ...freeHoles.map(h => ({ ...h, type: 'free', name: 'Free Hole' }))
  ].sort((a, b) => a.start - b.start);

  const getSegmentClass = (name = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('code')) return 'code';
    if (lower.includes('data')) return 'data';
    if (lower.includes('stack')) return 'stack';
    if (lower.includes('heap')) return 'heap';
    return 'free-hole';
  };

  return (
    <div>
      {/* Visual Memory Strip */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Physical Memory Map (0 to {totalMem} Bytes)</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Allocated: <strong className="mono">{memory_layout.total_allocated || 0}B</strong> | Free Gaps: <strong className="mono">{memory_layout.total_free || 0}B</strong>
          </span>
        </div>

        <div className="segment-bar-container">
          {memorySpans.map((span, idx) => {
            const widthPct = (span.size / totalMem) * 100;
            const isAlloc = span.type === 'allocated';
            const segClass = isAlloc ? getSegmentClass(span.name) : 'free-hole';

            return (
              <div
                key={idx}
                className={`segment-span ${segClass}`}
                style={{ width: `${Math.max(widthPct, 2)}%` }}
                title={`${span.name} [0x${span.start.toString(16).toUpperCase()} - 0x${span.end.toString(16).toUpperCase()}]: ${span.size} bytes`}
              >
                {widthPct > 8 ? `${span.name} (${span.size}B)` : span.name[0]}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap', fontSize: '0.75rem', color: '#475569' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 10, height: 10, background: '#2563eb', borderRadius: 2 }}></span> Code
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 10, height: 10, background: '#059669', borderRadius: 2 }}></span> Data
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 10, height: 10, background: '#d97706', borderRadius: 2 }}></span> Stack
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 10, height: 10, background: '#7c3aed', borderRadius: 2 }}></span> Heap
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 10, height: 10, background: '#cbd5e1', borderRadius: 2 }}></span> Free Hole (External Frag)
          </span>
        </div>
      </div>

      {/* Segment Table Definition */}
      <div className="table-wrapper" style={{ marginBottom: '1.25rem' }}>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Segment Name</th>
              <th>Base Address</th>
              <th>Limit (Size)</th>
              <th>Physical Span</th>
              <th>Permissions</th>
            </tr>
          </thead>
          <tbody>
            {segment_table_state.map((seg) => (
              <tr key={seg.segment_id}>
                <td className="mono" style={{ fontWeight: 600 }}>{seg.segment_id}</td>
                <td>
                  <span className="mono" style={{ fontWeight: 600 }}>{seg.name}</span>
                </td>
                <td className="mono">{seg.base} (0x{seg.base.toString(16).toUpperCase()})</td>
                <td className="mono">{seg.limit} Bytes</td>
                <td className="mono" style={{ color: '#64748b' }}>
                  {seg.base} &ndash; {seg.base + seg.limit - 1}
                </td>
                <td>
                  <span className="badge badge-blue mono">{seg.permissions}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* External Fragmentation Details */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.85rem 1rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.35rem' }}>
          External Fragmentation Analysis:
        </div>
        <div style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.5 }}>
          Segmentation does not divide physical memory into fixed units. As segments are placed at variable locations,
          free space becomes broken into separate disjoint holes ({memory_layout.free_hole_count || freeHoles.length} free holes detected, total: <strong>{memory_layout.total_free || 0} bytes</strong>).
          Largest contiguous free block is <strong>{memory_layout.largest_free_block || 0} bytes</strong>. Even if total free memory is sufficient, an incoming segment larger than {memory_layout.largest_free_block || 0} bytes cannot be loaded without compaction!
        </div>
      </div>
    </div>
  );
}
