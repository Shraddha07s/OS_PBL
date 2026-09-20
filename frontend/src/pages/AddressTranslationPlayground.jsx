import React, { useState } from 'react';
import { Compass, Play, RefreshCw, AlertTriangle, CheckCircle2, Cpu } from 'lucide-react';
import api from '../services/api';
import TranslationStepper from '../components/Visualizations/TranslationStepper';

export default function AddressTranslationPlayground() {
  const [mode, setMode] = useState('paging'); // 'paging' | 'segmentation'

  // Paging form state
  const [virtualAddress, setVirtualAddress] = useState(2500);
  const [pageSize, setPageSize] = useState(1024);
  const [enableTlb, setEnableTlb] = useState(true);

  // Segmentation form state
  const [logicalAddress, setLogicalAddress] = useState(1000);
  const [useExplicitSegment, setUseExplicitSegment] = useState(false);
  const [segmentId, setSegmentId] = useState(1); // Data
  const [segmentOffset, setSegmentOffset] = useState(5000); // Exceeds 4096 limit to test fault!

  // Shared state
  const [virtualSpace] = useState(65536);
  const [physicalMem] = useState(32768);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleTranslate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'paging') {
        const res = await api.translatePaging({
          virtual_address: Number(virtualAddress),
          virtual_address_space: Number(virtualSpace),
          physical_memory_size: Number(physicalMem),
          page_size: Number(pageSize),
          enable_tlb: enableTlb
        });
        setResult(res);
      } else {
        const payload = {
          logical_address: Number(logicalAddress),
          virtual_address_space: Number(virtualSpace),
          physical_memory_size: Number(physicalMem)
        };
        if (useExplicitSegment) {
          payload.segment_id = Number(segmentId);
          payload.offset = Number(segmentOffset);
        }
        const res = await api.translateSegmentation(payload);
        setResult(res);
      }
    } catch (err) {
      setError(err.message || 'Translation failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Preset triggers for quick demonstrations
  const loadPreset = (presetType) => {
    if (presetType === 'paging-baseline') {
      setMode('paging');
      setVirtualAddress(2500);
      setPageSize(1024);
    } else if (presetType === 'segmentation-valid') {
      setMode('segmentation');
      setUseExplicitSegment(true);
      setSegmentId(0); // Code (limit 8192)
      setSegmentOffset(1200);
    } else if (presetType === 'segmentation-fault') {
      setMode('segmentation');
      setUseExplicitSegment(true);
      setSegmentId(1); // Data (limit 4096)
      setSegmentOffset(5000); // Fault!
    } else if (presetType === 'paging-page-fault') {
      setMode('paging');
      setVirtualAddress(50000);
      setPageSize(1024);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Address Translation Playground</h1>
        <p className="page-description">
          Inspect intermediate calculations and step-by-step CPU translation logic for Paging and Segmentation.
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <button
          className={`btn ${mode === 'paging' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => { setMode('paging'); setResult(null); }}
        >
          <Cpu size={16} /> Paging Mode (Fixed Partitioning)
        </button>
        <button
          className={`btn ${mode === 'segmentation' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => { setMode('segmentation'); setResult(null); }}
        >
          <Compass size={16} /> Segmentation Mode (Logical Blocks)
        </button>
      </div>

      {/* Preset Demo Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Quick Test Presets:</span>
        <button className="btn btn-outline btn-sm" onClick={() => loadPreset('paging-baseline')}>
          Paging: Addr 2500 (Page 2, Offset 452)
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => loadPreset('segmentation-valid')}>
          Segmentation: Valid Code (Offset 1200)
        </button>
        <button className="btn btn-outline btn-sm" style={{ borderColor: '#fca5a5', color: '#991b1b' }} onClick={() => loadPreset('segmentation-fault')}>
          Segmentation: Fault (Offset 5000 &gt; Limit 4096)
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertTriangle size={18} />
          <div>{error}</div>
        </div>
      )}

      <div className="grid-2">
        {/* Input Form Column */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              {mode === 'paging' ? 'Paging Parameters' : 'Segmentation Parameters'}
            </div>
          </div>

          <form onSubmit={handleTranslate}>
            {mode === 'paging' ? (
              <>
                <div className="form-group">
                  <label className="form-label">Virtual Memory Address (Bytes)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={virtualAddress}
                    onChange={(e) => setVirtualAddress(e.target.value)}
                    min="0"
                    max={virtualSpace - 1}
                    required
                  />
                  <div className="form-hint">Address range: 0 to {virtualSpace - 1} bytes</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Page Size (Bytes)</label>
                  <select
                    className="form-select"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    <option value={512}>512 Bytes</option>
                    <option value={1024}>1024 Bytes (1 KB - Default)</option>
                    <option value={2048}>2048 Bytes (2 KB)</option>
                    <option value={4096}>4096 Bytes (4 KB)</option>
                  </select>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="tlb-check"
                    checked={enableTlb}
                    onChange={(e) => setEnableTlb(e.target.checked)}
                  />
                  <label htmlFor="tlb-check" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                    Enable Translation Lookaside Buffer (TLB) Cache
                  </label>
                </div>
              </>
            ) : (
              <>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input
                    type="checkbox"
                    id="explicit-seg"
                    checked={useExplicitSegment}
                    onChange={(e) => setUseExplicitSegment(e.target.checked)}
                  />
                  <label htmlFor="explicit-seg" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                    Specify Explicit Segment &amp; Offset (e.g., Code, Data)
                  </label>
                </div>

                {useExplicitSegment ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">Target Segment</label>
                      <select
                        className="form-select"
                        value={segmentId}
                        onChange={(e) => setSegmentId(Number(e.target.value))}
                      >
                        <option value={0}>Segment 0: Code (Base: 0, Limit: 8,192 B)</option>
                        <option value={1}>Segment 1: Data (Base: 8,192, Limit: 4,096 B)</option>
                        <option value={2}>Segment 2: Stack (Base: 16,384, Limit: 4,096 B)</option>
                        <option value={3}>Segment 3: Heap (Base: 24,576, Limit: 6,144 B)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Segment Offset (Bytes)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={segmentOffset}
                        onChange={(e) => setSegmentOffset(e.target.value)}
                        min="0"
                        required
                      />
                      <div className="form-hint">
                        Tip: Set offset &ge; limit to demonstrate a <strong>Segmentation Fault</strong>!
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Contiguous Logical Address (Bytes)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={logicalAddress}
                      onChange={(e) => setLogicalAddress(e.target.value)}
                      min="0"
                      max={virtualSpace - 1}
                      required
                    />
                    <div className="form-hint">Address space split evenly across 4 logical segments (16 KB each)</div>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="spin" /> Translating...
                </>
              ) : (
                <>
                  <Play size={16} /> Translate Address
                </>
              )}
            </button>
          </form>
        </div>

        {/* Translation Output Stepper */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              Step-by-Step Translation Walkthrough
            </div>
          </div>

          <TranslationStepper result={result} mode={mode} />
        </div>
      </div>
    </div>
  );
}
