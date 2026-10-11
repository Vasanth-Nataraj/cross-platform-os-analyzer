import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import time
import sys
import os

# Ensure modules can import from the project root directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from collectors.windows_collector import get_windows_kernel_metrics
from collectors.linux_collector import get_linux_kernel_metrics
from collectors.android_collector import AndroidCollector
from core.normalizer import TelemetryNormalizer
from core.alerts import KernelAlertEngine
from benchmarks.engine import run_full_comparative_benchmark

st.set_page_config(
    page_title="Cross-Platform OS Telemetry Engine",
    page_icon="⚡",
    layout="wide"
)

st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

    /* Global Typography & Background */
    html, body, [class*="css"] {
        font-family: 'Inter', -apple-system, sans-serif;
    }
    
    .stApp {
        background-color: #0b0f19;
        color: #f1f5f9;
    }

    /* Target headers */
    h1, h2, h3, h4 {
        font-family: 'Inter', sans-serif !important;
        font-weight: 700 !important;
        letter-spacing: -0.02em;
    }

    /* Metric Cards - Sleek Glassmorphism */
    div[data-testid="stMetric"] {
        background: rgba(17, 24, 39, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 16px 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
        backdrop-filter: blur(8px);
    }
    
    div[data-testid="stMetricValue"] > div {
        font-family: 'JetBrains Mono', monospace !important;
        font-size: 1.85rem !important;
        font-weight: 600 !important;
        color: #38bdf8 !important;
    }

    div[data-testid="stMetricLabel"] > div {
        font-size: 0.82rem !important;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #94a3b8 !important;
    }

    /* Modern Alert Badges */
    div[data-testid="stAlert"] {
        border-radius: 10px;
        border: none;
        font-size: 0.88rem;
        background-color: rgba(15, 23, 42, 0.8) !important;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }

    /* Custom borders for alert levels */
    div[data-testid="stAlert"]:has(div:contains("Alert")),
    div[data-testid="stAlert"]:has(div:contains("Severe")) {
        border-left: 4px solid #ef4444 !important;
    }

    /* Buttons */
    .stButton>button {
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        font-weight: 600;
        padding: 8px 24px;
        transition: all 0.2s ease-in-out;
    }

    .stButton>button:hover {
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        box-shadow: 0 0 15px rgba(37, 99, 235, 0.4);
        transform: translateY(-1px);
    }

    /* Clean Tabs */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
        background-color: transparent;
    }

    .stTabs [data-baseweb="tab"] {
        border-radius: 8px;
        padding: 8px 16px;
        color: #94a3b8;
        background-color: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .stTabs [aria-selected="true"] {
        background-color: rgba(30, 41, 59, 0.9) !important;
        color: #38bdf8 !important;
        border: 1px solid rgba(56, 189, 248, 0.3) !important;
    }

    /* Hide default Streamlit decoration header */
    header[data-testid="stHeader"] {
        background: transparent;
    }
</style>
""", unsafe_allow_html=True)
st.title("⚡ Cross-Platform Kernel Telemetry & Performance Analyzer")
st.caption("Unified Systems Telemetry & Cross-Kernel Performance Profiling Engine (Windows NT vs POSIX Linux vs Android Runtime)")

# ----------------- TABS NAVIGATION -----------------
tab_monitor, tab_benchmark = st.tabs(["📊 Live Kernel Telemetry", "🚀 Cross-Kernel Benchmarking"])

# ==============================================================================
# TAB 1: LIVE KERNEL TELEMETRY
# ==============================================================================
with tab_monitor:
    st.subheader("Live Telemetry & Kernel Pressure Monitor")
    
    # 1. Pipeline Extraction
    raw_win = get_windows_kernel_metrics()
    raw_lin = get_linux_kernel_metrics()
    android_col = AndroidCollector()
    raw_and = android_col.get_metrics()

    # 2. Schema Normalization
    norm_win = TelemetryNormalizer.normalize_windows(raw_win)
    norm_lin = TelemetryNormalizer.normalize_linux(raw_lin)
    norm_and = TelemetryNormalizer.normalize_android(raw_and)

    # 3. Alert & Bottleneck Detection Evaluation
    win_alerts = KernelAlertEngine.evaluate_windows(norm_win)
    lin_alerts = KernelAlertEngine.evaluate_linux(norm_lin)
    and_alerts = KernelAlertEngine.evaluate_android(norm_and)

    # 4. Display Subsystem Health Alerts
    st.markdown("#### Subsystem Health & Threshold Warnings")
    alert_cols = st.columns(3)

    def render_alerts(col, alerts):
        with col:
            for a in alerts:
                if a["level"] == "error":
                    st.error(f"**{a['title']}**: {a['message']}")
                elif a["level"] == "warning":
                    st.warning(f"**{a['title']}**: {a['message']}")
                elif a["level"] == "info":
                    st.info(f"**{a['title']}**: {a['message']}")
                else:
                    st.success(f"**{a['title']}**: {a['message']}")

    render_alerts(alert_cols[0], win_alerts)
    render_alerts(alert_cols[1], lin_alerts)
    render_alerts(alert_cols[2], and_alerts)

    st.divider()

    # 5. Side-by-Side Unified Metric Cards
    col_w, col_l, col_a = st.columns(3)

    with col_w:
        st.markdown("### 🪟 Windows NT")
        st.metric(
            label=norm_win["cpu"]["metric_type"],
            value=f"{norm_win['cpu']['context_switches']:,}"
        )
        st.metric(
            label=norm_win["cpu"]["workload_type"],
            value=f"{norm_win['cpu']['workload_metric']:,}"
        )
        st.metric(
            label="Committed Memory",
            value=f"{norm_win['memory']['used_mb']:.1f} MB",
            delta=f"{norm_win['memory']['utilization_pct']}% of limit"
        )
        st.caption(f"Paging Scheme: {norm_win['memory']['paging_type']}")

    with col_l:
        st.markdown("### 🐧 Linux (POSIX / WSL)")
        st.metric(
            label=norm_lin["cpu"]["metric_type"],
            value=f"{norm_lin['cpu']['context_switches']:,}"
        )
        st.metric(
            label=norm_lin["cpu"]["workload_type"],
            value=f"{norm_lin['cpu']['workload_metric']:,}"
        )
        st.metric(
            label="Active Used Memory",
            value=f"{norm_lin['memory']['used_mb']:.1f} MB",
            delta=f"{norm_lin['memory']['utilization_pct']}% of total"
        )
        st.caption(f"Buffer Cache: {norm_lin['memory']['dirty_cache_kb'] / 1024:.2f} MB Dirty Pages")

    with col_a:
        st.markdown(f"### 📱 {norm_and['os_name']}")
        st.metric(
            label="Dalvik / ART Heap",
            value=f"{norm_and['memory']['dalvik_mb']:.1f} MB"
        )
        st.metric(
            label="Native C/C++ Heap",
            value=f"{norm_and['memory']['native_mb']:.1f} MB"
        )
        st.metric(
            label="ZRAM Compressed Swap",
            value=f"{norm_and['memory']['paging_used_mb']:.1f} MB"
        )
        st.caption(f"Connection Status: {'Online (ADB)' if norm_and.get('connected') else 'Virtual Profile'}")

    st.divider()

    # 6. Comparative Memory Allocation Chart
    st.subheader("Memory Allocation & Footprint Comparison")
    mem_chart_df = pd.DataFrame({
        "Operating System Subsystem": [
            "Windows Committed Backing",
            "Linux Active Working Set",
            "Android Combined Heap"
        ],
        "Allocated Memory (MB)": [
            norm_win["memory"]["used_mb"],
            norm_lin["memory"]["used_mb"],
            norm_and["memory"]["used_mb"]
        ]
    })

    fig_mem = go.Figure(data=[
        go.Bar(
            x=mem_chart_df["Operating System Subsystem"],
            y=mem_chart_df["Allocated Memory (MB)"],
            text=mem_chart_df["Allocated Memory (MB)"],
            textposition="auto",
            marker_color=["#0078D7", "#E95420", "#3DDC84"]
        )
    ])
    fig_mem.update_layout(
        height=360,
        margin=dict(l=20, r=20, t=30, b=20),
        yaxis_title="Megabytes (MB)"
    )
    st.plotly_chart(fig_mem, use_container_width=True)

# ==============================================================================
# TAB 2: CROSS-KERNEL BENCHMARKING (MODULE 4)
# ==============================================================================
with tab_benchmark:
    st.subheader("Synthetic Workload Execution Profiler")
    st.markdown(
        "Runs an identical mathematical compute payload (matrix multiplication) "
        "and physical memory page dirtying workload concurrently across the "
        "Windows NT and Linux POSIX (WSL) schedulers to evaluate runtime latency."
    )

    if st.button("▶ Run Live Cross-Kernel Benchmark", type="primary"):
        with st.spinner("Executing workloads across OS environments..."):
            bench_results = run_full_comparative_benchmark()
            valid_results = [r for r in bench_results if r.get("status") == "Success"]

            if valid_results:
                df_bench = pd.DataFrame(valid_results)
                
                # Metrics Table
                st.markdown("#### Benchmark Execution Timers")
                st.dataframe(
                    df_bench[[
                        "platform",
                        "cpu_time_sec",
                        "mem_time_sec",
                        "total_latency_sec"
                    ]].rename(columns={
                        "platform": "Operating System",
                        "cpu_time_sec": "CPU Compute Latency (s)",
                        "mem_time_sec": "Memory Alloc Latency (s)",
                        "total_latency_sec": "Total Wall Clock (s)"
                    }),
                    use_container_width=True
                )

                # Visual Latency Comparison Chart
                fig_bench = go.Figure(data=[
                    go.Bar(
                        name="CPU Compute Latency (s)",
                        x=df_bench["platform"],
                        y=df_bench["cpu_time_sec"],
                        marker_color="#26A69A"
                    ),
                    go.Bar(
                        name="Memory Page Dirtying Latency (s)",
                        x=df_bench["platform"],
                        y=df_bench["mem_time_sec"],
                        marker_color="#AB47BC"
                    )
                ])
                fig_bench.update_layout(
                    barmode="group",
                    title="Comparative Execution Time (Lower is Better)",
                    yaxis_title="Duration in Seconds",
                    height=380
                )
                st.plotly_chart(fig_bench, use_container_width=True)

                # Technical Deduction Notes for Panel
                st.info(
                    "**Scheduler Observation:** Linux (WSL) CFS handles pure mathematical iterations "
                    "with lower user-space scheduling overhead compared to Windows NT, while Windows "
                    "avoids the virtualization boundary overhead observed in total wall time."
                )
            else:
                st.error("Failed to execute workload across one or more operating systems.")