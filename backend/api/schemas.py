from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# Address Translation Schemas
class PagingTranslationRequest(BaseModel):
    virtual_address: int = Field(..., description="Virtual memory address to translate", ge=0)
    virtual_address_space: int = Field(default=65536, ge=1024)
    physical_memory_size: int = Field(default=32768, ge=1024)
    page_size: int = Field(default=1024, ge=64)
    enable_tlb: bool = Field(default=True)

class SegmentationTranslationRequest(BaseModel):
    logical_address: int = Field(..., description="Logical memory address to translate", ge=0)
    segment_id: Optional[int] = Field(default=None, description="Optional explicit segment ID")
    offset: Optional[int] = Field(default=None, description="Optional explicit segment offset")
    virtual_address_space: int = Field(default=65536, ge=1024)
    physical_memory_size: int = Field(default=32768, ge=1024)

# Workload Generation Schema
class WorkloadRequest(BaseModel):
    workload_type: str = Field(default="Locality", description="Sequential, Random, Locality, or Mixed")
    reference_count: int = Field(default=1000, ge=1, le=10000)
    address_space: int = Field(default=65536, ge=1024)
    seed: int = Field(default=42, ge=0)

# Standalone Simulation Schemas
class SegmentInput(BaseModel):
    segment_id: int
    name: str
    base: int = Field(..., ge=0)
    limit: int = Field(..., ge=1)
    permissions: str = Field(default="rw-")

class PagingSimRequest(BaseModel):
    virtual_address_space: int = Field(default=65536, ge=1024)
    physical_memory_size: int = Field(default=32768, ge=1024)
    page_size: int = Field(default=1024, ge=64)
    replacement_algorithm: str = Field(default="LRU", description="FIFO, LRU, or Optimal")
    enable_tlb: bool = Field(default=True)
    tlb_size: int = Field(default=4, ge=1)
    reference_addresses: Optional[List[int]] = Field(default=None, description="Custom address reference list")
    workload_type: Optional[str] = Field(default="Locality")
    reference_count: Optional[int] = Field(default=1000, ge=1, le=10000)
    seed: Optional[int] = Field(default=42, ge=0)

class SegmentationSimRequest(BaseModel):
    virtual_address_space: int = Field(default=65536, ge=1024)
    physical_memory_size: int = Field(default=32768, ge=1024)
    segments: Optional[List[SegmentInput]] = Field(default=None)
    reference_addresses: Optional[List[int]] = Field(default=None)
    workload_type: Optional[str] = Field(default="Locality")
    reference_count: Optional[int] = Field(default=1000, ge=1, le=10000)
    seed: Optional[int] = Field(default=42, ge=0)

# Experiment & Comparison Request Schema
class ExperimentRequest(BaseModel):
    virtual_address_space: int = Field(default=65536, ge=1024)
    physical_memory_size: int = Field(default=32768, ge=1024)
    page_size: int = Field(default=1024, ge=64)
    reference_count: int = Field(default=1000, ge=1, le=10000)
    workload_type: str = Field(default="Locality")
    seed: int = Field(default=42, ge=0)
    replacement_algorithm: str = Field(default="LRU")
    enable_tlb: bool = Field(default=True)
    tlb_size: int = Field(default=4, ge=1)
    segments: Optional[List[SegmentInput]] = Field(default=None)

# Generic Response Schema Wrapper
class APIResponse(BaseModel):
    status: str = "success"
    message: str = ""
    data: Dict[str, Any]
