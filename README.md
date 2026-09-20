# Memory Management Simulator: Paging vs Segmentation

**Project Title:** Memory Management Simulator: Paging vs Segmentation — Address Translation and Performance Comparison  
**Current Branch:** `feature/core-simulation`

---

## 1. Project Overview

An interactive educational simulator designed to demonstrate and compare two fundamental Operating System memory-management techniques:
1. **Paging** (virtual address translation, page tables, page faults, replacement algorithms: FIFO, LRU, Optimal).
2. **Segmentation** (logical segments: Code, Data, Stack, Heap, base/limit validation, segmentation faults, memory layout, and holes).

---

## 2. Team Architecture & Responsibilities

| Member | Role | Responsibilities |
|---|---|---|
| **Member 1** | OS Memory Management Engineer | Core simulation logic in Java (Paging, Segmentation, Replacement, Cost Model, Tests, Documentation) |
| **Member 2** | Performance & Experimentation Engineer | Workload generation, reference strings, experimental benchmarking, and metrics |
| **Member 3** | Application & Integration Engineer | FastAPI backend, React frontend, and visualization dashboard |

---

## 3. Member 1 Java Core Simulation

The core simulation is implemented in modular, pure Java without external dependencies:

```
src/
  main/
    java/
      simulator/
        common/        <- CostModel (simulated cost units)
        paging/        <- PagingSimulator, PageTable, FIFO, LRU, Optimal
        segmentation/  <- SegmentationSimulator, SegmentTable, MemoryLayout
  test/
    java/
      simulator/
        TestRunner.java
        paging/
        segmentation/
docs/
  member1-core-simulation.md  <- Complete technical documentation
run_tests.bat
run_tests.ps1
```

---

## 4. Quick Start: Running Tests

### Option A: Using Batch Script (CMD)
```cmd
run_tests.bat
```

### Option B: Using PowerShell
```powershell
.\run_tests.ps1
```

### Option C: Direct Java Commands
```cmd
javac -d out/production src/main/java/simulator/common/*.java src/main/java/simulator/paging/*.java src/main/java/simulator/segmentation/*.java
javac -cp out/production -d out/test src/test/java/simulator/*.java src/test/java/simulator/paging/*.java src/test/java/simulator/segmentation/*.java
java -cp "out/production;out/test" simulator.TestRunner
```

---

## 5. Documentation

For detailed architecture, formulas, DTO contracts, and integration guides, see:
- [Member 1 Core Simulation Documentation](docs/member1-core-simulation.md)
