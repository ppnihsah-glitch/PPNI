import React from 'react';
import { ActiveRole } from '../types';
import { Users, Award, ShieldCheck, FileText, RefreshCw, Smartphone, ExternalLink } from 'lucide-react';

interface HeaderProps {
  activeRole: ActiveRole;
  setActiveRole: (role: ActiveRole) => void;
  onResetData: () => void;
  isTabletFrame: boolean;
  setIsTabletFrame: (val: boolean) => void;
  attendedCount: number;
  totalParticipants: number;
  totalScoresCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeRole,
  setActiveRole,
  onResetData,
  isTabletFrame,
  setIsTabletFrame,
  attendedCount,
  totalParticipants,
  totalScoresCount,
}) => {
  const getRoleUrl = (role: ActiveRole) => {
    switch (role) {
      case 'parent':
        return 'https://sites.google.com/view/mewarna-hsah-2026/kehadiran-peserta';
      case 'jury':
        return 'https://sites.google.com/view/mewarna-hsah-2026/portal-hakim-penilaian';
      case 'admin':
        return 'https://sites.google.com/view/mewarna-hsah-2026/urus-setia-pentadbir';
      case 'specification':
        return 'https://sites.google.com/view/mewarna-hsah-2026/spesifikasi-teknikal';
    }
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            HSAH 2026
          </span>
          <span className="font-medium text-slate-200">
            Unit Terapi Carakerja | Hospital Sultan Abdul Halim, Sungai Petani
          </span>
          <span className="hidden md:inline text-slate-500">•</span>
          <span className="hidden md:inline text-slate-400">
            Pertandingan Mewarna Hari Kesedaran Strok & Diabetis Sedunia
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-slate-400">
            <span>Kehadiran: <strong className="text-emerald-400">{attendedCount}/{totalParticipants}</strong></span>
            <span>Skor Dihantar: <strong className="text-amber-400">{totalScoresCount}</strong></span>
          </div>

          <button
            onClick={() => setIsTabletFrame(!isTabletFrame)}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition ${
              isTabletFrame
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Togol Mod Bingkai Tablet iPad (1024x768)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{isTabletFrame ? 'Bingkai Tablet: Aktif' : 'Mod Penuh'}</span>
          </button>

          <button
            onClick={onResetData}
            className="px-2 py-1 rounded text-xs text-slate-400 hover:text-white hover:bg-slate-800 flex items-center gap-1 transition"
            title="Set Semula Data Asal HSAH"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Set Semula</span>
          </button>
        </div>
      </div>

      {/* Main Bar with Simulated 3 Role Links / Google Sites Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
              Sistem Pendaftaran & Pemarkahan Mewarna HSAH 2026
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Seni Bina Google Sites + Google Sheets • 3 URL Peranan Berasingan • Akses Mesra Tablet
            </p>
          </div>

          {/* 3 Dedicated Role Links Tabs */}
          <nav className="flex items-center gap-1 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700/80 overflow-x-auto">
            <button
              onClick={() => setActiveRole('parent')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeRole === 'parent'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Users className="w-4 h-4 text-blue-200" />
              <div className="text-left">
                <div className="leading-tight">1. Portal Ibu Bapa</div>
                <div className="text-[10px] text-blue-200/80 font-normal">Sahkan Kehadiran & ID</div>
              </div>
            </button>

            <button
              onClick={() => setActiveRole('jury')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeRole === 'jury'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Award className="w-4 h-4 text-amber-200" />
              <div className="text-left">
                <div className="leading-tight">2. Portal Juri</div>
                <div className="text-[10px] text-amber-200/80 font-normal">Penilaian Buta & Kriteria</div>
              </div>
            </button>

            <button
              onClick={() => setActiveRole('admin')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeRole === 'admin'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              <div className="text-left">
                <div className="leading-tight">3. Portal Urus Setia</div>
                <div className="text-[10px] text-emerald-200/80 font-normal">Dashboard & Pemenang</div>
              </div>
            </button>

            <button
              onClick={() => setActiveRole('specification')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeRole === 'specification'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <FileText className="w-4 h-4 text-purple-200" />
              <div className="text-left">
                <div className="leading-tight">Spesifikasi Sistem</div>
                <div className="text-[10px] text-purple-200/80 font-normal">Dokumentasi & Skrip</div>
              </div>
            </button>
          </nav>
        </div>

        {/* URL Simulation bar showing the Google Sites URL for current role */}
        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2 truncate">
            <span className="font-mono text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[10px]">
              URL PERANAN INI:
            </span>
            <code className="text-slate-300 truncate font-mono select-all">
              {getRoleUrl(activeRole)}
            </code>
          </div>
          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 hidden sm:inline">
            Platform: Google Sites Embed
          </span>
        </div>
      </div>
    </header>
  );
};
