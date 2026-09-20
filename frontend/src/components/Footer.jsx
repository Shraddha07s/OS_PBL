import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div>
          <strong>Operating Systems Course Project</strong> &bull; Memory Management Simulator: Paging vs Segmentation
        </div>
        <div>
          <span>Member 1: OS Core Engine</span> &bull; 
          <span style={{ margin: '0 8px' }}>Member 2: Performance & Experiments</span> &bull; 
          <span>Member 3: API & Application Integration</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          * Address translation costs are measured in <em>Simulated Cost Units</em> (Memory access = 1.0, Page-table lookup = 1.0, Bounds check = 1.0, TLB hit = 0.2, Page-fault trap = 50.0).
        </div>
      </div>
    </footer>
  );
}
