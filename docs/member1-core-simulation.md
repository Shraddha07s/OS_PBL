# Member 1 Documentation: Core Simulation Engine (Java)

**Project Title:** Memory Management Simulator: Paging vs Segmentation — Address Translation and Performance Comparison  
**Role:** Member 1 — OS Memory Management Engineer  
**Branch:** `feature/core-simulation`  
**Language:** Java (JDK 26 compatible)  

---

## 1. Member 1 Responsibility

Member 1 is responsible for the core OS memory management simulation logic implemented in Java:
- **Paging Architecture**: Virtual address translation, Page Table, Page Table Entry (PTE), physical memory frames, page fault detection and handling.
- **Page Replacement Policies**: FIFO (First-In, First-Out), LRU (Least Recently Used), and Optimal (Belady's Min with forward look-ahead).
- **Segmentation Architecture**: Segment Table, Segment descriptors (Code, Data, Stack, Heap), base/limit boundary validation, permission validation, segmentation fault handling.
- **Memory Layout & State Tracking**: Allocated segment ranges, physical memory frames, free areas (memory holes), external fragmentation metrics.
- **Cost Model**: Abstract simulated cost calculation for paging and segmentation operations.
- **Result Contracts**: Exposing comprehensive, deterministic DTOs (Data Transfer Objects) for Member 2 (workload/metrics) and Member 3 (FastAPI backend and React frontend).
- **Unit Testing & Verification**: Comprehensive test suite covering address calculations, boundary conditions, faults, replacement algorithms, and determinism.

*Non-responsibilities:* Member 1 does NOT implement UI/React components, FastAPI REST endpoints, or internal random workload generators.

---

## 2. Java Directory & Package Structure

```
C:\OS_PBL\
├── src\
│   ├── main\
│   │   └── java\
│   │       └── simulator\
│   │           ├── common\
│   │           │   └── CostModel.java
│   │           ├── paging\
│   │           │   ├── FifoReplacement.java
│   │           │   ├── LruReplacement.java
│   │           │   ├── OptimalReplacement.java
│   │           │   ├── PageTable.java
│   │           │   ├── PageTableEntry.java
│   │           │   ├── PagingConfig.java
│   │           │   ├── PagingSimulationStep.java
│   │           │   ├── PagingSimulator.java
│   │           │   ├── PagingState.java
│   │           │   ├── PagingTranslationResult.java
│   │           │   ├── PhysicalFrame.java
│   │           │   └── ReplacementAlgorithm.java
│   │           └── segmentation\
│   │               ├── AccessType.java
│   │               ├── MemoryHole.java
│   │               ├── Permission.java
│   │               ├── Segment.java
│   │               ├── SegmentationMemoryLayout.java
│   │               ├── SegmentationSimulator.java
│   │               ├── SegmentationTranslationResult.java
│   │               └── SegmentTable.java
│   └── test\
│       └── java\
│           └── simulator\
│               ├── TestRunner.java
│               ├── paging\
│               │   └── PagingSimulatorTest.java
│               └── segmentation\
│                   └── SegmentationSimulatorTest.java
├── docs\
│   └── member1-core-simulation.md
├── run_tests.bat
├── run_tests.ps1
└── README.md
```

---

## 3. Paging Explanation

Paging is a non-contiguous memory management scheme that eliminates external fragmentation by dividing:
- **Logical/Virtual Memory** into fixed-sized blocks called **pages**.
- **Physical Memory** into fixed-sized blocks of the exact same size called **frames**.

Because pages and frames are identical in size, any virtual page can be placed into any available physical frame. Paging avoids external fragmentation completely, although it may experience internal fragmentation in the last page of a process if the process size is not an exact multiple of the page size.

---

## 4. Page Table Explanation

The **Page Table** maps a process's virtual page numbers to physical frame numbers:
- Implemented in `PageTable.java` and `PageTableEntry.java`.
- Each `PageTableEntry` tracks:
  - `pageNumber`: virtual page index.
  - `frameNumber`: physical frame currently mapped (-1 if not resident).
  - `valid`: boolean flag indicating whether the page is resident in physical memory (true) or non-resident on backing store (false).
  - `referenced`: set to true when the page is read or written.
  - `modified` (dirty bit): set to true when written to.
  - `loadTimestamp`: simulation step when the page was brought into memory (used by FIFO).
  - `lastAccessTimestamp`: simulation step when the page was most recently accessed (used by LRU).

---

## 5. FIFO (First-In, First-Out) Replacement

- **Class:** `FifoReplacement.java`
- **Policy:** Evicts the page that has resided in physical memory for the longest time.
- **Mechanism:** Inspects all resident pages in memory and selects the page with the lowest `loadTimestamp`.
- **Characteristics:** Simple to implement; does not account for frequency or recency of access, and may suffer from Belady's Anomaly.

---

## 6. LRU (Least Recently Used) Replacement

- **Class:** `LruReplacement.java`
- **Policy:** Evicts the page that has not been accessed for the longest period of time.
- **Mechanism:** Inspects all resident pages in memory and selects the page with the lowest `lastAccessTimestamp`.
- **Characteristics:** Approximates the optimal algorithm by exploiting temporal locality; does not suffer from Belady's Anomaly.

---

## 7. Optimal (Belady's Min) Replacement

- **Class:** `OptimalReplacement.java`
- **Policy:** Evicts the page that will not be used for the longest period of time in the future.
- **Mechanism:**
  1. Inspects the upcoming references in the externally supplied reference string starting from `currentStep + 1`.
  2. For each resident page, calculates the index of its next occurrence.
  3. If a page never appears again in the future string, it is prioritized for eviction.
  4. If multiple pages never appear again, ties are broken deterministically using FIFO load order (`loadTimestamp`).
  5. Otherwise, the page whose next reference index is highest (farthest in the future) is evicted.
- **Guarantee:** Optimal produces the theoretical minimum number of page faults for any given reference string and frame allocation.

---

## 8. Page Fault Handling

When a virtual address is referenced:
1. The simulator checks `pageTable.isPageValid(pageNumber)`.
2. If `false`, a **Page Fault** is triggered:
   - `pageFault` flag is set to `true`.
   - The simulator searches for an unallocated physical frame.
   - If a free frame exists:
     - The page is loaded into that frame.
     - `pageTable.mapPage(pageNumber, frameNumber, currentStep)` updates the entry to valid and sets timestamps.
   - If all frames are occupied:
     - The configured `ReplacementAlgorithm` is invoked to select a resident victim page.
     - The victim page is invalidated (`valid = false`, `frameNumber = -1`).
     - The newly referenced page takes over the victim's frame.
   - A simulated page fault penalty (`50.0` cost units) is added to the translation cost.
3. The translation step and resulting memory state are recorded in history.

---

## 9. Address Translation

### Paging Formulas
Given:
- `virtualAddress` (VA)
- `pageSize`

```text
pageNumber      = virtualAddress / pageSize
offset          = virtualAddress % pageSize
physicalAddress = (frameNumber * pageSize) + offset
```

### Hand-Verifiable Example
- Input: `virtualAddress = 2500`, `pageSize = 1024`
- Calculation:
  - `pageNumber = 2500 / 1024 = 2`
  - `offset = 2500 % 1024 = 452`
  - If Page 2 is mapped to Frame 0:
    - `physicalAddress = (0 * 1024) + 452 = 452`
  - If Page 2 is mapped to Frame 3:
    - `physicalAddress = (3 * 1024) + 452 = 3524`

---

## 10. Segmentation Explanation

Segmentation is a memory management scheme that supports the programmer's view of memory as variable-sized logical units:
- **Code:** Program instructions (typically Read-Execute).
- **Data:** Global and static variables (Read-Write).
- **Stack:** Local variables, return addresses, function frames (Read-Write).
- **Heap:** Dynamically allocated memory (Read-Write).

Each segment resides contiguously in physical memory but different segments can be placed at arbitrary physical base locations.

---

## 11. Base/Limit Validation & Segmentation Faults

- **Segment Descriptor:** Contains `base` (starting physical address), `limit` (length in bytes), and `permissions`.
- **Validation Rules:**
  1. **Segment Existence:** The requested segment ID or name must exist in the `SegmentTable`. If not, returns `SEGMENT_NOT_FOUND`.
  2. **Bounds Check:**
     - Offset must satisfy: `0 <= offset < limit`.
     - Boundary condition: If `offset == limit` or `offset > limit`, an invalid access occurs, resulting in `LIMIT_EXCEEDED` (Segmentation Fault).
     - If `offset < 0`, returns `LIMIT_EXCEEDED`.
  3. **Permission Check:** If the operation (`READ`, `WRITE`, `EXECUTE`) is not permitted by the segment's `Permission`, returns `PERMISSION_DENIED`.
- **Physical Address Calculation:**
  ```text
  if (offset >= 0 && offset < limit && segment.allows(accessType)) {
      physicalAddress = base + offset;
  } else {
      physicalAddress = -1; // Segmentation Fault
  }
  ```

---

## 12. Segmentation Memory Layout & Free Areas (Holes)

- **Class:** `SegmentationMemoryLayout.java`
- Because segments are variable in size, physical memory develops gaps between allocated segments called **memory holes** (external fragmentation).
- The simulator tracks:
  - `allocatedSegments`: list of active segments sorted by `base`.
  - `freeHoles`: list of unallocated memory blocks (`MemoryHole`: `base` and `size`).
  - `totalAllocatedMemory`: sum of all segment limits.
  - `totalFreeMemory`: sum of all hole sizes.
  - `largestFreeHole`: size of the largest contiguous free hole.
  - `externalFragmentationRatio`: calculated as `1.0 - (largestFreeHole / totalFreeMemory)` when free memory exists.

---

## 13. Simulated Cost Model

The simulator uses abstract **Simulated Cost Units** (SCU) for comparative educational analysis.

> [!IMPORTANT]
> These are simulated cost units for educational comparison. They do NOT represent real-world physical CPU clock cycles or nanoseconds.

| Operation | Cost (Units) |
|---|---|
| Memory Access | `1.0` |
| Page / Segment Table Lookup | `1.0` |
| Bounds Check | `1.0` |
| TLB Hit | `0.2` |
| Page Fault Handler Overhead | `50.0` |

### Calculation Rules
- **Paging Hit:** Lookup (`1.0`) + Memory Access (`1.0`) = **`2.0`**
- **Paging Fault:** Lookup (`1.0`) + Page Fault Handler (`50.0`) + Memory Access (`1.0`) = **`52.0`**
- **Segmentation Valid:** Lookup (`1.0`) + Bounds Check (`1.0`) + Memory Access (`1.0`) = **`3.0`**
- **Segmentation Fault:** Lookup (`1.0`) + Bounds Check (`1.0`) = **`2.0`** (access aborted)

---

## 14. Input → Processing → Output Contract

### Paging Contract
- **Input:**
  - `virtualAddress` (long) or `pageNumber` (int)
  - `pageSize` (int, e.g. 1024)
  - `totalFrames` (int, e.g. 3 or 4)
  - `replacementAlgorithm` (`FIFO`, `LRU`, `Optimal`)
  - Optional externally supplied reference string for forward look-ahead
- **Processing:**
  1. Compute `pageNumber = VA / pageSize`, `offset = VA % pageSize`.
  2. Query `PageTable`.
  3. If present and valid: record access, compute PA.
  4. If fault: find free frame or evict victim using replacement algorithm, map page.
  5. Compute simulated cost.
  6. Snapshot `PagingState` and append to `executionHistory`.
- **Output (`PagingTranslationResult`):**
  - `virtualAddress`, `pageNumber`, `offset`, `frameNumber`, `physicalAddress`
  - `pageFault` (boolean), `victimPageNumber`, `replacedFrameNumber`
  - `translationCost` (double), `memoryState` (`PagingState`), `stepNumber`, `statusMessage`

### Segmentation Contract
- **Input:**
  - `segmentId` (int) or `segmentName` (String, e.g. "Code", "Data")
  - `offset` (long)
  - `accessType` (`READ`, `WRITE`, `EXECUTE`)
  - `SegmentTable` configuration
- **Processing:**
  1. Lookup segment in `SegmentTable`.
  2. Validate `0 <= offset < limit`.
  3. Validate access permissions.
  4. If valid, compute `physicalAddress = base + offset`.
  5. If invalid, record fault type (`LIMIT_EXCEEDED`, `PERMISSION_DENIED`, `SEGMENT_NOT_FOUND`).
  6. Compute layout and simulated cost.
- **Output (`SegmentationTranslationResult`):**
  - `segmentId`, `segmentName`, `offset`, `base`, `limit`, `permissions`, `accessType`
  - `valid` (boolean), `faultType` (String or null), `physicalAddress` (long)
  - `translationCost` (double), `memoryLayout` (`SegmentationMemoryLayout`), `stepNumber`, `statusMessage`

---

## 15. Structured Result Contract (DTOs)

All result objects (`PagingTranslationResult`, `PagingState`, `PhysicalFrame`, `PageTableEntry`, `SegmentationTranslationResult`, `SegmentationMemoryLayout`, `MemoryHole`) expose public getters and clean `toString()` representations. They can be serialized directly to JSON via Jackson, Gson, or FastAPI Python models.

---

## 16. How Member 2 Supplies Reference Strings

Member 2 handles workload generation and experimental comparisons. Member 1's engine accepts workloads via two methods:

### Method A: Page Reference String (e.g. `[1, 2, 3, 1, 4, 2, 5]`)
```java
PagingConfig config = new PagingConfig(1024, 3);
PagingSimulator sim = new PagingSimulator(config, new OptimalReplacement());

List<Integer> workload = Arrays.asList(1, 2, 3, 1, 4, 2, 5);
List<PagingSimulationStep> steps = sim.executePageReferenceString(workload);

System.out.println("Total Faults: " + sim.getPageFaults());
System.out.println("Fault Rate: " + sim.getFaultRate());
System.out.println("Total Cost: " + sim.getTotalSimulatedCost());
```

### Method B: Virtual Address Workload (e.g. `[1024, 2048, 3072, 1024, 4096]`)
```java
List<Long> addresses = Arrays.asList(1024L, 2048L, 3072L, 1024L, 4096L);
List<PagingSimulationStep> steps = sim.executeAddressWorkload(addresses);
```

Both methods automatically supply the future reference list to `OptimalReplacement` to ensure accurate forward look-ahead.

---

## 17. How Member 3 Can Consume Results

Member 3 integrates the simulator into the FastAPI backend and React frontend:
- **CLI / Subprocess Execution:** Member 3 can invoke the compiled Java engine via CLI arguments or JSON stdin/stdout.
- **Direct Java/Python Bridge (e.g. Py4J or JPype):** Member 3 can call the Java classes directly.
- **Predictable JSON Output:** Each step returns complete memory snapshots (`PagingState` / `SegmentationMemoryLayout`), allowing frontend components to render:
  - Frame occupancy tables
  - Page table status (valid bit, referenced bit, modified bit, timestamps)
  - Memory layout visualization (color-coded segments and free holes)
  - Cumulative cost and fault rate charts

---

## 18. How to Compile

Run the provided PowerShell or Batch scripts, or execute standard `javac`:

```powershell
# Using PowerShell script:
.\run_tests.ps1

# Or manually:
javac -d out/production (Get-ChildItem -Recurse -Filter *.java src/main/java).FullName
javac -cp out/production -d out/test (Get-ChildItem -Recurse -Filter *.java src/test/java).FullName
```

---

## 19. How to Run Tests

Run the test suite via the test runner:

```powershell
# Using Batch script:
.\run_tests.bat

# Or using PowerShell:
.\run_tests.ps1

# Or directly via Java:
java -cp "out/production;out/test" simulator.TestRunner
```

Expected output:
```
============================================================
  OS MEMORY MANAGEMENT SIMULATOR — MEMBER 1 TEST SUITE
============================================================
Running Test Class: PagingSimulatorTest
  [PASS] testPhysicalAddressCalculation
  [PASS] testNormalTranslation
  [PASS] testDeterminism
  [PASS] testOffsetCalculation
  [PASS] testOptimalReplacement
  [PASS] testLruReplacement
  [PASS] testTranslationHistory
  [PASS] testPageCalculation
  [PASS] testBoundaryCases
  [PASS] testMemoryStateUpdate
  [PASS] testPageFaultHandling
  [PASS] testInvalidMemoryAccess
  [PASS] testFifoReplacement

Running Test Class: SegmentationSimulatorTest
  [PASS] testDeterminism
  [PASS] testBasePlusOffsetCalculation
  [PASS] testSegmentationFaultHandling
  [PASS] testOffsetEqualToLimit
  [PASS] testOffsetGreaterThanLimit
  [PASS] testFreeAreasAndHoles
  [PASS] testSegmentLookup
  [PASS] testValidOffset
  [PASS] testMemoryLayout

============================================================
                     TEST EXECUTION SUMMARY
============================================================
 Total Tests Executed : 22
 Tests Passed         : 22
 Tests Failed         : 0
============================================================
TEST SUITE STATUS: ALL TESTS PASSED SUCCESSFULLY! (100% PASS RATE)
```

---

## 20. Known Limitations

1. **Static Segment Table:** The current segmentation engine models fixed-allocation segments without dynamic segment compaction or runtime memory reallocation (such as First-Fit/Best-Fit allocation during process execution).
2. **Simplified Cost Units:** Cost metrics are simulated educational units, not hardware nanoseconds or cycle-accurate CPU metrics.
3. **Single Process Model:** The simulation currently models a single process address space for clarity and viva presentation.
