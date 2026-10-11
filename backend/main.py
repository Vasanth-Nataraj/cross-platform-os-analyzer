# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Ensure modules can import from parent directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from collectors.windows_collector import get_windows_kernel_metrics
from collectors.linux_collector import get_linux_kernel_metrics
from collectors.android_collector import AndroidCollector
from core.normalizer import TelemetryNormalizer
from core.alerts import KernelAlertEngine
from benchmarks.engine import run_full_comparative_benchmark

app = FastAPI(title="Cross-Kernel Telemetry API", version="1.0")

# Enable CORS so the React frontend on localhost can fetch data smoothly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

android_collector = AndroidCollector()

@app.get("/api/telemetry")
def get_telemetry():
    # 1. Query live kernel sources
    raw_win = get_windows_kernel_metrics()
    raw_lin = get_linux_kernel_metrics()
    raw_and = android_collector.get_metrics()

    # 2. Normalize to unified schema
    norm_win = TelemetryNormalizer.normalize_windows(raw_win)
    norm_lin = TelemetryNormalizer.normalize_linux(raw_lin)
    norm_and = TelemetryNormalizer.normalize_android(raw_and)

    # 3. Evaluate health & alerts
    win_alerts = KernelAlertEngine.evaluate_windows(norm_win)
    lin_alerts = KernelAlertEngine.evaluate_linux(norm_lin)
    and_alerts = KernelAlertEngine.evaluate_android(norm_and)

    return {
        "timestamp": norm_win["timestamp"],
        "windows": {
            "metrics": norm_win,
            "alerts": win_alerts,
            "status": "NOMINAL" if not any(a["level"] == "error" for a in win_alerts) else "PRESSURE"
        },
        "linux": {
            "metrics": norm_lin,
            "alerts": lin_alerts,
            "status": "NOMINAL" if not any(a["level"] == "error" for a in lin_alerts) else "PRESSURE"
        },
        "android": {
            "metrics": norm_and,
            "alerts": and_alerts,
            "status": "ONLINE" if norm_and.get("connected") else "STANDBY"
        }
    }

@app.post("/api/benchmark")
def run_benchmark():
    # Executes the comparative workloads across Windows NT and WSL Linux
    results = run_full_comparative_benchmark()
    return {"status": "success", "results": results}