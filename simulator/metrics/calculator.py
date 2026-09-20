from typing import Dict, Any

class MetricsCalculator:
    @staticmethod
    def compare_simulations(paging_results: Dict[str, Any], seg_results: Dict[str, Any]) -> Dict[str, Any]:
        """Compares Paging vs Segmentation simulation outputs under the exact same workload."""
        p_metrics = paging_results.get("metrics", {})
        s_metrics = seg_results.get("metrics", {})

        total_refs = p_metrics.get("total_references", 0)

        # Cost diff
        p_cost = p_metrics.get("total_cost", 0.0)
        s_cost = s_metrics.get("total_cost", 0.0)
        cost_diff = s_cost - p_cost
        cost_winner = "Paging" if p_cost < s_cost else ("Segmentation" if s_cost < p_cost else "Tie")

        # Fragmentation diff
        p_frag = p_metrics.get("internal_fragmentation_bytes", 0)
        s_frag = s_metrics.get("external_fragmentation_bytes", 0)

        # Utilization diff
        p_util = p_metrics.get("memory_utilization_pct", 0.0)
        s_util = s_metrics.get("memory_utilization_pct", 0.0)

        # Narrative interpretation
        interpretation = (
            f"Under the {paging_results.get('config', {}).get('replacement_algorithm', 'LRU')} replacement policy "
            f"and identical workload of {total_refs} references, {cost_winner} achieved lower total simulated cost "
            f"({min(p_cost, s_cost)} units vs {max(p_cost, s_cost)} units). "
            f"Paging incurred {p_metrics.get('page_faults', 0)} page faults (rate: {p_metrics.get('page_fault_rate', 0)*100:.1f}%), "
            f"while Segmentation experienced {s_metrics.get('segmentation_faults', 0)} invalid segment access faults. "
            f"Paging has 0 external fragmentation but can have internal fragmentation on page boundaries; "
            f"Segmentation incurred {s_frag} bytes of external fragmentation in unallocated free gaps."
        )

        return {
            "total_references": total_refs,
            "cost_comparison": {
                "paging_total_cost": p_cost,
                "paging_avg_cost": p_metrics.get("avg_cost", 0.0),
                "segmentation_total_cost": s_cost,
                "segmentation_avg_cost": s_metrics.get("avg_cost", 0.0),
                "cost_difference": round(cost_diff, 2),
                "winner": cost_winner
            },
            "fault_comparison": {
                "paging_page_faults": p_metrics.get("page_faults", 0),
                "paging_fault_rate": p_metrics.get("page_fault_rate", 0.0),
                "segmentation_faults": s_metrics.get("segmentation_faults", 0),
                "segmentation_fault_rate": s_metrics.get("fault_rate", 0.0)
            },
            "memory_comparison": {
                "paging_internal_fragmentation": p_frag,
                "paging_external_fragmentation": 0,
                "paging_memory_utilization_pct": p_util,
                "segmentation_internal_fragmentation": 0,
                "segmentation_external_fragmentation": s_frag,
                "segmentation_memory_utilization_pct": s_util,
                "segmentation_largest_free_block": s_metrics.get("largest_free_block", 0)
            },
            "access_validity": {
                "paging_valid_accesses": p_metrics.get("valid_accesses", 0),
                "paging_invalid_accesses": p_metrics.get("invalid_accesses", 0),
                "segmentation_valid_accesses": s_metrics.get("valid_accesses", 0),
                "segmentation_invalid_accesses": s_metrics.get("invalid_accesses", 0)
            },
            "interpretation": interpretation
        }
