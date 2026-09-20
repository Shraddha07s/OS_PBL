package simulator.segmentation;

/**
 * Structured result representing a single address translation in the Segmentation Simulator.
 * Contains the complete breakdown of segment lookup, base/limit validation,
 * permission check, physical address calculation, and cost.
 */
public class SegmentationTranslationResult {
    private final int segmentId;
    private final String segmentName;
    private final long offset;
    private final long base;
    private final long limit;
    private final Permission permissions;
    private final AccessType accessType;
    private final boolean valid;
    private final String faultType; // e.g., "LIMIT_EXCEEDED", "PERMISSION_DENIED", "SEGMENT_NOT_FOUND", null if valid
    private final long physicalAddress; // -1 if invalid
    private final double translationCost;
    private final SegmentationMemoryLayout memoryLayout;
    private final long stepNumber;
    private final String statusMessage;

    public SegmentationTranslationResult(int segmentId, String segmentName, long offset,
                                         long base, long limit, Permission permissions,
                                         AccessType accessType, boolean valid, String faultType,
                                         long physicalAddress, double translationCost,
                                         SegmentationMemoryLayout memoryLayout, long stepNumber,
                                         String statusMessage) {
        this.segmentId = segmentId;
        this.segmentName = segmentName;
        this.offset = offset;
        this.base = base;
        this.limit = limit;
        this.permissions = permissions;
        this.accessType = accessType;
        this.valid = valid;
        this.faultType = faultType;
        this.physicalAddress = physicalAddress;
        this.translationCost = translationCost;
        this.memoryLayout = memoryLayout;
        this.stepNumber = stepNumber;
        this.statusMessage = statusMessage;
    }

    public int getSegmentId() {
        return segmentId;
    }

    public String getSegmentName() {
        return segmentName;
    }

    public long getOffset() {
        return offset;
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

    public AccessType getAccessType() {
        return accessType;
    }

    public boolean isValid() {
        return valid;
    }

    public String getFaultType() {
        return faultType;
    }

    public long getPhysicalAddress() {
        return physicalAddress;
    }

    public double getTranslationCost() {
        return translationCost;
    }

    public SegmentationMemoryLayout getMemoryLayout() {
        return memoryLayout;
    }

    public long getStepNumber() {
        return stepNumber;
    }

    public String getStatusMessage() {
        return statusMessage;
    }

    @Override
    public String toString() {
        return "SegmentationTranslationResult{" +
                "step=" + stepNumber +
                ", seg=" + segmentName + " (" + segmentId + ")" +
                ", offset=" + offset +
                ", base=" + base +
                ", limit=" + limit +
                ", perms=" + permissions +
                ", access=" + accessType +
                ", valid=" + valid +
                (faultType != null ? ", fault='" + faultType + '\'' : "") +
                ", PA=" + physicalAddress +
                ", cost=" + translationCost +
                ", msg='" + statusMessage + '\'' +
                '}';
    }
}
