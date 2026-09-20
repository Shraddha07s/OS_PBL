import React from 'react';
import { 
  Cpu, 
  Layers, 
  Scale, 
  Compass, 
  FlaskConical, 
  ArrowRight, 
  CheckCircle2, 
  BarChart3,
  Server,
  Terminal
} from 'lucide-react';
import MetricCard from '../components/MetricCard';

export default function Dashboard({ setActivePage, backendStatus }) {
  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Memory Management Simulator</h1>
            <p className="page-description">
              Paging vs Segmentation &mdash; Address Translation & Experimental Performance Comparison
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={() => setActivePage('comparison')}>
              <Scale size={16} /> Run Head-to-Head Comparison
            </button>
            <button className="btn btn-outline" onClick={() => setActivePage('playground')}>
              <Compass size={16} /> Try Translation
            </button>
          </div>
        </div>
      </div>

      {/* Core Research Question Banner */}
      <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>Core Research Question:</div>
        <div>
          <em>"How do Paging and Segmentation differ in address-translation overhead and fragmentation behavior when processing the <strong>exact same memory-reference workload</strong>?"</em>
        </div>
      </div>

      {/* Baseline Configuration Grid */}
      <div className="card-header" style={{ border: 'none', padding: 0, marginBottom: '0.75rem' }}>
        <div className="card-title">
          <Cpu size={18} /> Baseline Simulator Configuration
        </div>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Configurable in Simulator & Experiments</span>
      </div>

      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <MetricCard 
          label="Virtual Address Space" 
          value="64 KB" 
          detail="65,536 bytes (16-bit addressable)" 
        />
        <MetricCard 
          label="Physical Memory Size" 
          value="32 KB" 
          detail="32,768 bytes physical RAM" 
        />
        <MetricCard 
          label="Paging Frame / Page Size" 
          value="1 KB" 
          detail="1,024 bytes (32 frames, 64 pages)" 
        />
        <MetricCard 
          label="Baseline Workload" 
          value="1,000 Refs" 
          detail="Locality 80/20 &bull; Seed 42" 
        />
      </div>

      {/* Quick Start Workflows */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Compass size={18} /> Recommended Interactive Workflows
          </div>
        </div>
        
        <div className="grid-3">
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                <Compass size={18} color="#2563eb" /> 1. Address Translation
              </div>
              <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.5 }}>
                Enter virtual addresses such as <code>2500</code> and observe page number, offset, frame lookup, and physical address step-by-step.
              </p>
            </div>
            <button className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }} onClick={() => setActivePage('playground')}>
              Open Playground <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                <FlaskConical size={18} color="#059669" /> 2. Generate Workloads
              </div>
              <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.5 }}>
                Synthesize deterministic reference strings (Sequential, 80/20 Locality, Random, Mixed) with reproducible random seeds.
              </p>
            </div>
            <button className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }} onClick={() => setActivePage('workload')}>
              Create Workload <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                <Scale size={18} color="#d97706" /> 3. Compare Both Techniques
              </div>
              <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.5 }}>
                Feed the exact same reference sequence into Paging and Segmentation to experimentally evaluate translation cost and fragmentation.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }} onClick={() => setActivePage('comparison')}>
              Run Comparison <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Architecture & Team Division */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Layers size={18} /> System Architecture Flow
            </div>
          </div>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ padding: '0.5rem 0.75rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                <strong>React + Vite Frontend</strong> &mdash; Interactive visual steppers, frame maps, controls & Recharts
              </div>
              <div style={{ textAlign: 'center', color: '#94a3b8' }}>&darr; REST API via JSON (HTTP / FastApi)</div>
              <div style={{ padding: '0.5rem 0.75rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                <strong>FastAPI Service Layer</strong> &mdash; Request validation, schema enforcement, endpoint routing
              </div>
              <div style={{ textAlign: 'center', color: '#94a3b8' }}>&darr; Orchestration & Evaluation</div>
              <div style={{ padding: '0.5rem 0.75rem', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '4px' }}>
                <strong>Simulation & Experiment Engines</strong> &mdash; Paging (FIFO, LRU, Optimal), Segmentation (Base/Limit), Workloads & Metrics
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <CheckCircle2 size={18} /> 3-Member Student Engineering Team
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ borderLeft: '3px solid #2563eb', paddingLeft: '0.75rem' }}>
              <strong>Member 1: OS Memory Management Engineer</strong>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Paging engine, page table, frame allocation, replacement algorithms (FIFO/LRU/Optimal), segmentation engine, bounds checking.</div>
            </div>
            <div style={{ borderLeft: '3px solid #059669', paddingLeft: '0.75rem' }}>
              <strong>Member 2: Performance & Experimentation Engineer</strong>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Deterministic workload generator, cost metric calculator, identical-workload experiment runner.</div>
            </div>
            <div style={{ borderLeft: '3px solid #d97706', paddingLeft: '0.75rem' }}>
              <strong>Member 3: Application & Integration Engineer</strong>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>FastAPI backend API endpoints, React interactive application, visual steppers, live charts & system integration.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
