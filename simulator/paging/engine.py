from typing import List, Dict, Any, Optional
from simulator.paging.page_table import PageTable, PageTableEntry
from simulator.paging.replacement import get_replacement_policy, ReplacementPolicy

class PagingSimulator:
    def __init__(
        self,
        virtual_address_space: int = 65536,  # 64 KB
        physical_memory_size: int = 32768,   # 32 KB
        page_size: int = 1024,               # 1 KB
        replacement_algorithm: str = "LRU",
        enable_tlb: bool = True,
        tlb_size: int = 4
    ):
        if page_size <= 0:
            raise ValueError("Page size must be greater than 0")
        if virtual_address_space <= 0 or physical_memory_size <= 0:
            raise ValueError("Memory size must be greater than 0")
        if page_size > physical_memory_size:
            raise ValueError("Page size cannot be larger than physical memory size")
        if page_size > virtual_address_space:
            raise ValueError("Page size cannot be larger than virtual address space")

        self.virtual_address_space = virtual_address_space
        self.physical_memory_size = physical_memory_size
        self.page_size = page_size
        self.num_pages = virtual_address_space // page_size
        self.num_frames = physical_memory_size // page_size
        self.replacement_algorithm_name = replacement_algorithm
        self.policy: ReplacementPolicy = get_replacement_policy(replacement_algorithm)
        
        self.enable_tlb = enable_tlb
        self.tlb_size = tlb_size
        self.tlb: Dict[int, int] = {}  # page_num -> frame_num

        self.page_table = PageTable(self.num_pages)
        self.free_frames = list(range(self.num_frames))
        self.frame_allocation: Dict[int, int] = {}  # frame_num -> page_num
        self.page_to_frame: Dict[int, int] = {}     # page_num -> frame_num

    def reset(self):
        self.page_table.reset()
        self.free_frames = list(range(self.num_frames))
        self.frame_allocation.clear()
        self.page_to_frame.clear()
        self.tlb.clear()

    def translate_single(self, virtual_address: int) -> Dict[str, Any]:
        """Translates a single virtual address without modifying simulator state (for playground mode)."""
        if virtual_address < 0 or virtual_address >= self.virtual_address_space:
            return {
                "virtual_address": virtual_address,
                "valid": False,
                "error": f"Address {virtual_address} out of virtual address space [0, {self.virtual_address_space - 1}]",
                "page_number": None,
                "offset": None,
                "frame_number": None,
                "physical_address": None,
                "translation_cost": 0.0,
                "tlb_hit": False,
                "page_fault": False
            }

        page_number = virtual_address // self.page_size
        offset = virtual_address % self.page_size
        
        entry = self.page_table.get_entry(page_number)
        
        # Check TLB first if enabled
        tlb_hit = False
        frame_number = None
        
        if self.enable_tlb and page_number in self.tlb:
            tlb_hit = True
            frame_number = self.tlb[page_number]
            translation_cost = 0.2 + 1.0  # TLB hit (0.2) + Physical memory access (1.0)
            page_fault = False
        elif entry and entry.valid:
            frame_number = entry.frame_number
            translation_cost = 1.0 + 1.0  # Page table lookup (1.0) + Physical memory access (1.0)
            page_fault = False
        else:
            page_fault = True
            translation_cost = 1.0 + 50.0 + 1.0  # Lookup (1.0) + Page Fault Handler (50.0) + Memory access (1.0)
            frame_number = self.page_to_frame.get(page_number, 0)  # Default fallback representation for playground

        physical_address = (frame_number * self.page_size + offset) if frame_number is not None else None

        return {
            "virtual_address": virtual_address,
            "page_number": page_number,
            "offset": offset,
            "page_size": self.page_size,
            "num_pages": self.num_pages,
            "num_frames": self.num_frames,
            "frame_number": frame_number,
            "physical_address": physical_address,
            "valid": True,
            "tlb_hit": tlb_hit,
            "page_fault": page_fault,
            "translation_cost": translation_cost,
            "steps": [
                f"1. Virtual Address: {virtual_address}",
                f"2. Page Number = {virtual_address} // {self.page_size} = {page_number}",
                f"3. Offset = {virtual_address} % {self.page_size} = {offset}",
                f"4. {'TLB Hit!' if tlb_hit else ('Page Table Lookup -> Frame ' + str(frame_number) if not page_fault else 'Page Fault Detected!')}",
                f"5. Physical Address = {frame_number} * {self.page_size} + {offset} = {physical_address}" if physical_address is not None else "5. Physical Address: N/A (Page Fault Required)"
            ]
        }

    def simulate_references(self, addresses: List[int]) -> Dict[str, Any]:
        """Runs full step-by-step simulation on a sequence of virtual addresses."""
        self.reset()
        
        # Pre-extract page numbers for Optimal algorithm lookahead
        page_references = [addr // self.page_size for addr in addresses if 0 <= addr < self.virtual_address_space]
        
        total_references = len(addresses)
        page_faults = 0
        tlb_hits = 0
        total_cost = 0.0
        invalid_accesses = 0
        
        history = []

        for step_idx, addr in enumerate(addresses):
            if addr < 0 or addr >= self.virtual_address_space:
                invalid_accesses += 1
                history.append({
                    "step": step_idx,
                    "address": addr,
                    "valid": False,
                    "error": "Out of Virtual Address Space Range",
                    "page_fault": False,
                    "tlb_hit": False,
                    "cost": 0.0
                })
                continue

            page_num = addr // self.page_size
            offset = addr % self.page_size
            timestamp = float(step_idx)

            tlb_hit = False
            page_fault = False
            evicted_page = None
            cost = 0.0

            # 1. TLB Check
            if self.enable_tlb and page_num in self.tlb:
                tlb_hit = True
                tlb_hits += 1
                frame_num = self.tlb[page_num]
                cost = 0.2 + 1.0  # TLB hit + Memory access
                
                # Update page table entry access time
                entry = self.page_table.get_entry(page_num)
                if entry:
                    entry.last_accessed = timestamp
                    entry.referenced = True

            # 2. Page Table Check
            else:
                entry = self.page_table.get_entry(page_num)
                if entry and entry.valid:
                    # Page Hit in Page Table
                    frame_num = entry.frame_number
                    entry.last_accessed = timestamp
                    entry.referenced = True
                    cost = 1.0 + 1.0  # Page Table lookup + Memory access
                    
                    # Update TLB (FIFO/LRU replacement in TLB)
                    if self.enable_tlb:
                        if len(self.tlb) >= self.tlb_size and page_num not in self.tlb:
                            # evict random or first key in TLB
                            first_key = next(iter(self.tlb))
                            del self.tlb[first_key]
                        self.tlb[page_num] = frame_num
                else:
                    # 3. Page Fault
                    page_fault = True
                    page_faults += 1
                    cost = 1.0 + 50.0 + 1.0  # Lookup + Fault handler + Access

                    if self.free_frames:
                        # Allocate free frame
                        frame_num = self.free_frames.pop(0)
                    else:
                        # Evict a victim page
                        allocated_entries = {
                            p: e for p, e in self.page_table.entries.items() if e.valid
                        }
                        evicted_page = self.policy.select_victim(
                            allocated_entries,
                            future_references=page_references,
                            current_step=step_idx
                        )
                        victim_entry = self.page_table.get_entry(evicted_page)
                        frame_num = victim_entry.frame_number
                        
                        # Unmap victim
                        self.page_table.unmap_page(evicted_page)
                        if evicted_page in self.page_to_frame:
                            del self.page_to_frame[evicted_page]
                        if self.enable_tlb and evicted_page in self.tlb:
                            del self.tlb[evicted_page]

                    # Map new page
                    self.page_table.map_page(page_num, frame_num, timestamp)
                    self.frame_allocation[frame_num] = page_num
                    self.page_to_frame[page_num] = frame_num

                    if self.enable_tlb:
                        if len(self.tlb) >= self.tlb_size:
                            first_key = next(iter(self.tlb))
                            del self.tlb[first_key]
                        self.tlb[page_num] = frame_num

            physical_addr = frame_num * self.page_size + offset
            total_cost += cost

            history.append({
                "step": step_idx,
                "virtual_address": addr,
                "page_number": page_num,
                "offset": offset,
                "frame_number": frame_num,
                "physical_address": physical_addr,
                "tlb_hit": tlb_hit,
                "page_fault": page_fault,
                "evicted_page": evicted_page,
                "cost": round(cost, 2),
                "valid": True
            })

        # Calculate metrics
        valid_accesses = total_references - invalid_accesses
        page_fault_rate = (page_faults / valid_accesses) if valid_accesses > 0 else 0.0
        tlb_hit_rate = (tlb_hits / valid_accesses) if valid_accesses > 0 else 0.0
        avg_cost = (total_cost / total_references) if total_references > 0 else 0.0

        # Calculate internal fragmentation
        # Pages in use:
        allocated_page_count = len([e for e in self.page_table.entries.values() if e.valid])
        # Assumption: On average, the last byte of allocated pages might leave half page internal fragment or page size overhead
        internal_frag_bytes = allocated_page_count * 0  # In paging, fixed page size eliminates external frag, internal frag occurs on actual allocated process memory boundaries.
        # For simulator presentation: Internal fragmentation is estimated per allocated page or process size.

        memory_utilization = (allocated_page_count * self.page_size / self.physical_memory_size) * 100.0 if self.physical_memory_size > 0 else 0.0

        return {
            "technique": "Paging",
            "config": {
                "virtual_address_space": self.virtual_address_space,
                "physical_memory_size": self.physical_memory_size,
                "page_size": self.page_size,
                "num_pages": self.num_pages,
                "num_frames": self.num_frames,
                "replacement_algorithm": self.replacement_algorithm_name,
                "enable_tlb": self.enable_tlb,
                "tlb_size": self.tlb_size
            },
            "metrics": {
                "total_references": total_references,
                "valid_accesses": valid_accesses,
                "invalid_accesses": invalid_accesses,
                "page_faults": page_faults,
                "page_fault_rate": round(page_fault_rate, 4),
                "tlb_hits": tlb_hits,
                "tlb_hit_rate": round(tlb_hit_rate, 4),
                "total_cost": round(total_cost, 2),
                "avg_cost": round(avg_cost, 2),
                "allocated_pages": allocated_page_count,
                "allocated_frames": allocated_page_count,
                "free_frames": len(self.free_frames),
                "memory_utilization_pct": round(memory_utilization, 2),
                "internal_fragmentation_bytes": internal_frag_bytes,
                "external_fragmentation_bytes": 0  # Paging has 0 external fragmentation
            },
            "page_table_state": [
                {
                    "page_number": entry.page_number,
                    "frame_number": entry.frame_number,
                    "valid": entry.valid,
                    "referenced": entry.referenced,
                    "modified": entry.modified
                }
                for entry in self.page_table.entries.values()
            ],
            "frame_table_state": [
                {
                    "frame_number": f,
                    "page_number": self.frame_allocation.get(f, None),
                    "is_free": f in self.free_frames
                }
                for f in range(self.num_frames)
            ],
            "history": history
        }
