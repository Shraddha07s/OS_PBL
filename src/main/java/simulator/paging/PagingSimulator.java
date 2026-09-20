package simulator.paging;

import simulator.common.CostModel;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Core Paging Memory Management Simulator.
 *
 * Simulates address translation, page table lookup, page fault detection,
 * frame allocation, and page replacement policies (FIFO, LRU, Optimal).
 *
 * Maintains deterministic state without global or static mutable variables.
 */
public class PagingSimulator {
    private final PagingConfig config;
    private final ReplacementAlgorithm replacementAlgorithm;
    private final PageTable pageTable;
    private final List<PhysicalFrame> frames;
    private final List<PagingSimulationStep> executionHistory;

    private long currentStep;
    private int totalReferences;
    private int pageFaults;
    private int pageHits;
    private double totalSimulatedCost;

    public PagingSimulator(PagingConfig config, ReplacementAlgorithm replacementAlgorithm) {
        if (config == null) {
            throw new IllegalArgumentException("PagingConfig cannot be null");
        }
        if (replacementAlgorithm == null) {
            throw new IllegalArgumentException("ReplacementAlgorithm cannot be null");
        }
        this.config = config;
        this.replacementAlgorithm = replacementAlgorithm;
        this.pageTable = new PageTable();
        this.frames = new ArrayList<>(config.getTotalFrames());
        for (int i = 0; i < config.getTotalFrames(); i++) {
            this.frames.add(new PhysicalFrame(i));
        }
        this.executionHistory = new ArrayList<>();
        this.currentStep = 0;
        this.totalReferences = 0;
        this.pageFaults = 0;
        this.pageHits = 0;
        this.totalSimulatedCost = 0.0;
    }

    /**
     * Translates a single virtual address to a physical address without future look-ahead.
     */
    public PagingTranslationResult translate(long virtualAddress) {
        return translateInternal(virtualAddress, Collections.emptyList(), false);
    }

    /**
     * Translates a single virtual address with knowledge of future page references.
     * Useful for look-ahead replacement policies like Optimal.
     */
    public PagingTranslationResult translate(long virtualAddress, List<Integer> futureReferences) {
        return translateInternal(virtualAddress, futureReferences, false);
    }

    /**
     * Executes a complete workload of virtual addresses.
     * Extracts page numbers to supply full future look-ahead to the replacement policy.
     *
     * @param virtualAddresses list of virtual addresses to translate
     * @return list of simulation steps with full execution details
     */
    public List<PagingSimulationStep> executeAddressWorkload(List<Long> virtualAddresses) {
        if (virtualAddresses == null) {
            throw new IllegalArgumentException("Virtual address workload cannot be null");
        }

        // Precompute page numbers for Optimal look-ahead
        List<Integer> pageNumbers = new ArrayList<>(virtualAddresses.size());
        for (Long va : virtualAddresses) {
            if (va < 0) {
                throw new IllegalArgumentException("Virtual address cannot be negative: " + va);
            }
            pageNumbers.add((int) (va / config.getPageSize()));
        }

        List<PagingSimulationStep> steps = new ArrayList<>();
        for (int i = 0; i < virtualAddresses.size(); i++) {
            long va = virtualAddresses.get(i);
            List<Integer> future = pageNumbers.subList(i + 1, pageNumbers.size());
            PagingTranslationResult result = translateInternal(va, future, false);
            steps.add(new PagingSimulationStep(result.getStepNumber(), va, result.getPageNumber(), result));
        }
        return steps;
    }

    /**
     * Executes an externally supplied page reference string (list of page numbers).
     * Automatically converts page numbers to base virtual addresses (pageNumber * pageSize).
     *
     * @param pageNumbers list of page numbers to access
     * @return list of simulation steps with full execution details
     */
    public List<PagingSimulationStep> executePageReferenceString(List<Integer> pageNumbers) {
        if (pageNumbers == null) {
            throw new IllegalArgumentException("Page reference string cannot be null");
        }

        List<PagingSimulationStep> steps = new ArrayList<>();
        for (int i = 0; i < pageNumbers.size(); i++) {
            int pageNum = pageNumbers.get(i);
            if (pageNum < 0) {
                throw new IllegalArgumentException("Page number cannot be negative: " + pageNum);
            }
            long va = (long) pageNum * config.getPageSize();
            List<Integer> future = pageNumbers.subList(i + 1, pageNumbers.size());
            PagingTranslationResult result = translateInternal(va, future, false);
            steps.add(new PagingSimulationStep(result.getStepNumber(), va, pageNum, result));
        }
        return steps;
    }

    private synchronized PagingTranslationResult translateInternal(long virtualAddress,
                                                                   List<Integer> futureReferences,
                                                                   boolean isWrite) {
        currentStep++;
        totalReferences++;

        // 1. Boundary & Limit Checks
        if (virtualAddress < 0) {
            throw new IllegalArgumentException("Invalid memory access: negative virtual address (" + virtualAddress + ")");
        }
        if (config.getVirtualAddressLimit() > 0 && virtualAddress >= config.getVirtualAddressLimit()) {
            throw new IllegalArgumentException("Invalid memory access: virtual address " + virtualAddress +
                    " exceeds limit " + config.getVirtualAddressLimit());
        }

        // 2. Calculate Page Number and Offset
        int pageSize = config.getPageSize();
        int pageNumber = (int) (virtualAddress / pageSize);
        long offset = virtualAddress % pageSize;

        boolean isFault = false;
        Integer victimPage = null;
        Integer replacedFrame = null;
        int targetFrame = -1;
        String statusMessage;

        // 3. Page Table Lookup
        PageTableEntry entry = pageTable.getEntry(pageNumber);

        if (entry != null && entry.isValid()) {
            // Page Hit
            pageHits++;
            targetFrame = entry.getFrameNumber();
            pageTable.recordAccess(pageNumber, currentStep, isWrite);
            statusMessage = String.format("PAGE HIT: Page %d is resident in Frame %d.", pageNumber, targetFrame);
        } else {
            // Page Fault
            isFault = true;
            pageFaults++;

            // Check for available free frame
            PhysicalFrame availableFrame = findFreeFrame();
            if (availableFrame != null) {
                // Free frame available - no eviction needed
                targetFrame = availableFrame.getFrameNumber();
                availableFrame.setPageNumber(pageNumber);
                pageTable.mapPage(pageNumber, targetFrame, currentStep);
                statusMessage = String.format("PAGE FAULT: Page %d loaded into free Frame %d.", pageNumber, targetFrame);
            } else {
                // All frames occupied - invoke replacement policy
                victimPage = replacementAlgorithm.selectVictim(frames, pageTable, futureReferences);
                PageTableEntry victimEntry = pageTable.getEntry(victimPage);
                if (victimEntry == null || !victimEntry.isValid()) {
                    throw new IllegalStateException("Selected victim page " + victimPage + " is not valid in page table");
                }

                targetFrame = victimEntry.getFrameNumber();
                replacedFrame = targetFrame;

                // Evict victim page
                pageTable.unmapPage(victimPage);

                // Assign frame to new page
                PhysicalFrame frameToReuse = frames.get(targetFrame);
                frameToReuse.setPageNumber(pageNumber);
                pageTable.mapPage(pageNumber, targetFrame, currentStep);

                statusMessage = String.format("PAGE FAULT: Frames full. Evicted Page %d from Frame %d using %s. Loaded Page %d into Frame %d.",
                        victimPage, targetFrame, replacementAlgorithm.getName(), pageNumber, targetFrame);
            }
        }

        // 4. Physical Address Calculation
        long physicalAddress = ((long) targetFrame * pageSize) + offset;

        // 5. Simulated Cost Calculation
        double cost = CostModel.calculatePagingCost(isFault);
        totalSimulatedCost += cost;

        // 6. Snapshot Memory State
        PagingState stateSnapshot = new PagingState(config.getTotalFrames(), frames, pageTable.getValidEntries(), currentStep);

        // 7. Create Translation Result
        PagingTranslationResult result = new PagingTranslationResult(
                virtualAddress, pageNumber, offset, targetFrame, physicalAddress,
                isFault, victimPage, replacedFrame, cost, stateSnapshot, currentStep, statusMessage
        );

        // 8. Record in execution history
        executionHistory.add(new PagingSimulationStep(currentStep, virtualAddress, pageNumber, result));

        return result;
    }

    private PhysicalFrame findFreeFrame() {
        for (PhysicalFrame frame : frames) {
            if (!frame.isOccupied()) {
                return frame;
            }
        }
        return null;
    }

    /**
     * Resets the simulator to its initial empty state.
     */
    public synchronized void reset() {
        pageTable.clear();
        for (PhysicalFrame frame : frames) {
            frame.setOccupied(false);
        }
        executionHistory.clear();
        currentStep = 0;
        totalReferences = 0;
        pageFaults = 0;
        pageHits = 0;
        totalSimulatedCost = 0.0;
    }

    // Getters and inspection methods
    public PagingConfig getConfig() {
        return config;
    }

    public ReplacementAlgorithm getReplacementAlgorithm() {
        return replacementAlgorithm;
    }

    public PageTable getPageTable() {
        return pageTable;
    }

    public List<PhysicalFrame> getFrames() {
        List<PhysicalFrame> copies = new ArrayList<>();
        for (PhysicalFrame f : frames) {
            copies.add(f.copy());
        }
        return copies;
    }

    public PagingState getMemoryState() {
        return new PagingState(config.getTotalFrames(), frames, pageTable.getValidEntries(), currentStep);
    }

    public List<PagingSimulationStep> getExecutionHistory() {
        return Collections.unmodifiableList(executionHistory);
    }

    public int getTotalReferences() {
        return totalReferences;
    }

    public int getPageFaults() {
        return pageFaults;
    }

    public int getPageHits() {
        return pageHits;
    }

    public double getTotalSimulatedCost() {
        return totalSimulatedCost;
    }

    public double getHitRate() {
        return totalReferences == 0 ? 0.0 : (double) pageHits / totalReferences;
    }

    public double getFaultRate() {
        return totalReferences == 0 ? 0.0 : (double) pageFaults / totalReferences;
    }
}
