import React, { useState, useEffect } from 'react';
import { ActiveRole, Participant, JuryMember, JuryScore } from './types';
import { INITIAL_PARTICIPANTS, INITIAL_JURIES, INITIAL_SCORES } from './data/initialData';
import { Header } from './components/Header';
import { ParentKiosk } from './components/ParentKiosk';
import { JuryPortal } from './components/JuryPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { SpecDocViewer } from './components/SpecDocViewer';

const STORAGE_KEY_PARTICIPANTS = 'hsah_mewarna_2026_participants';
const STORAGE_KEY_SCORES = 'hsah_mewarna_2026_scores';

export default function App() {
  const [activeRole, setActiveRole] = useState<ActiveRole>('parent');
  const [isTabletFrame, setIsTabletFrame] = useState<boolean>(false);

  // Load participants from localStorage or initial
  const [participants, setParticipants] = useState<Participant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PARTICIPANTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading participants from storage:', e);
    }
    return INITIAL_PARTICIPANTS;
  });

  // Juries master list
  const [juries] = useState<JuryMember[]>(INITIAL_JURIES);

  // Load scores from localStorage or initial
  const [scores, setScores] = useState<JuryScore[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCORES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading scores from storage:', e);
    }
    return INITIAL_SCORES;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PARTICIPANTS, JSON.stringify(participants));
    } catch (e) {
      console.error('Error saving participants to storage:', e);
    }
  }, [participants]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(scores));
    } catch (e) {
      console.error('Error saving scores to storage:', e);
    }
  }, [scores]);

  // Handlers
  const handleVerifyAttendance = (participantId: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === participantId
          ? { ...p, attended: true, attendedAt: p.attendedAt || now }
          : p
      )
    );
  };

  const handleToggleAttendance = (participantId: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === participantId
          ? {
              ...p,
              attended: !p.attended,
              attendedAt: !p.attended ? now : undefined,
            }
          : p
      )
    );
  };

  const handleAddScore = (newScore: JuryScore) => {
    setScores((prev) => [newScore, ...prev]);
  };

  const handleDeleteScore = (scoreId: string) => {
    setScores((prev) => prev.filter((s) => s.id !== scoreId));
  };

  const handleUpdateParticipant = (updated: Participant) => {
    setParticipants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleAddParticipant = (newP: Participant) => {
    setParticipants((prev) => [...prev, newP]);
  };

  const handleResetData = () => {
    if (confirm('Adakah anda pasti ingin menetapkan semula semua data kepada senarai asal HSAH 2026?')) {
      localStorage.removeItem(STORAGE_KEY_PARTICIPANTS);
      localStorage.removeItem(STORAGE_KEY_SCORES);
      setParticipants(INITIAL_PARTICIPANTS);
      setScores(INITIAL_SCORES);
    }
  };

  const attendedCount = participants.filter((p) => p.attended).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900">
      {/* Top Header & Role Switcher */}
      <Header
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        onResetData={handleResetData}
        isTabletFrame={isTabletFrame}
        setIsTabletFrame={setIsTabletFrame}
        attendedCount={attendedCount}
        totalParticipants={participants.length}
        totalScoresCount={scores.length}
      />

      {/* Main Content Area (supports normal or tablet-simulated frame) */}
      <main className="flex-1 py-4 sm:py-6">
        {isTabletFrame ? (
          <div className="max-w-4xl mx-auto px-4">
            {/* Tablet Frame Bezel */}
            <div className="bg-slate-900 rounded-[2.5rem] p-4 sm:p-6 shadow-2xl border-4 border-slate-700">
              <div className="flex items-center justify-between px-4 pb-3 text-slate-400 text-xs border-b border-slate-800">
                <span className="font-semibold text-slate-300">Apple iPad Pro 11" (Simulasi Kiosk Acara)</span>
                <span className="font-mono text-cyan-400">10:45 AM • HSAH-WiFi</span>
              </div>
              <div className="bg-slate-50 rounded-2xl min-h-[640px] max-h-[750px] overflow-y-auto mt-3 p-2 sm:p-4">
                {activeRole === 'parent' && (
                  <ParentKiosk
                    participants={participants}
                    onVerifyAttendance={handleVerifyAttendance}
                  />
                )}
                {activeRole === 'jury' && (
                  <JuryPortal
                    participants={participants}
                    juries={juries}
                    scores={scores}
                    onAddScore={handleAddScore}
                  />
                )}
                {activeRole === 'admin' && (
                  <AdminDashboard
                    participants={participants}
                    juries={juries}
                    scores={scores}
                    onToggleAttendance={handleToggleAttendance}
                    onUpdateParticipant={handleUpdateParticipant}
                    onAddParticipant={handleAddParticipant}
                    onDeleteScore={handleDeleteScore}
                  />
                )}
                {activeRole === 'specification' && <SpecDocViewer />}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {activeRole === 'parent' && (
              <ParentKiosk
                participants={participants}
                onVerifyAttendance={handleVerifyAttendance}
              />
            )}
            {activeRole === 'jury' && (
              <JuryPortal
                participants={participants}
                juries={juries}
                scores={scores}
                onAddScore={handleAddScore}
              />
            )}
            {activeRole === 'admin' && (
              <AdminDashboard
                participants={participants}
                juries={juries}
                scores={scores}
                onToggleAttendance={handleToggleAttendance}
                onUpdateParticipant={handleUpdateParticipant}
                onAddParticipant={handleAddParticipant}
                onDeleteScore={handleDeleteScore}
              />
            )}
            {activeRole === 'specification' && <SpecDocViewer />}
          </div>
        )}
      </main>

      {/* Global Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <div className="font-semibold text-slate-200">
              Unit Terapi Carakerja • Hospital Sultan Abdul Halim, Sungai Petani, Kedah
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Pertandingan Mewarna Sempena Hari Kesedaran Strok & Diabetes Sedunia 2026
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Seni Bina: <strong>Google Sites + Sheets</strong></span>
            <span>•</span>
            <button
              onClick={() => setActiveRole('specification')}
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              Lihat Spesifikasi Penuh
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
