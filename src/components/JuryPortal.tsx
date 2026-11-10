import React, { useState, useMemo } from 'react';
import { Participant, JuryMember, JuryScore, CriteriaBreakdown, CategoryType } from '../types';
import { calculateRankings } from '../utils/tieBreaker';
import { 
  Award, 
  ShieldAlert, 
  CheckCircle, 
  Lock, 
  Info, 
  Sliders, 
  ListOrdered, 
  UserCheck, 
  Sparkles, 
  Search,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface JuryPortalProps {
  participants: Participant[];
  juries: JuryMember[];
  scores: JuryScore[];
  onAddScore: (newScore: JuryScore) => void;
}

export const JuryPortal: React.FC<JuryPortalProps> = ({
  participants,
  juries,
  scores,
  onAddScore,
}) => {
  // Current active jury login
  const [selectedJuryId, setSelectedJuryId] = useState<string>(juries[0]?.id || 'JUR-01');
  const [activeTab, setActiveTab] = useState<'marking' | 'leaderboard'>('marking');
  const [leaderboardCategory, setLeaderboardCategory] = useState<CategoryType>('TADIKA');

  // Input participant number for scoring
  const [inputParticipantId, setInputParticipantId] = useState('');
  const [confirmedParticipant, setConfirmedParticipant] = useState<Participant | null>(null);

  // Criteria score inputs
  const [criteria, setCriteria] = useState<CriteriaBreakdown>({
    kreativiti: 20,
    kombinasiWarna: 20,
    kekemasan: 25,
    persembahan: 16,
  });
  const [notes, setNotes] = useState('');
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  const currentJury = useMemo(() => {
    return juries.find((j) => j.id === selectedJuryId) || juries[0];
  }, [juries, selectedJuryId]);

  // Calculate live total
  const liveTotal = useMemo(() => {
    return (
      Number(criteria.kreativiti || 0) +
      Number(criteria.kombinasiWarna || 0) +
      Number(criteria.kekemasan || 0) +
      Number(criteria.persembahan || 0)
    );
  }, [criteria]);

  // Check if current jury has already scored this participant
  const existingSubmission = useMemo(() => {
    if (!confirmedParticipant || !currentJury) return null;
    return scores.find(
      (s) =>
        s.participantId.toUpperCase() === confirmedParticipant.id.toUpperCase() &&
        s.juryId === currentJury.id
    );
  }, [confirmedParticipant, currentJury, scores]);

  // Handle participant ID search / entry
  const handleLoadParticipant = (idToSearch?: string) => {
    const rawId = (idToSearch || inputParticipantId).trim().toUpperCase().replace(/-/g, '');
    if (!rawId) return;

    const matched = participants.find(
      (p) => p.id.replace(/-/g, '').toUpperCase() === rawId
    );

    if (matched) {
      setConfirmedParticipant(matched);
      setInputParticipantId(matched.id);

      // Check if already scored to prefill or reset
      const prior = scores.find(
        (s) => s.participantId.toUpperCase() === matched.id.toUpperCase() && s.juryId === currentJury.id
      );

      if (prior) {
        setCriteria({ ...prior.criteria });
        setNotes(prior.notes || '');
      } else {
        // default baseline marks
        setCriteria({
          kreativiti: 20,
          kombinasiWarna: 20,
          kekemasan: 25,
          persembahan: 16,
        });
        setNotes('');
      }
    } else {
      setConfirmedParticipant(null);
      alert(`Nombor peserta "${rawId}" tidak dijumpai dalam sistem.`);
    }
  };

  // Handle Score Submission
  const handleSubmitScore = (e: React.FormEvent) => {
    e.preventDefault();

    if (!confirmedParticipant) return;

    if (existingSubmission) {
      alert('Peserta ini telah anda nilai sebelum ini! Sistem menghalang kemasukan markah berganda.');
      return;
    }

    // Validation bounds
    if (criteria.kreativiti < 0 || criteria.kreativiti > 25) {
      alert('Markah Kreativiti mestilah antara 0 hingga 25.');
      return;
    }
    if (criteria.kombinasiWarna < 0 || criteria.kombinasiWarna > 25) {
      alert('Markah Kombinasi Warna mestilah antara 0 hingga 25.');
      return;
    }
    if (criteria.kekemasan < 0 || criteria.kekemasan > 30) {
      alert('Markah Kekemasan & Kawalan Mewarna mestilah antara 0 hingga 30.');
      return;
    }
    if (criteria.persembahan < 0 || criteria.persembahan > 20) {
      alert('Markah Persembahan mestilah antara 0 hingga 20.');
      return;
    }

    const newScore: JuryScore = {
      id: `SC-${confirmedParticipant.id}-${currentJury.id}-${Date.now().toString().slice(-4)}`,
      participantId: confirmedParticipant.id,
      category: confirmedParticipant.category,
      juryId: currentJury.id,
      juryName: currentJury.name,
      criteria: {
        kreativiti: Number(criteria.kreativiti),
        kombinasiWarna: Number(criteria.kombinasiWarna),
        kekemasan: Number(criteria.kekemasan),
        persembahan: Number(criteria.persembahan),
      },
      totalScore: liveTotal,
      notes: notes.trim() || undefined,
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onAddScore(newScore);
    setSubmissionFeedback(`Markah untuk peserta ${confirmedParticipant.id} berjaya disimpan! (${liveTotal}/100)`);
    setTimeout(() => setSubmissionFeedback(null), 4000);

    // Reset for next participant
    setInputParticipantId('');
    setConfirmedParticipant(null);
  };

  // Quick list of participants in this jury's queue
  const categoryParticipants = useMemo(() => {
    return participants.sort((a, b) => a.id.localeCompare(b.id));
  }, [participants]);

  // Calculate jury leaderboards sorted highest to lowest, separated by category
  const tadikaRanked = useMemo(() => {
    return calculateRankings(participants, scores, 'TADIKA');
  }, [participants, scores]);

  const sekolahRendahRanked = useMemo(() => {
    return calculateRankings(participants, scores, 'SEKOLAH_RENDAH');
  }, [participants, scores]);

  // Count how many participants scored by this jury
  const myScoredCount = useMemo(() => {
    return scores.filter((s) => s.juryId === currentJury.id).length;
  }, [scores, currentJury.id]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Feedback Banner */}
      {submissionFeedback && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold text-sm">{submissionFeedback}</span>
        </div>
      )}

      {/* Jury Profile & Active Tablet Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              Portal Hakim Rasmi
            </span>
            <span className="text-xs text-slate-400">Mod Penilaian Buta (Blind Scoring)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            {currentJury.name}
          </h2>
          <p className="text-xs text-slate-400">{currentJury.role}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Switch Active Jury (simulating multiple tablets) */}
          <div className="bg-slate-800 p-2 rounded-xl border border-slate-700 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-400" />
            <select
              value={selectedJuryId}
              onChange={(e) => {
                setSelectedJuryId(e.target.value);
                setConfirmedParticipant(null);
              }}
              aria-label="Pilih Profil Hakim"
              className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
            >
              {juries.map((j) => (
                <option key={j.id} value={j.id} className="bg-slate-800 text-white">
                  {j.id}: {j.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded-xl text-xs text-amber-300 font-medium">
            Dinilai oleh anda: <strong className="text-amber-200 text-sm">{myScoredCount}</strong> karya
          </div>
        </div>
      </div>

      {/* Navigation tabs inside Jury link */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('marking')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
            activeTab === 'marking'
              ? 'bg-amber-600 text-white shadow'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Borang Pemarkahan Peserta
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
            activeTab === 'leaderboard'
              ? 'bg-amber-600 text-white shadow'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          Keputusan Keseluruhan (T vs R)
        </button>
      </div>

      {/* TAB 1: MARKING FORM */}
      {activeTab === 'marking' && (
        <div className="space-y-6">
          {/* Step 1: Enter Participant Number (e.g. T001, R001) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label htmlFor="jury-participant-input" className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>Masukkan Nombor Peserta pada Karya:</span>
                <span className="text-xs font-normal text-slate-500">(T001 - T022 atau R001 - R022)</span>
              </label>

              {/* Blind scoring notice badge */}
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit">
                <Lock className="w-3 h-3 text-indigo-600" />
                Nama & identiti murid disorokkan secara automatik
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  id="jury-participant-input"
                  type="text"
                  value={inputParticipantId}
                  onChange={(e) => setInputParticipantId(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleLoadParticipant();
                    }
                  }}
                  placeholder="Contoh: T001, T008, R001, R007..."
                  className="w-full pl-11 pr-4 py-3 text-lg font-mono font-bold uppercase border-2 border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition"
                />
              </div>

              <button
                type="button"
                onClick={() => handleLoadParticipant()}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                Muat Borang Markah
              </button>
            </div>

            {/* Quick selector chips by category for tablet convenience */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="text-xs font-medium text-slate-500">Pilih Pantas Nombor Karya:</div>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[11px] font-bold text-amber-800 self-center mr-1">Tadika:</span>
                {categoryParticipants
                  .filter((p) => p.category === 'TADIKA')
                  .slice(0, 11)
                  .map((p) => {
                    const isScoredByMe = scores.some(
                      (s) => s.participantId === p.id && s.juryId === currentJury.id
                    );
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleLoadParticipant(p.id)}
                        className={`font-mono text-xs px-2.5 py-1 rounded-lg border transition ${
                          isScoredByMe
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                            : 'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-700'
                        }`}
                        title={isScoredByMe ? 'Telah dinilai oleh anda' : 'Belum dinilai'}
                      >
                        {p.id} {isScoredByMe && '✓'}
                      </button>
                    );
                  })}
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-indigo-800 self-center mr-1">Rendah:</span>
                {categoryParticipants
                  .filter((p) => p.category === 'SEKOLAH_RENDAH')
                  .slice(0, 11)
                  .map((p) => {
                    const isScoredByMe = scores.some(
                      (s) => s.participantId === p.id && s.juryId === currentJury.id
                    );
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleLoadParticipant(p.id)}
                        className={`font-mono text-xs px-2.5 py-1 rounded-lg border transition ${
                          isScoredByMe
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                            : 'bg-slate-50 hover:bg-indigo-50 border-slate-200 text-slate-700'
                        }`}
                        title={isScoredByMe ? 'Telah dinilai oleh anda' : 'Belum dinilai'}
                      >
                        {p.id} {isScoredByMe && '✓'}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Step 2: Scoring Form (Only shown when participant is selected) */}
          {confirmedParticipant ? (
            <form onSubmit={handleSubmitScore} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
              {/* Blind Header: Displays ID and Category, NEVER name */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-900 text-amber-400 font-mono font-black text-2xl flex items-center justify-center shadow">
                    {confirmedParticipant.id}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Nombor Peserta Pada Karya
                    </div>
                    <div className="text-lg font-bold text-slate-900">
                      Kategori: {confirmedParticipant.category === 'TADIKA' ? 'Tadika / Prasekolah' : 'Sekolah Rendah'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {confirmedParticipant.age} • Status Kehadiran: {confirmedParticipant.attended ? 'Hadir' : 'Belum Hadir'}
                    </div>
                  </div>
                </div>

                {/* Blind Security Notice */}
                <div className="text-xs text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200 max-w-xs">
                  <div className="font-semibold text-slate-700 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-indigo-600" />
                    Penilaian Tanpa Nama (Blind)
                  </div>
                  <span>Nama murid dan sekolah disorokkan bagi memastikan ketelusan 100%.</span>
                </div>
              </div>

              {/* DUPLICATE SCORING CHECK WARNING */}
              {existingSubmission && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 flex items-start gap-3 text-amber-900">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-sm text-amber-800">
                      PERHATIAN: ANDA TELAH MENILAI PESERTA INI SEBELUM INI!
                    </div>
                    <p>
                      Penilaian telah dihantar pada <strong>{existingSubmission.submittedAt}</strong> dengan jumlah markah{' '}
                      <strong>{existingSubmission.totalScore}/100</strong>. Sistem menghalang kemasukan markah berganda bagi peserta yang sama oleh hakim yang sama.
                    </p>
                    <p className="text-amber-700 font-medium">
                      Borang di bawah dipaparkan dalam mod baca sahaja (read-only).
                    </p>
                  </div>
                </div>
              )}

              {/* 4 Official Criteria Rubrics from HSAH PDF */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-base font-bold text-slate-900">
                    A. Kriteria Pemarkahan (Jumlah 100 Markah)
                  </h3>
                  <span className="text-xs text-slate-500">Unit Terapi Carakerja HSAH 2026</span>
                </div>

                {/* Criterion 1: Kreativiti & Keaslian (Max 25) */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">1</span>
                        Kreativiti & Keaslian
                      </div>
                      <p className="text-xs text-slate-500 ml-7">
                        Idea, gaya dan penggunaan warna yang kreatif; hasil kerja menunjukkan pilihan dan usaha peserta sendiri.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <input
                        type="number"
                        min={0}
                        max={25}
                        disabled={!!existingSubmission}
                        value={criteria.kreativiti}
                        onChange={(e) =>
                          setCriteria({ ...criteria, kreativiti: Math.min(25, Math.max(0, Number(e.target.value))) })
                        }
                        className="w-16 py-1.5 px-2 text-center text-base font-bold font-mono border-2 border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 disabled:bg-slate-100"
                      />
                      <span className="text-xs font-bold text-slate-500">/ 25</span>
                    </div>
                  </div>
                  {/* Range Slider for quick tablet touch */}
                  <input
                    type="range"
                    min={0}
                    max={25}
                    disabled={!!existingSubmission}
                    value={criteria.kreativiti}
                    onChange={(e) => setCriteria({ ...criteria, kreativiti: Number(e.target.value) })}
                    className="w-full accent-amber-600 disabled:opacity-50"
                  />
                </div>

                {/* Criterion 2: Kombinasi & Kesesuaian Warna (Max 25) */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">2</span>
                        Kombinasi & Kesesuaian Warna
                      </div>
                      <p className="text-xs text-slate-500 ml-7">
                        Pemilihan dan padanan warna yang sesuai serta penggunaan warna yang menarik.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <input
                        type="number"
                        min={0}
                        max={25}
                        disabled={!!existingSubmission}
                        value={criteria.kombinasiWarna}
                        onChange={(e) =>
                          setCriteria({ ...criteria, kombinasiWarna: Math.min(25, Math.max(0, Number(e.target.value))) })
                        }
                        className="w-16 py-1.5 px-2 text-center text-base font-bold font-mono border-2 border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 disabled:bg-slate-100"
                      />
                      <span className="text-xs font-bold text-slate-500">/ 25</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={25}
                    disabled={!!existingSubmission}
                    value={criteria.kombinasiWarna}
                    onChange={(e) => setCriteria({ ...criteria, kombinasiWarna: Number(e.target.value) })}
                    className="w-full accent-amber-600 disabled:opacity-50"
                  />
                </div>

                {/* Criterion 3: Kekemasan & Kawalan Mewarna (Max 30) */}
                <div className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <div className="text-sm font-bold text-amber-950 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 text-xs flex items-center justify-center font-bold">3</span>
                        Kekemasan & Kawalan Mewarna (Keutamaan Pemutus Seri)
                      </div>
                      <p className="text-xs text-amber-800 ml-7">
                        Kawalan alat mewarna, sapuan/garisan yang kemas dan usaha mewarna dalam ruang gambar.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <input
                        type="number"
                        min={0}
                        max={30}
                        disabled={!!existingSubmission}
                        value={criteria.kekemasan}
                        onChange={(e) =>
                          setCriteria({ ...criteria, kekemasan: Math.min(30, Math.max(0, Number(e.target.value))) })
                        }
                        className="w-16 py-1.5 px-2 text-center text-base font-bold font-mono border-2 border-amber-400 rounded-lg focus:outline-none focus:border-amber-600 disabled:bg-slate-100"
                      />
                      <span className="text-xs font-bold text-amber-800">/ 30</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={30}
                    disabled={!!existingSubmission}
                    value={criteria.kekemasan}
                    onChange={(e) => setCriteria({ ...criteria, kekemasan: Number(e.target.value) })}
                    className="w-full accent-amber-600 disabled:opacity-50"
                  />
                </div>

                {/* Criterion 4: Persembahan Keseluruhan (Max 20) */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">4</span>
                        Persembahan Keseluruhan
                      </div>
                      <p className="text-xs text-slate-500 ml-7">
                        Hasil akhir kelihatan lengkap, seimbang dan menunjukkan usaha yang bersungguh-sungguh.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <input
                        type="number"
                        min={0}
                        max={20}
                        disabled={!!existingSubmission}
                        value={criteria.persembahan}
                        onChange={(e) =>
                          setCriteria({ ...criteria, persembahan: Math.min(20, Math.max(0, Number(e.target.value))) })
                        }
                        className="w-16 py-1.5 px-2 text-center text-base font-bold font-mono border-2 border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 disabled:bg-slate-100"
                      />
                      <span className="text-xs font-bold text-slate-500">/ 20</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    disabled={!!existingSubmission}
                    value={criteria.persembahan}
                    onChange={(e) => setCriteria({ ...criteria, persembahan: Number(e.target.value) })}
                    className="w-full accent-amber-600 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Auto Calculated Total Mark & Judge Notes */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Pengiraan Automatik Markah Keseluruhan:
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    Kreativiti ({criteria.kreativiti}) + Warna ({criteria.kombinasiWarna}) + Kekemasan ({criteria.kekemasan}) + Persembahan ({criteria.persembahan})
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-4xl sm:text-5xl font-black text-amber-400">
                    {liveTotal} <span className="text-xl text-slate-400 font-normal">/ 100</span>
                  </div>
                </div>
              </div>

              {/* Optional Jury Comment */}
              <div className="space-y-2">
                <label htmlFor="jury-notes" className="block text-xs font-bold text-slate-700">
                  Catatan Ringkas Hakim (Pilihan):
                </label>
                <textarea
                  id="jury-notes"
                  rows={2}
                  disabled={!!existingSubmission}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Sapuan warna ceria dan sangat kemas bagi peringkat umur ini..."
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-amber-500 disabled:bg-slate-100"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmedParticipant(null);
                    setInputParticipantId('');
                  }}
                  className="w-full sm:w-auto px-5 py-3 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal / Pilih Karya Lain
                </button>

                {!existingSubmission ? (
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Sahkan & Hantar Markah ({liveTotal}/100)
                  </button>
                ) : (
                  <div className="text-xs text-amber-700 font-semibold bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
                    Markah Telah Dihantar & Terkunci
                  </div>
                )}
              </div>
            </form>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-500 space-y-2">
              <Award className="w-12 h-12 mx-auto text-amber-500/80" />
              <h4 className="font-bold text-slate-800 text-base">Sedia untuk Menilai Karya</h4>
              <p className="text-xs max-w-md mx-auto text-slate-500">
                Sila masukkan nombor peserta daripada belakang kertas lukisan (cth: <strong>T001</strong> untuk Tadika atau <strong>R001</strong> untuk Sekolah Rendah) di atas untuk memulakan pemarkahan.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OVERALL MARKS LEADERBOARD (Sorted Highest to Lowest, Separated by T vs R) */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-amber-600" />
                Papan Markah Keseluruhan Mengikut Kategori
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Disusun dari markah tertinggi ke terendah secara berasingan (T vs R) mengikut Prosedur Penilaian HSAH.
              </p>
            </div>

            {/* Category Selector Tabs */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl">
              <button
                onClick={() => setLeaderboardCategory('TADIKA')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  leaderboardCategory === 'TADIKA'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kategori Tadika (T001-T022)
              </button>
              <button
                onClick={() => setLeaderboardCategory('SEKOLAH_RENDAH')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  leaderboardCategory === 'SEKOLAH_RENDAH'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kategori Sekolah Rendah (R001-R022)
              </button>
            </div>
          </div>

          {/* Results Table for Selected Category */}
          {(() => {
            const list = leaderboardCategory === 'TADIKA' ? tadikaRanked : sekolahRendahRanked;

            if (list.length === 0) {
              return (
                <div className="text-center py-10 text-slate-500">
                  <Info className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="font-semibold">Belum ada karya yang dinilai dalam kategori ini.</p>
                </div>
              );
            }

            return (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-3 px-3 w-14 text-center">Ked.</th>
                      <th className="py-3 px-3">No. Peserta (Karya)</th>
                      <th className="py-3 px-2 text-center">Kreativiti (25)</th>
                      <th className="py-3 px-2 text-center">Warna (25)</th>
                      <th className="py-3 px-2 text-center bg-amber-100/50">Kekemasan (30)</th>
                      <th className="py-3 px-2 text-center">Persembahan (20)</th>
                      <th className="py-3 px-3 text-right">Jumlah Purata (/100)</th>
                      <th className="py-3 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {list.map((item, idx) => (
                      <tr
                        key={item.participantId}
                        className={`hover:bg-slate-50/80 transition ${
                          idx < 3 ? 'bg-amber-50/20 font-medium' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`w-6 h-6 inline-flex items-center justify-center rounded-full font-bold text-xs ${
                              idx === 0
                                ? 'bg-yellow-400 text-yellow-950 shadow-sm'
                                : idx === 1
                                ? 'bg-slate-300 text-slate-800'
                                : idx === 2
                                ? 'bg-amber-700 text-amber-50'
                                : 'text-slate-500'
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900 text-sm">
                          {item.participantId}
                        </td>
                        <td className="py-3 px-2 text-center font-mono">{item.avgKreativiti}</td>
                        <td className="py-3 px-2 text-center font-mono">{item.avgKombinasi}</td>
                        <td className="py-3 px-2 text-center font-mono font-bold text-amber-900 bg-amber-50/50">
                          {item.avgKekemasan}
                        </td>
                        <td className="py-3 px-2 text-center font-mono">{item.avgPersembahan}</td>
                        <td className="py-3 px-3 text-right font-mono font-black text-sm text-slate-900">
                          {item.averageTotal}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {item.tieBrokenBy ? (
                            <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-medium" title={item.tieBrokenBy}>
                              Pemutus Seri
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                              {item.scores.length} Juri
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
