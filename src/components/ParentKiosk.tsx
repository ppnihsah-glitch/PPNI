import React, { useState, useMemo } from 'react';
import { Participant } from '../types';
import { searchParticipants, cleanPhoneNumber } from '../utils/searchMatcher';
import { Search, CheckCircle2, AlertCircle, Printer, Sparkles, User, Phone, School, Clock, X } from 'lucide-react';

interface ParentKioskProps {
  participants: Participant[];
  onVerifyAttendance: (participantId: string) => void;
}

export const ParentKiosk: React.FC<ParentKioskProps> = ({
  participants,
  onVerifyAttendance,
}) => {
  const [query, setQuery] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Partial match search
  const searchResults = useMemo(() => {
    return searchParticipants(participants, query);
  }, [participants, query]);

  // Keep selectedParticipant updated with latest state
  const currentParticipant = useMemo(() => {
    if (!selectedParticipant) return null;
    return participants.find((p) => p.id === selectedParticipant.id) || selectedParticipant;
  }, [participants, selectedParticipant]);

  const handleVerify = (p: Participant) => {
    onVerifyAttendance(p.id);
    setSelectedParticipant(p);
    setShowSlipModal(true);
    setSuccessToast(`Kehadiran ${p.name} (${p.id}) berjaya disahkan!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium text-sm">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Card / Instructions */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Kiosk Sah Kehadiran Kendiri Ibu Bapa</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang ke Pertandingan Mewarna HSAH 2026
          </h2>
          <p className="mt-2 text-blue-100 text-sm sm:text-base max-w-2xl leading-relaxed">
            Sila masukkan <strong>Nama Murid</strong> atau <strong>Nombor Telefon</strong> penjaga yang didaftarkan untuk mengesahkan kehadiran dan mendapatkan <strong>Nombor ID Meja Peserta (T001 / R001)</strong>.
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-blue-200">
            <span className="bg-blue-800/60 px-2.5 py-1 rounded-lg border border-blue-400/20">
              👶 Tadika: Kod Awalan <strong>T001 - T022</strong>
            </span>
            <span className="bg-blue-800/60 px-2.5 py-1 rounded-lg border border-blue-400/20">
              🎒 Sekolah Rendah: Kod Awalan <strong>R001 - R022</strong>
            </span>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Touch-Friendly Search Box */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-4">
        <label htmlFor="parent-search" className="block text-sm font-bold text-slate-800">
          Cari Maklumat Peserta:
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <input
            id="parent-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Taip nama anak (cth: Ayris, Danish) atau no tel (cth: 0142700827, 019511)..."
            className="w-full pl-13 pr-12 py-3.5 text-base sm:text-lg border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition shadow-inner"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search quick hints */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            💡 <em>Sistem menyokong carian sebahagian (partial match) tanpa menghiraukan tanda sengkang atau huruf besar/kecil.</em>
          </span>
          {query && (
            <span className="font-medium text-blue-600">
              Dijumpai: {searchResults.length} rekod
            </span>
          )}
        </div>

        {/* Quick sample filter pills for easy testing */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Contoh Carian Cepat:</span>
          {['Ayris', 'Danish', '014-2700827', '019-5119905', 'Tadika Shujen', 'SK Sungai Pasir'].map((sample) => (
            <button
              key={sample}
              onClick={() => setQuery(sample)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-lg transition border border-slate-200"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results Section */}
      {query.trim().length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center justify-between">
            <span>Hasil Carian ({searchResults.length})</span>
            {searchResults.length > 0 && (
              <span className="text-xs text-slate-500 font-normal">
                Pilih peserta untuk sahkan kehadiran
              </span>
            )}
          </h3>

          {searchResults.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center text-amber-800">
              <AlertCircle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
              <p className="font-semibold text-base">Tiada rekod ditemui untuk "{query}"</p>
              <p className="text-sm text-amber-700 mt-1">
                Sila pastikan ejaan nama anak atau nombor telefon adalah sama seperti dalam borang pendaftaran asal.
                Jika masih menghadapi masalah, sila rujuk Kaunter Urus Setia HSAH.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((participant) => (
                <div
                  key={participant.id}
                  className={`bg-white rounded-2xl p-5 border-2 transition-all shadow-sm flex flex-col justify-between ${
                    participant.attended
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : 'border-slate-200 hover:border-blue-400'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header: ID Badge & Category */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-black text-lg px-3 py-1 rounded-lg ${
                            participant.category === 'TADIKA'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                          }`}
                        >
                          {participant.id}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {participant.category === 'TADIKA' ? 'Tadika / Prasekolah' : 'Sekolah Rendah'}
                        </span>
                      </div>

                      {participant.attended ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Hadir
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                          Belum Hadir
                        </span>
                      )}
                    </div>

                    {/* Participant Details */}
                    <div>
                      <h4 className="text-base font-bold text-slate-900 leading-snug">
                        {participant.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{participant.age}</p>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                      {participant.parentName && (
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">Penjaga: <strong>{participant.parentName}</strong></span>
                        </div>
                      )}
                      {participant.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>No Tel: <strong>{participant.phone}</strong></span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <School className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">Institusi: <strong>{participant.school}</strong></span>
                      </div>
                      {participant.attended && participant.attendedAt && (
                        <div className="flex items-center gap-2 text-emerald-700 pt-1 border-t border-slate-200">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Daftar masuk: {participant.attendedAt}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    {!participant.attended ? (
                      <button
                        onClick={() => handleVerify(participant)}
                        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Sahkan Kehadiran Saya
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedParticipant(participant);
                          setShowSlipModal(true);
                        }}
                        className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-600" />
                        Lihat & Cetak Slip Nombor ID
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Default State: Info Cards when not searching */}
      {query.trim().length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-600 text-sm">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              1
            </div>
            <h4 className="font-bold text-slate-900">Cari Nama / No Tel</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Taip sekurang-kurangnya 3 aksara nama anak atau nombor telefon bimbit ibu/bapa untuk padanan automatik.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              2
            </div>
            <h4 className="font-bold text-slate-900">Tekan 'Sahkan Kehadiran'</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sistem akan merekod kehadiran secara masa nyata terus ke Google Sheets urus setia secara automatik.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              3
            </div>
            <h4 className="font-bold text-slate-900">Dapatkan ID Peserta</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Nombor ID (T001 / R001) ditulis pada pelekat dan belakang kertas lukisan. Nama tidak boleh ditulis di depan!
            </p>
          </div>
        </div>
      )}

      {/* Slip Modal: Official Badge Slip for Parent */}
      {showSlipModal && currentParticipant && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Slip Pengesahan Kehadiran Peserta
              </div>
              <button
                onClick={() => setShowSlipModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Slip Card */}
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 bg-slate-50 text-center space-y-4">
              <div className="text-xs text-slate-500 font-medium">
                UNIT TERAPI CARAKERJA | HOSPITAL SULTAN ABDUL HALIM
              </div>

              <div>
                <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide bg-blue-100 text-blue-800">
                  {currentParticipant.category === 'TADIKA' ? 'Kategori Tadika / Prasekolah' : 'Kategori Sekolah Rendah'}
                </span>
                <div className="text-slate-500 text-xs mt-2">NOMBOR PESERTA / MEJA ANDA:</div>
                <div className="font-mono text-5xl sm:text-6xl font-black text-slate-900 tracking-wider my-2">
                  {currentParticipant.id}
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-left space-y-1 text-xs">
                <div className="text-slate-900 font-bold text-sm truncate">{currentParticipant.name}</div>
                <div className="text-slate-600">{currentParticipant.school} • {currentParticipant.age}</div>
                {currentParticipant.parentName && (
                  <div className="text-slate-500">Penjaga: {currentParticipant.parentName} ({currentParticipant.phone})</div>
                )}
                <div className="text-emerald-700 font-semibold pt-1">
                  Status: Hadir ({currentParticipant.attendedAt || 'Telah Disahkan'})
                </div>
              </div>

              {/* Crucial Reminder from PDF */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left text-[11px] text-amber-900 leading-relaxed space-y-1">
                <div className="font-bold flex items-center gap-1 text-amber-800">
                  <AlertCircle className="w-3.5 h-3.5" />
                  PERINGATAN PENTING KEPADA IBU BAPA:
                </div>
                <ul className="list-disc pl-4 space-y-0.5 text-amber-800">
                  <li>Tulis nombor ID <strong>{currentParticipant.id}</strong> pada pelekat dan belakang kertas lukisan.</li>
                  <li><strong>JANGAN</strong> tulis nama peserta di hadapan karya lukisan bagi memastikan identiti dirahsiakan daripada hakim.</li>
                  <li>Bawa peserta ke meja pertandingan mengikut nombor yang tertera.</li>
                </ul>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handlePrintSlip}
                className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition"
              >
                <Printer className="w-4 h-4" />
                Cetak / Simpan Slip
              </button>
              <button
                onClick={() => {
                  setShowSlipModal(false);
                  setQuery('');
                }}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition"
              >
                Selesai (Cari Peserta Lain)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
