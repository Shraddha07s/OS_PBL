package simulator.paging;

/**
 * Structured result representing a single address translation in the Paging Simulator.
 * Contains the complete breakdown of the translation process for inspection,
 * performance tracking, and frontend visualization.
 */
public class PagingTranslationResult {
    private final long virtualAddress;
    private final int pageNumber;
    private final long offset;
    private final int frameNumber;
    private final long physicalAddress;
    private final boolean pageFault;
    private final Integer victimPageNumber;
    private final Integer replacedFrameNumber;
    private final double translationCost;
    private final PagingState memoryState;
    private final long stepNumber;
    private final String statusMessage;

    public PagingTranslationResult(long virtualAddress, int pageNumber, long offset,
                                   int frameNumber, long physicalAddress, boolean pageFault,
                                   Integer victimPageNumber, Integer replacedFrameNumber,
                                   double translationCost, PagingState memoryState,
                                   long stepNumber, String statusMessage) {
        this.virtualAddress = virtualAddress;
        this.pageNumber = pageNumber;
        this.offset = offset;
        this.frameNumber = frameNumber;
        this.physicalAddress = physicalAddress;
        this.pageFault = pageFault;
        this.victimPageNumber = victimPageNumber;
        this.replacedFrameNumber = replacedFrameNumber;
        this.translationCost = translationCost;
        this.memoryState = memoryState;
        this.stepNumber = stepNumber;
        this.statusMessage = statusMessage;
    }

    public long getVirtualAddress() {
        return virtualAddress;
    }

    public int getPageNumber() {
        return pageNumber;
    }

    public long getOffset() {
        return offset;
    }

    public int getFrameNumber() {
        return frameNumber;
    }

    public long getPhysicalAddress() {
        return physicalAddress;
    }

    public boolean isPageFault() {
        return pageFault;
    }

    public Integer getVictimPageNumber() {
        return victimPageNumber;
    }

    public Integer getReplacedFrameNumber() {
        return replacedFrameNumber;
    }

    public double getTranslationCost() {
        return translationCost;
    }

    public PagingState getMemoryState() {
        return memoryState;
    }

    public long getStepNumber() {
        return stepNumber;
    }

    public String getStatusMessage() {
        return statusMessage;
    }

    @Override
    public String toString() {
        return "PagingTranslationResult{" +
                "step=" + stepNumber +
                ", VA=" + virtualAddress +
                ", page=" + pageNumber +
                ", offset=" + offset +
                ", frame=" + frameNumber +
                ", PA=" + physicalAddress +
                ", fault=" + pageFault +
                (victimPageNumber != null ? ", victim=" + victimPageNumber : "") +
                ", cost=" + translationCost +
                ", msg='" + statusMessage + '\'' +
                '}';
    }
}
