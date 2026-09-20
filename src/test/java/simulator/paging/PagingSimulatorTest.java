package simulator.paging;

import simulator.common.CostModel;

import java.util.Arrays;
import java.util.List;

/**
 * Unit tests for Paging simulation and replacement algorithms.
 * Covers requirements 1-12 and 21 (Determinism).
 */
public class PagingSimulatorTest {

    // Helper assertion methods for standalone execution without external dependencies
    private static void assertEquals(long expected, long actual, String message) {
        if (expected != actual) {
            throw new AssertionError(String.format("%s: expected <%d> but was <%d>", message, expected, actual));
        }
    }

    private static void assertEquals(double expected, double actual, double delta, String message) {
        if (Math.abs(expected - actual) > delta) {
            throw new AssertionError(String.format("%s: expected <%f> but was <%f>", message, expected, actual));
        }
    }

    private static void assertEquals(Object expected, Object actual, String message) {
        if (expected == null && actual == null) return;
        if (expected == null || !expected.equals(actual)) {
            throw new AssertionError(String.format("%s: expected <%s> but was <%s>", message, expected, actual));
        }
    }

    private static void assertTrue(boolean condition, String message) {
        if (!condition) {
            throw new AssertionError("Assertion failed: " + message);
        }
    }

    private static void assertFalse(boolean condition, String message) {
        if (condition) {
            throw new AssertionError("Assertion failed: " + message);
        }
    }

    // 1. Page calculation (Mandatory Example: VA=2500, PageSize=1024 -> page=2)
    public static void testPageCalculation() {
        int pageSize = 1024;
        long virtualAddress = 2500;
        int pageNumber = (int) (virtualAddress / pageSize);
        assertEquals(2, pageNumber, "Virtual address 2500 with page size 1024 must yield page number 2");
    }

    // 2. Offset calculation (Mandatory Example: VA=2500, PageSize=1024 -> offset=452)
    public static void testOffsetCalculation() {
        int pageSize = 1024;
        long virtualAddress = 2500;
        long offset = virtualAddress % pageSize;
        assertEquals(452, offset, "Virtual address 2500 with page size 1024 must yield offset 452");
    }

    // 3. Physical address calculation (PA = frameNumber * pageSize + offset)
    public static void testPhysicalAddressCalculation() {
        int pageSize = 1024;
        int frameNumber = 3;
        long offset = 452;
        long physicalAddress = (long) frameNumber * pageSize + offset;
        assertEquals(3524, physicalAddress, "Physical address must be 3 * 1024 + 452 = 3524");
    }

    // 4. Normal translation (Page hit after initial load)
    public static void testNormalTranslation() {
        PagingConfig config = new PagingConfig(1024, 4);
        PagingSimulator sim = new PagingSimulator(config, new FifoReplacement());

        // Step 1: Initial access (Page Fault)
        PagingTranslationResult res1 = sim.translate(2500);
        assertTrue(res1.isPageFault(), "First access to page 2 must be a page fault");
        assertEquals(2, res1.getPageNumber(), "Page number must be 2");
        assertEquals(452, res1.getOffset(), "Offset must be 452");
        assertEquals(0, res1.getFrameNumber(), "Page 2 should be loaded into free frame 0");
        assertEquals(452, res1.getPhysicalAddress(), "Physical address should be 0*1024 + 452 = 452");

        // Step 2: Second access to same page (Page Hit)
        PagingTranslationResult res2 = sim.translate(2600); // 2600 / 1024 = page 2, offset 552
        assertFalse(res2.isPageFault(), "Second access to page 2 must be a page hit");
        assertEquals(2, res2.getPageNumber(), "Page number must be 2");
        assertEquals(552, res2.getOffset(), "Offset must be 552");
        assertEquals(0, res2.getFrameNumber(), "Frame number must remain 0");
        assertEquals(552, res2.getPhysicalAddress(), "Physical address should be 0*1024 + 552 = 552");
        assertEquals(CostModel.calculatePagingCost(false), res2.getTranslationCost(), 0.001, "Cost must be hit cost");
    }

    // 5. Boundary cases (offset 0, offset = pageSize - 1)
    public static void testBoundaryCases() {
        PagingConfig config = new PagingConfig(1024, 4);
        PagingSimulator sim = new PagingSimulator(config, new FifoReplacement());

        // Offset 0: virtual address 1024 -> page 1, offset 0
        PagingTranslationResult res1 = sim.translate(1024);
        assertEquals(1, res1.getPageNumber(), "Page number should be 1");
        assertEquals(0, res1.getOffset(), "Offset should be 0");

        // Offset pageSize - 1: virtual address 2047 -> page 1, offset 1023
        PagingTranslationResult res2 = sim.translate(2047);
        assertEquals(1, res2.getPageNumber(), "Page number should be 1");
        assertEquals(1023, res2.getOffset(), "Offset should be 1023");
    }

    // 6. Invalid memory access
    public static void testInvalidMemoryAccess() {
        PagingConfig config = new PagingConfig(1024, 4, 10000); // Limit 10000
        PagingSimulator sim = new PagingSimulator(config, new FifoReplacement());

        // Negative address
        boolean threwNegative = false;
        try {
            sim.translate(-50);
        } catch (IllegalArgumentException e) {
            threwNegative = true;
        }
        assertTrue(threwNegative, "Negative virtual address must throw IllegalArgumentException");

        // Address beyond virtual limit
        boolean threwLimit = false;
        try {
            sim.translate(10050);
        } catch (IllegalArgumentException e) {
            threwLimit = true;
        }
        assertTrue(threwLimit, "Virtual address exceeding limit must throw IllegalArgumentException");
    }

    // 7. Page fault detection and recording
    public static void testPageFaultHandling() {
        PagingConfig config = new PagingConfig(1024, 2);
        PagingSimulator sim = new PagingSimulator(config, new FifoReplacement());

        PagingTranslationResult res = sim.translate(2500);
        assertTrue(res.isPageFault(), "Page fault must be detected");
        assertEquals(1, sim.getPageFaults(), "Total page faults count must be 1");
        assertEquals(CostModel.calculatePagingCost(true), res.getTranslationCost(), 0.001,
                "Simulated cost must reflect page fault handler overhead");
    }

    // 8. Memory state update
    public static void testMemoryStateUpdate() {
        PagingConfig config = new PagingConfig(1024, 2);
        PagingSimulator sim = new PagingSimulator(config, new FifoReplacement());

        sim.translate(2500); // page 2
        PagingState state = sim.getMemoryState();

        assertEquals(2, state.getTotalFrames(), "Total frames must be 2");
        assertEquals(1, state.getAllocatedFramesCount(), "Allocated frames count must be 1");
        assertEquals(1, state.getFreeFramesCount(), "Free frames count must be 1");
        assertTrue(state.getFrames().get(0).isOccupied(), "Frame 0 must be occupied");
        assertEquals(2, state.getFrames().get(0).getPageNumber(), "Frame 0 must hold page 2");
        assertFalse(state.getFrames().get(1).isOccupied(), "Frame 1 must be free");
    }

    // 9. Translation history
    public static void testTranslationHistory() {
        PagingConfig config = new PagingConfig(1024, 4);
        PagingSimulator sim = new PagingSimulator(config, new FifoReplacement());

        sim.translate(1024); // Step 1
        sim.translate(2048); // Step 2
        sim.translate(3072); // Step 3

        List<PagingSimulationStep> history = sim.getExecutionHistory();
        assertEquals(3, history.size(), "Execution history must contain exactly 3 steps");
        assertEquals(1, history.get(0).getStepIndex(), "Step 1 index must be 1");
        assertEquals(1, history.get(0).getPageNumber(), "Step 1 page must be 1");
        assertEquals(2, history.get(1).getStepIndex(), "Step 2 index must be 2");
        assertEquals(2, history.get(1).getPageNumber(), "Step 2 page must be 2");
        assertEquals(3, history.get(2).getStepIndex(), "Step 3 index must be 3");
        assertEquals(3, history.get(2).getPageNumber(), "Step 3 page must be 3");
    }

    // 10. FIFO Replacement Algorithm with reference string [1, 2, 3, 1, 4, 2, 5] and 3 frames
    public static void testFifoReplacement() {
        PagingConfig config = new PagingConfig(1024, 3);
        PagingSimulator sim = new PagingSimulator(config, new FifoReplacement());

        List<Integer> refString = Arrays.asList(1, 2, 3, 1, 4, 2, 5);
        List<PagingSimulationStep> steps = sim.executePageReferenceString(refString);

        // Step 0: Ref 1 -> Fault (Frame 0)
        assertTrue(steps.get(0).getResult().isPageFault(), "Step 1 (page 1) must fault");
        assertEquals(0, steps.get(0).getResult().getFrameNumber(), "Page 1 in Frame 0");

        // Step 1: Ref 2 -> Fault (Frame 1)
        assertTrue(steps.get(1).getResult().isPageFault(), "Step 2 (page 2) must fault");
        assertEquals(1, steps.get(1).getResult().getFrameNumber(), "Page 2 in Frame 1");

        // Step 2: Ref 3 -> Fault (Frame 2)
        assertTrue(steps.get(2).getResult().isPageFault(), "Step 3 (page 3) must fault");
        assertEquals(2, steps.get(2).getResult().getFrameNumber(), "Page 3 in Frame 2");

        // Step 3: Ref 1 -> Hit (Frame 0)
        assertFalse(steps.get(3).getResult().isPageFault(), "Step 4 (page 1) must hit");
        assertEquals(0, steps.get(3).getResult().getFrameNumber(), "Page 1 still in Frame 0");

        // Step 4: Ref 4 -> Fault. Frames full [1, 2, 3]. Oldest is 1! Evict 1 from Frame 0.
        assertTrue(steps.get(4).getResult().isPageFault(), "Step 5 (page 4) must fault");
        assertEquals(Integer.valueOf(1), steps.get(4).getResult().getVictimPageNumber(), "Victim must be page 1 (oldest)");
        assertEquals(0, steps.get(4).getResult().getFrameNumber(), "Page 4 loaded into Frame 0");

        // Step 5: Ref 2 -> Hit (Frame 1)
        assertFalse(steps.get(5).getResult().isPageFault(), "Step 6 (page 2) must hit");
        assertEquals(1, steps.get(5).getResult().getFrameNumber(), "Page 2 still in Frame 1");

        // Step 6: Ref 5 -> Fault. Frames full [4, 2, 3]. Oldest loaded is 2! Evict 2 from Frame 1.
        assertTrue(steps.get(6).getResult().isPageFault(), "Step 7 (page 5) must fault");
        assertEquals(Integer.valueOf(2), steps.get(6).getResult().getVictimPageNumber(), "Victim must be page 2");
        assertEquals(1, steps.get(6).getResult().getFrameNumber(), "Page 5 loaded into Frame 1");

        assertEquals(5, sim.getPageFaults(), "FIFO total page faults must be 5");
        assertEquals(2, sim.getPageHits(), "FIFO total page hits must be 2");
    }

    // 11. LRU Replacement Algorithm with reference string [1, 2, 3, 1, 4, 2, 5] and 3 frames
    public static void testLruReplacement() {
        PagingConfig config = new PagingConfig(1024, 3);
        PagingSimulator sim = new PagingSimulator(config, new LruReplacement());

        List<Integer> refString = Arrays.asList(1, 2, 3, 1, 4, 2, 5);
        List<PagingSimulationStep> steps = sim.executePageReferenceString(refString);

        // Step 0: Ref 1 -> Fault (Frame 0)
        // Step 1: Ref 2 -> Fault (Frame 1)
        // Step 2: Ref 3 -> Fault (Frame 2)
        // Step 3: Ref 1 -> Hit (Frame 0). Last access timestamps: page 1 = 4, page 2 = 2, page 3 = 3.
        // Step 4: Ref 4 -> Fault. Resident: [1, 2, 3]. LRU page is 2 (accessed at 2). Evict 2 from Frame 1.
        assertTrue(steps.get(4).getResult().isPageFault(), "Step 5 (page 4) must fault");
        assertEquals(Integer.valueOf(2), steps.get(4).getResult().getVictimPageNumber(), "Victim must be page 2 (LRU)");
        assertEquals(1, steps.get(4).getResult().getFrameNumber(), "Page 4 loaded into Frame 1");

        // Step 5: Ref 2 -> Fault. Resident: [1, 4, 3]. Last accessed: page 1 = 4, page 4 = 5, page 3 = 3.
        // LRU page is 3! Evict 3 from Frame 2.
        assertTrue(steps.get(5).getResult().isPageFault(), "Step 6 (page 2) must fault");
        assertEquals(Integer.valueOf(3), steps.get(5).getResult().getVictimPageNumber(), "Victim must be page 3 (LRU)");
        assertEquals(2, steps.get(5).getResult().getFrameNumber(), "Page 2 loaded into Frame 2");

        // Step 6: Ref 5 -> Fault. Resident: [1, 4, 2]. Last accessed: page 1 = 4, page 4 = 5, page 2 = 6.
        // LRU page is 1! Evict 1 from Frame 0.
        assertTrue(steps.get(6).getResult().isPageFault(), "Step 7 (page 5) must fault");
        assertEquals(Integer.valueOf(1), steps.get(6).getResult().getVictimPageNumber(), "Victim must be page 1 (LRU)");
        assertEquals(0, steps.get(6).getResult().getFrameNumber(), "Page 5 loaded into Frame 0");

        assertEquals(6, sim.getPageFaults(), "LRU total page faults must be 6");
        assertEquals(1, sim.getPageHits(), "LRU total page hits must be 1");
    }

    // 12. Optimal Replacement Algorithm with reference string [1, 2, 3, 1, 4, 2, 5] and 3 frames
    public static void testOptimalReplacement() {
        PagingConfig config = new PagingConfig(1024, 3);
        PagingSimulator sim = new PagingSimulator(config, new OptimalReplacement());

        List<Integer> refString = Arrays.asList(1, 2, 3, 1, 4, 2, 5);
        List<PagingSimulationStep> steps = sim.executePageReferenceString(refString);

        // Step 0: Ref 1 -> Fault (Frame 0)
        // Step 1: Ref 2 -> Fault (Frame 1)
        // Step 2: Ref 3 -> Fault (Frame 2)
        // Step 3: Ref 1 -> Hit (Frame 0)
        // Step 4: Ref 4 -> Fault. Resident: [1, 2, 3]. Future references: [2, 5].
        // Next uses: Page 2 used next (dist 1). Page 1 and Page 3 are never used again!
        // Deterministic tie-breaker: FIFO load order -> Page 1 was loaded first, so evict Page 1.
        assertTrue(steps.get(4).getResult().isPageFault(), "Step 5 (page 4) must fault");
        assertEquals(Integer.valueOf(1), steps.get(4).getResult().getVictimPageNumber(), "Victim must be page 1");
        assertEquals(0, steps.get(4).getResult().getFrameNumber(), "Page 4 loaded into Frame 0");

        // Step 5: Ref 2 -> Hit (Frame 1)
        assertFalse(steps.get(5).getResult().isPageFault(), "Step 6 (page 2) must hit");
        assertEquals(1, steps.get(5).getResult().getFrameNumber(), "Page 2 still in Frame 1");

        // Step 6: Ref 5 -> Fault. Resident: [4, 2, 3]. Future references: [].
        // All never used again. Oldest loaded page is Page 2 (loaded at step 2, whereas Page 3 loaded at step 3, Page 4 at step 5).
        // Evict Page 2 from Frame 1. Load Page 5 into Frame 1.
        assertTrue(steps.get(6).getResult().isPageFault(), "Step 7 (page 5) must fault");
        assertEquals(Integer.valueOf(2), steps.get(6).getResult().getVictimPageNumber(), "Victim must be page 2");
        assertEquals(1, steps.get(6).getResult().getFrameNumber(), "Page 5 loaded into Frame 1");

        assertEquals(5, sim.getPageFaults(), "Optimal total page faults must be 5");
        assertEquals(2, sim.getPageHits(), "Optimal total page hits must be 2");
    }

    // 21a. Determinism: same input produces same output
    public static void testDeterminism() {
        PagingConfig config = new PagingConfig(1024, 3);
        List<Integer> refString = Arrays.asList(1, 2, 3, 1, 4, 2, 5);

        // Run 1
        PagingSimulator sim1 = new PagingSimulator(config, new FifoReplacement());
        List<PagingSimulationStep> run1 = sim1.executePageReferenceString(refString);

        // Run 2
        PagingSimulator sim2 = new PagingSimulator(config, new FifoReplacement());
        List<PagingSimulationStep> run2 = sim2.executePageReferenceString(refString);

        assertEquals(run1.size(), run2.size(), "Both runs must have same number of steps");
        for (int i = 0; i < run1.size(); i++) {
            PagingTranslationResult r1 = run1.get(i).getResult();
            PagingTranslationResult r2 = run2.get(i).getResult();
            assertEquals(r1.getVirtualAddress(), r2.getVirtualAddress(), "VA must match at step " + i);
            assertEquals(r1.getPageNumber(), r2.getPageNumber(), "Page must match at step " + i);
            assertEquals(r1.getFrameNumber(), r2.getFrameNumber(), "Frame must match at step " + i);
            assertEquals(r1.getPhysicalAddress(), r2.getPhysicalAddress(), "PA must match at step " + i);
            assertEquals(r1.isPageFault(), r2.isPageFault(), "Fault state must match at step " + i);
            assertEquals(r1.getTranslationCost(), r2.getTranslationCost(), 0.0001, "Cost must match at step " + i);
        }
    }
}
