import platform
import subprocess
import json

def get_windows_kernel_metrics() -> dict:
    if platform.system() != "Windows":
        return {"error": "Platform is not Windows"}

    metrics = {
        "os": "Windows",
        "cpu_context_switches_sec": 0,
        "page_faults_sec": 0,
        "committed_bytes_mb": 0,
        "commit_limit_mb": 0
    }

    try:
        # PowerShell command querying low-level OS performance counters
        cmd = (
            "powershell -NoProfile -Command "
            "\"Get-CimInstance -ClassName Win32_PerfFormattedData_PerfOS_System | "
            "Select-Object ContextSwitchesPerSec | ConvertTo-Json; "
            "Get-CimInstance -ClassName Win32_PerfFormattedData_PerfOS_Memory | "
            "Select-Object PageFaultsPerSec, CommittedBytes, CommitLimit | ConvertTo-Json\""
        )
        output = subprocess.check_output(cmd, shell=True, text=True).strip()
        
        # Parse outputs (two JSON objects emitted sequentially)
        json_blocks = [json.loads(b) for b in output.replace("}\n{", "}|||{").split("|||") if b.strip()]
        
        if len(json_blocks) >= 2:
            metrics["cpu_context_switches_sec"] = int(json_blocks[0].get("ContextSwitchesPerSec", 0))
            metrics["page_faults_sec"] = int(json_blocks[1].get("PageFaultsPerSec", 0))
            
            comm_bytes = int(json_blocks[1].get("CommittedBytes", 0))
            comm_limit = int(json_blocks[1].get("CommitLimit", 0))
            metrics["committed_bytes_mb"] = round(comm_bytes / (1024 * 1024), 2)
            metrics["commit_limit_mb"] = round(comm_limit / (1024 * 1024), 2)
            
    except Exception as e:
        metrics["error"] = str(e)

    return metrics

if __name__ == "__main__":
    import pprint
    pprint.pprint(get_windows_kernel_metrics())