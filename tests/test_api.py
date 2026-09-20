import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "modules" in data
    assert data["modules"]["paging_engine"] == "online"

def test_paging_translation_baseline():
    """
    Requirement Test:
    Virtual Address = 2500, Page Size = 1024
    Expected: Page = 2, Offset = 452 (since 2500 // 1024 = 2, 2500 % 1024 = 452)
    """
    payload = {
        "virtual_address": 2500,
        "virtual_address_space": 65536,
        "physical_memory_size": 32768,
        "page_size": 1024,
        "enable_tlb": True
    }
    response = client.post("/api/translate/paging", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["status"] == "success"
    data = res["data"]
    assert data["valid"] is True
    assert data["page_number"] == 2
    assert data["offset"] == 452
    assert len(data["steps"]) >= 4

def test_paging_translation_out_of_bounds():
    payload = {
        "virtual_address": 70000,
        "virtual_address_space": 65536,
        "physical_memory_size": 32768,
        "page_size": 1024
    }
    response = client.post("/api/translate/paging", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["data"]["valid"] is False
    assert "out of virtual address space" in res["data"]["error"].lower()

def test_segmentation_translation_valid():
    payload = {
        "logical_address": 1000,
        "segment_id": 0,
        "offset": 500,
        "virtual_address_space": 65536,
        "physical_memory_size": 32768
    }
    response = client.post("/api/translate/segmentation", json=payload)
    assert response.status_code == 200
    res = response.json()
    data = res["data"]
    assert data["valid"] is True
    assert data["segmentation_fault"] is False
    assert data["physical_address"] == data["base"] + 500

def test_segmentation_fault_bounds_check():
    """
    Requirement Test:
    Offset = 5000, Limit = 4000 (e.g. Segment 1 Data has limit 4096)
    Expected: Segmentation fault / invalid access
    """
    payload = {
        "logical_address": 20000,
        "segment_id": 1,  # Data segment has limit 4096
        "offset": 5000,
        "virtual_address_space": 65536,
        "physical_memory_size": 32768
    }
    response = client.post("/api/translate/segmentation", json=payload)
    assert response.status_code == 200
    res = response.json()
    data = res["data"]
    assert data["valid"] is False
    assert data["segmentation_fault"] is True
    assert "Segmentation Fault" in data["error"]
    assert "exceeds segment" in data["error"]

def test_workload_generator_determinism():
    """Test that the same seed and settings generate identical reference streams."""
    payload1 = {
        "workload_type": "Locality",
        "reference_count": 500,
        "address_space": 65536,
        "seed": 42
    }
    payload2 = {
        "workload_type": "Locality",
        "reference_count": 500,
        "address_space": 65536,
        "seed": 42
    }
    res1 = client.post("/api/workloads/generate", json=payload1).json()["data"]
    res2 = client.post("/api/workloads/generate", json=payload2).json()["data"]

    assert res1["references"] == res2["references"]
    assert len(res1["references"]) == 500
    assert res1["stats"]["unique_addresses"] > 0

def test_workload_generator_all_types():
    for wtype in ["Sequential", "Random", "Locality", "Mixed"]:
        payload = {
            "workload_type": wtype,
            "reference_count": 100,
            "address_space": 65536,
            "seed": 10
        }
        res = client.post("/api/workloads/generate", json=payload)
        assert res.status_code == 200
        assert len(res.json()["data"]["references"]) == 100

def test_paging_simulation_policies():
    """Test FIFO, LRU, and Optimal replacement policies in simulation."""
    for algo in ["FIFO", "LRU", "Optimal"]:
        payload = {
            "virtual_address_space": 65536,
            "physical_memory_size": 16384,
            "page_size": 1024,
            "replacement_algorithm": algo,
            "enable_tlb": True,
            "tlb_size": 4,
            "reference_count": 200,
            "workload_type": "Locality",
            "seed": 42
        }
        response = client.post("/api/simulate/paging", json=payload)
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["technique"] == "Paging"
        assert data["metrics"]["total_references"] == 200
        assert data["metrics"]["page_faults"] > 0
        assert data["metrics"]["memory_utilization_pct"] > 0
        assert data["metrics"]["external_fragmentation_bytes"] == 0

def test_segmentation_simulation():
    payload = {
        "virtual_address_space": 65536,
        "physical_memory_size": 32768,
        "reference_count": 200,
        "workload_type": "Locality",
        "seed": 42
    }
    response = client.post("/api/simulate/segmentation", json=payload)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["technique"] == "Segmentation"
    assert data["metrics"]["total_references"] == 200
    assert "external_fragmentation_bytes" in data["metrics"]
    assert "memory_layout" in data

def test_experiment_compare_same_workload():
    """Verify that head-to-head comparison runs on the EXACT same workload."""
    payload = {
        "virtual_address_space": 65536,
        "physical_memory_size": 32768,
        "page_size": 1024,
        "reference_count": 300,
        "workload_type": "Locality",
        "seed": 42,
        "replacement_algorithm": "LRU",
        "enable_tlb": True,
        "tlb_size": 4
    }
    response = client.post("/api/experiments/compare", json=payload)
    assert response.status_code == 200
    data = response.json()["data"]

    # Check that both simulations evaluated the exact same number of references
    assert data["paging"]["metrics"]["total_references"] == 300
    assert data["segmentation"]["metrics"]["total_references"] == 300

    # Check comparison metrics
    comp = data["comparison"]
    assert "cost_comparison" in comp
    assert "fault_comparison" in comp
    assert "memory_comparison" in comp
    assert "interpretation" in comp
    assert comp["cost_comparison"]["winner"] in ["Paging", "Segmentation", "Tie"]
