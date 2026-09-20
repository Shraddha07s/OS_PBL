package simulator.common;

/**
 * CostModel defines the simulated cost units used across memory management simulations.
 *
 * NOTE: These are abstract simulated cost units used for comparative educational analysis.
 * They do NOT represent actual physical CPU timings or nanoseconds.
 */
public final class CostModel {

    public static final double MEMORY_ACCESS_COST = 1.0;
    public static final double PAGE_SEGMENT_LOOKUP_COST = 1.0;
    public static final double BOUNDS_CHECK_COST = 1.0;
    public static final double TLB_HIT_COST = 0.2;
    public static final double PAGE_FAULT_HANDLER_COST = 50.0;

    private CostModel() {
        // Prevent instantiation
    }

    /**
     * Calculates the simulated cost for a paging translation.
     *
     * @param isPageFault whether a page fault occurred during translation
     * @return simulated cost in abstract units
     */
    public static double calculatePagingCost(boolean isPageFault) {
        if (isPageFault) {
            // Lookup + Fault Handler overhead + Physical Memory Access
            return PAGE_SEGMENT_LOOKUP_COST + PAGE_FAULT_HANDLER_COST + MEMORY_ACCESS_COST;
        } else {
            // Normal translation: Page Table Lookup + Physical Memory Access
            return PAGE_SEGMENT_LOOKUP_COST + MEMORY_ACCESS_COST;
        }
    }

    /**
     * Calculates the simulated cost for a segmentation translation.
     *
     * @param isValid whether the bounds and permission checks succeeded
     * @return simulated cost in abstract units
     */
    public static double calculateSegmentationCost(boolean isValid) {
        if (isValid) {
            // Segment Table Lookup + Bounds Check + Physical Memory Access
            return PAGE_SEGMENT_LOOKUP_COST + BOUNDS_CHECK_COST + MEMORY_ACCESS_COST;
        } else {
            // Segment Table Lookup + Bounds Check (access aborted due to fault)
            return PAGE_SEGMENT_LOOKUP_COST + BOUNDS_CHECK_COST;
        }
    }
}
