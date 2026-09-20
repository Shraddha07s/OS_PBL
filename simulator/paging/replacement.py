from typing import List, Dict, Optional
from simulator.paging.page_table import PageTableEntry

class ReplacementPolicy:
    def select_victim(
        self,
        allocated_pages: Dict[int, PageTableEntry],
        future_references: Optional[List[int]] = None,
        current_step: int = 0
    ) -> int:
        raise NotImplementedError

class FIFOReplacement(ReplacementPolicy):
    def select_victim(
        self,
        allocated_pages: Dict[int, PageTableEntry],
        future_references: Optional[List[int]] = None,
        current_step: int = 0
    ) -> int:
        if not allocated_pages:
            raise ValueError("No pages allocated to evict")
        # Evict page with the oldest loaded_at timestamp
        victim_page = min(allocated_pages.keys(), key=lambda p: allocated_pages[p].loaded_at)
        return victim_page

class LRUReplacement(ReplacementPolicy):
    def select_victim(
        self,
        allocated_pages: Dict[int, PageTableEntry],
        future_references: Optional[List[int]] = None,
        current_step: int = 0
    ) -> int:
        if not allocated_pages:
            raise ValueError("No pages allocated to evict")
        # Evict page with the oldest last_accessed timestamp
        victim_page = min(allocated_pages.keys(), key=lambda p: allocated_pages[p].last_accessed)
        return victim_page

class OptimalReplacement(ReplacementPolicy):
    def select_victim(
        self,
        allocated_pages: Dict[int, PageTableEntry],
        future_references: Optional[List[int]] = None,
        current_step: int = 0
    ) -> int:
        if not allocated_pages:
            raise ValueError("No pages allocated to evict")
        
        if not future_references:
            # Fallback to LRU if future stream isn't supplied
            return min(allocated_pages.keys(), key=lambda p: allocated_pages[p].last_accessed)
        
        future_stream = future_references[current_step:]
        
        furthest_distance = -1
        victim_page = None
        
        for page in allocated_pages.keys():
            try:
                # Find index of first next access in future_stream
                next_use = future_stream.index(page)
            except ValueError:
                # Page is never used again in future stream, ideal victim
                next_use = float('inf')
            
            if next_use > furthest_distance:
                furthest_distance = next_use
                victim_page = page
                
        return victim_page if victim_page is not None else list(allocated_pages.keys())[0]

def get_replacement_policy(algorithm_name: str) -> ReplacementPolicy:
    name = algorithm_name.upper()
    if name == "FIFO":
        return FIFOReplacement()
    elif name == "LRU":
        return LRUReplacement()
    elif name in ["OPTIMAL", "OPT"]:
        return OptimalReplacement()
    else:
        raise ValueError(f"Unsupported replacement algorithm: '{algorithm_name}'. Choose from FIFO, LRU, Optimal.")
