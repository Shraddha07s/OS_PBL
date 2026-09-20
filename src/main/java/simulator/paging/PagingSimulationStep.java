package simulator.paging;

/**
 * Represents a discrete step in a paging simulation execution history.
 */
public class PagingSimulationStep {
    private final long stepIndex;
    private final long virtualAddress;
    private final int pageNumber;
    private final PagingTranslationResult result;

    public PagingSimulationStep(long stepIndex, long virtualAddress, int pageNumber, PagingTranslationResult result) {
        this.stepIndex = stepIndex;
        this.virtualAddress = virtualAddress;
        this.pageNumber = pageNumber;
        this.result = result;
    }

    public long getStepIndex() {
        return stepIndex;
    }

    public long getVirtualAddress() {
        return virtualAddress;
    }

    public int getPageNumber() {
        return pageNumber;
    }

    public PagingTranslationResult getResult() {
        return result;
    }

    @Override
    public String toString() {
        return "PagingSimulationStep{" +
                "step=" + stepIndex +
                ", VA=" + virtualAddress +
                ", page=" + pageNumber +
                ", result=" + result +
                '}';
    }
}
