package simulator.paging;

import java.util.List;

/**
 * Least Recently Used (LRU) Page Replacement Algorithm.
 *
 * Evicts the page that has not been accessed for the longest time
 * (i.e. has the smallest last-access timestamp).
 */
public class LruReplacement implements ReplacementAlgorithm {

    @Override
    public String getName() {
        return "LRU";
    }

    @Override
    public int selectVictim(List<PhysicalFrame> allocatedFrames, PageTable pageTable, List<Integer> futureReferences) {
        if (allocatedFrames == null || allocatedFrames.isEmpty()) {
            throw new IllegalStateException("Cannot select victim from empty frame list");
        }

        int victimPage = -1;
        long oldestAccessTime = Long.MAX_VALUE;

        for (PhysicalFrame frame : allocatedFrames) {
            int pageNumber = frame.getPageNumber();
            PageTableEntry entry = pageTable.getEntry(pageNumber);
            if (entry != null && entry.isValid()) {
                if (entry.getLastAccessTimestamp() < oldestAccessTime) {
                    oldestAccessTime = entry.getLastAccessTimestamp();
                    victimPage = pageNumber;
                }
            }
        }

        if (victimPage == -1) {
            victimPage = allocatedFrames.get(0).getPageNumber();
        }

        return victimPage;
    }
}
