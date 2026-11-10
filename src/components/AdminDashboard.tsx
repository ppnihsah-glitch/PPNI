import React, { useState, useMemo } from 'react';
import { Participant, JuryMember, JuryScore, CategoryType } from '../types';
import { calculateRankings } from '../utils/tieBreaker';
import { GOOGLE_APPS_SCRIPT_CODE } from '../services/googleSheetsScript';
import {
  Users,
  CheckCircle2,
  Award,
  Trophy,
  Database,
  Search,
  Filter,
  Download,
  Printer,
  Plus,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  FileSpreadsheet,
  Lock,
  Unlock,
  Eye,
  Layers,
  ShieldCheck
} from 'lucide-react';

interface AdminDashboardProps {
  participants: Participant[];
  juries: JuryMember[];
  scores: JuryScore[];
  onToggleAttendance: (participantId: string) => void;
  onUpdateParticipant: (updated: Participant) => void;
  onAddParticipant: (newP: Participant) => void;
  onDeleteScore: (scoreId: string) => void;
}

type AdminTab = 'participants' | 'attendance' | 'juries' | 'winners' | 'sheets_sync';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  participants,
  juries,
  scores,
  onToggleAttendance,
  onUpdateParticipant,
  onAddParticipant,
  onDeleteScore,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('participants');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | CategoryType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [winnersCategory, setWinnersCategory] = useState<CategoryType>('TADIKA');

  // Modal for adding participant
  const [showAddModal, setShowAddModal] = useState(false);
  const [newParticipant, setNewParticipant] = useState<Partial<Participant>>({
    category: 'TADIKA',
    name: '',
    parentName: '',
    phone: '',
    school: '',
    age: '6 TAHUN',
  });

  // Replacement paper recording modal
  const [replacementParticipant, setReplacementParticipant] = useState<Participant | null>(null);
  const [replacementReason, setReplacementReason] = useState('Kertas rosak / koyak');

  // Stats calculation
  const stats = useMemo(() => {
    const total = participants.length;
    const attended = participants.filter((p) => p.attended).length;
    const tadikaTotal = participants.filter((p) => p.category === 'TADIKA').length;
    const tadikaAttended = participants.filter((p) => p.category === 'TADIKA' && p.attended).length;
    const sekolahTotal = participants.filter((p) => p.category === 'SEKOLAH_RENDAH').length;
    const sekolahAttended = participants.filter((p) => p.category === 'SEKOLAH_RENDAH' && p.attended).length;

    return {
      total,
      attended,
      attendanceRate: total > 0 ? ((attended / total) * 100).toFixed(1) : '0',
      tadikaTotal,
      tadikaAttended,
      tadikaRate: tadikaTotal > 0 ? ((tadikaAttended / tadikaTotal) * 100).toFixed(1) : '0',
      sekolahTotal,
      sekolahAttended,
      sekolahRate: sekolahTotal > 0 ? ((sekolahAttended / sekolahTotal) * 100).toFixed(1) : '0',
      totalScores: scores.length,
    };
  }, [participants, scores]);

  // Filtered participant list
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const matchCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.parentName && p.parentName.toLowerCase().includes(q)) ||
        (p.school && p.school.toLowerCase().includes(q)) ||
        (p.phone && p.phone.includes(q));
      return matchCategory && matchQuery;
    });
  }, [participants, categoryFilter, searchQuery]);

  // Verified attendance only
  const verifiedList = useMemo(() => {
    return participants.filter((p) => p.attended);
  }, [participants]);

  // Ranked Top 10 lists calculated via Section C rules
  const tadikaWinners = useMemo(() => {
    return calculateRankings(participants, scores, 'TADIKA');
  }, [participants, scores]);

  const sekolahWinners = useMemo(() => {
    return calculateRankings(participants, scores, 'SEKOLAH_RENDAH');
  }, [participants, scores]);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleSaveReplacement = () => {
    if (!replacementParticipant) return;
    onUpdateParticipant({
      ...replacementParticipant,
      replacementPaperUsed: true,
      replacementPaperReason: replacementReason,
    });
    setReplacementParticipant(null);
  };

  const handleCreateParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipant.name) return;

    // determine next ID
    const cat = newParticipant.category || 'TADIKA';
    const prefix = cat === 'TADIKA' ? 'T' : 'R';
    const existingCat = participants.filter((p) => p.category === cat);
    const nextNum = existingCat.length + 1;
    const formattedId = `${prefix}${String(nextNum).padStart(3, '0')}`;

    const p: Participant = {
      id: formattedId,
      bil: nextNum,
      name: newParticipant.name.toUpperCase(),
      parentName: (newParticipant.parentName || '').toUpperCase(),
      phone: newParticipant.phone || '',
      school: (newParticipant.school || '').toUpperCase(),
      age: newParticipant.age || (cat === 'TADIKA' ? '6 TAHUN' : '9 TAHUN'),
      category: cat,
      attended: false,
    };

    onAddParticipant(p);
    setShowAddModal(false);
    setNewParticipant({
      category: 'TADIKA',
      name: '',
      parentName: '',
      phone: '',
      school: '',
      age: '6 TAHUN',
    });
  };

  const exportParticipantsCSV = () => {
    const headers = [
      'ID Peserta',
      'Bil',
      'Kategori',
      'Nama Murid',
      'Nama Ibu/Bapa',
      'No Tel',
      'Sekolah',
      'Umur',
      'Hadir',
      'Masa Hadir',
      'Kertas Ganti',
    ];
    const rows = participants.map((p) => [
      p.id,
      p.bil,
      p.category,
      `"${p.name}"`,
      `"${p.parentName || ''}"`,
      `"${p.phone || ''}"`,
      `"${p.school || ''}"`,
      `"${p.age}"`,
      p.attended ? 'YA' : 'TIDAK',
      p.attendedAt || '',
      p.replacementPaperUsed ? `YA (${p.replacementPaperReason})` : 'TIDAK',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Peserta_Mewarna_HSAH_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Admin Title & Key Metrics Cards */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Portal Pentadbir & Urus Setia HSAH</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Dashboard Pengurusan Pendaftaran & Penilaian
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-2xl">
              Memantau status kehadiran masa nyata, kemajuan pemarkahan juri panel, dan senarai rasmi 10 pemenang terbaik mengikut kategori.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Daftar Peserta Baharu
            </button>
            <button
              onClick={exportParticipantsCSV}
              className="py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
              title="Eksport ke CSV"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>

        {/* 4 Fast Metric Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="text-xs text-emerald-200 font-medium">Jumlah Peserta Berdaftar</div>
            <div className="text-2xl sm:text-3xl font-black mt-1">{stats.total}</div>
            <div className="text-[11px] text-emerald-300 mt-0.5">T: {stats.tadikaTotal} | R: {stats.sekolahTotal}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="text-xs text-emerald-200 font-medium">Kadar Kehadiran</div>
            <div className="text-2xl sm:text-3xl font-black mt-1 text-emerald-300">
              {stats.attended} <span className="text-sm font-semibold text-emerald-100">({stats.attendanceRate}%)</span>
            </div>
            <div className="text-[11px] text-emerald-300 mt-0.5">Disahkan di Kiosk / Kaunter</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="text-xs text-amber-200 font-medium">Borang Skor Dihantar</div>
            <div className="text-2xl sm:text-3xl font-black mt-1 text-amber-300">{stats.totalScores}</div>
            <div className="text-[11px] text-amber-200/80 mt-0.5">Oleh 3 Panel Hakim</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="text-xs text-cyan-200 font-medium">Status Pemenang Top 10</div>
            <div className="text-2xl sm:text-3xl font-black mt-1 text-cyan-300">
              {tadikaWinners.length > 0 && sekolahWinners.length > 0 ? 'Sedia' : 'Dalam Proses'}
            </div>
            <div className="text-[11px] text-cyan-200/80 mt-0.5">Kira automatik pemutus seri</div>
          </div>
        </div>
      </div>

      {/* 5 Main Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('participants')}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
            activeTab === 'participants'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          1. Senarai Peserta Mengikut Kategori
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
            activeTab === 'attendance'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          2. Senarai Kehadiran Disahkan ({stats.attended})
        </button>

        <button
          onClick={() => setActiveTab('juries')}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
            activeTab === 'juries'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          3. Senarai Nama Juri & Pemantauan
        </button>

        <button
          onClick={() => setActiveTab('winners')}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
            activeTab === 'winners'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Trophy className="w-4 h-4 text-yellow-300" />
          4. Top 10 Pemenang Per Kategori
        </button>

        <button
          onClick={() => setActiveTab('sheets_sync')}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
            activeTab === 'sheets_sync'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Integrasi Google Sheets & Apps Script
        </button>
      </div>

      {/* TAB 1: PARTICIPANT LIST BY CATEGORY */}
      {activeTab === 'participants' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Category filter pills */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl">
              <button
                onClick={() => setCategoryFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  categoryFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({participants.length})
              </button>
              <button
                onClick={() => setCategoryFilter('TADIKA')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  categoryFilter === 'TADIKA'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tadika (T001-T022)
              </button>
              <button
                onClick={() => setCategoryFilter('SEKOLAH_RENDAH')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  categoryFilter === 'SEKOLAH_RENDAH'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sekolah Rendah (R001-R022)
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari ID, nama murid, sekolah..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Participants Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-3 w-16 text-center">ID</th>
                  <th className="py-3 px-3">Nama Murid</th>
                  <th className="py-3 px-3">Nama Ibu/Bapa</th>
                  <th className="py-3 px-3">No Telefon</th>
                  <th className="py-3 px-3">Tadika / Sekolah</th>
                  <th className="py-3 px-2 text-center">Umur</th>
                  <th className="py-3 px-3 text-center">Kehadiran</th>
                  <th className="py-3 px-3 text-center">Kertas Ganti</th>
                  <th className="py-3 px-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredParticipants.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                          p.category === 'TADIKA'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {p.id}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {p.name}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {p.parentName || <span className="text-slate-400">-</span>}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">{p.phone || '-'}</td>
                    <td className="py-3 px-3 text-slate-600">{p.school || '-'}</td>
                    <td className="py-3 px-2 text-center text-slate-600">{p.age}</td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onToggleAttendance(p.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                          p.attended
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {p.attended ? '✓ Hadir' : '○ Belum'}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {p.replacementPaperUsed ? (
                        <span
                          className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded"
                          title={p.replacementPaperReason}
                        >
                          Ya (Kertas 2)
                        </span>
                      ) : (
                        <button
                          onClick={() => setReplacementParticipant(p)}
                          className="text-[10px] text-slate-400 hover:text-slate-700 underline"
                        >
                          + Rekod Ganti
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onToggleAttendance(p.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {p.attended ? 'Batal Hadir' : 'Sahkan'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: VERIFIED ATTENDANCE LIST */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Daftar Kehadiran Rasmi (Disahkan)
              </h3>
              <p className="text-xs text-slate-500">
                Menepati format Borang B (B. DAFTAR PESERTA) Unit Terapi Carakerja HSAH 2026.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="py-2 px-3 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Printer className="w-4 h-4" />
              Cetak Senarai Kehadiran
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tadika Attendees */}
            <div className="border border-slate-200 rounded-xl p-4 bg-amber-50/20 space-y-3">
              <div className="flex items-center justify-between font-bold text-sm text-amber-900 border-b border-amber-200 pb-2">
                <span>Tadika / Prasekolah (Siri T)</span>
                <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                  {stats.tadikaAttended} / {stats.tadikaTotal} Hadir ({stats.tadikaRate}%)
                </span>
              </div>
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {verifiedList
                  .filter((p) => p.category === 'TADIKA')
                  .map((p) => (
                    <div
                      key={p.id}
                      className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span className="font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[11px]">
                            {p.id}
                          </span>
                          <span>{p.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{p.school}</div>
                      </div>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {p.attendedAt || 'Hadir'}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Sekolah Rendah Attendees */}
            <div className="border border-slate-200 rounded-xl p-4 bg-indigo-50/20 space-y-3">
              <div className="flex items-center justify-between font-bold text-sm text-indigo-900 border-b border-indigo-200 pb-2">
                <span>Sekolah Rendah (Siri R)</span>
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">
                  {stats.sekolahAttended} / {stats.sekolahTotal} Hadir ({stats.sekolahRate}%)
                </span>
              </div>
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {verifiedList
                  .filter((p) => p.category === 'SEKOLAH_RENDAH')
                  .map((p) => (
                    <div
                      key={p.id}
                      className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span className="font-mono bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded text-[11px]">
                            {p.id}
                          </span>
                          <span>{p.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{p.school}</div>
                      </div>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {p.attendedAt || 'Hadir'}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: JURY NAME LIST & MONITORING */}
      {activeTab === 'juries' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                Senarai Panel Hakim & Status Pemarkahan
              </h3>
              <p className="text-xs text-slate-500">
                Memantau bilangan karya yang telah dinilai oleh setiap hakim.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {juries.map((j) => {
              const myScores = scores.filter((s) => s.juryId === j.id);
              const tadikaCount = myScores.filter((s) => s.category === 'TADIKA').length;
              const sekolahCount = myScores.filter((s) => s.category === 'SEKOLAH_RENDAH').length;

              return (
                <div key={j.id} className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-slate-900 text-amber-400 font-mono text-xs font-bold px-2.5 py-1 rounded-lg">
                      {j.id}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">PIN: ****</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{j.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{j.role}</p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Karya Tadika Dinilai:</span>
                      <strong className="text-amber-700">{tadikaCount} / {stats.tadikaTotal}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Karya Sekolah Rendah:</span>
                      <strong className="text-indigo-700">{sekolahCount} / {stats.sekolahTotal}</strong>
                    </div>
                    <div className="flex justify-between text-slate-800 font-bold pt-1 border-t border-slate-100">
                      <span>Jumlah Penilaian:</span>
                      <span className="text-emerald-700">{myScores.length}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submitted Scores Audit Log (Admin oversight) */}
          <div className="space-y-3 pt-3">
            <h4 className="font-bold text-slate-800 text-sm">Audit Log Markah Terkini</h4>
            <div className="overflow-x-auto max-h-80 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                    <th className="py-2.5 px-3">No. Karya</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3">Hakim</th>
                    <th className="py-2.5 px-2 text-center">Kreativiti (25)</th>
                    <th className="py-2.5 px-2 text-center">Warna (25)</th>
                    <th className="py-2.5 px-2 text-center">Kekemasan (30)</th>
                    <th className="py-2.5 px-2 text-center">Persembahan (20)</th>
                    <th className="py-2.5 px-3 text-right">Jumlah (/100)</th>
                    <th className="py-2.5 px-3 text-right">Tindakan Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scores.map((sc) => (
                    <tr key={sc.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">{sc.participantId}</td>
                      <td className="py-2 px-3">{sc.category === 'TADIKA' ? 'Tadika' : 'Sek. Rendah'}</td>
                      <td className="py-2 px-3 text-slate-600">{sc.juryName}</td>
                      <td className="py-2 px-2 text-center font-mono">{sc.criteria.kreativiti}</td>
                      <td className="py-2 px-2 text-center font-mono">{sc.criteria.kombinasiWarna}</td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-amber-900 bg-amber-50/50">
                        {sc.criteria.kekemasan}
                      </td>
                      <td className="py-2 px-2 text-center font-mono">{sc.criteria.persembahan}</td>
                      <td className="py-2 px-3 text-right font-mono font-black text-slate-900">
                        {sc.totalScore}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Nyahkunci / Padam skor ${sc.participantId} oleh ${sc.juryName}?`)) {
                              onDeleteScore(sc.id);
                            }
                          }}
                          className="text-[11px] text-red-600 hover:text-red-800"
                          title="Buka kunci untuk dinilai semula jika ada pembetulan"
                        >
                          Padam / Buka Kunci
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TOP 10 WINNERS PER CATEGORY */}
      {activeTab === 'winners' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Senarai Rasmi 10 Pemenang Terbaik Mengikut Kategori
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengiraan pemutus seri automatik mengikut Kaedah Seksyen C Borang Pemarkahan HSAH 2026.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Category tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setWinnersCategory('TADIKA')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    winnersCategory === 'TADIKA'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Top 10 Tadika (T)
                </button>
                <button
                  onClick={() => setWinnersCategory('SEKOLAH_RENDAH')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    winnersCategory === 'SEKOLAH_RENDAH'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Top 10 Sekolah Rendah (R)
                </button>
              </div>

              <button
                onClick={() => window.print()}
                className="py-2 px-3 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" />
                Cetak Sijil / Keputusan
              </button>
            </div>
          </div>

          {/* Tie-breaker rules reminder box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Hierarki Penentuan Pemutus Seri Rasmi (Seksyen C):</strong>
              <div className="text-[11px] text-blue-800 mt-0.5">
                1. Jumlah Markah Keseluruhan → 2. Kekemasan & Kawalan Mewarna (30 Markah) → 3. Kreativiti & Keaslian (25 Markah) → 4. Kombinasi Warna (25 Markah) → 5. Musyawarah Panel Hakim.
                <em> *Kategori Tadika dan Sekolah Rendah tidak sesekali dibandingkan bersama.</em>
              </div>
            </div>
          </div>

          {/* Top 10 Table */}
          {(() => {
            const list = (winnersCategory === 'TADIKA' ? tadikaWinners : sekolahWinners).slice(0, 10);

            if (list.length === 0) {
              return (
                <div className="text-center py-12 text-slate-500">
                  <Trophy className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold">Belum ada pemarkahan yang direkodkan dalam kategori ini.</p>
                </div>
              );
            }

            return (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-3 px-3 w-16 text-center">Kedudukan</th>
                      <th className="py-3 px-3">Anugerah</th>
                      <th className="py-3 px-3">No. Peserta</th>
                      <th className="py-3 px-3">Nama Pemenang</th>
                      <th className="py-3 px-3">Sekolah / Tadika</th>
                      <th className="py-3 px-2 text-center bg-amber-100/40">Kekemasan (30)</th>
                      <th className="py-3 px-2 text-center">Kreativiti (25)</th>
                      <th className="py-3 px-2 text-center">Warna (25)</th>
                      <th className="py-3 px-3 text-right">Purata Markah</th>
                      <th className="py-3 px-3 text-center">Catatan Penentuan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {list.map((winner, idx) => {
                      const prizeName =
                        idx === 0
                          ? 'JOHAN'
                          : idx === 1
                          ? 'NAIB JOHAN'
                          : idx === 2
                          ? 'TEMPAT KETIGA'
                          : `SAGUHATI ${idx + 1}`;

                      return (
                        <tr
                          key={winner.participantId}
                          className={`hover:bg-slate-50 transition ${
                            idx === 0
                              ? 'bg-yellow-50 font-semibold'
                              : idx === 1
                              ? 'bg-slate-50/80 font-medium'
                              : idx === 2
                              ? 'bg-amber-50/40 font-medium'
                              : ''
                          }`}
                        >
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`w-7 h-7 inline-flex items-center justify-center rounded-full font-black text-xs ${
                                idx === 0
                                  ? 'bg-yellow-400 text-yellow-950 shadow-md'
                                  : idx === 1
                                  ? 'bg-slate-300 text-slate-900 shadow-sm'
                                  : idx === 2
                                  ? 'bg-amber-700 text-white shadow-sm'
                                  : 'text-slate-600 bg-slate-100'
                              }`}
                            >
                              {idx + 1}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                idx === 0
                                  ? 'bg-yellow-200 text-yellow-900'
                                  : idx === 1
                                  ? 'bg-slate-200 text-slate-800'
                                  : idx === 2
                                  ? 'bg-amber-200 text-amber-900'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {prizeName}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">
                            {winner.participantId}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900 text-sm">
                            {winner.name || '-'}
                          </td>
                          <td className="py-3 px-3 text-slate-600">{winner.school || '-'}</td>
                          <td className="py-3 px-2 text-center font-mono font-bold text-amber-900 bg-amber-50/40">
                            {winner.avgKekemasan}
                          </td>
                          <td className="py-3 px-2 text-center font-mono">{winner.avgKreativiti}</td>
                          <td className="py-3 px-2 text-center font-mono">{winner.avgKombinasi}</td>
                          <td className="py-3 px-3 text-right font-mono font-black text-base text-slate-900">
                            {winner.averageTotal}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {winner.tieBrokenBy ? (
                              <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                                {winner.tieBrokenBy}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Markah Mutlak</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 5: GOOGLE SHEETS & APPS SCRIPT INTEGRATION HUB */}
      {activeTab === 'sheets_sync' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                Penyelarasan Google Sheets & Pelayan Google Apps Script
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Semua data kehadiran dan pemarkahan dikemaskini terus ke Google Sheet anda secara 'real-time'.
              </p>
            </div>

            <button
              onClick={handleCopyScript}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow transition"
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedCode ? 'Kod Telah Disalin!' : 'Salin Kod Google Apps Script'}
            </button>
          </div>

          {/* Setup Guide Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">
                1
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Buka Google Sheets</h4>
              <p className="text-slate-600 leading-relaxed">
                Cipta helaian baharu bertajuk <strong>"Database Pertandingan Mewarna HSAH 2026"</strong> dengan 3 tab: <code>Peserta</code>, <code>Pemarkahan</code>, dan <code>Juri</code>.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">
                2
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Tampal Apps Script</h4>
              <p className="text-slate-600 leading-relaxed">
                Di Google Sheets, klik menu <strong>Extensions &gt; Apps Script</strong>. Padam kod asal dan tampal kod Apps Script di bawah. Klik Run pada <code>initSetupDatabase</code>.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">
                3
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Deploy Web App & Semat di Sites</h4>
              <p className="text-slate-600 leading-relaxed">
                Klik <strong>Deploy &gt; New deployment &gt; Web app</strong>. Tetapkan <em>Who has access: Anyone</em>. Salin URL Web App dan sematkan (Embed) pada halaman Google Sites anda.
              </p>
            </div>
          </div>

          {/* Script Viewer Container */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Code.gs (Apps Script Source)</span>
              <span>Bahasa: JavaScript (Google Apps Script)</span>
            </div>
            <pre className="bg-slate-950 text-slate-100 p-4 rounded-xl text-xs font-mono max-h-96 overflow-y-auto leading-relaxed border border-slate-800">
              {GOOGLE_APPS_SCRIPT_CODE}
            </pre>
          </div>
        </div>
      )}

      {/* Modal for Adding New Participant */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">Daftar Peserta Baharu</h3>
            <form onSubmit={handleCreateParticipant} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori:</label>
                <select
                  value={newParticipant.category}
                  onChange={(e) =>
                    setNewParticipant({ ...newParticipant, category: e.target.value as CategoryType })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                >
                  <option value="TADIKA">Tadika / Prasekolah (Siri T)</option>
                  <option value="SEKOLAH_RENDAH">Sekolah Rendah (Siri R)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Murid:</label>
                <input
                  type="text"
                  required
                  placeholder="Nama penuh murid..."
                  value={newParticipant.name}
                  onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Ibu/Bapa:</label>
                <input
                  type="text"
                  placeholder="Nama penjaga..."
                  value={newParticipant.parentName}
                  onChange={(e) => setNewParticipant({ ...newParticipant, parentName: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">No Telefon Penjaga:</label>
                <input
                  type="text"
                  placeholder="Cth: 019-1234567..."
                  value={newParticipant.phone}
                  onChange={(e) => setNewParticipant({ ...newParticipant, phone: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Tadika / Sekolah:</label>
                <input
                  type="text"
                  placeholder="Cth: Tadika Kemas / SK Sungai Pasir..."
                  value={newParticipant.school}
                  onChange={(e) => setNewParticipant({ ...newParticipant, school: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow"
                >
                  Simpan Peserta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Recording Replacement Paper (Kertas Ganti from PDF Section C) */}
      {replacementParticipant && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900">
              Rekod Kertas Ganti ({replacementParticipant.id})
            </h3>
            <p className="text-xs text-slate-500">
              Mengikut Borang C HSAH (Rekod Kertas Ganti), rekodkan sebab penggantian kertas lukisan.
            </p>
            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-slate-700">Sebab Penggantian:</label>
              <select
                value={replacementReason}
                onChange={(e) => setReplacementReason(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              >
                <option value="Kertas terkoyak secara tidak sengaja">Kertas terkoyak secara tidak sengaja</option>
                <option value="Kotoran cecair / air tertumpah">Kotoran cecair / air tertumpah</option>
                <option value="Kerosakan alat mewarna menembusi kertas">Kerosakan alat mewarna menembusi kertas</option>
                <option value="Lain-lain sebab yang diluluskan ketua juri">Lain-lain sebab diluluskan ketua juri</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReplacementParticipant(null)}
                className="px-3 py-1.5 text-slate-600 text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleSaveReplacement}
                className="px-4 py-1.5 bg-amber-600 text-white font-bold rounded-xl text-xs"
              >
                Sahkan Penggantian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
