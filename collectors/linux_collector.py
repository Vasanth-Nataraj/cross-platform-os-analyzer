import os
import subprocess
import platform

def parse_proc_stat(content: str) -> dict:
    stats = {"context_switches": 0, "processes_forked": 0}
    for line in content.splitlines():
        if line.startswith("ctxt "):
            stats["context_switches"] = int(line.split()[1])
        elif line.startswith("processes "):
            stats["processes_forked"] = int(line.split()[1])
    return stats

def parse_proc_meminfo(content: str) -> dict:
    mem = {}
    for line in content.splitlines():
        parts = line.split(":")
        if len(parts) == 2:
            key = parts[0].strip()
            # values are generally in kB
            val = int(parts[1].strip().split()[0])
            mem[key] = val
            
    total = mem.get("MemTotal", 0)
    free = mem.get("MemFree", 0)
    buffers = mem.get("Buffers", 0)
    cached = mem.get("Cached", 0)
    dirty = mem.get("Dirty", 0)
    
    return {
        "mem_total_mb": round(total / 1024, 2),
        "mem_available_mb": round((free + buffers + cached) / 1024, 2),
        "dirty_cache_kb": dirty,
        "swap_total_mb": round(mem.get("SwapTotal", 0) / 1024, 2),
        "swap_free_mb": round(mem.get("SwapFree", 0) / 1024, 2)
    }

def get_linux_kernel_metrics() -> dict:
    # Check if native Linux or accessible via WSL on Windows
    if platform.system() == "Linux":
        try:
            with open("/proc/stat", "r") as f:
                stat_data = parse_proc_stat(f.read())
            with open("/proc/meminfo", "r") as f:
                mem_data = parse_proc_meminfo(f.read())
            return {"os": "Linux", **stat_data, **mem_data}
        except Exception as e:
            return {"error": str(e)}
            
    elif platform.system() == "Windows":
        try:
            # Query Linux via WSL subsystem directly
            stat_out = subprocess.check_output(["wsl", "cat", "/proc/stat"], text=True)
            mem_out = subprocess.check_output(["wsl", "cat", "/proc/meminfo"], text=True)
            stat_data = parse_proc_stat(stat_out)
            mem_data = parse_proc_meminfo(mem_out)
            return {"os": "Linux (WSL)", **stat_data, **mem_data}
        except Exception as e:
            return {"error": f"WSL execution failed: {e}"}

    return {"error": "Unsupported environment"}

if __name__ == "__main__":
    import pprint
    pprint.pprint(get_linux_kernel_metrics())