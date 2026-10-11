# TELEMETRIX // Cross-Kernel Observability Engine

A real-time operating systems profiling engine and telemetry dashboard engineered to monitor, analyze, and benchmark low-level kernel abstractions across **Windows NT**, **POSIX Linux (WSL2)**, and **Android Runtime (ART/ZRAM)**.

---

## 1. System Requirements & Prerequisites

* **Host Operating System:** Windows 10 (Build 19041+) or Windows 11 (x86_64)
* **Subsystem Bridge:** Windows Subsystem for Linux (WSL2) with any POSIX distribution (Ubuntu / Debian recommended)
* **Backend Runtime:** Python 3.10+ (64-bit)
* **Frontend Runtime:** Node.js 18+ & npm
* **Optional Mobile Bridge:** Android Debug Bridge (`adb`) added to system `PATH` with USB debugging enabled on a connected physical device or emulator.

---

## 2. Architectural Overview
```text
+---------------------------------------------------------------------------------+
|                                FRONTEND VIEWPORT                                |
|             (Vite + React 18 + Tailwind CSS + HTML5 Canvas Pulse Engine)        |
+---------------------------------------------------------------------------------+
▲
│ HTTP / JSON Polling (1500ms)
▼
+---------------------------------------------------------------------------------+
|                           FASTAPI OBSERVABILITY BRIDGE                          |
|                       (Uvicorn ASGI Server on Port 8000)                        |
+---------------------------------------------------------------------------------+
│                                  │                             │
▼                                  ▼                             ▼
+--------------------+            +--------------------+         +--------------------+
|   WINDOWS NT CORE  |            |   POSIX LINUX /    |         |  ANDROID RUNTIME   |
|     SUBSYSTEM      |            |     WSL2 BRIDGE    |         |    (ART / ZRAM)    |
+--------------------+            +--------------------+         +--------------------+
| * pywin32 / WMI    |            | * /proc/stat       |         | * adb shell        |
| * Win32 Pagefile   |            | * /proc/meminfo    |         | * dumpsys meminfo  |
| * Demand Paging    |            | * CFS Red-Black    |         | * Dalvik GC Heap   |
| * Context Switch   |            |   Tree Switches    |         | * Native C++ Heap  |
|   Preemption       |            | * Dirty Page Cache |         | * In-Memory ZRAM   |
+--------------------+            +--------------------+         +--------------------+
```

---

## 3. Syllabus & Academic Mapping

* **Unit I (OS Services & Kernel Architectures):** Dual-mode execution, Win32 API abstraction layer, and POSIX system call dispatching.
* **Unit II (Processes & CPU Scheduling):** Preemptive context-switch rate tracking, CFS virtual runtime ($vruntime$) dynamics, and thread scheduling queue monitoring.
* **Unit III (Memory Management & Virtual Memory):** Demand paging fault frequency, working set trimming, committed pagefile limits, and Linux dirty write-back buffer cache.
* **Unit IV (Storage & File Systems):** Linux Virtual File System (VFS) buffer metrics and asynchronous flush queues.
* **Unit V (Mobile & Embedded OS Case Studies):** Android Runtime (ART) managed memory garbage collection cycles, native NDK heap consumption, and ZRAM swap compression.

---

## 4. API Specification

### `GET /api/telemetry`
Returns instantaneous snapshot telemetry across all three operating system kernels.

**Response Structure (`200 OK`):**
```json
{
  "windows": {
    "status": "NOMINAL",
    "metrics": {
      "cpu": {
        "context_switches": 18135,
        "workload_metric": 35702
      },
      "memory": {
        "used_mb": 19312.64,
        "utilization_pct": 91.68
      }
    },
    "alerts": [
      {
        "level": "INFO",
        "message": "Committed memory at 91.68% of total limit"
      }
    ]
  },
  "linux": {
    "status": "NOMINAL",
    "metrics": {
      "cpu": {
        "context_switches": 3050688,
        "workload_metric": 23513
      },
      "memory": {
        "used_mb": 421.3,
        "utilization_pct": 11.98,
        "dirty_cache_kb": 286.72
      }
    },
    "alerts": []
  },
  "android": {
    "status": "STANDBY",
    "metrics": {
      "connected": false,
      "memory": {
        "dalvik_mb": 47.5,
        "native_mb": 59.9,
        "paging_used_mb": 179.8
      }
    },
    "alerts": []
  }
}
```

### `POST /api/benchmark`
Dispatches synchronized synthetic CPU compute iteration loops and physical memory allocation dirtying sequences to measure execution latency under bare-metal Windows NT versus virtualized WSL2 POSIX.

**Response Structure (`200 OK`):**

```json
{
  "status": "COMPLETED",
  "results": [
    {
      "platform": "Windows NT",
      "cpu_time_sec": 7.049,
      "mem_time_sec": 0.095,
      "total_latency_sec": 7.490
    },
    {
      "platform": "Linux (POSIX / WSL)",
      "cpu_time_sec": 3.906,
      "mem_time_sec": 0.511,
      "total_latency_sec": 4.807
    }
  ]
}
```

## 5. Local Setup & Execution Guide
# Step 1: Clone the Repository
```bash
git clone [https://github.com/](https://github.com/)<your-username>/OS_CSP.git
cd OS_CSP
```
# Step 2: Initialize & Launch the Python Telemetry Bridge
Open PowerShell with regular or administrative privileges:

# Create a virtual environment (optional but recommended)
```bash
python -m venv venv
.\venv\Scripts\Activate.ps1
```

# Install kernel-collector dependencies
```bash
pip install -r requirements.txt
```

# Start the FastAPI telemetry server
```bash
python -m uvicorn backend.main:app --reload --port 8000
```
The backend API will be live at http://localhost:8000 (docs available at /docs).

# Step 3: Launch the React Observability Frontend
Open a second terminal window:
```bash
cd frontend
```
# Install UI and icon dependencies
```bash
npm install
```
# Start Vite hot-reloading development server
```bash
npm run dev
```
Access the interface at http://localhost:5173.

## 6. Project Directory Hierarchy
```text
OS_CSP/
├── backend/
│   ├── main.py                  # FastAPI routing & CORS configuration
│   ├── core/
│   │   ├── alerts.py            # Real-time threshold evaluation rules
│   │   └── benchmark.py         # Cross-kernel matrix compute & memory dirtying
│   └── collectors/
│       ├── windows_collector.py # Win32 / WMI perf counter dispatch
│       ├── linux_collector.py   # WSL2 /proc/stat & /proc/meminfo parser
│       └── android_collector.py # ADB shell dumpsys meminfo inspector
├── frontend/
│   ├── public/
│   │   └── circuit-bg.jpg       # Golden motherboard PCB texture
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── CircuitAnimation.jsx  # HTML5 Canvas electric current engine
│   │   │   ├── Sidebar.jsx           # Pop-out workspace navigation drawer
│   │   │   └── Sparkline.jsx         # SVG rolling historical metric waveform
│   │   ├── App.jsx              # Main telemetry viewport & kernel views
│   │   ├── index.css            # Tailwind CSS directives
│   │   └── main.jsx             # React DOM root entry point
│   ├── package.json
│   └── vite.config.js
├── requirements.txt             # Locked Python runtime dependencies
└── README.md                    # Project documentation & execution reference
```