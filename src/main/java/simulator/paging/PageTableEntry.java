package simulator.paging;

/**
 * Represents an entry in the Page Table.
 *
 * Tracks mapping between a virtual page number and a physical frame number,
 * along with validity, reference, modification, and access ordering metadata.
 */
public class PageTableEntry {
    private final int pageNumber;
    private int frameNumber;
    private boolean valid;
    private boolean referenced;
    private boolean modified;
    private long loadTimestamp;
    private long lastAccessTimestamp;

    public PageTableEntry(int pageNumber) {
        this.pageNumber = pageNumber;
        this.frameNumber = -1;
        this.valid = false;
        this.referenced = false;
        this.modified = false;
        this.loadTimestamp = -1;
        this.lastAccessTimestamp = -1;
    }

    public PageTableEntry(int pageNumber, int frameNumber, boolean valid,
                          boolean referenced, boolean modified,
                          long loadTimestamp, long lastAccessTimestamp) {
        this.pageNumber = pageNumber;
        this.frameNumber = frameNumber;
        this.valid = valid;
        this.referenced = referenced;
        this.modified = modified;
        this.loadTimestamp = loadTimestamp;
        this.lastAccessTimestamp = lastAccessTimestamp;
    }

    public int getPageNumber() {
        return pageNumber;
    }

    public int getFrameNumber() {
        return frameNumber;
    }

    public void setFrameNumber(int frameNumber) {
        this.frameNumber = frameNumber;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public boolean isReferenced() {
        return referenced;
    }

    public void setReferenced(boolean referenced) {
        this.referenced = referenced;
    }

    public boolean isModified() {
        return modified;
    }

    public void setModified(boolean modified) {
        this.modified = modified;
    }

    public long getLoadTimestamp() {
        return loadTimestamp;
    }

    public void setLoadTimestamp(long loadTimestamp) {
        this.loadTimestamp = loadTimestamp;
    }

    public long getLastAccessTimestamp() {
        return lastAccessTimestamp;
    }

    public void setLastAccessTimestamp(long lastAccessTimestamp) {
        this.lastAccessTimestamp = lastAccessTimestamp;
    }

    /**
     * Creates a deep snapshot copy of this entry for history and visualization.
     */
    public PageTableEntry copy() {
        return new PageTableEntry(pageNumber, frameNumber, valid, referenced,
                modified, loadTimestamp, lastAccessTimestamp);
    }

    @Override
    public String toString() {
        return "PageTableEntry{" +
                "page=" + pageNumber +
                ", frame=" + frameNumber +
                ", valid=" + valid +
                ", ref=" + referenced +
                ", mod=" + modified +
                ", load=" + loadTimestamp +
                ", lastAccess=" + lastAccessTimestamp +
                '}';
    }
}
