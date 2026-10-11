// frontend/src/components/Sidebar.jsx
import React from 'react';
import { 
  Layers, 
  Terminal, 
  Cpu, 
  Smartphone, 
  Zap, 
  Gauge, 
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen, currentView, setCurrentView, telemetry }) {
  const navItems = [
    {
      id: 'overview',
      label: '01 Overview',
      subtitle: 'Cross-Kernel Matrix',
      icon: Layers,
      unitBadge: 'UNIT I',
      status: 'ONLINE'
    },
    {
      id: 'windows',
      label: '02 Windows NT',
      subtitle: 'Virtual Memory & Faults',
      icon: Terminal,
      unitBadge: 'UNIT II/III',
      status: telemetry?.windows?.status || 'POLL'
    },
    {
      id: 'linux',
      label: '03 POSIX Linux',
      subtitle: 'CFS & Buffer Cache',
      icon: Cpu,
      unitBadge: 'UNIT III/IV',
      status: telemetry?.linux?.status || 'POLL'
    },
    {
      id: 'android',
      label: '04 Android OS',
      subtitle: 'ART & ZRAM Paging',
      icon: Smartphone,
      unitBadge: 'UNIT V',
      status: telemetry?.android?.status || 'STANDBY'
    },
    {
      id: 'benchmarks',
      label: '05 Benchmark',
      subtitle: 'Synthetic Workload Lab',
      icon: Gauge,
      unitBadge: 'BENCH',
      status: 'READY'
    }
  ];

  return (
    <>
      {/* Dimmed backdrop when drawer is open */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Slide-out Sidebar Drawer */}
      <aside 
        className={`fixed top-0 left-0 h-full w-80 bg-[#06080d]/95 border-r border-white/[0.08] backdrop-blur-2xl flex flex-col justify-between z-40 transition-transform duration-300 ease-in-out shadow-2xl shadow-black/90 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header & Close Button */}
          <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10">
                <Zap className="w-4 h-4 fill-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm tracking-widest font-black uppercase text-white">
                    telemetry/x
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[9px] font-mono text-amber-300 font-semibold border border-amber-500/30">
                    CSP
                  </span>
                </div>
                <span className="text-[10px] block font-mono text-slate-500 tracking-wider uppercase mt-0.5">
                  Kernel Observer Engine
                </span>
              </div>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
              title="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section Heading */}
          <div className="px-6 pt-6 pb-2">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-semibold">
              TELEMETRY WORKSPACE
            </span>
          </div>

          {/* Nav Items */}
          <nav className="px-3 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between group border ${
                    isActive
                      ? 'bg-amber-500/15 border-amber-500/40 text-white shadow-lg shadow-amber-500/5'
                      : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <div className="truncate">
                      <div className="text-xs font-mono font-bold tracking-wider leading-none">
                        {item.label}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 tracking-tight mt-1 truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[8px] font-mono px-1.5 py-0.5 rounded border tracking-wider ${
                      isActive
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/30 font-semibold'
                        : 'bg-white/[0.02] text-slate-500 border-white/[0.05]'
                    }`}
                  >
                    {item.unitBadge}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Diagnostics in Drawer */}
        <div className="p-4 m-3 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
          <div className="flex items-center justify-between text-[10px] font-mono mb-2">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              ENGINE STATUS
            </span>
            <span className="text-emerald-400 font-semibold">SYNCHRONIZED</span>
          </div>
          <div className="space-y-1 text-[9px] font-mono text-slate-500 border-t border-white/[0.04] pt-2">
            <div className="flex justify-between">
              <span>DISPATCH INTERFACE:</span>
              <span className="text-slate-400">WIN32 / WSL2 / ADB</span>
            </div>
            <div className="flex justify-between">
              <span>FASTAPI BRIDGE:</span>
              <span className="text-slate-400">PORT 8000</span>
            </div>
            <div className="flex justify-between">
              <span>POLLING TICK:</span>
              <span className="text-amber-400/90 font-semibold">1500 MS</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}