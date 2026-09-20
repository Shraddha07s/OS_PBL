package simulator.segmentation;

/**
 * Represents a free unallocated block of physical memory (a "hole").
 */
public class MemoryHole {
    private final long base;
    private final long size;

    public MemoryHole(long base, long size) {
        if (base < 0) {
            throw new IllegalArgumentException("Hole base cannot be negative: " + base);
        }
        if (size <= 0) {
            throw new IllegalArgumentException("Hole size must be positive: " + size);
        }
        this.base = base;
        this.size = size;
    }

    public long getBase() {
        return base;
    }

    public long getSize() {
        return size;
    }

    public long getEndAddress() {
        return base + size;
    }

    @Override
    public String toString() {
        return "MemoryHole{" +
                "base=" + base +
                ", size=" + size +
                ", end=" + (base + size) +
                '}';
    }
}
