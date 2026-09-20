from fastapi import APIRouter, HTTPException, status
from backend.api.schemas import (
    PagingTranslationRequest,
    SegmentationTranslationRequest,
    WorkloadRequest,
    PagingSimRequest,
    SegmentationSimRequest,
    ExperimentRequest,
    APIResponse
)
from simulator.paging.engine import PagingSimulator
from simulator.segmentation.engine import SegmentationSimulator
from simulator.segmentation.segment_table import Segment
from simulator.workloads.generator import WorkloadGenerator
from simulator.experiments.runner import ExperimentRunner

router = APIRouter(prefix="/api", tags=["simulation"])

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "OS Memory Management Simulator API",
        "version": "1.0.0",
        "modules": {
            "paging_engine": "online",
            "segmentation_engine": "online",
            "workload_generator": "online",
            "experiment_runner": "online"
        }
    }

@router.post("/translate/paging", response_model=APIResponse)
def translate_paging(req: PagingTranslationRequest):
    try:
        sim = PagingSimulator(
            virtual_address_space=req.virtual_address_space,
            physical_memory_size=req.physical_memory_size,
            page_size=req.page_size,
            enable_tlb=req.enable_tlb
        )
        res = sim.translate_single(req.virtual_address)
        return APIResponse(
            status="success",
            message=f"Translated Virtual Address {req.virtual_address} using Paging",
            data=res
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/translate/segmentation", response_model=APIResponse)
def translate_segmentation(req: SegmentationTranslationRequest):
    try:
        sim = SegmentationSimulator(
            virtual_address_space=req.virtual_address_space,
            physical_memory_size=req.physical_memory_size
        )
        res = sim.translate_single(
            logical_address=req.logical_address,
            segment_id=req.segment_id,
            offset=req.offset
        )
        return APIResponse(
            status="success",
            message=f"Translated Logical Address {req.logical_address} using Segmentation",
            data=res
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/workloads/generate", response_model=APIResponse)
def generate_workload(req: WorkloadRequest):
    try:
        generator = WorkloadGenerator(address_space=req.address_space, seed=req.seed)
        data = generator.generate(workload_type=req.workload_type, reference_count=req.reference_count)
        return APIResponse(
            status="success",
            message=f"Generated {req.reference_count} references for '{req.workload_type}' workload (Seed: {req.seed})",
            data=data
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/simulate/paging", response_model=APIResponse)
def simulate_paging(req: PagingSimRequest):
    try:
        # Determine reference string
        if req.reference_addresses and len(req.reference_addresses) > 0:
            addresses = req.reference_addresses
        else:
            gen = WorkloadGenerator(address_space=req.virtual_address_space, seed=req.seed or 42)
            wdata = gen.generate(workload_type=req.workload_type or "Locality", reference_count=req.reference_count or 1000)
            addresses = wdata["references"]

        sim = PagingSimulator(
            virtual_address_space=req.virtual_address_space,
            physical_memory_size=req.physical_memory_size,
            page_size=req.page_size,
            replacement_algorithm=req.replacement_algorithm,
            enable_tlb=req.enable_tlb,
            tlb_size=req.tlb_size
        )
        results = sim.simulate_references(addresses)
        return APIResponse(
            status="success",
            message=f"Paging simulation finished for {len(addresses)} references",
            data=results
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/simulate/segmentation", response_model=APIResponse)
def simulate_segmentation(req: SegmentationSimRequest):
    try:
        # Determine reference string
        if req.reference_addresses and len(req.reference_addresses) > 0:
            addresses = req.reference_addresses
        else:
            gen = WorkloadGenerator(address_space=req.virtual_address_space, seed=req.seed or 42)
            wdata = gen.generate(workload_type=req.workload_type or "Locality", reference_count=req.reference_count or 1000)
            addresses = wdata["references"]

        custom_segs = None
        if req.segments:
            custom_segs = [
                Segment(
                    segment_id=s.segment_id,
                    name=s.name,
                    base=s.base,
                    limit=s.limit,
                    permissions=s.permissions
                )
                for s in req.segments
            ]

        sim = SegmentationSimulator(
            virtual_address_space=req.virtual_address_space,
            physical_memory_size=req.physical_memory_size,
            segments=custom_segs
        )
        results = sim.simulate_references(addresses)
        return APIResponse(
            status="success",
            message=f"Segmentation simulation finished for {len(addresses)} references",
            data=results
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/experiments/run", response_model=APIResponse)
@router.post("/experiments/compare", response_model=APIResponse)
def run_experiment_compare(req: ExperimentRequest):
    try:
        custom_segs = None
        if req.segments:
            custom_segs = [
                Segment(
                    segment_id=s.segment_id,
                    name=s.name,
                    base=s.base,
                    limit=s.limit,
                    permissions=s.permissions
                )
                for s in req.segments
            ]

        runner = ExperimentRunner()
        res = runner.run_experiment(
            virtual_address_space=req.virtual_address_space,
            physical_memory_size=req.physical_memory_size,
            page_size=req.page_size,
            reference_count=req.reference_count,
            workload_type=req.workload_type,
            seed=req.seed,
            replacement_algorithm=req.replacement_algorithm,
            enable_tlb=req.enable_tlb,
            tlb_size=req.tlb_size,
            custom_segments=custom_segs
        )

        return APIResponse(
            status="success",
            message="Head-to-head comparison completed on identical workload.",
            data=res
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
