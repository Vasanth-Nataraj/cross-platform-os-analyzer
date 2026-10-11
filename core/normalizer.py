import time
from typing import Dict, Any

class TelemetryNormalizer:
    """
    Normalizes disparate kernel-level metrics into a standard schema
    suitable for comparative analytics and side-by-side visualization.
    """

    @staticmethod
    def normalize_windows(raw: Dict[str, Any]) -> Dict[str, Any]:
        committed = raw.get("committed_bytes_mb", 0.0)
        limit = raw.get("commit_limit_mb", 1.0) or 1.0
        utilization = round((committed / limit) * 100, 2)

        return {
            "os_name": "Windows NT",
            "timestamp": time.time(),
            "cpu": {
                "context_switches": raw.get("cpu_context_switches_sec", 0),
                "metric_type": "Context Switches / sec",
                "workload_metric": raw.get("page_faults_sec", 0),
                "workload_type": "Page Faults / sec"
            },
            "memory": {
                "used_mb": committed,
                "total_limit_mb": limit,
                "utilization_pct": utilization,
                "paging_used_mb": committed,
                "paging_type": "Pagefile Backed Commit"
            }
        }

    @staticmethod
    def normalize_linux(raw: Dict[str, Any]) -> Dict[str, Any]:
        total_mb = raw.get("mem_total_mb", 1.0) or 1.0
        avail_mb = raw.get("mem_available_mb", 0.0)
        used_mb = round(total_mb - avail_mb, 2)
        utilization = round((used_mb / total_mb) * 100, 2)

        swap_total = raw.get("swap_total_mb", 0.0)
        swap_free = raw.get("swap_free_mb", 0.0)
        swap_used = round(swap_total - swap_free, 2)

        return {
            "os_name": "Linux (POSIX)",
            "timestamp": time.time(),
            "cpu": {
                "context_switches": raw.get("context_switches", 0),
                "metric_type": "Cumulative Context Switches",
                "workload_metric": raw.get("processes_forked", 0),
                "workload_type": "Cumulative Tasks Forked"
            },
            "memory": {
                "used_mb": used_mb,
                "total_limit_mb": total_mb,
                "utilization_pct": utilization,
                "paging_used_mb": swap_used,
                "paging_type": "Linux Swap",
                "dirty_cache_kb": raw.get("dirty_cache_kb", 0)
            }
        }

    @staticmethod
    def normalize_android(raw: Dict[str, Any]) -> Dict[str, Any]:
        dalvik_mb = round(raw.get("dalvik_heap_kb", 0) / 1024, 2)
        native_mb = round(raw.get("native_heap_kb", 0) / 1024, 2)
        zram_mb = round(raw.get("zram_used_kb", 0) / 1024, 2)
        used_mb = round(dalvik_mb + native_mb, 2)

        return {
            "os_name": f"Android ({raw.get('device', 'Virtual Device')})",
            "timestamp": time.time(),
            "connected": raw.get("connected", False),
            "cpu": {
                "context_switches": 0,
                "metric_type": "ADB Polled / ART Managed",
                "workload_metric": 0,
                "workload_type": "Dalvik Heap Sweeps"
            },
            "memory": {
                "used_mb": used_mb,
                "total_limit_mb": 0.0,
                "utilization_pct": 0.0,
                "paging_used_mb": zram_mb,
                "paging_type": "ZRAM Compressed Pool",
                "dalvik_mb": dalvik_mb,
                "native_mb": native_mb
            }
        }