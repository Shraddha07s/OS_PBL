from typing import List, Dict, Any, Optional
from simulator.segmentation.segment_table import SegmentTable, Segment

class SegmentationSimulator:
    def __init__(
        self,
        virtual_address_space: int = 65536,  # 64 KB
        physical_memory_size: int = 32768,   # 32 KB
        segments: Optional[List[Segment]] = None
    ):
        self.virtual_address_space = virtual_address_space
        self.physical_memory_size = physical_memory_size
        self.segment_table = SegmentTable(segments)
        # Determine logical segment partition size in Virtual Address Space
        self.num_segments = len(self.segment_table.segments)
        self.segment_space_size = self.virtual_address_space // max(1, self.num_segments)

    def decode_address(self, logical_address: int) -> tuple[int, int]:
        """Decodes a contiguous logical address into (segment_id, offset)."""
        segment_id = logical_address // self.segment_space_size
        offset = logical_address % self.segment_space_size
        return segment_id, offset

    def translate_single(self, logical_address: int, segment_id: Optional[int] = None, offset: Optional[int] = None) -> Dict[str, Any]:
        """Translates a logical address or (segment_id, offset) pair."""
        if segment_id is None or offset is None:
            if logical_address < 0 or logical_address >= self.virtual_address_space:
                return {
                    "logical_address": logical_address,
                    "valid": False,
                    "error": f"Address {logical_address} out of virtual address space [0, {self.virtual_address_space - 1}]",
                    "segment_id": None,
                    "segment_name": None,
                    "offset": None,
                    "base": None,
                    "limit": None,
                    "physical_address": None,
                    "translation_cost": 0.0,
                    "segmentation_fault": True
                }
            segment_id, offset = self.decode_address(logical_address)

        segment = self.segment_table.get_segment(segment_id)
        if not segment:
            return {
                "logical_address": logical_address,
                "valid": False,
                "error": f"Invalid Segment ID {segment_id}. No segment defined.",
                "segment_id": segment_id,
                "segment_name": None,
                "offset": offset,
                "base": None,
                "limit": None,
                "physical_address": None,
                "translation_cost": 0.0,
                "segmentation_fault": True
            }

        # Check bounds: offset < limit
        if offset < segment.limit:
            physical_address = segment.base + offset
            valid = True
            segmentation_fault = False
            error = None
            cost = 1.0 + 1.0 + 1.0  # Segment lookup + Bounds check + Memory access
            steps = [
                f"1. Logical Address: {logical_address} (Segment {segment.name} [ID {segment_id}], Offset {offset})",
                f"2. Segment Table Lookup: Base = {segment.base}, Limit = {segment.limit}",
                f"3. Bounds Check: Offset ({offset}) < Limit ({segment.limit}) -> PASS",
                f"4. Physical Address = Base ({segment.base}) + Offset ({offset}) = {physical_address}"
            ]
        else:
            physical_address = None
            valid = False
            segmentation_fault = True
            error = f"Segmentation Fault: Offset {offset} exceeds segment '{segment.name}' limit {segment.limit}."
            cost = 1.0 + 1.0 + 50.0  # Segment lookup + Bounds check + Trap handler
            steps = [
                f"1. Logical Address: {logical_address} (Segment {segment.name} [ID {segment_id}], Offset {offset})",
                f"2. Segment Table Lookup: Base = {segment.base}, Limit = {segment.limit}",
                f"3. Bounds Check: Offset ({offset}) >= Limit ({segment.limit}) -> FAULT!",
                f"4. Result: {error}"
            ]

        return {
            "logical_address": logical_address,
            "segment_id": segment_id,
            "segment_name": segment.name,
            "offset": offset,
            "base": segment.base,
            "limit": segment.limit,
            "permissions": segment.permissions,
            "physical_address": physical_address,
            "valid": valid,
            "segmentation_fault": segmentation_fault,
            "error": error,
            "translation_cost": cost,
            "steps": steps
        }

    def calculate_fragmentation(self) -> Dict[str, Any]:
        return self.calculate_memory_layout()

    def calculate_memory_layout(self) -> Dict[str, Any]:
        """Calculates allocated blocks, free memory holes, and external fragmentation."""
        # Sort segments by base address
        sorted_segs = sorted(self.segment_table.segments.values(), key=lambda s: s.base)
        
        allocated_blocks = []
        free_holes = []
        
        current_addr = 0
        total_allocated = 0
        
        for seg in sorted_segs:
            if seg.base > current_addr:
                hole_size = seg.base - current_addr
                free_holes.append({
                    "start": current_addr,
                    "end": seg.base - 1,
                    "size": hole_size
                })
            
            end_addr = seg.base + seg.limit - 1
            allocated_blocks.append({
                "segment_id": seg.segment_id,
                "name": seg.name,
                "start": seg.base,
                "end": end_addr,
                "size": seg.limit,
                "permissions": seg.permissions
            })
            total_allocated += seg.limit
            current_addr = max(current_addr, seg.base + seg.limit)

        if current_addr < self.physical_memory_size:
            hole_size = self.physical_memory_size - current_addr
            free_holes.append({
                "start": current_addr,
                "end": self.physical_memory_size - 1,
                "size": hole_size
            })

        total_free = sum(h["size"] for h in free_holes)
        largest_free_block = max((h["size"] for h in free_holes), default=0)
        
        memory_utilization = (total_allocated / self.physical_memory_size) * 100.0 if self.physical_memory_size > 0 else 0.0

        return {
            "physical_memory_size": self.physical_memory_size,
            "total_allocated": total_allocated,
            "total_free": total_free,
            "largest_free_block": largest_free_block,
            "free_hole_count": len(free_holes),
            "external_fragmentation_bytes": total_free,  # Unallocated fragmented gaps
            "memory_utilization_pct": round(memory_utilization, 2),
            "allocated_blocks": allocated_blocks,
            "free_holes": free_holes
        }

    def simulate_references(self, addresses: List[int]) -> Dict[str, Any]:
        """Runs batch simulation on a sequence of logical memory addresses."""
        total_references = len(addresses)
        segmentation_faults = 0
        invalid_accesses = 0
        total_cost = 0.0
        
        history = []

        for step_idx, addr in enumerate(addresses):
            res = self.translate_single(addr)
            
            if not res["valid"]:
                invalid_accesses += 1
                if res["segmentation_fault"]:
                    segmentation_faults += 1
            
            total_cost += res["translation_cost"]
            history.append({
                "step": step_idx,
                "logical_address": addr,
                "segment_id": res["segment_id"],
                "segment_name": res["segment_name"],
                "offset": res["offset"],
                "base": res["base"],
                "limit": res["limit"],
                "physical_address": res["physical_address"],
                "valid": res["valid"],
                "segmentation_fault": res["segmentation_fault"],
                "error": res["error"],
                "cost": res["translation_cost"]
            })

        valid_accesses = total_references - invalid_accesses
        avg_cost = (total_cost / total_references) if total_references > 0 else 0.0
        layout = self.calculate_memory_layout()

        return {
            "technique": "Segmentation",
            "config": {
                "virtual_address_space": self.virtual_address_space,
                "physical_memory_size": self.physical_memory_size,
                "segments": self.segment_table.to_list()
            },
            "metrics": {
                "total_references": total_references,
                "valid_accesses": valid_accesses,
                "invalid_accesses": invalid_accesses,
                "segmentation_faults": segmentation_faults,
                "fault_rate": round(segmentation_faults / total_references, 4) if total_references > 0 else 0.0,
                "total_cost": round(total_cost, 2),
                "avg_cost": round(avg_cost, 2),
                "allocated_bytes": layout["total_allocated"],
                "free_bytes": layout["total_free"],
                "largest_free_block": layout["largest_free_block"],
                "external_fragmentation_bytes": layout["external_fragmentation_bytes"],
                "internal_fragmentation_bytes": 0,  # Segmentation has 0 internal fragmentation
                "memory_utilization_pct": layout["memory_utilization_pct"]
            },
            "segment_table_state": self.segment_table.to_list(),
            "memory_layout": layout,
            "history": history
        }
