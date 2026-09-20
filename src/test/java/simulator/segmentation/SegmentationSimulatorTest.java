package simulator.segmentation;

import simulator.common.CostModel;

import java.util.List;

/**
 * Unit tests for Segmentation simulation, bounds/permission checking, and memory layout.
 * Covers requirements 13-20 and 21 (Determinism).
 */
public class SegmentationSimulatorTest {

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

    private static SegmentTable createStandardSegmentTable() {
        SegmentTable table = new SegmentTable();
        // Code: base 1000, limit 400, Read-Execute
        table.addSegment(new Segment(0, "Code", 1000, 400, Permission.READ_EXECUTE));
        // Data: base 2000, limit 600, Read-Write
        table.addSegment(new Segment(1, "Data", 2000, 600, Permission.READ_WRITE));
        // Stack: base 3500, limit 500, Read-Write
        table.addSegment(new Segment(2, "Stack", 3500, 500, Permission.READ_WRITE));
        // Heap: base 5000, limit 800, Read-Write
        table.addSegment(new Segment(3, "Heap", 5000, 800, Permission.READ_WRITE));
        return table;
    }

    // 13. Segment lookup (by ID and name)
    public static void testSegmentLookup() {
        SegmentTable table = createStandardSegmentTable();
        Segment codeById = table.getSegment(0);
        Segment codeByName = table.getSegment("Code");

        assertEquals("Code", codeById.getName(), "Segment lookup by ID 0 should return 'Code'");
        assertEquals(codeById, codeByName, "Lookup by ID and lookup by name must return the same segment");
        assertEquals(1000, codeById.getBase(), "Code base should be 1000");
        assertEquals(400, codeById.getLimit(), "Code limit should be 400");
    }

    // 14. Base + offset calculation (PA = base + offset)
    public static void testBasePlusOffsetCalculation() {
        SegmentTable table = createStandardSegmentTable();
        SegmentationSimulator sim = new SegmentationSimulator(table, 8000);

        SegmentationTranslationResult res = sim.translate("Data", 150, AccessType.READ);
        assertTrue(res.isValid(), "Offset 150 in Data should be valid");
        assertEquals(2000, res.getBase(), "Base should be 2000");
        assertEquals(150, res.getOffset(), "Offset should be 150");
        assertEquals(2150, res.getPhysicalAddress(), "Physical address must be 2000 + 150 = 2150");
    }

    // 15. Valid offset (offset < limit)
    public static void testValidOffset() {
        SegmentTable table = createStandardSegmentTable();
        SegmentationSimulator sim = new SegmentationSimulator(table, 8000);

        // Offset 0 (first byte)
        SegmentationTranslationResult res0 = sim.translate("Code", 0, AccessType.EXECUTE);
        assertTrue(res0.isValid(), "Offset 0 should be valid");
        assertEquals(1000, res0.getPhysicalAddress(), "PA for offset 0 should be base (1000)");

        // Offset limit - 1 (last valid byte: 399)
        SegmentationTranslationResult resEnd = sim.translate("Code", 399, AccessType.EXECUTE);
        assertTrue(resEnd.isValid(), "Offset 399 (limit - 1) should be valid");
        assertEquals(1399, resEnd.getPhysicalAddress(), "PA for offset 399 should be 1399");
        assertEquals(CostModel.calculateSegmentationCost(true), resEnd.getTranslationCost(), 0.001,
                "Cost should be successful translation cost");
    }

    // 16. Offset equal to limit (boundary condition: offset == limit is a FAULT)
    public static void testOffsetEqualToLimit() {
        SegmentTable table = createStandardSegmentTable();
        SegmentationSimulator sim = new SegmentationSimulator(table, 8000);

        // Code limit is 400. Valid offsets are 0..399. Offset 400 is out of bounds!
        SegmentationTranslationResult res = sim.translate("Code", 400, AccessType.READ);
        assertFalse(res.isValid(), "Offset equal to limit (400) MUST produce a segmentation fault");
        assertEquals("LIMIT_EXCEEDED", res.getFaultType(), "Fault type must be LIMIT_EXCEEDED");
        assertEquals(-1, res.getPhysicalAddress(), "Physical address must be -1 on fault");
        assertEquals(CostModel.calculateSegmentationCost(false), res.getTranslationCost(), 0.001,
                "Cost should reflect bounds check failure without memory access");
    }

    // 17. Offset greater than limit (fault)
    public static void testOffsetGreaterThanLimit() {
        SegmentTable table = createStandardSegmentTable();
        SegmentationSimulator sim = new SegmentationSimulator(table, 8000);

        SegmentationTranslationResult res = sim.translate("Code", 450, AccessType.READ);
        assertFalse(res.isValid(), "Offset 450 > limit 400 MUST produce a segmentation fault");
        assertEquals("LIMIT_EXCEEDED", res.getFaultType(), "Fault type must be LIMIT_EXCEEDED");
        assertEquals(-1, res.getPhysicalAddress(), "Physical address must be -1 on fault");
    }

    // 18. Segmentation fault handling (negative offset & permission denied)
    public static void testSegmentationFaultHandling() {
        SegmentTable table = createStandardSegmentTable();
        SegmentationSimulator sim = new SegmentationSimulator(table, 8000);

        // Negative offset
        SegmentationTranslationResult resNeg = sim.translate("Data", -10, AccessType.READ);
        assertFalse(resNeg.isValid(), "Negative offset must fail");
        assertEquals("LIMIT_EXCEEDED", resNeg.getFaultType(), "Fault type must be LIMIT_EXCEEDED");

        // Permission denied (Writing to Read-Execute Code segment)
        SegmentationTranslationResult resPerm = sim.translate("Code", 100, AccessType.WRITE);
        assertFalse(resPerm.isValid(), "Write to read-only Code segment must fail");
        assertEquals("PERMISSION_DENIED", resPerm.getFaultType(), "Fault type must be PERMISSION_DENIED");
        assertEquals(-1, resPerm.getPhysicalAddress(), "Physical address must be -1");

        // Non-existent segment
        SegmentationTranslationResult resNotFound = sim.translate("NonExistent", 50, AccessType.READ);
        assertFalse(resNotFound.isValid(), "Non-existent segment must fail");
        assertEquals("SEGMENT_NOT_FOUND", resNotFound.getFaultType(), "Fault type must be SEGMENT_NOT_FOUND");
    }

    // 19. Memory layout tracking
    public static void testMemoryLayout() {
        SegmentTable table = createStandardSegmentTable();
        long totalMemory = 8000;
        SegmentationSimulator sim = new SegmentationSimulator(table, totalMemory);

        SegmentationMemoryLayout layout = sim.computeMemoryLayout();
        assertEquals(totalMemory, layout.getTotalMemorySize(), "Total memory size must be 8000");

        List<Segment> allocated = layout.getAllocatedSegments();
        assertEquals(4, allocated.size(), "Should have 4 allocated segments");
        // Sum of limits: 400 + 600 + 500 + 800 = 2300
        assertEquals(2300, layout.getTotalAllocatedMemory(), "Total allocated memory must be 2300");
    }

    // 20. Free areas and memory holes
    public static void testFreeAreasAndHoles() {
        SegmentTable table = createStandardSegmentTable();
        // Layout:
        // Hole 1: 0 to 1000 (size 1000)
        // Code:   1000 to 1400 (size 400)
        // Hole 2: 1400 to 2000 (size 600)
        // Data:   2000 to 2600 (size 600)
        // Hole 3: 2600 to 3500 (size 900)
        // Stack:  3500 to 4000 (size 500)
        // Hole 4: 4000 to 5000 (size 1000)
        // Heap:   5000 to 5800 (size 800)
        // Hole 5: 5800 to 8000 (size 2200)
        long totalMemory = 8000;
        SegmentationSimulator sim = new SegmentationSimulator(table, totalMemory);

        SegmentationMemoryLayout layout = sim.computeMemoryLayout();
        List<MemoryHole> holes = layout.getFreeHoles();

        assertEquals(5, holes.size(), "There should be 5 distinct memory holes");

        // Hole 1
        assertEquals(0, holes.get(0).getBase(), "Hole 1 base should be 0");
        assertEquals(1000, holes.get(0).getSize(), "Hole 1 size should be 1000");

        // Hole 2
        assertEquals(1400, holes.get(1).getBase(), "Hole 2 base should be 1400");
        assertEquals(600, holes.get(1).getSize(), "Hole 2 size should be 600");

        // Hole 3
        assertEquals(2600, holes.get(2).getBase(), "Hole 3 base should be 2600");
        assertEquals(900, holes.get(2).getSize(), "Hole 3 size should be 900");

        // Hole 4
        assertEquals(4000, holes.get(3).getBase(), "Hole 4 base should be 4000");
        assertEquals(1000, holes.get(3).getSize(), "Hole 4 size should be 1000");

        // Hole 5
        assertEquals(5800, holes.get(4).getBase(), "Hole 5 base should be 5800");
        assertEquals(2200, holes.get(4).getSize(), "Hole 5 size should be 2200");

        // Total free memory: 1000 + 600 + 900 + 1000 + 2200 = 5700
        assertEquals(5700, layout.getTotalFreeMemory(), "Total free memory must be 5700");
        assertEquals(2200, layout.getLargestFreeHole(), "Largest free hole must be 2200");
    }

    // 21b. Determinism: same input produces same output
    public static void testDeterminism() {
        SegmentTable table1 = createStandardSegmentTable();
        SegmentationSimulator sim1 = new SegmentationSimulator(table1, 8000);

        SegmentTable table2 = createStandardSegmentTable();
        SegmentationSimulator sim2 = new SegmentationSimulator(table2, 8000);

        SegmentationTranslationResult r1 = sim1.translate("Data", 250, AccessType.WRITE);
        SegmentationTranslationResult r2 = sim2.translate("Data", 250, AccessType.WRITE);

        assertEquals(r1.isValid(), r2.isValid(), "Validity must match");
        assertEquals(r1.getPhysicalAddress(), r2.getPhysicalAddress(), "Physical address must match");
        assertEquals(r1.getTranslationCost(), r2.getTranslationCost(), 0.0001, "Cost must match");
        assertEquals(r1.getBase(), r2.getBase(), "Base must match");
        assertEquals(r1.getLimit(), r2.getLimit(), "Limit must match");
    }
}
