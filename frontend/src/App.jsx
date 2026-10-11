// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { Menu, Zap, Play } from 'lucide-react';
import Sidebar from './components/Sidebar';
import CircuitAnimation from './components/CircuitAnimation';
import Sparkline from './components/Sparkline';
import circuitBg from './assets/circuit-bg.jpg';

export default function App() {
  const [telemetry, setTelemetry] = useState(null);
  const [currentView, setCurrentView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [benchmarking, setBenchmarking] = useState(false);
  const [benchResults, setBenchResults] = useState(null);

  // 15-tick rolling memory buffer for live sparkline waveforms
  const [history, setHistory] = useState({
    winCtx: [],
    winFault: [],
    linCtx: [],
    linForks: [],
    artHeap: [],
    zram: []
  });

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/telemetry');
        if (res.ok) {
          const data = await res.json();
          setTelemetry(data);

          // Append incoming metrics and cap array at 15 items
          setHistory(prev => ({
            winCtx: [...prev.winCtx, data.windows.metrics.cpu.context_switches].slice(-15),
            winFault: [...prev.winFault, data.windows.metrics.cpu.workload_metric].slice(-15),
            linCtx: [...prev.linCtx, data.linux.metrics.cpu.context_switches].slice(-15),
            linForks: [...prev.linForks, data.linux.metrics.cpu.workload_metric].slice(-15),
            artHeap: [...prev.artHeap, data.android.metrics.memory.dalvik_mb].slice(-15),
            zram: [...prev.zram, data.android.metrics.memory.paging_used_mb].slice(-15),
          }));
        }
      } catch (err) {
        console.error("Telemetry bridge offline", err);
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 1500);
    return () => clearInterval(interval);
  }, []);

  const runBenchmark = async () => {
    setBenchmarking(true);
    setBenchResults(null);
    try {
      const res = await fetch('http://localhost:8000/api/benchmark', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setBenchResults(data.results);
      }
    } catch (err) {
      console.error("Benchmark failed", err);
    } finally {
      setBenchmarking(false);
    }
  };

  const win = telemetry?.windows;
  const lin = telemetry?.linux;
  const andr = telemetry?.android;

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-[#05070a] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
      
      {/* ATMOSPHERIC BACKGROUND LAYER: Golden Circuit Board + Electrical Pulse */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#05070a]">
        <img 
          src={circuitBg} 
          alt="Golden Circuit Architecture" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 contrast-125 brightness-95"
        />

        <CircuitAnimation />

        <div 
          className="absolute inset-0 z-[2]"
          style={{
            background: 'radial-gradient(circle at 50% 45%, rgba(5, 7, 10, 0.40) 0%, rgba(5, 7, 10, 0.90) 85%)'
          }}
        />

        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full z-[2]"
          style={{
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, rgba(0, 0, 0, 0) 70%)',
            filter: 'blur(80px)'
          }}
        />
      </div>

      {/* POP-OUT SIDEBAR DRAWER */}
      <Sidebar 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        telemetry={telemetry} 
      />

      {/* TOP TECHNICAL BAR */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-8 pt-6 pb-4 flex items-center justify-between border-b border-white/[0.08]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open Workspace Navigation"
            className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.1] hover:border-amber-400/50 hover:bg-amber-500/10 text-slate-300 hover:text-amber-400 transition-all shadow-sm flex items-center justify-center group"
          >
            <Menu className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10">
              <Zap className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm tracking-widest font-black uppercase text-white">
                  telemetrix
                </span>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[9px] font-mono text-amber-300 font-semibold border border-amber-500/30">
                  CSP
                </span>
              </div>
              <span className="text-[10px] block font-mono text-slate-500 tracking-wider uppercase mt-0.5">
                KERNEL OBSERVABILITY SYSTEM
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="px-3 py-1 rounded border border-amber-400/30 bg-amber-400/10 text-amber-300 font-semibold uppercase">
            VIEW: {currentView}
          </span>
          <span className="text-slate-400 border border-white/[0.08] bg-black/40 px-3 py-1 rounded-md hidden sm:inline-block">
            REFRESH_RATE: 1.5S
          </span>
        </div>
      </header>

      {/* MAIN VIEWPORT */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-8 py-8 flex-1 flex flex-col justify-center">
        
        {/* VIEW 01: OVERVIEW (3 MONOLITHIC CARDS) */}
        {currentView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* CARD 1: WINDOWS NT */}
            <div 
              onClick={() => setCurrentView('windows')}
              className="relative group cursor-pointer overflow-hidden flex flex-col justify-between rounded-2xl bg-black/45 border border-white/[0.12] p-8 backdrop-blur-md shadow-2xl shadow-black/80 transition-all duration-300 hover:border-amber-400/50 hover:bg-black/60"
            >
              <div className="absolute -top-6 -right-3 text-8xl font-mono font-black text-white/[0.03] select-none pointer-events-none group-hover:text-amber-400/[0.06] transition-colors">
                01
              </div>

              <div className="relative z-10 flex items-start justify-between border-b border-white/[0.06] pb-5">
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-amber-400/80 uppercase font-semibold">01 // SUBSYSTEM</div>
                  <h2 className="text-2xl font-mono font-black tracking-tight text-white mt-0.5">WINDOWS NT</h2>
                </div>
                <span className={`text-[10px] font-mono px-2.5 py-1 rounded border tracking-wider font-semibold ${
                  win?.status === 'NOMINAL'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}>
                  {win?.status || 'POLLING'}
                </span>
              </div>

              <div className="relative z-10 space-y-7 my-6">
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">DISPATCH_RATE</div>
                  <div className="text-4xl font-mono font-black tracking-tight text-white mt-1">
                    {win?.metrics.cpu.context_switches.toLocaleString() || '---'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">Context Switches / sec</div>
                </div>

                <div className="border-t border-white/[0.04] pt-5">
                  <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">MEMORY_FAULT_EVENTS</div>
                  <div className="text-3xl font-mono font-bold text-slate-200 mt-1">
                    {win?.metrics.cpu.workload_metric.toLocaleString() || '---'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">Page Faults / sec</div>
                </div>

                <div className="border-t border-white/[0.04] pt-5">
                  <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">VIRTUAL_COMMIT</div>
                  <div className="text-2xl font-mono font-bold text-slate-300 mt-1">
                    {win ? `${(win.metrics.memory.used_mb / 1024).toFixed(2)} GB` : '---'}
                    <span className="text-xs text-amber-400/80 ml-2 font-mono font-semibold">
                      ({win?.metrics.memory.utilization_pct}% Limit)
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">Pagefile Backed Commit</div>
                </div>
              </div>

              <div className="relative z-10 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>MEM_MODEL: DEMAND PAGING</span>
                <span className="text-amber-400 group-hover:translate-x-1 transition-transform">EXPAND MODULE →</span>
              </div>
            </div>

            {/* CARD 2: POSIX LINUX */}
            <div 
              onClick={() => setCurrentView('linux')}
              className="relative group cursor-pointer overflow-hidden flex flex-col justify-between rounded-2xl bg-black/45 border border-white/[0.12] p-8 backdrop-blur-md shadow-2xl shadow-black/80 transition-all duration-300 hover:border-amber-400/50 hover:bg-black/60"
            >
              <div className="absolute -top-6 -right-3 text-8xl font-mono font-black text-white/[0.03] select-none pointer-events-none group-hover:text-amber-400/[0.06] transition-colors">
                02
              </div>

              <div className="relative z-10 flex items-start justify-between border-b border-white/[0.06] pb-5">
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-amber-400/80 uppercase font-semibold">02 // SUBSYSTEM</div>
                  <h2 className="text-2xl font-mono font-black tracking-tight text-white mt-0.5">POSIX LINUX</h2>
                </div>
                <span className={`text-[10px] font-mono px-2.5 py-1 rounded border tracking-wider font-semibold ${
                  lin?.status === 'NOMINAL'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}>
                  {lin?.status || 'POLLING'}
                </span>
              </div>

              <div className="relative z-10 space-y-7 my-6">
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">CUMULATIVE_DISPATCH</div>
                  <div className="text-4xl font-mono font-black tracking-tight text-white mt-1">
                    {lin?.metrics.cpu.context_switches.toLocaleString() || '---'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">CFS Switches Since Boot</div>
                </div>

                <div className="border-t border-white/[0.04] pt-5">
                  <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">TASK_INSTANTIATIONS</div>
                  <div className="text-3xl font-mono font-bold text-slate-200 mt-1">
                    {lin?.metrics.cpu.workload_metric.toLocaleString() || '---'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">Fork / Clone Syscalls</div>
                </div>

                <div className="border-t border-white/[0.04] pt-5">
                  <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">PHYSICAL_WORKING_SET</div>
                  <div className="text-2xl font-mono font-bold text-slate-300 mt-1">
                    {lin ? `${lin.metrics.memory.used_mb.toFixed(1)} MB` : '---'}
                    <span className="text-xs text-amber-400/80 ml-2 font-mono font-semibold">
                      ({lin?.metrics.memory.utilization_pct}% RAM)
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    Dirty Cache: {(lin?.metrics.memory.dirty_cache_kb / 1024 || 0).toFixed(2)} MB
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>SCHEDULER: CFS</span>
                <span className="text-amber-400 group-hover:translate-x-1 transition-transform">EXPAND MODULE →</span>
              </div>
            </div>

            {/* CARD 3: ANDROID RUNTIME */}
            <div 
              onClick={() => setCurrentView('android')}
              className="relative group cursor-pointer overflow-hidden flex flex-col justify-between rounded-2xl bg-black/45 border border-white/[0.12] p-8 backdrop-blur-md shadow-2xl shadow-black/80 transition-all duration-300 hover:border-amber-400/50 hover:bg-black/60"
            >
              <div className="absolute -top-6 -right-3 text-8xl font-mono font-black text-white/[0.03] select-none pointer-events-none group-hover:text-amber-400/[0.06] transition-colors">
                03
              </div>

              <div className="relative z-10 flex items-start justify-between border-b border-white/[0.06] pb-5">
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-amber-400/80 uppercase font-semibold">03 // SUBSYSTEM</div>
                  <h2 className="text-2xl font-mono font-black tracking-tight text-white mt-0.5">ANDROID RUNTIME</h2>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded border tracking-wider bg-sky-500/10 text-sky-400 border-sky-500/30 font-semibold">
                  {andr?.status || 'STANDBY'}
                </span>
              </div>

              <div className="relative z-10 space-y-7 my-6">
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">MANAGED_GC_HEAP</div>
                  <div className="text-4xl font-mono font-black tracking-tight text-white mt-1">
                    {andr?.metrics.memory.dalvik_mb.toFixed(1) || '---'} <span className="text-xl font-normal text-slate-400">MB</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">Dalvik / ART Managed Heap</div>
                </div>

                <div className="border-t border-white/[0.04] pt-5">
                  <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">UNMANAGED_NATIVE_HEAP</div>
                  <div className="text-3xl font-mono font-bold text-slate-200 mt-1">
                    {andr?.metrics.memory.native_mb.toFixed(1) || '---'} <span className="text-lg font-normal text-slate-400">MB</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">Native C / C++ Allocations</div>
                </div>

                <div className="border-t border-white/[0.04] pt-5">
                  <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">COMPRESSED_PAGE_POOL</div>
                  <div className="text-2xl font-mono font-bold text-slate-300 mt-1">
                    {andr?.metrics.memory.paging_used_mb.toFixed(1) || '---'} <span className="text-base font-normal text-slate-400">MB</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">ZRAM Compression Pool</div>
                </div>
              </div>

              <div className="relative z-10 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>SWAP: ZRAM IN-MEMORY</span>
                <span className="text-amber-400 group-hover:translate-x-1 transition-transform">EXPAND MODULE →</span>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 02: WINDOWS DEEP DIVE WITH ROLLING SPARKLINE CHARTS */}
        {currentView === 'windows' && (
          <div className="rounded-2xl bg-black/60 border border-white/[0.12] p-8 backdrop-blur-md shadow-2xl max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8 pb-5 border-b border-white/[0.08]">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">MODULE 02 // UNIT II & III</span>
                <h2 className="text-2xl font-mono font-black text-white mt-1">
                  Windows NT Virtual Memory & Dispatch Profile
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-1">Real-time NT kernel thread preemption & demand page faults.</p>
              </div>
              <button 
                onClick={() => setCurrentView('overview')}
                className="text-xs font-mono text-slate-400 hover:text-white border border-white/[0.1] px-3.5 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-all"
              >
                ← BACK TO MATRIX
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
              {/* Context Switch Rate with Mini-Chart */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Context Switches / Sec</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">LIVE WAVE</span>
                  </div>
                  <div className="text-3xl font-black text-white mt-2">
                    {win?.metrics.cpu.context_switches.toLocaleString() || '---'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Scheduler preemptions and thread transitions.</div>
                </div>
                <div className="mt-5 pt-3 border-t border-white/[0.04]">
                  <Sparkline data={history.winCtx} color="#f59e0b" height={55} />
                </div>
              </div>

              {/* Page Fault Rate with Mini-Chart */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Page Fault Rate</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">LIVE WAVE</span>
                  </div>
                  <div className="text-3xl font-black text-white mt-2">
                    {win?.metrics.cpu.workload_metric.toLocaleString() || '---'} <span className="text-base font-normal text-slate-400">/s</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Hard and soft page faults resolved by NT Memory Manager.</div>
                </div>
                <div className="mt-5 pt-3 border-t border-white/[0.04]">
                  <Sparkline data={history.winFault} color="#fbbf24" height={55} />
                </div>
              </div>

              {/* Pagefile Limit Commit */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-xs text-slate-500 uppercase tracking-wider">Committed Pagefile Pool</span>
                <div className="text-3xl font-black text-amber-400 mt-2">
                  {(win?.metrics.memory.used_mb / 1024 || 0).toFixed(2)} GB
                  <span className="text-xs text-slate-400 font-normal ml-2">({win?.metrics.memory.utilization_pct}% Limit)</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-2">Demand paging committed working set ratio.</div>
              </div>

              {/* Alert Engine Box (Clean Bullet Formatter) */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-xs text-slate-500 uppercase tracking-wider">Alert Engine Status</span>
                <div className="text-sm font-semibold text-slate-200 mt-2 space-y-1">
                  {win?.alerts && win.alerts.length > 0 ? (
                    win.alerts.map((a, i) => (
                      <div key={i} className="flex items-center gap-2 text-amber-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        <span>{a.message.replace(/\.$/, '')}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-emerald-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      All kernel memory buffers nominal
                    </div>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-3">Dynamic threshold analysis from normalizer telemetry.</div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 03: POSIX LINUX DEEP DIVE WITH ROLLING SPARKLINE CHARTS */}
        {currentView === 'linux' && (
          <div className="rounded-2xl bg-black/60 border border-white/[0.12] p-8 backdrop-blur-md shadow-2xl max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8 pb-5 border-b border-white/[0.08]">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">MODULE 03 // UNIT III & IV</span>
                <h2 className="text-2xl font-mono font-black text-white mt-1">
                  POSIX Linux CFS & Buffer Cache Profiling
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-1">Direct inspection of /proc/stat CPU jiffies & /proc/meminfo.</p>
              </div>
              <button 
                onClick={() => setCurrentView('overview')}
                className="text-xs font-mono text-slate-400 hover:text-white border border-white/[0.1] px-3.5 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-all"
              >
                ← BACK TO MATRIX
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
              {/* CFS Context Switches Mini-Chart */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">CFS Context Switches</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">LIVE WAVE</span>
                  </div>
                  <div className="text-3xl font-black text-white mt-2">
                    {lin?.metrics.cpu.context_switches.toLocaleString() || '---'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Cumulative red-black tree dispatch count from /proc/stat.</div>
                </div>
                <div className="mt-5 pt-3 border-t border-white/[0.04]">
                  <Sparkline data={history.linCtx} color="#10b981" height={55} />
                </div>
              </div>

              {/* Task Forks Mini-Chart */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Task Fork Syscalls</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">LIVE WAVE</span>
                  </div>
                  <div className="text-3xl font-black text-white mt-2">
                    {lin?.metrics.cpu.workload_metric.toLocaleString() || '---'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Total fork() and clone() process invocations since boot.</div>
                </div>
                <div className="mt-5 pt-3 border-t border-white/[0.04]">
                  <Sparkline data={history.linForks} color="#34d399" height={55} />
                </div>
              </div>

              {/* Dirty Page Buffer Cache */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-xs text-slate-500 uppercase tracking-wider">Dirty Page Buffer Cache</span>
                <div className="text-3xl font-black text-amber-400 mt-2">
                  {(lin?.metrics.memory.dirty_cache_kb / 1024 || 0).toFixed(2)} MB
                </div>
                <div className="text-[11px] text-slate-500 mt-2">Unwritten disk blocks in physical memory awaiting pdflush sync.</div>
              </div>

              {/* Active Physical Memory */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-xs text-slate-500 uppercase tracking-wider">Active Physical RAM</span>
                <div className="text-3xl font-black text-slate-200 mt-2">
                  {(lin?.metrics.memory.used_mb || 0).toFixed(1)} MB
                  <span className="text-xs text-slate-400 font-normal ml-2">({lin?.metrics.memory.utilization_pct}%)</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-2">Active working set allocation in WSL2 Linux subsystem.</div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 04: ANDROID DEEP DIVE WITH ROLLING SPARKLINE CHARTS */}
        {currentView === 'android' && (
          <div className="rounded-2xl bg-black/60 border border-white/[0.12] p-8 backdrop-blur-md shadow-2xl max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8 pb-5 border-b border-white/[0.08]">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">MODULE 04 // UNIT V</span>
                <h2 className="text-2xl font-mono font-black text-white mt-1">
                  Android ART Managed Heap & ZRAM Compressed Swap
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-1">dumpsys meminfo mobile architecture: ART vs Native vs ZRAM.</p>
              </div>
              <button 
                onClick={() => setCurrentView('overview')}
                className="text-xs font-mono text-slate-400 hover:text-white border border-white/[0.1] px-3.5 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-all"
              >
                ← BACK TO MATRIX
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
              {/* Dalvik ART Heap Mini-Chart */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Dalvik / ART Managed Heap</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">LIVE WAVE</span>
                  </div>
                  <div className="text-3xl font-black text-white mt-2">
                    {andr?.metrics.memory.dalvik_mb.toFixed(1) || '---'} <span className="text-base font-normal text-slate-400">MB</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Garbage collected runtime heap monitored via ADB.</div>
                </div>
                <div className="mt-5 pt-3 border-t border-white/[0.04]">
                  <Sparkline data={history.artHeap} color="#38bdf8" height={55} />
                </div>
              </div>

              {/* ZRAM Compressed RAM Mini-Chart */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">ZRAM Compressed RAM</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">LIVE WAVE</span>
                  </div>
                  <div className="text-3xl font-black text-sky-400 mt-2">
                    {andr?.metrics.memory.paging_used_mb.toFixed(1) || '---'} <span className="text-base font-normal text-slate-400">MB</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">In-memory compressed swap before Low Memory Killer (LMK).</div>
                </div>
                <div className="mt-5 pt-3 border-t border-white/[0.04]">
                  <Sparkline data={history.zram} color="#0284c7" height={55} />
                </div>
              </div>

              {/* Native Heap Allocation */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-xs text-slate-500 uppercase tracking-wider">Native C++ Heap Allocation</span>
                <div className="text-3xl font-black text-slate-200 mt-2">
                  {andr?.metrics.memory.native_mb.toFixed(1) || '---'} MB
                </div>
                <div className="text-[11px] text-slate-500 mt-2">Unmanaged allocations executed by C/C++ libraries and NDK.</div>
              </div>

              {/* ADB Connection Status */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-xs text-slate-500 uppercase tracking-wider">ADB Hardware Bridge</span>
                <div className="text-xl font-bold text-slate-200 mt-2">
                  {andr?.metrics.connected ? 'Physical Device Connected' : 'Simulated / Standby Profiler'}
                </div>
                <div className="text-[11px] text-slate-500 mt-2">Direct shell socket communication with Android OS kernel.</div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 05: BENCHMARKS */}
        {currentView === 'benchmarks' && (
          <div className="rounded-2xl bg-black/60 border border-white/[0.12] p-8 backdrop-blur-md max-w-4xl mx-auto w-full shadow-2xl shadow-black/80">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/[0.06]">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">MODULE 05 // BENCHMARK</span>
                <h2 className="text-2xl font-mono font-black text-white mt-1">
                  CROSS-KERNEL WORKLOAD DISPATCH
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-2 leading-relaxed">
                  Dispatches identical CPU compute iterations and physical memory allocation loops across Windows NT and WSL Linux POSIX schedulers.
                </p>
              </div>
              <button
                onClick={runBenchmark}
                disabled={benchmarking}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-400 text-black font-mono text-xs font-bold hover:bg-amber-300 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {benchmarking ? 'EXECUTING...' : 'DISPATCH WORKLOAD'}
              </button>
            </div>

            {benchResults ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benchResults.map((res, i) => (
                  <div key={i} className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest mb-4">
                      {res.platform}
                    </div>
                    <div className="space-y-4 font-mono">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 text-xs">CPU Compute Latency:</span>
                        <span className="text-white font-bold">{res.cpu_time_sec}s</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 text-xs">Memory Page Allocation:</span>
                        <span className="text-white font-bold">{res.mem_time_sec}s</span>
                      </div>
                      <div className="flex justify-between items-center text-sm pt-3 border-t border-white/[0.06]">
                        <span className="text-slate-300 text-xs font-semibold">Total Execution Latency:</span>
                        <span className="text-amber-400 font-black text-base">{res.total_latency_sec}s</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500 font-mono text-xs tracking-wider">
                {benchmarking ? 'Measuring kernel execution times across schedulers...' : 'SYSTEM READY. CLICK "DISPATCH WORKLOAD" TO BEGIN.'}
              </div>
            )}
          </div>
        )}

      </main>

      {/* FOOTER STATUS BAR */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-8 py-5 flex items-center justify-between border-t border-white/[0.08] font-mono text-[11px] text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            PIPELINE ACTIVE
          </span>
          <span>HOST: WINDOWS NT</span>
          <span>POSIX: WSL2</span>
        </div>
        <div className="flex items-center gap-4">
          <span>POLL_RATE: 1500MS</span>
          <span className="text-slate-400 font-medium">PASSIVE TELEMETRY MODE</span>
        </div>
      </footer>

    </div>
  );
}