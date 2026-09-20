package simulator.paging;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Represents the operating system Page Table.
 * Manages mappings from virtual page numbers to physical frames.
 */
public class PageTable {
    private final Map<Integer, PageTableEntry> entries;

    public PageTable() {
        this.entries = new HashMap<>();
    }

    /**
     * Retrieves the PageTableEntry for the given page number, or null if it has never been accessed.
     */
    public PageTableEntry getEntry(int pageNumber) {
        return entries.get(pageNumber);
    }

    /**
     * Retrieves or creates a PageTableEntry for the given page number.
     */
    public PageTableEntry getOrCreateEntry(int pageNumber) {
        return entries.computeIfAbsent(pageNumber, PageTableEntry::new);
    }

    /**
     * Checks if a page is currently mapped to a physical frame.
     */
    public boolean isPageValid(int pageNumber) {
        PageTableEntry entry = entries.get(pageNumber);
        return entry != null && entry.isValid();
    }

    /**
     * Maps a page to a physical frame, updating timestamps and flags.
     */
    public void mapPage(int pageNumber, int frameNumber, long step) {
        PageTableEntry entry = getOrCreateEntry(pageNumber);
        entry.setFrameNumber(frameNumber);
        entry.setValid(true);
        entry.setReferenced(true);
        entry.setLoadTimestamp(step);
        entry.setLastAccessTimestamp(step);
    }

    /**
     * Unmaps a page from physical memory (e.g. during page replacement).
     */
    public void unmapPage(int pageNumber) {
        PageTableEntry entry = entries.get(pageNumber);
        if (entry != null) {
            entry.setFrameNumber(-1);
            entry.setValid(false);
            entry.setReferenced(false);
        }
    }

    /**
     * Updates access metadata for a page hit.
     */
    public void recordAccess(int pageNumber, long step, boolean isWrite) {
        PageTableEntry entry = entries.get(pageNumber);
        if (entry != null) {
            entry.setReferenced(true);
            entry.setLastAccessTimestamp(step);
            if (isWrite) {
                entry.setModified(true);
            }
        }
    }

    /**
     * Returns all entries currently tracked in the page table.
     */
    public List<PageTableEntry> getAllEntries() {
        return new ArrayList<>(entries.values());
    }

    /**
     * Returns all currently valid (resident in memory) entries.
     */
    public List<PageTableEntry> getValidEntries() {
        List<PageTableEntry> validList = new ArrayList<>();
        for (PageTableEntry entry : entries.values()) {
            if (entry.isValid()) {
                validList.add(entry);
            }
        }
        return validList;
    }

    /**
     * Clears all entries in the page table.
     */
    public void clear() {
        entries.clear();
    }
}
