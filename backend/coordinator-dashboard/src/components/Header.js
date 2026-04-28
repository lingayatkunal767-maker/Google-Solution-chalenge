import React from 'react';

export default function Header({ user }) {
  return (
    <header className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 shadow-sm fixed top-0 right-0 left-0 md:left-64 z-40 flex justify-between items-center px-6 h-16">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold tracking-tighter text-slate-50 uppercase hidden sm:block">Command Center</h2>
        <div className="text-on-surface-variant font-body-sm text-body-sm border-l border-outline-variant pl-4 hidden sm:block">October 24, 2023</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-64 hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input className="w-full bg-surface-container-high border border-outline-variant rounded-full py-1.5 pl-10 pr-4 text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-on-surface-variant transition-colors" placeholder="Search operations..." type="text" />
        </div>
        <div className="flex items-center gap-2 border-r border-outline-variant pr-4">
          <button className="p-2 rounded-full text-slate-400 font-medium hover:bg-slate-800/50 hover:text-white transition-colors cursor-pointer active:scale-95 duration-200">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
          </button>
          <button className="p-2 rounded-full text-slate-400 font-medium hover:bg-slate-800/50 hover:text-white transition-colors cursor-pointer active:scale-95 duration-200">
            <span className="material-symbols-outlined text-[22px]">help</span>
          </button>
          <button className="p-2 rounded-full text-slate-400 font-medium hover:bg-slate-800/50 hover:text-white transition-colors cursor-pointer active:scale-95 duration-200">
            <span className="material-symbols-outlined text-[22px]">settings</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="font-body-md text-body-md text-on-surface">{user?.displayName || 'Admin'}</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">{user?.role || 'System'}</p>
          </div>
          <div className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center bg-slate-800 text-white font-bold">
            {user?.displayName?.slice(0, 2).toUpperCase() || 'AD'}
          </div>
        </div>
      </div>
    </header>
  );
}
