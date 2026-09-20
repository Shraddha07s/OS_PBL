package simulator.paging;

import java.util.List;

/**
 * Optimal (OPT / Belady's Min) Page Replacement Algorithm.
 *
 * Inspects future page references in the externally supplied reference string.
 * Evicts the resident page that will not be used for the longest period of time.
 * If any resident page is never referenced again in the future string, it is preferred for eviction.
 * Ties among pages that are never used again are broken deterministically using load order (FIFO).
 */
public class OptimalReplacement implements ReplacementAlgorithm {

    @Override
    public String getName() {
        return "Optimal";
    }

    @Override
    public int selectVictim(List<PhysicalFrame> allocatedFrames, PageTable pageTable, List<Integer> futureReferences) {
        if (allocatedFrames == null || allocatedFrames.isEmpty()) {
            throw new IllegalStateException("Cannot select victim from empty frame list");
        }

        int victimPage = -1;
        int farthestNextUse = -1;
        long oldestLoadTimeForUnused = Long.MAX_VALUE;

        for (PhysicalFrame frame : allocatedFrames) {
            int pageNumber = frame.getPageNumber();
            PageTableEntry entry = pageTable.getEntry(pageNumber);

            int nextIndex = findNextReferenceIndex(pageNumber, futureReferences);

            if (nextIndex == -1) {
                // Page is never referenced again in the future string!
                // Prioritize this page. If multiple pages are never used again, break tie with loadTimestamp (FIFO).
                long loadTime = (entry != null) ? entry.getLoadTimestamp() : Long.MAX_VALUE;
                if (farthestNextUse != Integer.MAX_VALUE || loadTime < oldestLoadTimeForUnused) {
                    farthestNextUse = Integer.MAX_VALUE;
                    oldestLoadTimeForUnused = loadTime;
                    victimPage = pageNumber;
                }
            } else {
                // Page is referenced again. Compare next use distance only if no never-used page found yet.
                if (farthestNextUse != Integer.MAX_VALUE && nextIndex > farthestNextUse) {
                    farthestNextUse = nextIndex;
                    victimPage = pageNumber;
                }
            }
        }

        if (victimPage == -1) {
            victimPage = allocatedFrames.get(0).getPageNumber();
        }

        return victimPage;
    }

    private int findNextReferenceIndex(int pageNumber, List<Integer> futureReferences) {
        if (futureReferences == null) {
            return -1;
        }
        for (int i = 0; i < futureReferences.size(); i++) {
            if (futureReferences.get(i) == pageNumber) {
                return i;
            }
        }
        return -1;
    }
}
