package simulator.segmentation;

import simulator.common.CostModel;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/**
 * Core Segmentation Memory Management Simulator.
 *
 * Simulates segment lookup, base/limit boundary validation, permission enforcement,
 * physical address calculation, and memory layout tracking (allocated ranges and free holes).
 *
 * Maintains deterministic state without global or static mutable variables.
 */
public class SegmentationSimulator {
    private final SegmentTable segmentTable;
    private final long totalMemorySize;
    private final List<SegmentationTranslationResult> executionHistory;

    private long currentStep;
    private int totalAccesses;
    private int successfulTranslations;
    private int segmentationFaults;
    private double totalSimulatedCost;

    public SegmentationSimulator(SegmentTable segmentTable, long totalMemorySize) {
        if (segmentTable == null) {
            throw new IllegalArgumentException("SegmentTable cannot be null");
        }
        if (totalMemorySize <= 0) {
            throw new IllegalArgumentException("Total memory size must be positive: " + totalMemorySize);
        }
        this.segmentTable = segmentTable;
        this.totalMemorySize = totalMemorySize;
        this.executionHistory = new ArrayList<>();
        this.currentStep = 0;
        this.totalAccesses = 0;
        this.successfulTranslations = 0;
        this.segmentationFaults = 0;
        this.totalSimulatedCost = 0.0;
    }

    /**
     * Translates a segment identifier and offset to a physical address.
     *
     * @param segmentId numeric identifier of the segment
     * @param offset byte offset within the segment
     * @param accessType type of operation (READ, WRITE, EXECUTE)
     * @return structured translation result
     */
    public synchronized SegmentationTranslationResult translate(int segmentId, long offset, AccessType accessType) {
        currentStep++;
        totalAccesses++;

        Segment segment = segmentTable.getSegment(segmentId);

        // 1. Segment Lookup Check
        if (segment == null) {
            segmentationFaults++;
            double cost = CostModel.PAGE_SEGMENT_LOOKUP_COST;
            totalSimulatedCost += cost;
            SegmentationMemoryLayout layout = computeMemoryLayout();
            String msg = String.format("SEGMENTATION FAULT: Segment ID %d does not exist in segment table.", segmentId);
            SegmentationTranslationResult result = new SegmentationTranslationResult(
                    segmentId, "UNKNOWN", offset, -1, -1, null, accessType,
                    false, "SEGMENT_NOT_FOUND", -1, cost, layout, currentStep, msg
            );
            executionHistory.add(result);
            return result;
        }

        return processSegmentTranslation(segment, offset, accessType);
    }

    /**
     * Translates a segment name and offset to a physical address.
     *
     * @param segmentName name of the segment (e.g., "Code", "Data", "Stack", "Heap")
     * @param offset byte offset within the segment
     * @param accessType type of operation (READ, WRITE, EXECUTE)
     * @return structured translation result
     */
    public synchronized SegmentationTranslationResult translate(String segmentName, long offset, AccessType accessType) {
        currentStep++;
        totalAccesses++;

        Segment segment = segmentTable.getSegment(segmentName);

        if (segment == null) {
            segmentationFaults++;
            double cost = CostModel.PAGE_SEGMENT_LOOKUP_COST;
            totalSimulatedCost += cost;
            SegmentationMemoryLayout layout = computeMemoryLayout();
            String msg = String.format("SEGMENTATION FAULT: Segment '%s' does not exist in segment table.", segmentName);
            SegmentationTranslationResult result = new SegmentationTranslationResult(
                    -1, segmentName != null ? segmentName : "UNKNOWN", offset, -1, -1, null, accessType,
                    false, "SEGMENT_NOT_FOUND", -1, cost, layout, currentStep, msg
            );
            executionHistory.add(result);
            return result;
        }

        return processSegmentTranslation(segment, offset, accessType);
    }

    private SegmentationTranslationResult processSegmentTranslation(Segment segment, long offset, AccessType accessType) {
        // 2. Base/Limit Bounds Check
        // Rule: offset must be >= 0 and strictly < limit
        if (offset < 0) {
            segmentationFaults++;
            double cost = CostModel.calculateSegmentationCost(false);
            totalSimulatedCost += cost;
            SegmentationMemoryLayout layout = computeMemoryLayout();
            String msg = String.format("SEGMENTATION FAULT: Negative offset %d on segment '%s'.", offset, segment.getName());
            SegmentationTranslationResult result = new SegmentationTranslationResult(
                    segment.getSegmentId(), segment.getName(), offset, segment.getBase(), segment.getLimit(),
                    segment.getPermissions(), accessType, false, "LIMIT_EXCEEDED", -1, cost, layout, currentStep, msg
            );
            executionHistory.add(result);
            return result;
        }

        if (offset >= segment.getLimit()) {
            segmentationFaults++;
            double cost = CostModel.calculateSegmentationCost(false);
            totalSimulatedCost += cost;
            SegmentationMemoryLayout layout = computeMemoryLayout();
            String msg = String.format("SEGMENTATION FAULT: Offset %d exceeds limit %d on segment '%s' (base=%d, limit=%d).",
                    offset, segment.getLimit(), segment.getName(), segment.getBase(), segment.getLimit());
            SegmentationTranslationResult result = new SegmentationTranslationResult(
                    segment.getSegmentId(), segment.getName(), offset, segment.getBase(), segment.getLimit(),
                    segment.getPermissions(), accessType, false, "LIMIT_EXCEEDED", -1, cost, layout, currentStep, msg
            );
            executionHistory.add(result);
            return result;
        }

        // 3. Permission Check
        if (accessType != null && !segment.allows(accessType)) {
            segmentationFaults++;
            double cost = CostModel.calculateSegmentationCost(false);
            totalSimulatedCost += cost;
            SegmentationMemoryLayout layout = computeMemoryLayout();
            String msg = String.format("SEGMENTATION FAULT: Permission denied for access %s on segment '%s' with permissions %s.",
                    accessType, segment.getName(), segment.getPermissions().getSymbol());
            SegmentationTranslationResult result = new SegmentationTranslationResult(
                    segment.getSegmentId(), segment.getName(), offset, segment.getBase(), segment.getLimit(),
                    segment.getPermissions(), accessType, false, "PERMISSION_DENIED", -1, cost, layout, currentStep, msg
            );
            executionHistory.add(result);
            return result;
        }

        // 4. Valid Physical Address Calculation: PA = base + offset
        long physicalAddress = segment.getBase() + offset;
        successfulTranslations++;
        double cost = CostModel.calculateSegmentationCost(true);
        totalSimulatedCost += cost;
        SegmentationMemoryLayout layout = computeMemoryLayout();

        String msg = String.format("VALID TRANSLATION: Segment '%s' [base=%d, limit=%d] + offset %d = physical address %d.",
                segment.getName(), segment.getBase(), segment.getLimit(), offset, physicalAddress);

        SegmentationTranslationResult result = new SegmentationTranslationResult(
                segment.getSegmentId(), segment.getName(), offset, segment.getBase(), segment.getLimit(),
                segment.getPermissions(), accessType, true, null, physicalAddress, cost, layout, currentStep, msg
        );
        executionHistory.add(result);
        return result;
    }

    /**
     * Computes the current memory layout, identifying allocated segment ranges
     * and free memory areas (holes).
     */
    public SegmentationMemoryLayout computeMemoryLayout() {
        List<Segment> segments = new ArrayList<>(segmentTable.getAllSegments());
        // Sort segments by ascending base address
        segments.sort(Comparator.comparingLong(Segment::getBase));

        List<MemoryHole> holes = new ArrayList<>();
        long currentCursor = 0;

        for (Segment s : segments) {
            if (s.getBase() > currentCursor) {
                // Free hole before this segment
                holes.add(new MemoryHole(currentCursor, s.getBase() - currentCursor));
            }
            // Advance cursor to the end of this segment
            long segEnd = s.getBase() + s.getLimit();
            if (segEnd > currentCursor) {
                currentCursor = segEnd;
            }
        }

        // Check for remaining hole after the last segment up to totalMemorySize
        if (currentCursor < totalMemorySize) {
            holes.add(new MemoryHole(currentCursor, totalMemorySize - currentCursor));
        }

        return new SegmentationMemoryLayout(totalMemorySize, segments, holes);
    }

    /**
     * Resets the simulator's execution state.
     */
    public synchronized void reset() {
        executionHistory.clear();
        currentStep = 0;
        totalAccesses = 0;
        successfulTranslations = 0;
        segmentationFaults = 0;
        totalSimulatedCost = 0.0;
    }

    // Getters
    public SegmentTable getSegmentTable() {
        return segmentTable;
    }

    public long getTotalMemorySize() {
        return totalMemorySize;
    }

    public List<SegmentationTranslationResult> getExecutionHistory() {
        return Collections.unmodifiableList(executionHistory);
    }

    public int getTotalAccesses() {
        return totalAccesses;
    }

    public int getSuccessfulTranslations() {
        return successfulTranslations;
    }

    public int getSegmentationFaults() {
        return segmentationFaults;
    }

    public double getTotalSimulatedCost() {
        return totalSimulatedCost;
    }
}
