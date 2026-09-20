"""
Unit tests for MetricsCalculator.
Verifies cost comparison, fragmentation contrast, fault comparison, and interpretation.
"""
import pytest
from simulator.metrics.calculator import MetricsCalculator


class TestMetricsCalculator:
    def test_compare_simulations_basic(self):
        """Verify comparison metrics with synthetic paging and segmentation results."""
        paging_results = {
            "config": {"replacement_algorithm": "LRU"},
            "metrics": {
                "total_references": 100,
                "valid_accesses": 100,
                "invalid_accesses": 0,
                "page_faults": 5,
                "page_fault_rate": 0.05,
                "total_cost": 210.0,
                "avg_cost": 2.10,
                "internal_fragmentation_bytes": 1024,
                "external_fragmentation_bytes": 0,
                "memory_utilization_pct": 95.0
            }
        }
        seg_results = {
            "config": {},
            "metrics": {
                "total_references": 100,
                "valid_accesses": 90,
                "invalid_accesses": 10,
                "segmentation_faults": 10,
                "fault_rate": 0.10,
                "total_cost": 300.0,
                "avg_cost": 3.00,
                "internal_fragmentation_bytes": 0,
                "external_fragmentation_bytes": 4096,
                "largest_free_block": 2048,
                "memory_utilization_pct": 87.5
            }
        }

        comparison = MetricsCalculator.compare_simulations(paging_results, seg_results)

        assert comparison["total_references"] == 100
        assert comparison["cost_comparison"]["winner"] == "Paging"
        assert comparison["cost_comparison"]["paging_total_cost"] == 210.0
        assert comparison["cost_comparison"]["segmentation_total_cost"] == 300.0
        assert comparison["cost_comparison"]["cost_difference"] == 90.0

        # Memory comparison
        mem_comp = comparison["memory_comparison"]
        assert mem_comp["paging_internal_fragmentation"] == 1024
        assert mem_comp["paging_external_fragmentation"] == 0
        assert mem_comp["segmentation_internal_fragmentation"] == 0
        assert mem_comp["segmentation_external_fragmentation"] == 4096

        # Interpretation text
        assert "LRU" in comparison["interpretation"]
        assert "Paging" in comparison["interpretation"]

    def test_compare_simulations_segmentation_lower_cost(self):
        """When segmentation total cost is lower, winner must be Segmentation."""
        p_res = {
            "config": {"replacement_algorithm": "FIFO"},
            "metrics": {"total_references": 50, "total_cost": 500.0, "avg_cost": 10.0}
        }
        s_res = {
            "metrics": {"total_references": 50, "total_cost": 150.0, "avg_cost": 3.0}
        }
        comp = MetricsCalculator.compare_simulations(p_res, s_res)
        assert comp["cost_comparison"]["winner"] == "Segmentation"
