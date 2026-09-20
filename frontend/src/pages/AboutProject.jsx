import React from 'react';
import { Info, Users, GraduationCap, ShieldCheck, Code, HelpCircle, Terminal } from 'lucide-react';

export default function AboutProject() {
  const vivaQuestions = [
    {
      q: "Q1: Why do we test both Paging and Segmentation with the exact same memory reference string?",
      a: "In experimental computer science, comparing two memory management architectures is only scientifically valid if the workload (working set, reference frequency, locality) is controlled and identical. Using different random workloads would confound the performance metrics."
    },
    {
      q: "Q2: Why does Paging eliminate external fragmentation completely?",
      a: "Because both virtual memory (pages) and physical memory (frames) are partitioned into identical, fixed-size power-of-two units (e.g., 1024 bytes). Any free frame can satisfy any virtual page allocation, leaving no unusable gaps between allocations."
    },
    {
      q: "Q3: What causes a Segmentation Fault during address translation?",
      a: "A segmentation fault occurs when the hardware memory management unit (MMU) detects that the supplied offset is greater than or equal to the segment limit register (offset >= limit). This prevents a process from accessing memory outside its declared logical segments."
    },
    {
      q: "Q4: What is Belady's Anomaly and which replacement policy can exhibit it?",
      a: "Belady's Anomaly is the phenomenon where allocating more physical page frames to a process leads to an increase (rather than decrease) in page faults. It can occur under FIFO replacement, but cannot occur under stack algorithms like LRU or Optimal."
    },
    {
      q: "Q5: How does a TLB reduce the effective memory access time in Paging?",
      a: "Without a TLB, every memory access requires two physical memory accesses (one for page table lookup, one for the actual operand). A TLB is a high-speed associative hardware cache. On a TLB hit (e.g., 0.2 units), the page table lookup is skipped."
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">About the Project</h1>
        <p className="page-description">
          Operating Systems Course Project &mdash; 3-Member Engineering Collaboration
        </p>
      </div>

      {/* Project Title & Context */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <GraduationCap size={18} /> Project Context &amp; Objective
          </div>
          <span className="badge badge-blue">Academic Year 2025&ndash;2026</span>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
          <strong>"Memory Management Simulator: Paging vs Segmentation &mdash; Address Translation and Performance Comparison"</strong> is an interactive engineering application developed for undergraduate Operating Systems education.
          The project enables students and instructors to visualize virtual-to-physical address translation step-by-step, experiment with page replacement algorithms, analyze internal versus external fragmentation, and conduct reproducible head-to-head performance benchmarks using identical synthetic workloads.
        </p>
      </div>

      {/* 3-Member Team Roles */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Users size={18} /> Engineering Team &amp; Division of Labor
          </div>
        </div>

        <div className="grid-3">
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem', background: '#f8fafc' }}>
            <div style={{ fontWeight: 700, color: '#2563eb', marginBottom: '0.25rem' }}>Member 1</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>OS Memory Management Engineer</div>
            <ul style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.5rem', paddingLeft: '1.2rem', lineHeight: 1.5 }}>
              <li>Paging simulation engine (fixed partitioning)</li>
              <li>Page table data structures &amp; frame allocation</li>
              <li>Replacement algorithms: FIFO, LRU, Optimal</li>
              <li>Segmentation engine &amp; hardware bounds checking</li>
            </ul>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem', background: '#f8fafc' }}>
            <div style={{ fontWeight: 700, color: '#059669', marginBottom: '0.25rem' }}>Member 2</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>Performance &amp; Experimentation Engineer</div>
            <ul style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.5rem', paddingLeft: '1.2rem', lineHeight: 1.5 }}>
              <li>Deterministic reference stream generator (Locality, Sequential, Random, Mixed)</li>
              <li>Simulated cost calculation model</li>
              <li>Head-to-head experiment runner</li>
              <li>Statistical metrics &amp; analysis logic</li>
            </ul>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem', background: '#f8fafc' }}>
            <div style={{ fontWeight: 700, color: '#d97706', marginBottom: '0.25rem' }}>Member 3 (This Role)</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>Application &amp; Integration Engineer</div>
            <ul style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.5rem', paddingLeft: '1.2rem', lineHeight: 1.5 }}>
              <li>FastAPI backend REST endpoints &amp; schemas</li>
              <li>React + Vite user interface &amp; visual steppers</li>
              <li>Frame/segment memory visualizations</li>
              <li>Automated test suite &amp; integration</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Academic Integrity & Technology Stack */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <ShieldCheck size={18} /> Academic Integrity &amp; Scientific Standard
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.6 }}>
            <p style={{ marginBottom: '0.5rem' }}>
              &bull; <strong>No Fabricated Results:</strong> All displayed numbers, tables, and charts are generated in real-time by the Python simulation engine executing the reference sequences.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              &bull; <strong>Controlled Workloads:</strong> Experiments feed the exact same synthesized address stream to both architectures to isolate memory management behavior.
            </p>
            <p>
              &bull; <strong>Simulated Cost Units:</strong> Overheads are clearly labeled as architectural simulation units (e.g., TLB hit = 0.2, Page fault = 50.0) rather than pseudo-clock times.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Code size={18} /> Technology Stack
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.6 }}>
            <p><strong>Frontend:</strong> React 18, Vite 5, Recharts, Lucide-React, Modern CSS</p>
            <p><strong>Backend:</strong> Python 3.13, FastAPI, Pydantic v2, Uvicorn</p>
            <p><strong>Testing:</strong> Pytest, FastAPI TestClient</p>
            <p><strong>Version Control:</strong> Git (Branch: <code>feature/frontend-integration</code>)</p>
          </div>
        </div>
      </div>

      {/* Viva Voce Defense Question Bank */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <HelpCircle size={18} /> Viva Voce Defense Guide
          </div>
          <span className="badge badge-amber">Frequently Asked Viva Questions</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {vivaQuestions.map((vq, idx) => (
            <div key={idx} style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                {vq.q}
              </div>
              <div style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.5 }}>
                {vq.a}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
