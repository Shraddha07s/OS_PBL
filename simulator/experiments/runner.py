from typing import Dict, Any, List, Optional
from simulator.paging.engine import PagingSimulator
from simulator.segmentation.engine import SegmentationSimulator
from simulator.segmentation.segment_table import Segment
from simulator.workloads.generator import WorkloadGenerator
from simulator.metrics.calculator import MetricsCalculator

class ExperimentRunner:
    def __init__(self):
        pass

    def run_experiment(
        self,
        virtual_address_space: int = 65536,
        physical_memory_size: int = 32768,
        page_size: int = 1024,
        reference_count: int = 1000,
        workload_type: str = "Locality",
        seed: int = 42,
        replacement_algorithm: str = "LRU",
        enable_tlb: bool = True,
        tlb_size: int = 4,
        custom_segments: Optional[List[Segment]] = None
    ) -> Dict[str, Any]:
        """
        Executes a head-to-head experiment comparing Paging and Segmentation
        using the EXACT SAME generated workload.
        """
        # 1. Generate workload (Deterministic with seed)
        gen = WorkloadGenerator(address_space=virtual_address_space, seed=seed)
        workload_data = gen.generate(workload_type=workload_type, reference_count=reference_count)
        references = workload_data["references"]

        # 2. Run Paging Simulation
        paging_sim = PagingSimulator(
            virtual_address_space=virtual_address_space,
            physical_memory_size=physical_memory_size,
            page_size=page_size,
            replacement_algorithm=replacement_algorithm,
            enable_tlb=enable_tlb,
            tlb_size=tlb_size
        )
        paging_results = paging_sim.simulate_references(references)

        # 3. Run Segmentation Simulation (with EXACT SAME workload)
        seg_sim = SegmentationSimulator(
            virtual_address_space=virtual_address_space,
            physical_memory_size=physical_memory_size,
            segments=custom_segments
        )
        seg_results = seg_sim.simulate_references(references)

        # 4. Compare Metrics
        comparison = MetricsCalculator.compare_simulations(paging_results, seg_results)

        return {
            "experiment_id": f"EXP-{seed}-{workload_type[:3].upper()}-{page_size}",
            "config": {
                "virtual_address_space": virtual_address_space,
                "physical_memory_size": physical_memory_size,
                "page_size": page_size,
                "reference_count": reference_count,
                "workload_type": workload_type,
                "seed": seed,
                "replacement_algorithm": replacement_algorithm,
                "enable_tlb": enable_tlb,
                "tlb_size": tlb_size
            },
            "workload_stats": workload_data["stats"],
            "workload_preview": workload_data["preview"],
            "paging": paging_results,
            "segmentation": seg_results,
            "comparison": comparison
        }
