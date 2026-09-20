from typing import Optional, Dict
from pydantic import BaseModel

class PageTableEntry(BaseModel):
    page_number: int
    frame_number: Optional[int] = None
    valid: bool = False
    referenced: bool = False
    modified: bool = False
    last_accessed: float = 0.0
    loaded_at: float = 0.0

class PageTable:
    def __init__(self, num_pages: int):
        self.num_pages = num_pages
        self.entries: Dict[int, PageTableEntry] = {
            i: PageTableEntry(page_number=i) for i in range(num_pages)
        }

    def get_entry(self, page_number: int) -> Optional[PageTableEntry]:
        return self.entries.get(page_number)

    def map_page(self, page_number: int, frame_number: int, timestamp: float) -> PageTableEntry:
        entry = self.entries[page_number]
        entry.frame_number = frame_number
        entry.valid = True
        entry.last_accessed = timestamp
        entry.loaded_at = timestamp
        return entry

    def unmap_page(self, page_number: int) -> PageTableEntry:
        entry = self.entries[page_number]
        entry.valid = False
        entry.frame_number = None
        return entry

    def reset(self):
        for entry in self.entries.values():
            entry.valid = False
            entry.frame_number = None
            entry.referenced = False
            entry.modified = False
            entry.last_accessed = 0.0
            entry.loaded_at = 0.0
