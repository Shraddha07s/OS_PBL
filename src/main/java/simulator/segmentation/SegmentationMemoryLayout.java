package simulator.segmentation;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Represents the physical memory layout under Segmentation.
 * Tracks allocated segments, free memory areas (holes), and fragmentation metrics.
 */
public class SegmentationMemoryLayout {
    private final long totalMemorySize;
    private final List<Segment> allocatedSegments;
    private final List<MemoryHole> freeHoles;
    private final long totalAllocatedMemory;
    private final long totalFreeMemory;
    private final long largestFreeHole;
    private final double externalFragmentationRatio;

    public SegmentationMemoryLayout(long totalMemorySize, List<Segment> allocatedSegments, List<MemoryHole> freeHoles) {
        this.totalMemorySize = totalMemorySize;
        this.allocatedSegments = Collections.unmodifiableList(new ArrayList<>(allocatedSegments));
        this.freeHoles = Collections.unmodifiableList(new ArrayList<>(freeHoles));

        long allocated = 0;
        for (Segment s : allocatedSegments) {
            allocated += s.getLimit();
        }
        this.totalAllocatedMemory = allocated;

        long free = 0;
        long largest = 0;
        for (MemoryHole h : freeHoles) {
            free += h.getSize();
            if (h.getSize() > largest) {
                largest = h.getSize();
            }
        }
        this.totalFreeMemory = free;
        this.largestFreeHole = largest;

        // External fragmentation metric: fraction of free memory that cannot be satisfied by the largest hole
        // Standard definition: 1.0 - (largestFreeHole / totalFreeMemory) when totalFreeMemory > 0
        if (totalFreeMemory > 0) {
            this.externalFragmentationRatio = 1.0 - ((double) largestFreeHole / totalFreeMemory);
        } else {
            this.externalFragmentationRatio = 0.0;
        }
    }

    public long getTotalMemorySize() {
        return totalMemorySize;
    }

    public List<Segment> getAllocatedSegments() {
        return allocatedSegments;
    }

    public List<MemoryHole> getFreeHoles() {
        return freeHoles;
    }

    public long getTotalAllocatedMemory() {
        return totalAllocatedMemory;
    }

    public long getTotalFreeMemory() {
        return totalFreeMemory;
    }

    public long getLargestFreeHole() {
        return largestFreeHole;
    }

    public double getExternalFragmentationRatio() {
        return externalFragmentationRatio;
    }

    @Override
    public String toString() {
        return "SegmentationMemoryLayout{" +
                "totalMemory=" + totalMemorySize +
                ", allocated=" + totalAllocatedMemory +
                ", free=" + totalFreeMemory +
                ", largestHole=" + largestFreeHole +
                ", holesCount=" + freeHoles.size() +
                ", extFragRatio=" + String.format("%.2f", externalFragmentationRatio) +
                '}';
    }
}
