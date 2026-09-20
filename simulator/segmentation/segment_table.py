from typing import Dict, List, Optional
from pydantic import BaseModel

class Segment(BaseModel):
    segment_id: int
    name: str
    base: int
    limit: int
    permissions: str = "r-x"

class SegmentTable:
    def __init__(self, segments: Optional[List[Segment]] = None):
        self.segments: Dict[int, Segment] = {}
        if segments:
            for seg in segments:
                self.segments[seg.segment_id] = seg
        else:
            self._init_default_segments()

    def _init_default_segments(self):
        # Default baseline memory layout in physical space (32 KB physical memory)
        # Segment 0: Code (base=0, limit=8192) -> 8 KB
        # Segment 1: Data (base=8192, limit=4096) -> 4 KB
        # Segment 2: Stack (base=16384, limit=4096) -> 4 KB
        # Segment 3: Heap (base=24576, limit=6144) -> 6 KB
        # Total allocated: 26624 bytes out of 32768 bytes
        default_segs = [
            Segment(segment_id=0, name="Code", base=0, limit=8192, permissions="r-x"),
            Segment(segment_id=1, name="Data", base=8192, limit=4096, permissions="rw-"),
            Segment(segment_id=2, name="Stack", base=16384, limit=4096, permissions="rw-"),
            Segment(segment_id=3, name="Heap", base=24576, limit=6144, permissions="rw-"),
        ]
        for seg in default_segs:
            self.segments[seg.segment_id] = seg

    def get_segment(self, segment_id: int) -> Optional[Segment]:
        return self.segments.get(segment_id)

    def add_segment(self, segment: Segment):
        self.segments[segment.segment_id] = segment

    def to_list(self) -> List[Dict]:
        return [seg.model_dump() for seg in self.segments.values()]
