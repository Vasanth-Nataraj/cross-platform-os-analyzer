from typing import Dict, Any, List

class KernelAlertEngine:
    """
    Evaluates normalized OS telemetry records against critical kernel thresholds
    to detect thrashing, scheduling bottlenecks, and resource starvation.
    """

    @staticmethod
    def evaluate_windows(norm_win: Dict[str, Any]) -> List[Dict[str, str]]:
        alerts = []
        page_faults = norm_win.get("cpu", {}).get("workload_metric", 0)
        ctxt_switches = norm_win.get("cpu", {}).get("context_switches", 0)
        mem_pct = norm_win.get("memory", {}).get("utilization_pct", 0)

        # Threshold 1: Excessive Page Faulting (Indicates working set exhaustion / disk paging)
        if page_faults > 15000:
            alerts.append({
                "level": "error",
                "title": "Severe Page Faulting",
                "message": f"Page faults at {page_faults:,}/sec. Disk paging activity elevated."
            })
        elif page_faults > 5000:
            alerts.append({
                "level": "warning",
                "title": "Elevated Page Translations",
                "message": f"Page faults elevated at {page_faults:,}/sec."
            })

        # Threshold 2: Context Switch Overhead
        if ctxt_switches > 25000:
            alerts.append({
                "level": "warning",
                "title": "High Scheduler Contention",
                "message": f"Context switches at {ctxt_switches:,}/sec across threads."
            })

        # Threshold 3: Commit Limit Pressure
        if mem_pct > 90.0:
            alerts.append({
                "level": "error",
                "title": "Commit Limit Saturation",
                "message": f"Committed memory at {mem_pct}% of total limit."
            })

        if not alerts:
            alerts.append({
                "level": "success",
                "title": "Subsystem Stable",
                "message": "Windows NT scheduler and virtual memory metrics within normal range."
            })

        return alerts

    @staticmethod
    def evaluate_linux(norm_lin: Dict[str, Any]) -> List[Dict[str, str]]:
        alerts = []
        mem = norm_lin.get("memory", {})
        used_swap = mem.get("paging_used_mb", 0)
        dirty_kb = mem.get("dirty_cache_kb", 0)

        # Threshold 1: Swap Exhaustion / Potential Thrashing
        if used_swap > 800.0:  # WSL default swap is usually ~1024MB
            alerts.append({
                "level": "error",
                "title": "High Swap Utilization",
                "message": f"Active swap allocation reached {used_swap:.1f} MB. Risk of thrashing."
            })

        # Threshold 2: Uncommitted Cache Flush Latency
        if dirty_kb > 50000:  # > 50MB unwritten pages in cache
            alerts.append({
                "level": "warning",
                "title": "Dirty Page Accumulation",
                "message": f"Dirty buffer cache at {dirty_kb / 1024:.1f} MB awaiting sync to disk."
            })

        if not alerts:
            alerts.append({
                "level": "success",
                "title": "Subsystem Stable",
                "message": "Linux POSIX memory buffer pools and swap space healthy."
            })

        return alerts

    @staticmethod
    def evaluate_android(norm_and: Dict[str, Any]) -> List[Dict[str, str]]:
        alerts = []
        if not norm_and.get("connected", False):
            alerts.append({
                "level": "info",
                "title": "Standby Mode",
                "message": "Android runtime running in simulator profile (USB disconnected)."
            })
            return alerts

        zram_mb = norm_and.get("memory", {}).get("paging_used_mb", 0)
        # Threshold: High ZRAM Compression (precursor to Android LMK kills)
        if zram_mb > 1500.0:
            alerts.append({
                "level": "error",
                "title": "Aggressive ZRAM Saturation",
                "message": f"ZRAM compressed pool at {zram_mb:.1f} MB. Android LMK eviction imminent."
            })
        else:
            alerts.append({
                "level": "success",
                "title": "Subsystem Stable",
                "message": "Dalvik/ART heap and low-memory killer thresholds nominal."
            })

        return alerts