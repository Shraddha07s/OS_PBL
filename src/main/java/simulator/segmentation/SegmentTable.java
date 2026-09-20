package simulator.segmentation;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Represents the Operating System Segment Table.
 * Maps segment identifiers or names to their respective Segment descriptors.
 */
public class SegmentTable {
    private final Map<Integer, Segment> segmentsById;
    private final Map<String, Segment> segmentsByName;

    public SegmentTable() {
        this.segmentsById = new LinkedHashMap<>();
        this.segmentsByName = new LinkedHashMap<>();
    }

    /**
     * Adds a segment to the segment table.
     */
    public void addSegment(Segment segment) {
        if (segment == null) {
            throw new IllegalArgumentException("Segment cannot be null");
        }
        segmentsById.put(segment.getSegmentId(), segment);
        segmentsByName.put(segment.getName().toLowerCase(), segment);
    }

    /**
     * Retrieves a segment by its numeric identifier.
     */
    public Segment getSegment(int segmentId) {
        return segmentsById.get(segmentId);
    }

    /**
     * Retrieves a segment by its name (case-insensitive, e.g., "code", "Data").
     */
    public Segment getSegment(String name) {
        if (name == null) {
            return null;
        }
        return segmentsByName.get(name.trim().toLowerCase());
    }

    /**
     * Checks if a segment exists by ID.
     */
    public boolean hasSegment(int segmentId) {
        return segmentsById.containsKey(segmentId);
    }

    /**
     * Returns an unmodifiable list of all registered segments.
     */
    public List<Segment> getAllSegments() {
        return Collections.unmodifiableList(new ArrayList<>(segmentsById.values()));
    }

    /**
     * Clears all segments from the table.
     */
    public void clear() {
        segmentsById.clear();
        segmentsByName.clear();
    }
}
