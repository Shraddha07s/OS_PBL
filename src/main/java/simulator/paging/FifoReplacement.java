package simulator.paging;

import java.util.List;

/**
 * First-In, First-Out (FIFO) Page Replacement Algorithm.
 *
 * Evicts the page that has been resident in memory for the longest time
 * (i.e. has the smallest load timestamp).
 */
public class FifoReplacement implements ReplacementAlgorithm {

    @Override
    public String getName() {
        return "FIFO";
    }

    @Override
    public int selectVictim(List<PhysicalFrame> allocatedFrames, PageTable pageTable, List<Integer> futureReferences) {
        if (allocatedFrames == null || allocatedFrames.isEmpty()) {
            throw new IllegalStateException("Cannot select victim from empty frame list");
        }

        int victimPage = -1;
        long oldestLoadTime = Long.MAX_VALUE;

        for (PhysicalFrame frame : allocatedFrames) {
            int pageNumber = frame.getPageNumber();
            PageTableEntry entry = pageTable.getEntry(pageNumber);
            if (entry != null && entry.isValid()) {
                if (entry.getLoadTimestamp() < oldestLoadTime) {
                    oldestLoadTime = entry.getLoadTimestamp();
                    victimPage = pageNumber;
                }
            }
        }

        if (victimPage == -1) {
            // Fallback to the first occupied frame's page
            victimPage = allocatedFrames.get(0).getPageNumber();
        }

        return victimPage;
    }
}
