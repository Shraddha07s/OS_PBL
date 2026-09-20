package simulator.paging;

/**
 * Configuration parameters for the Paging Simulator.
 */
public class PagingConfig {
    private final int pageSize;
    private final int totalFrames;
    private final long virtualAddressLimit;

    /**
     * Constructs a PagingConfig with unlimited virtual address space.
     *
     * @param pageSize size of each page/frame in bytes (must be > 0)
     * @param totalFrames total number of physical frames available (must be > 0)
     */
    public PagingConfig(int pageSize, int totalFrames) {
        this(pageSize, totalFrames, -1);
    }

    /**
     * Constructs a PagingConfig with a specified virtual address limit.
     *
     * @param pageSize size of each page/frame in bytes (must be > 0)
     * @param totalFrames total number of physical frames available (must be > 0)
     * @param virtualAddressLimit upper bound on virtual address space (-1 for unbounded)
     */
    public PagingConfig(int pageSize, int totalFrames, long virtualAddressLimit) {
        if (pageSize <= 0) {
            throw new IllegalArgumentException("Page size must be positive, got: " + pageSize);
        }
        if (totalFrames <= 0) {
            throw new IllegalArgumentException("Total frames must be positive, got: " + totalFrames);
        }
        this.pageSize = pageSize;
        this.totalFrames = totalFrames;
        this.virtualAddressLimit = virtualAddressLimit;
    }

    public int getPageSize() {
        return pageSize;
    }

    public int getTotalFrames() {
        return totalFrames;
    }

    public long getVirtualAddressLimit() {
        return virtualAddressLimit;
    }

    @Override
    public String toString() {
        return "PagingConfig{" +
                "pageSize=" + pageSize +
                ", totalFrames=" + totalFrames +
                ", virtualAddressLimit=" + virtualAddressLimit +
                '}';
    }
}
