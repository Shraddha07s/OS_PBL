import random
from typing import List, Dict, Any

class WorkloadGenerator:
    def __init__(self, address_space: int = 65536, seed: int = 42):
        self.address_space = address_space
        self.seed = seed

    def generate(self, workload_type: str = "Locality", reference_count: int = 1000) -> Dict[str, Any]:
        """Generates a deterministic reference string based on workload pattern and seed."""
        if reference_count <= 0:
            raise ValueError("Reference count must be greater than 0")
        if self.address_space <= 0:
            raise ValueError("Address space must be greater than 0")

        rng = random.Random(self.seed)
        pattern = workload_type.lower()
        references: List[int] = []

        if pattern == "sequential":
            # Linear sequential addresses with occasional wrap-around or loop
            stride = 64  # step size in bytes
            current_addr = rng.randint(0, self.address_space // 4)
            for _ in range(reference_count):
                references.append(current_addr % self.address_space)
                current_addr += stride

        elif pattern == "random":
            # Pure uniform random references across virtual address space
            for _ in range(reference_count):
                references.append(rng.randint(0, self.address_space - 1))

        elif pattern == "locality":
            # 80/20 Locality rule: 80% of accesses hit a small working set (20% of memory)
            working_set_size = max(1024, self.address_space // 5)
            working_set_base = rng.randint(0, self.address_space - working_set_size)

            for _ in range(reference_count):
                if rng.random() < 0.85:
                    # Access within hot working set
                    addr = working_set_base + rng.randint(0, working_set_size - 1)
                else:
                    # Access outside working set
                    addr = rng.randint(0, self.address_space - 1)
                references.append(addr % self.address_space)

        elif pattern == "mixed":
            # Combination: 40% sequential loops, 40% locality, 20% random spikes
            stride = 128
            seq_addr = rng.randint(0, self.address_space // 2)
            hot_base = rng.randint(0, self.address_space // 2)
            hot_size = max(512, self.address_space // 8)

            for i in range(reference_count):
                r = rng.random()
                if r < 0.45:
                    # Sequential access
                    addr = seq_addr
                    seq_addr = (seq_addr + stride) % self.address_space
                elif r < 0.85:
                    # Hot region access
                    addr = hot_base + rng.randint(0, hot_size - 1)
                else:
                    # Random noise
                    addr = rng.randint(0, self.address_space - 1)
                references.append(addr % self.address_space)
        else:
            raise ValueError(f"Unsupported workload type: '{workload_type}'. Supported types: Sequential, Random, Locality, Mixed.")

        # Summary statistics of generated workload
        unique_addresses = len(set(references))
        unique_pages_1k = len(set(a // 1024 for a in references))

        return {
            "workload_type": workload_type,
            "reference_count": reference_count,
            "address_space": self.address_space,
            "seed": self.seed,
            "references": references,
            "preview": references[:50],  # First 50 references for frontend preview
            "stats": {
                "min_address": min(references),
                "max_address": max(references),
                "unique_addresses": unique_addresses,
                "unique_pages_1k": unique_pages_1k
            }
        }
