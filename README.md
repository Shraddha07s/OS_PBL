# Memory Management Simulator: Paging vs Segmentation
### Address Translation and Performance Comparison

An interactive Operating Systems college course engineering project comparing **Paging** and **Segmentation** through virtual-to-physical address translation, memory fragmentation analysis, page replacement algorithms, and empirical benchmarks on identical workloads.

---

## 1. Project Overview & Research Question

In modern operating systems, virtual memory abstracts physical RAM to provide isolation, protection, and efficient resource sharing. Two classical approaches to memory management are:

1. **Paging:** Fixed-size contiguous blocks called *Pages* in virtual memory are mapped to identical *Frames* in physical memory. Paging eliminates external fragmentation but introduces internal fragmentation and requires multi-level page tables or TLBs.
2. **Segmentation:** Variable-size contiguous blocks called *Segments* (Code, Data, Stack, Heap) reflect the programmer's logical view of memory. Segmentation avoids internal fragmentation and supports logical protection, but suffers from external fragmentation and requires compaction.

### Central Research Question
> *"How do Paging and Segmentation differ in address-translation overhead and fragmentation behavior when processing the **exact same memory-reference workload**?"*

### Strict Experimental Principle
To guarantee scientific validity, **the exact same sequence of synthesized memory references is supplied to both Paging and Segmentation simulation engines**. Workloads are generated deterministically using pseudo-random seeds.

---

## 2. 3-Member Engineering Team & Contributions

This project was built collaboratively by a 3-member student team:

| Member | Role | Core Responsibilities |
|---|---|---|
| **Member 1** | **OS Memory Management Engineer** | Paging engine, frame allocation table, page table entries, replacement policies (`FIFO`, `LRU`, `Optimal`), segmentation descriptor table, base/limit address translation, hardware bounds checking. |
| **Member 2** | **Performance & Experimentation Engineer** | Deterministic workload generator (`Sequential`, `Locality 80/20`, `Random`, `Mixed`), simulated translation cost model, comparison logic, experiment sweep runner, statistical metric calculation. |
| **Member 3** | **Application & Integration Engineer** | FastAPI REST endpoints, Pydantic schemas, React + Vite application, step-by-step visual steppers (`TranslationStepper`), physical memory and segment visualizers (`PageFrameVisualizer`, `SegmentVisualizer`), 10 interactive UI pages, automated test suite (`tests/test_api.py`), end-to-end integration. |

---

## 3. System Architecture

```
                       User Browser
                            │
               React + Vite Frontend (Port 5173)
        ┌───────────────────┴───────────────────┐
        │  • Address Translation Stepper         │
        │  • Physical Frame / Segment Visualizer │
        │  • Interactive Comparison & Charts    │
        └───────────────────┬───────────────────┘
                            │ REST / JSON (HTTP)
               FastAPI Backend (Port 8000)
        ┌───────────────────┴───────────────────┐
        │  • Schema Validation (Pydantic v2)    │
        │  • API Endpoints (backend/api/)       │
        └───────────────────┬───────────────────┘
                            │ Module Invocations
        ┌───────────────────┴───────────────────┐
        │        Simulator Core Engine          │
        │  ├─ simulator/paging/ (FIFO, LRU, OPT)│
        │  ├─ simulator/segmentation/ (Base/Lim)│
        │  ├─ simulator/workloads/ (4 Patterns) │
        │  └─ simulator/experiments/ & metrics/ │
        └───────────────────────────────────────┘
```

---

## 4. Key Features & 10 Interactive Pages

1. **Dashboard:** Project overview, baseline configuration (64 KB virtual, 32 KB physical, 1 KB pages, 1,000 refs), architecture diagram, and quick workflows.
2. **Address Translation Playground:** Real-time step-by-step translation. Enter a virtual address (e.g. 2500) and watch `Page = 2, Offset = 452` computed, or test segmentation bounds validation (e.g., offset 5000 exceeding limit 4096 to trigger a Segmentation Fault).
3. **Paging Simulator:** Interactive physical frame visualizer, page table resident status, TLB cache hit indicators, and page replacement algorithm selection (`FIFO`, `LRU`, `Optimal`).
4. **Segmentation Simulator:** Physical memory layout displaying Code, Data, Stack, and Heap spans, along with unallocated free gaps (external fragmentation).
5. **Workload Generator:** Generates reproducible reference streams for `Sequential`, `Random`, `Locality (80/20)`, and `Mixed` patterns with live address distribution histograms.
6. **Comparison (Head-to-Head):** Evaluates Paging vs Segmentation on the **exact same reference string**, generating cost bar charts, fault comparison, and descriptive narrative interpretation.
7. **Experiments:** Configurable parametric sweeps over virtual space, physical RAM, page sizes (512 B to 4096 B), and replacement algorithms.
8. **Results & Analytics:** Academic interpretation answering *"What did I run?"*, *"What happened?"*, and *"What do these numbers mean?"*, with exportable JSON reports.
9. **Algorithms & Theory:** Complete textbook reference for mathematical equations, Belady's anomaly, TLB hit formulas, and internal/external fragmentation.
10. **About Project & Viva Guide:** Engineering roles, academic integrity statements, and a viva defense question bank.

---

## 5. Technology Stack

- **Frontend:** React 18, Vite 5, Recharts (data visualization), Lucide-React (clean icons), Custom Academic CSS theme.
- **Backend:** Python 3.13, FastAPI, Uvicorn, Pydantic v2.
- **Testing:** Pytest, FastAPI TestClient.
- **Version Control:** Git (`feature/frontend-integration` branch).

---

## 6. Simulated Cost Model

Because actual wall-clock execution time varies with host OS scheduling and hardware caching, we adopt an architectural **Simulated Cost Model**:

| Operation | Simulated Cost | Rationale |
|---|---|---|
| **Physical Memory Access** | `1.0 unit` | Standard bus memory access cycle |
| **Page Table Lookup** | `1.0 unit` | Single memory read for Page Table Entry |
| **TLB Cache Hit** | `0.2 unit` | Fast parallel hardware register lookup |
| **Segment Table + Bounds Check** | `2.0 units` | Segment register lookup (1.0) + Hardware comparator check (1.0) |
| **Page Fault Trap Handler** | `50.0 units` | OS interrupt context switch, disk frame fetch, and victim replacement |

---

## 7. Setup & Installation Instructions

### Prerequisites
- **Python 3.10+** (Tested on Python 3.13)
- **Node.js 18+** & **npm**

### Step 1: Clone Repository
```powershell
git clone <repository_url>
cd OSSSS
```

### Step 2: Install Backend Dependencies & Run Tests
```powershell
pip install -r requirements.txt
python -m pytest tests/test_api.py -v
```

### Step 3: Start FastAPI Backend Server
```powershell
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
API documentation is automatically available at:
- Swagger UI: `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/api/health`

### Step 4: Install Frontend Dependencies & Start React App
Open a second terminal window:
```powershell
cd frontend
npm install
npm run dev
```
The React application will launch at `http://localhost:5173`.

---

## 8. API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check verifying simulation engine modules |
| `POST` | `/api/translate/paging` | Step-by-step paging address translation |
| `POST` | `/api/translate/segmentation` | Step-by-step segmentation translation & bounds check |
| `POST` | `/api/workloads/generate` | Deterministic synthetic memory reference stream |
| `POST` | `/api/simulate/paging` | Full sequence paging simulation (FIFO, LRU, Optimal) |
| `POST` | `/api/simulate/segmentation` | Full sequence segmentation simulation & layout |
| `POST` | `/api/experiments/compare` | Head-to-head comparison on the **exact same workload** |
| `POST` | `/api/experiments/run` | Parametric experiment execution |

---

## 9. Viva Voce Defense Question Bank

**Q1: Why must the exact same workload be provided to both simulators?**
> *Answer:* Comparing memory management schemes under different workloads introduces confounding variables. Controlled comparison requires holding the memory access sequence constant while varying the memory management scheme.

**Q2: How does Paging prevent external fragmentation?**
> *Answer:* By discretizing all memory into uniform power-of-two page frames. Because any page can occupy any frame, there are never variable-sized unallocatable gaps between allocations.

**Q3: What causes a Segmentation Fault?**
> *Answer:* When `Offset >= Limit` for the target segment. The CPU hardware comparator halts the translation and traps to the OS kernel.

**Q4: What is Belady's Anomaly?**
> *Answer:* The counterintuitive phenomenon where adding more physical page frames causes more page faults. It can occur under FIFO replacement, but is mathematically impossible under stack algorithms like LRU.

---

## 10. Limitations & Future Work

- **Multi-Level Paging:** Current implementation models single-level paging with a 4-entry associative TLB. Hierarchical 2-level paging for larger address spaces is a logical extension.
- **Dynamic Compaction:** Future versions could simulate memory defragmentation (compaction) algorithms for Segmentation.
- **Multiprogramming:** Extending the engine to simulate concurrent processes sharing physical frames.
