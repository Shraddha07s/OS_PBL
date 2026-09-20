package simulator.paging;

/**
 * Represents a physical memory frame in main memory.
 */
public class PhysicalFrame {
    private final int frameNumber;
    private int pageNumber;
    private boolean occupied;

    public PhysicalFrame(int frameNumber) {
        this.frameNumber = frameNumber;
        this.pageNumber = -1;
        this.occupied = false;
    }

    public PhysicalFrame(int frameNumber, int pageNumber, boolean occupied) {
        this.frameNumber = frameNumber;
        this.pageNumber = pageNumber;
        this.occupied = occupied;
    }

    public int getFrameNumber() {
        return frameNumber;
    }

    public int getPageNumber() {
        return pageNumber;
    }

    public void setPageNumber(int pageNumber) {
        this.pageNumber = pageNumber;
        this.occupied = (pageNumber >= 0);
    }

    public boolean isOccupied() {
        return occupied;
    }

    public void setOccupied(boolean occupied) {
        this.occupied = occupied;
        if (!occupied) {
            this.pageNumber = -1;
        }
    }

    public PhysicalFrame copy() {
        return new PhysicalFrame(frameNumber, pageNumber, occupied);
    }

    @Override
    public String toString() {
        return "PhysicalFrame{" +
                "frame=" + frameNumber +
                ", page=" + pageNumber +
                ", occupied=" + occupied +
                '}';
    }
}
