package simulator.segmentation;

/**
 * Access permissions for memory segments.
 */
public enum Permission {
    READ("R"),
    WRITE("W"),
    EXECUTE("X"),
    READ_WRITE("RW"),
    READ_EXECUTE("RX"),
    READ_WRITE_EXECUTE("RWX");

    private final String symbol;

    Permission(String symbol) {
        this.symbol = symbol;
    }

    public String getSymbol() {
        return symbol;
    }

    /**
     * Checks if this permission permits the specified access type.
     */
    public boolean allows(AccessType accessType) {
        if (accessType == null) {
            return false;
        }
        return switch (this) {
            case READ -> accessType == AccessType.READ;
            case WRITE -> accessType == AccessType.WRITE;
            case EXECUTE -> accessType == AccessType.EXECUTE;
            case READ_WRITE -> accessType == AccessType.READ || accessType == AccessType.WRITE;
            case READ_EXECUTE -> accessType == AccessType.READ || accessType == AccessType.EXECUTE;
            case READ_WRITE_EXECUTE -> true;
        };
    }
}
