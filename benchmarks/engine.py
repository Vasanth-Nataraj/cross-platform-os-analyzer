# benchmarks/engine.py
import time
import subprocess
import platform
import os

BENCHMARK_PAYLOAD = """
import time

# Workload: Matrix multiplication to stress CPU scheduler
def cpu_workload(n=350):
    A = [[1.0 for _ in range(n)] for _ in range(n)]
    B = [[2.0 for _ in range(n)] for _ in range(n)]
    C = [[0.0 for _ in range(n)] for _ in range(n)]
    for i in range(n):
        for j in range(n):
            for k in range(n):
                C[i][j] += A[i][k] * B[k][j]

# Workload: Memory page allocation and dirtying
def mem_workload(blocks=50, block_size_mb=2):
    pages = []
    for _ in range(blocks):
        pages.append(bytearray(block_size_mb * 1024 * 1024))
    del pages

start = time.time()
cpu_workload()
cpu_time = round(time.time() - start, 3)

start = time.time()
mem_workload()
mem_time = round(time.time() - start, 3)

print(f"{cpu_time},{mem_time}")
"""

def run_windows_benchmark() -> dict:
    start_wall = time.time()
    try:
        res = subprocess.run(
            ["python", "-c", BENCHMARK_PAYLOAD],
            capture_output=True,
            text=True,
            check=True
        )
        cpu_t, mem_t = res.stdout.strip().split(",")
        return {
            "platform": "Windows NT",
            "cpu_time_sec": float(cpu_t),
            "mem_time_sec": float(mem_t),
            "total_latency_sec": round(time.time() - start_wall, 3),
            "status": "Success"
        }
    except Exception as e:
        return {"platform": "Windows NT", "status": f"Error: {e}"}

def run_linux_wsl_benchmark() -> dict:
    start_wall = time.time()
    try:
        # Run identical python payload inside WSL Linux kernel
        res = subprocess.run(
            ["wsl", "python3", "-c", BENCHMARK_PAYLOAD],
            capture_output=True,
            text=True,
            check=True
        )
        cpu_t, mem_t = res.stdout.strip().split(",")
        return {
            "platform": "Linux (POSIX / WSL)",
            "cpu_time_sec": float(cpu_t),
            "mem_time_sec": float(mem_t),
            "total_latency_sec": round(time.time() - start_wall, 3),
            "status": "Success"
        }
    except Exception as e:
        return {"platform": "Linux (POSIX / WSL)", "status": f"Error: {e}"}

def run_full_comparative_benchmark() -> list:
    print("Executing benchmark across Windows NT and POSIX Linux...")
    win_res = run_windows_benchmark()
    lin_res = run_linux_wsl_benchmark()
    return [win_res, lin_res]

if __name__ == "__main__":
    import pprint
    pprint.pprint(run_full_comparative_benchmark())