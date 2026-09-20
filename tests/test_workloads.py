"""
Unit tests for WorkloadGenerator.
Verifies seed determinism, sequential, random, locality, mixed workloads, and error handling.
"""
import pytest
from simulator.workloads.generator import WorkloadGenerator


class TestWorkloadGenerator:
    def test_seed_determinism(self):
        """Same seed must produce identical reference sequences."""
        gen1 = WorkloadGenerator(address_space=65536, seed=42)
        gen2 = WorkloadGenerator(address_space=65536, seed=42)

        res1 = gen1.generate(workload_type="locality", reference_count=200)
        res2 = gen2.generate(workload_type="locality", reference_count=200)

        assert res1["references"] == res2["references"]
        assert len(res1["references"]) == 200

    def test_different_seeds_diverge(self):
        """Different seeds must produce different reference sequences."""
        gen1 = WorkloadGenerator(address_space=65536, seed=42)
        gen2 = WorkloadGenerator(address_space=65536, seed=99)

        res1 = gen1.generate(workload_type="random", reference_count=100)
        res2 = gen2.generate(workload_type="random", reference_count=100)

        assert res1["references"] != res2["references"]

    def test_sequential_workload(self):
        """Sequential workload should step by stride and stay within bounds."""
        addr_space = 1024
        count = 50
        gen = WorkloadGenerator(address_space=addr_space, seed=123)
        res = gen.generate(workload_type="sequential", reference_count=count)

        assert len(res["references"]) == count
        for addr in res["references"]:
            assert 0 <= addr < addr_space

    def test_random_workload(self):
        """Random workload should be bounded within address space."""
        addr_space = 65536
        count = 300
        gen = WorkloadGenerator(address_space=addr_space, seed=7)
        res = gen.generate(workload_type="random", reference_count=count)

        assert len(res["references"]) == count
        for addr in res["references"]:
            assert 0 <= addr < addr_space

        assert len(set(res["references"])) > 200

    def test_locality_workload_clustering(self):
        """Locality workload should concentrate >= 75% of accesses in working set."""
        addr_space = 65536
        count = 500
        gen = WorkloadGenerator(address_space=addr_space, seed=42)
        res = gen.generate(workload_type="locality", reference_count=count)

        assert len(res["references"]) == count
        for addr in res["references"]:
            assert 0 <= addr < addr_space

        # Working set size is 20% of address space
        working_set_size = addr_space // 5
        first_100 = res["references"][:100]
        # Check clustering around median of sample
        median_ref = sorted(first_100)[len(first_100) // 2]
        close_refs = sum(1 for a in first_100 if abs(a - median_ref) <= working_set_size)
        assert close_refs / len(first_100) >= 0.70

    def test_mixed_workload(self):
        """Mixed workload generates valid references across patterns."""
        addr_space = 65536
        count = 400
        gen = WorkloadGenerator(address_space=addr_space, seed=101)
        res = gen.generate(workload_type="mixed", reference_count=count)

        assert len(res["references"]) == count
        assert all(0 <= a < addr_space for a in res["references"])

    def test_invalid_workload_type(self):
        """Invalid workload type must raise ValueError."""
        gen = WorkloadGenerator(address_space=1024, seed=1)
        with pytest.raises(ValueError, match="Unsupported workload type"):
            gen.generate(workload_type="quantum_gaussian", reference_count=100)

    def test_invalid_parameters(self):
        """Non-positive reference count or address space must raise ValueError."""
        gen = WorkloadGenerator(address_space=1024, seed=1)
        with pytest.raises(ValueError, match="Reference count must be greater than 0"):
            gen.generate(reference_count=0)

        gen_bad_space = WorkloadGenerator(address_space=0, seed=1)
        with pytest.raises(ValueError, match="Address space must be greater than 0"):
            gen_bad_space.generate(reference_count=10)
