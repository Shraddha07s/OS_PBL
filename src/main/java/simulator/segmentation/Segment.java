package simulator.segmentation;

/**
 * Represents a logical memory segment (e.g., Code, Data, Stack, Heap).
 *
 * Contains base address, limit (length), and access permissions.
 */
public class Segment {
    private final int segmentId;
    private final String name;
    private final long base;
    private final long limit;
    private final Permission permissions;

    public Segment(int segmentId, String name, long base, long limit, Permission permissions) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Segment name cannot be null or empty");
        }
        if (base < 0) {
            throw new IllegalArgumentException("Segment base cannot be negative: " + base);
        }
        if (limit <= 0) {
            throw new IllegalArgumentException("Segment limit must be positive: " + limit);
        }
        if (permissions == null) {
            throw new IllegalArgumentException("Segment permissions cannot be null");
        }
        this.segmentId = segmentId;
        this.name = name;
        this.base = base;
        this.limit = limit;
        this.permissions = permissions;
    }

    public int getSegmentId() {
        return segmentId;
    }

    public String getName() {
        return name;
    }

    public long getBase() {
        return base;
    }

    public long getLimit() {
        return limit;
    }

    public Permission getPermissions() {
        return permissions;
    }

    /**
     * Checks if a given offset is strictly within the segment limit.
     * Translation rule: offset >= 0 && offset < limit.
     * Note: offset == limit is a BOUNDS VIOLATION.
     */
    public boolean isWithinBounds(long offset) {
        return offset >= 0 && offset < limit;
    }

    /**
     * Checks if this segment permits the specified access type.
     */
    public boolean allows(AccessType accessType) {
        return permissions.allows(accessType);
    }

    /**
     * Returns the end physical address (base + limit) of this segment.
     */
    public long getEndAddress() {
        return base + limit;
    }

    @Override
    public String toString() {
        return "Segment{" +
                "id=" + segmentId +
                ", name='" + name + '\'' +
                ", base=" + base +
                ", limit=" + limit +
                ", perms=" + permissions +
                '}';
    }
}
