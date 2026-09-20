import React from 'react';
import { ArrowDown, CheckCircle2, AlertTriangle, Cpu, HardDrive } from 'lucide-react';

export default function TranslationStepper({ result, mode = 'paging' }) {
  if (!result) {
    return (
      <div className="alert alert-info">
        Enter an address above and click <strong>"Translate Address"</strong> to view the step-by-step translation sequence.
      </div>
    );
  }

  if (result.valid === false && !result.segmentation_fault && result.error) {
    return (
      <div className="alert alert-danger">
        <AlertTriangle size={18} />
        <div>
          <strong>Invalid Address:</strong> {result.error}
        </div>
      </div>
    );
  }

  if (mode === 'paging') {
    return (
      <div className="stepper-container">
        {/* Step 1: Virtual Address Breakdown */}
        <div className="step-card">
          <div className="step-title">Step 1: Virtual Address Decomposition</div>
          <div className="step-content mono">
            Virtual Address: <strong>{result.virtual_address}</strong> (0x{result.virtual_address?.toString(16).toUpperCase()})
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ background: '#f1f5f9', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Formula: <code>Address // Page Size</code></span>
              <div className="mono" style={{ fontWeight: 600 }}>Page Number (p) = {result.page_number}</div>
            </div>
            <div style={{ background: '#f1f5f9', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Formula: <code>Address % Page Size</code></span>
              <div className="mono" style={{ fontWeight: 600 }}>Offset (d) = {result.offset}</div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <ArrowDown size={18} style={{ margin: '0 auto' }} />
        </div>

        {/* Step 2: Page Table / TLB Lookup */}
        <div className={`step-card ${result.page_fault ? 'fault' : 'hit'}`}>
          <div className="step-title">
            Step 2: {result.tlb_hit ? 'TLB Lookup (Hit!)' : (result.page_fault ? 'Page Table Lookup (Page Fault!)' : 'Page Table Lookup (Hit)')}
          </div>
          <div className="step-content">
            {result.tlb_hit ? (
              <span style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={16} /> Page #{result.page_number} found in fast TLB cache &rarr; Frame #{result.frame_number}
              </span>
            ) : result.page_fault ? (
              <span style={{ color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={16} /> Page #{result.page_number} is not currently mapped in physical memory. OS Page Fault Handler invoked (+50 cost units).
              </span>
            ) : (
              <span>
                Page Table Entry #{result.page_number} is Valid &rarr; Mapped to Physical Frame #{result.frame_number}
              </span>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <ArrowDown size={18} style={{ margin: '0 auto' }} />
        </div>

        {/* Step 3: Physical Address Calculation */}
        <div className="step-card">
          <div className="step-title">Step 3: Physical Address Construction</div>
          <div className="step-content mono">
            {result.physical_address !== null ? (
              <>
                <div>Formula: <code>Physical Address = Frame × Page Size + Offset</code></div>
                <div style={{ marginTop: '0.35rem', fontSize: '1.1rem', color: '#2563eb', fontWeight: 700 }}>
                  = {result.frame_number} × {result.page_size} + {result.offset} = {result.physical_address} (0x{result.physical_address?.toString(16).toUpperCase()})
                </div>
              </>
            ) : (
              <div style={{ color: '#dc2626' }}>
                Physical Address cannot be directly formed until frame allocation occurs via Page Fault handling.
              </div>
            )}
          </div>
        </div>

        {/* Step 4: Translation Overhead */}
        <div className="step-card" style={{ background: '#f8fafc', borderLeftColor: '#64748b' }}>
          <div className="step-title">Step 4: Simulated Translation Cost</div>
          <div className="step-content" style={{ fontSize: '0.9rem' }}>
            Total simulated overhead: <strong className="mono">{result.translation_cost} units</strong>
            <span style={{ color: '#64748b', marginLeft: '8px' }}>
              ({result.tlb_hit ? 'TLB check 0.2 + Mem access 1.0' : (result.page_fault ? 'Page table lookup 1.0 + Fault trap 50.0 + Mem access 1.0' : 'Page table lookup 1.0 + Mem access 1.0')})
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Segmentation Stepper
  return (
    <div className="stepper-container">
      {/* Step 1: Logical Address Decomposition */}
      <div className="step-card">
        <div className="step-title">Step 1: Logical Address & Segment Identification</div>
        <div className="step-content mono">
          Logical Address: <strong>{result.logical_address}</strong> &rarr; Segment: <strong>{result.segment_name || `Segment #${result.segment_id}`}</strong> (ID: {result.segment_id})
        </div>
        <div style={{ marginTop: '0.35rem', fontSize: '0.9rem' }}>
          Segment Offset: <span className="mono" style={{ fontWeight: 600 }}>{result.offset}</span> bytes
        </div>
      </div>

      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
        <ArrowDown size={18} style={{ margin: '0 auto' }} />
      </div>

      {/* Step 2: Segment Table Lookup */}
      <div className="step-card">
        <div className="step-title">Step 2: Segment Table Registers Lookup</div>
        <div className="step-content">
          <div className="mono" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>Base Address = <strong>{result.base}</strong></div>
            <div>Limit (Length) = <strong>{result.limit}</strong> bytes</div>
            <div>Permissions = <strong>{result.permissions || 'rw-'}</strong></div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
        <ArrowDown size={18} style={{ margin: '0 auto' }} />
      </div>

      {/* Step 3: Bounds Check */}
      <div className={`step-card ${result.segmentation_fault ? 'fault' : 'hit'}`}>
        <div className="step-title">
          Step 3: Bounds Validation (Offset &lt; Limit)
        </div>
        <div className="step-content">
          {result.segmentation_fault ? (
            <div style={{ color: '#dc2626' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                <AlertTriangle size={18} /> SEGMENTATION FAULT / ILLEGAL ACCESS
              </div>
              <div style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>
                Offset <strong>{result.offset}</strong> is &ge; Segment Limit <strong>{result.limit}</strong>! Access trapped by CPU hardware.
              </div>
            </div>
          ) : (
            <div style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={18} />
              <span>Bounds Check Passed: Offset <strong>{result.offset}</strong> &lt; Limit <strong>{result.limit}</strong></span>
            </div>
          )}
        </div>
      </div>

      {!result.segmentation_fault && (
        <>
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>
            <ArrowDown size={18} style={{ margin: '0 auto' }} />
          </div>

          {/* Step 4: Physical Address Calculation */}
          <div className="step-card">
            <div className="step-title">Step 4: Physical Address Calculation</div>
            <div className="step-content mono">
              <div>Formula: <code>Physical Address = Base + Offset</code></div>
              <div style={{ marginTop: '0.35rem', fontSize: '1.1rem', color: '#2563eb', fontWeight: 700 }}>
                = {result.base} + {result.offset} = {result.physical_address} (0x{result.physical_address?.toString(16).toUpperCase()})
              </div>
            </div>
          </div>
        </>
      )}

      {/* Step 5: Cost */}
      <div className="step-card" style={{ background: '#f8fafc', borderLeftColor: '#64748b' }}>
        <div className="step-title">Step {result.segmentation_fault ? '4' : '5'}: Simulated Translation Cost</div>
        <div className="step-content" style={{ fontSize: '0.9rem' }}>
          Total simulated overhead: <strong className="mono">{result.translation_cost} units</strong>
          <span style={{ color: '#64748b', marginLeft: '8px' }}>
            ({result.segmentation_fault ? 'Segment table lookup 1.0 + Bounds check 1.0 + Fault trap 50.0' : 'Segment table lookup 1.0 + Bounds check 1.0 + Mem access 1.0'})
          </span>
        </div>
      </div>
    </div>
  );
}
