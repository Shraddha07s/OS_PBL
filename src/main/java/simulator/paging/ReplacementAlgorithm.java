package simulator.paging;

import java.util.List;

/**
 * Interface defining a page replacement policy.
 */
public interface ReplacementAlgorithm {

    /**
     * Returns the human-readable name of the replacement algorithm.
     */
    String getName();

    /**
     * Selects a resident victim page to be evicted from memory.
     *
     * @param allocatedFrames list of currently occupied physical frames
     * @param pageTable current page table containing entry metadata
     * @param futureReferences sequence of future page references (used by look-ahead policies like Optimal)
     * @return the page number of the selected victim page
     */
    int selectVictim(List<PhysicalFrame> allocatedFrames, PageTable pageTable, List<Integer> futureReferences);
}
