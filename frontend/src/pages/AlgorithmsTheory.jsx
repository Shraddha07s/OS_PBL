import React from 'react';
import { BookOpen, Cpu, Layers, HardDrive, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';

export default function AlgorithmsTheory() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Algorithms &amp; Operating Systems Theory</h1>
        <p className="page-description">
          Core theoretical foundations, mathematical formulas, and viva questions for Memory Management.
        </p>
      </div>

      {/* 1. Address Translation Mathematics */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Cpu size={18} /> 1. Address Translation Mathematics
          </div>
        </div>

        <div className="grid-2">
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', color: '#2563eb', marginBottom: '0.5rem' }}>Paging Translation (Fixed-Size Units)</h3>
            <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.75rem' }}>
              Virtual address space is divided into fixed-size <strong>Pages</strong>, and physical memory into identical <strong>Frames</strong>.
            </p>
            <div className="mono" style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
              <div>Page Number (p) = Virtual Address // Page Size</div>
              <div>Offset (d) = Virtual Address % Page Size</div>
              <div style={{ marginTop: '0.5rem', color: '#2563eb', fontWeight: 600 }}>
                Physical Address = Frame Number &times; Page Size + Offset
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
              Example: Virtual Address 2500 with Page Size 1024 &rarr; <code>p = 2500 // 1024 = 2</code>, <code>d = 2500 % 1024 = 452</code>. If Page 2 maps to Frame 6, Physical Address = 6 &times; 1024 + 452 = 6596.
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', color: '#059669', marginBottom: '0.5rem' }}>Segmentation Translation (Variable-Size Blocks)</h3>
            <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.75rem' }}>
              Logical memory reflects the programmer's view (Code, Data, Stack, Heap). Each segment has a <strong>Base</strong> and <strong>Limit</strong>.
            </p>
            <div className="mono" style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
              <div>if (Offset &lt; Limit):</div>
              <div style={{ color: '#059669', fontWeight: 600, paddingLeft: '1rem' }}>
                Physical Address = Base Address + Offset
              </div>
              <div>else:</div>
              <div style={{ color: '#dc2626', fontWeight: 600, paddingLeft: '1rem' }}>
                Trap: Segmentation Fault (Bounds Violation)
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
              Example: Data segment at Base 8192, Limit 4096. Offset 5000 is &ge; 4096 &rarr; Hardware bounds violation (Segmentation Fault!).
            </div>
          </div>
        </div>
      </div>

      {/* 2. Page Replacement Policies */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Layers size={18} /> 2. Page Replacement Algorithms
          </div>
        </div>

        <div className="grid-3">
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem' }}>
            <h4 style={{ fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.35rem' }}>First-In, First-Out (FIFO)</h4>
            <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.5 }}>
              Evicts the page that has been in physical memory the longest, based on <code>loaded_at</code> timestamp.
            </p>
            <div style={{ marginTop: '0.5rem', fontSize: '0.775rem', color: '#d97706', background: '#fffbeb', padding: '0.4rem', borderRadius: '4px' }}>
              <strong>Belady's Anomaly:</strong> Under FIFO, increasing physical frame count can sometimes paradoxically <em>increase</em> page faults!
            </div>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem' }}>
            <h4 style={{ fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.35rem' }}>Least Recently Used (LRU)</h4>
            <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.5 }}>
              Approximates future behavior using past history. Evicts the page with the oldest <code>last_accessed</code> timestamp.
            </p>
            <div style={{ marginTop: '0.5rem', fontSize: '0.775rem', color: '#059669', background: '#ecfdf5', padding: '0.4rem', borderRadius: '4px' }}>
              <strong>Stack Algorithm:</strong> LRU never suffers from Belady's anomaly because the set of pages in N frames is always a subset of N+1 frames.
            </div>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem' }}>
            <h4 style={{ fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.35rem' }}>Optimal (Belady's Algorithm)</h4>
            <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.5 }}>
              Evicts the page that will not be used for the longest period in future references. Requires clairvoyance (future stream lookahead).
            </p>
            <div style={{ marginTop: '0.5rem', fontSize: '0.775rem', color: '#2563eb', background: '#eff6ff', padding: '0.4rem', borderRadius: '4px' }}>
              <strong>Theoretical Lower Bound:</strong> Serves as an impossible-in-practice benchmark to evaluate real heuristic policies.
            </div>
          </div>
        </div>
      </div>

      {/* 3. Fragmentation & Cost Model */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <HardDrive size={18} /> 3. Internal vs External Fragmentation
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.6 }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <strong>Internal Fragmentation (Paging):</strong> Occurs when process memory requirements do not divide evenly by the page size. Unused bytes reside <em>inside</em> the allocated page. On average, ~half page size is wasted per process allocation.
            </div>
            <div>
              <strong>External Fragmentation (Segmentation):</strong> Occurs when total free memory is sufficient to satisfy a request, but available space is broken into small non-contiguous holes between allocated segments. Requires memory compaction or swapping to remediate.
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Zap size={18} /> 4. Simulated Translation Cost Model
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#334155' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Operation</th>
                  <th>Simulated Cost</th>
                  <th>Rationale</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Memory Access</td>
                  <td className="mono">1.0 unit</td>
                  <td>Baseline bus read/write cycle</td>
                </tr>
                <tr>
                  <td>Page Table Lookup</td>
                  <td className="mono">1.0 unit</td>
                  <td>Single memory lookup of PTE</td>
                </tr>
                <tr>
                  <td>TLB Cache Hit</td>
                  <td className="mono">0.2 unit</td>
                  <td>Fast associative hardware register lookup</td>
                </tr>
                <tr>
                  <td>Segment Table + Bounds</td>
                  <td className="mono">2.0 units</td>
                  <td>Table lookup (1.0) + Comparator check (1.0)</td>
                </tr>
                <tr>
                  <td>Page Fault Handler</td>
                  <td className="mono">50.0 units</td>
                  <td>OS interrupt trap, disk fetch &amp; replacement</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
