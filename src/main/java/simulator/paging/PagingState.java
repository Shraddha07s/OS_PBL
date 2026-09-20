package simulator.paging;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Snapshot of the memory state in the Paging Simulator at a specific point in time.
 * Provides clean, immutable data for frontend visualization and history tracking.
 */
public class PagingState {
    private final int totalFrames;
    private final int allocatedFramesCount;
    private final int freeFramesCount;
    private final List<PhysicalFrame> frames;
    private final List<PageTableEntry> activeEntries;
    private final long stepNumber;

    public PagingState(int totalFrames, List<PhysicalFrame> frames,
                       List<PageTableEntry> activeEntries, long stepNumber) {
        this.totalFrames = totalFrames;
        int occupied = 0;
        List<PhysicalFrame> frameCopies = new ArrayList<>();
        if (frames != null) {
            for (PhysicalFrame f : frames) {
                frameCopies.add(f.copy());
                if (f.isOccupied()) {
                    occupied++;
                }
            }
        }
        this.frames = Collections.unmodifiableList(frameCopies);
        this.allocatedFramesCount = occupied;
        this.freeFramesCount = totalFrames - occupied;

        List<PageTableEntry> entryCopies = new ArrayList<>();
        if (activeEntries != null) {
            for (PageTableEntry e : activeEntries) {
                entryCopies.add(e.copy());
            }
        }
        this.activeEntries = Collections.unmodifiableList(entryCopies);
        this.stepNumber = stepNumber;
    }

    public int getTotalFrames() {
        return totalFrames;
    }

    public int getAllocatedFramesCount() {
        return allocatedFramesCount;
    }

    public int getFreeFramesCount() {
        return freeFramesCount;
    }

    public List<PhysicalFrame> getFrames() {
        return frames;
    }

    public List<PageTableEntry> getActiveEntries() {
        return activeEntries;
    }

    public long getStepNumber() {
        return stepNumber;
    }

    @Override
    public String toString() {
        return "PagingState{" +
                "step=" + stepNumber +
                ", totalFrames=" + totalFrames +
                ", allocated=" + allocatedFramesCount +
                ", free=" + freeFramesCount +
                ", frames=" + frames +
                '}';
    }
}
