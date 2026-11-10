import React, { useState } from 'react';
import { Copy, Check, Printer, FileText, Download, ShieldCheck, Sparkles } from 'lucide-react';

export const SpecDocViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const fullSpecMarkdown = `# SPESIFIKASI TEKNIKAL SISTEM PENDAFTARAN & PEMARKAHAN MEWARNA
## UNIT TERAPI CARAKERJA | HOSPITAL SULTAN ABDUL HALIM (HSAH) 2026
**Platform Cadangan:** Google Sites (Antara Muka Pengguna / Web UI) & Google Sheets (Pangkalan Data Bersepadu)  
**Konteks Peristiwa:** Pertandingan Mewarna Hari Kesedaran Strok & Diabetes Sedunia 2026  
**Sasaran Peranti:** Tablet (iPad / Android Tablet), Telefon Pintar & Komputer Riba Urus Setia  

---

### 1. RINGKASAN EKSEKUTIF & SENI BINA SISTEM

Sistem ini direka bentuk khas untuk operasi tablet di lokasi pertandingan (venue) dengan seni bina tiga pautan URL berasingan berasaskan peranan (*Role-Based Access Control*). Sistem menghubungkan antara muka web Google Sites kepada lembaran Google Sheets melalui Google Apps Script Web App JSON API.

#### Struktur 3 Pautan Google Sites:
1. **Pautan 1 (Ibu Bapa / Penjaga):** \`https://sites.google.com/view/mewarna-hsah-2026/kehadiran-peserta\`  
   *Kiosk sah kehadiran kendiri, carian fleksibel sebahagian (partial match), penyerahan Nombor Meja/ID Peserta (T001 - T022 bagi Tadika; R001 - R022 bagi Sekolah Rendah).*
2. **Pautan 2 (Panel Juri / Hakim):** \`https://sites.google.com/view/mewarna-hsah-2026/portal-hakim-penilaian\`  
   *Penilaian buta (Blind Scoring), paparan 4 kriteria rasmi HSAH (Jumlah 100 markah), kiraan automatik, pencegahan pemarkahan berganda (duplicate check lock), serta paparan skor keseluruhan mengikut kategori berasingan.*
3. **Pautan 3 (Urus Setia / Pentadbir):** \`https://sites.google.com/view/mewarna-hsah-2026/urus-setia-pentadbir\`  
   *Dashboard 4 tab: Senarai Peserta Kategori, Senarai Kehadiran Disahkan, Senarai & Pemantauan Juri, dan Senarai Rasmi 10 Pemenang Terbaik dengan algoritma pemutus seri automatik.*

---

### 2. SPESIFIKASI PAUTAN 1: PORTAL IBU BAPA (KEHADIRAN & ID)

#### A. Medan Data (Data Fields)
- \`query\` (Input): Carian rentetan teks (Nama murid, Nama ibu/bapa, atau No telefon bimbit).
- \`participantId\` (Output Paparan): T001 - T022 atau R001 - R022.
- \`childName\` (Output Paparan): Nama Penuh Murid.
- \`parentName\` (Output Paparan): Nama Ibu/Bapa atau Penjaga.
- \`phone\` (Output Paparan): No telefon berdaftar.
- \`school\` (Output Paparan): Nama Tadika atau Sekolah.
- \`age\` (Output Paparan): Peringkat umur (cth: 5 Tahun, 6 Tahun, 9 Tahun).
- \`attended\` (Status): Boolean (\`true\` / \`false\`).
- \`attendedAt\` (Timestamp): Tarikh dan masa kehadiran disahkan (format: \`YYYY-MM-DD HH:mm:ss\`).

#### B. Peraturan Pengesahan (Validation Rules)
1. **Panjang Minimum Input:** Carian memerlukan sekurang-kurangnya 3 aksara bagi mengelakkan beban carian kosong.
2. **Kalis Format Telefon (Phone Sanitization):** Semua aksara bukan angka (tanda sengkang, ruang kosong, tanda kurung) dibuang sebelum padanan.
3. **Pemberian ID Unik Bersiri:**
   - Kategori Tadika / Prasekolah: Wajib menerima ID format \`T\` + 3 digit (cth: \`T001\` hingga \`T022\`).
   - Kategori Sekolah Rendah: Wajib menerima ID format \`R\` + 3 digit (cth: \`R001\` hingga \`R022\`).
4. **Idempotensi Kehadiran:** Jika peserta telah disahkan hadir, penekanan butang ulangan tidak membatalkan atau merosakkan rekod, sebaliknya terus memaparkan semula Slip Nombor ID.

#### C. Aliran Skrin (Screen Flow)
\`\`\`
[Skrin Kiosk: Kotak Carian Utama]
       │
       ▼ (Pengguna menaip nama/no tel)
[Algoritma Carian Sebahagian (Partial Match)]
       │
       ├─── Tiada Padanan ──► [Paparan Amaran: Rujuk Kaunter Urus Setia HSAH]
       │
       └─── Dijumpai ──► [Kad Hasil Carian: Info Murid & Status Semasa]
                               │
                               ▼ (Tekan "Sahkan Kehadiran Saya")
                    [Kemas Kini Google Sheet: Hadir = TRUE & Masa]
                               │
                               ▼
               [Slip Digital: Nombor ID Besar (T001 / R001)]
               • Paparan Amaran: "Tulis nombor di belakang karya sahaja!"
               • Butang Cetak / Simpan Slip
\`\`\`

---

### 3. SPESIFIKASI PAUTAN 2: PORTAL PANEL HAKIM (PEMARKAHAN BUTA)

#### A. Medan Data (Data Fields)
- \`juryId\` (Sesi Juri): Kod pengenalan juri (\`JUR-01\`, \`JUR-02\`, \`JUR-03\`).
- \`participantId\` (Input Carian): Nombor ID karya (\`T001\` - \`T022\` atau \`R001\` - \`R022\`).
- \`category\` (Sistem): \`TADIKA\` atau \`SEKOLAH_RENDAH\` (dikesan automatik dari huruf awalan).
- \`kreativiti\` (Markah): Integer 0 hingga 25.
- \`kombinasiWarna\` (Markah): Integer 0 hingga 25.
- \`kekemasan\` (Markah): Integer 0 hingga 30.
- \`persembahan\` (Markah): Integer 0 hingga 20.
- \`totalScore\` (Kiraan Automatik): Integer 0 hingga 100 (\`kreativiti + kombinasiWarna + kekemasan + persembahan\`).
- \`notes\` (Pilihan): Catatan ringkas ulasan karya.
- \`submittedAt\` (Timestamp): Masa penyerahan markah.

#### B. Peraturan Pengesahan (Validation Rules)
1. **Blind Marking Strict Rule (Kerahsiaan Identiti):**
   - Paparan borang hakim **DILARANG SAMA SEKALI** memaparkan medan \`name\`, \`parentName\`, atau \`school\`.
   - Hanya \`participantId\` dan \`category\` sahaja dibenarkan terpapar.
2. **Had Nilai Sempadan Kriteria (Range Clamping):**
   - Kreativiti & Keaslian: $0 \\le markah \\le 25$.
   - Kombinasi & Kesesuaian Warna: $0 \\le markah \\le 25$.
   - Kekemasan & Kawalan Mewarna: $0 \\le markah \\le 30$.
   - Persembahan Keseluruhan: $0 \\le markah \\le 20$.
3. **Kiraan Jumlah Automatik:** Nilai jumlah dikira secara langsung (*real-time reactive sum*) tanpa perlu butang pengiraan berasingan.
4. **Pencegahan Pemarkahan Berganda (Duplicate Prevention):**
   - Sebelum memaparkan borang aktif, sistem menyemak jadual markah untuk kunci gabungan \`participantId + juryId\`.
   - Jika wujud: Paparan ditukar serta-merta kepada status **TERKUNCI (Read-Only)** dengan notis amaran masa penyerahan terdahulu.

#### C. Aliran Skrin (Screen Flow)
\`\`\`
[Log Masuk Tablet: Pilih Profil Juri]
       │
       ▼
[Input Nombor Karya: Cth T001 / R001]
       │
       ├─── Semakan Rekod Sedia Ada ──► (Wujud?) ──► [Borang Terkunci (Read-Only)]
       │                                            "Anda telah menilai karya ini"
       │
       └─── Belum Dinilai ──► [Borang Buta: 4 Kriteria & Slider Markah]
                                     │
                                     ▼ (Kiraan Automatik /100)
                              [Sahkan & Hantar Markah]
                                     │
                                     ▼
                       [Kemas Kini Baris Pemarkahan Google Sheet]
                                     │
                                     ▼
                    [Tab Papan Markah Kategori: T vs R Terasing]
\`\`\`

---

### 4. SPESIFIKASI PAUTAN 3: PORTAL URUS SETIA / PENTADBIR

#### 4 Tab Utama Dashboard Pentadbir:
1. **Tab 1: Senarai Peserta Mengikut Kategori (Participant List by Category)**
   - Paparan jadual penuh: Bil, ID Peserta, Nama Murid, Nama Penjaga, No Tel, Sekolah, Umur, Hadir, dan Rekod Kertas Ganti (Borang C).
   - Penapis kategori: Semua, Tadika sahaja (Siri T), Sekolah Rendah sahaja (Siri R).
   - Butang pendaftaran peserta baharu (walk-in) dan eksport CSV.
2. **Tab 2: Senarai Kehadiran Disahkan (Verified Attendance List)**
   - Menapis senarai peserta yang bertanda \`Hadir = TRUE\`.
   - Kad metrik kadar kehadiran: Jumlah hadir, peratusan Tadika, dan peratusan Sekolah Rendah.
   - Fungsi cetak senarai pendaftaran rasmi (Borang B).
3. **Tab 3: Senarai Nama Juri & Pemantauan (Jury Name List & Monitoring)**
   - Senarai 3 juri rasmi (Pn. Zahartini, En. Ahmad Faiz, Pn. Norazlina).
   - Penunjuk kemajuan penilaian: Bilangan karya dinilai berbanding jumlah peserta hadir.
   - Fungsi audit markah dan kebenaran nyahkunci (*override unlock*) sekiranya juri membuat kesilapan teknikal.
4. **Tab 4: Top 10 Pemenang Mengikut Kategori (Top 10 Winners per Category)**
   - Pengasingan mutlak: Top 10 Tadika (T001-T022) dan Top 10 Sekolah Rendah (R001-R022).
   - Gelaran anugerah: Johan (1), Naib Johan (2), Tempat Ketiga (3), Saguhati 4 hingga 10.
   - Penunjuk kaedah pemutus seri rasmi yang digunakan.

---

### 5. SKEMA PANGKALAN DATA GOOGLE SHEETS

Sistem menggunakan satu fail Google Spreadsheet bertajuk **"Database Pertandingan Mewarna HSAH 2026"** dengan helaian-helaian berikut:

#### Jadual 1: \`Peserta\` (Master Participants Table)
| Lajur | Nama Medan | Jenis Data | Catatan / Contoh |
|---|---|---|---|
| A | ID Peserta | Text (PK) | \`T001\` hingga \`T022\`, \`R001\` hingga \`R022\` |
| B | Bil | Integer | 1, 2, 3... |
| C | Kategori | Text | \`TADIKA\` atau \`SEKOLAH_RENDAH\` |
| D | Nama Murid | Text | NUR AYRIS ZINNIRAH BINTI MOHAMAD HAFIZ |
| E | Nama Ibu/Bapa | Text | MOHAMAD HAFIZ BIN MOHAMAD KHAYAPI |
| F | No Telefon | Text | \`014-2700827\` |
| G | Nama Sekolah/Tadika | Text | TADIKA PINTAR STRAWBERI |
| H | Umur | Text | 6 TAHUN |
| I | Hadir | Boolean | \`TRUE\` / \`FALSE\` |
| J | Masa Hadir | DateTime | \`2026-11-14 08:15:22\` |
| K | Kertas Ganti | Text | \`TIDAK\` atau \`YA: Kertas terkoyak\` |

#### Jadual 2: \`Pemarkahan\` (Jury Scores Table)
| Lajur | Nama Medan | Jenis Data | Catatan / Contoh |
|---|---|---|---|
| A | ID Skor | Text (PK) | \`SC-T001-JUR01\` |
| B | No Peserta | Text (FK) | \`T001\` |
| C | Kategori | Text | \`TADIKA\` |
| D | ID Juri | Text (FK) | \`JUR-01\` |
| E | Nama Juri | Text | Pn. Zahartini binti Ibrahim |
| F | Kreativiti | Integer | 0 hingga 25 |
| G | Kombinasi Warna | Integer | 0 hingga 25 |
| H | Kekemasan Mewarna | Integer | 0 hingga 30 |
| I | Persembahan | Integer | 0 hingga 20 |
| J | Jumlah Markah | Integer | Formula / Auto-calc (Maks 100) |
| K | Catatan Juri | Text | Ulasan ringkas hasil seni |
| L | Masa Dinilai | DateTime | \`2026-11-14 10:45:10\` |

#### Jadual 3: \`Juri\` (Jury Roster Table)
| Lajur | Nama Medan | Jenis Data | Catatan / Contoh |
|---|---|---|---|
| A | ID Juri | Text (PK) | \`JUR-01\`, \`JUR-02\`, \`JUR-03\` |
| B | Nama Juri | Text | Pn. Zahartini binti Ibrahim |
| C | Jawatan / Agensi | Text | Ketua Juri / Jurupulih HSAH |
| D | Kod PIN Akses | Text | \`1234\` (Akses Tablet) |

---

### 6. PERATURAN LOGIK PERNIAGAAN & ALGORITMA

#### A. Algoritma Carian Sebahagian (Partial Match Search)
1. **Input Normalization:** Rentetan carian dipotong ruang hadapan/belakang (*trim*) dan ditukar kepada huruf kecil (*lowercase*).
2. **Pembersihan No Telefon:** Segala simbol buang: \`cleanedPhone = query.replace(/\\D/g, '')\`. Jika bermula \`60\`, dilaraskan kepada \`0\`.
3. **Pencarian Dwiarah:** Sistem menyemak padanan \`includes\` pada:
   - Nama Murid
   - Nama Penjaga
   - No Telefon (jika input $\\ge 3$ digit)
   - ID Peserta (cth: "T001" atau "T-001")

#### B. Pencegahan Pemarkahan Berganda (Duplicate Scoring Prevention)
Untuk mengekalkan integriti penghakiman, gabungan \`(participantId, juryId)\` adalah unik (*compound unique key*):
$$\\text{Kunci Skor} = \\text{ID Peserta} + \\text{"\\_"} + \\text{ID Juri}$$
Apabila juri memuatkan karya:
1. Sistem menyemak sama ada baris dengan kunci ini telah wujud dalam Jadual \`Pemarkahan\`.
2. Jika wujud:
   - Butang "Hantar Markah" dinyahaktifkan (*disabled*).
   - Banner amaran kuning dipaparkan: *"Anda telah menilai peserta ini pada [Masa] dengan markah [X]/100"*.
   - Markah sedia ada dipaparkan secara statik untuk semakan sahaja.
3. Hanya Pentadbir (Urus Setia) dalam Tab 3 dibenarkan memadam atau menyahkunci rekod skor jika wujud justifikasi pembetulan.

#### C. Algoritma Susunan & Pemutus Seri (Section C Tie-Breaker Logic)
Markah disusun dari tertinggi ke terendah secara berasingan untuk Kategori Tadika dan Sekolah Rendah:
$$\\text{Kumpulan Data} = \\text{Filter by Category (Tadika / Sekolah Rendah)}$$
Sekiranya dua atau lebih peserta memperoleh Jumlah Purata Markah yang sama, penentuan kedudukan dibuat secara automatik mengikut turutan hierarki Seksyen C PDF HSAH:
1. **Langkah 1:** Semak semula jumlah markah keseluruhan.
2. **Langkah 2 (Keutamaan Pertama):** Bandingkan markah kriteria **Kekemasan & Kawalan Mewarna (30 markah)**. Peserta dengan markah lebih tinggi diletakkan di atas.
3. **Langkah 3 (Keutamaan Kedua):** Jika masih seri, bandingkan markah **Kreativiti & Keaslian (25 markah)**.
4. **Langkah 4 (Keutamaan Ketiga):** Jika masih seri, bandingkan markah **Kombinasi & Kesesuaian Warna (25 markah)**.
5. **Langkah 5 (Keutamaan Keempat):** Jika masih seri, sistem menandakan status *"Seri Penuh - Perbincangan Panel Hakim"* untuk pengesahan ketua juri.

---

### 7. PANDUAN PELAKSANAAN GOOGLE SITES & GOOGLE APPS SCRIPT

#### Langkah 1: Sediakan Google Sheets
1. Bina Google Sheet bertajuk **"Database Pertandingan Mewarna HSAH 2026"**.
2. Masukkan 22 peserta Tadika (T001 - T022) dan 22 peserta Sekolah Rendah (R001 - R022).

#### Langkah 2: Pasang Google Apps Script
1. Klik **Extensions > Apps Script**.
2. Masukkan kod \`Code.gs\` yang disediakan dalam portal ini.
3. Klik **Deploy > New Deployment > Web App**.
   - **Execute as:** \`Me\`
   - **Who has access:** \`Anyone\`
4. Salin URL Web App yang dijana.

#### Langkah 3: Bina Google Sites
1. Buka [sites.google.com](https://sites.google.com) dan cipta tapak baharu: **"Pertandingan Mewarna HSAH 2026"**.
2. Cipta 3 Halaman Berasingan:
   - **Halaman 1:** \`/kehadiran\` (Sematkan Kiosk Ibu Bapa melalui blok 'Embed URL').
   - **Halaman 2:** \`/penilaian-juri\` (Sematkan Portal Pemarkahan Hakim).
   - **Halaman 3:** \`/urus-setia\` (Sematkan Dashboard Pentadbir; lindungi halaman ini dengan kebenaran emel Google khusus urus setia).
3. Uji paparan pada tablet iPad / Android di tapak acara.
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullSpecMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([fullSpecMarkdown], { type: 'text/markdown;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'Spesifikasi_Sistem_Mewarna_HSAH_2026.md';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dokumentasi Seni Bina & Spesifikasi Rasmi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Spesifikasi Lengkap Sistem (Google Sites + Sheets)
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Dokumentasi lengkap meliputi skema pangkalan data, medan data 3 pautan peranan, peraturan pengesahan, aliran skrin, dan logik pemutus seri HSAH 2026.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow transition"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Telah Disalin!' : 'Salin Markdown'}
          </button>
          <button
            onClick={handleDownload}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            title="Muat Turun Fail .md"
          >
            <Download className="w-4 h-4" />
            .MD
          </button>
          <button
            onClick={() => window.print()}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            title="Cetak Dokumentasi"
          >
            <Printer className="w-4 h-4" />
            Cetak
          </button>
        </div>
      </div>

      {/* Structured Document Body */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 text-slate-800 space-y-8 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
              1
            </span>
            <h3 className="text-xl font-bold text-slate-900">
              Seni Bina 3 Pautan Peranan (Google Sites Architecture)
            </h3>
          </div>

          <p className="text-sm text-slate-600">
            Sistem beroperasi pada <strong>Google Sites</strong> sebagai platform gerbang web dengan 3 pautan URL khas yang boleh diakses melalui tablet tablet-mesra di reruai (kiosk/meja hakim/urus setia), manakala fail <strong>Google Sheets</strong> bertindak sebagai pangkalan data awan berpusat melalui Google Apps Script Web App JSON API.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">Pautan 1: Ibu Bapa</span>
              <h4 className="font-bold text-slate-900 text-sm">Portal Sah Kehadiran & ID</h4>
              <p className="text-xs text-slate-600">
                Carian pantas menggunakan nama anak atau nombor telefon. Menjana Slip Digital dan Nombor ID Meja (T001 bagi Tadika, R001 bagi Sekolah Rendah).
              </p>
              <div className="font-mono text-[11px] text-blue-700 bg-white p-2 rounded border border-blue-100 truncate">
                /kehadiran-peserta
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Pautan 2: Panel Hakim</span>
              <h4 className="font-bold text-slate-900 text-sm">Portal Penilaian Buta (Blind)</h4>
              <p className="text-xs text-slate-600">
                Hakim memasukkan nombor karya tanpa melihat nama anak. Memasukkan markah bagi 4 kriteria rasmi HSAH (100 markah), kiraan automatik, dan kunci pemarkahan berganda.
              </p>
              <div className="font-mono text-[11px] text-amber-700 bg-white p-2 rounded border border-amber-100 truncate">
                /portal-hakim-penilaian
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Pautan 3: Pentadbir</span>
              <h4 className="font-bold text-slate-900 text-sm">Dashboard Urus Setia</h4>
              <p className="text-xs text-slate-600">
                4 tab bersepadu: Senarai Peserta Kategori, Kehadiran Disahkan, Pemantauan Hakim, dan Senarai 10 Pemenang Terbaik dengan penentuan pemutus seri rasmi.
              </p>
              <div className="font-mono text-[11px] text-emerald-700 bg-white p-2 rounded border border-emerald-100 truncate">
                /urus-setia-pentadbir
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
              2
            </span>
            <h3 className="text-xl font-bold text-slate-900">
              Spesifikasi Pautan 1: Portal Ibu Bapa
            </h3>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-3">Komponen</th>
                  <th className="p-3">Spesifikasi Teknikal</th>
                  <th className="p-3">Catatan / Validasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-bold text-slate-900">Medan Carian Input</td>
                  <td className="p-3">Nama Murid ATAU No Telefon Penjaga ATAU No ID</td>
                  <td className="p-3">Minimum 3 aksara. Menyokong partial match.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900">Logik Padanan Telefon</td>
                  <td className="p-3">Semua simbol bukan nombor disingkirkan: <code>014-2700827</code> $\rightarrow$ <code>0142700827</code></td>
                  <td className="p-3">Padanan fleksibel walaupun ibu bapa tidak menaip sengkang.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900">Nombor ID Peserta</td>
                  <td className="p-3">Tadika: <code>T001 - T022</code> • Sekolah Rendah: <code>R001 - R022</code></td>
                  <td className="p-3">Dipaparkan besar pada skrin dan slip pendaftaran digital.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900">Tindakan Pengesahan</td>
                  <td className="p-3">Butang satu sentuhan: "Sahkan Kehadiran Saya"</td>
                  <td className="p-3">Mengemaskini status Hadir = TRUE dan merekodkan cap masa.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900">Peringatan Khas</td>
                  <td className="p-3 font-semibold text-amber-800">
                    "Tulis ID pada pelekat dan belakang kertas lukisan sahaja. Jangan tulis nama di hadapan!"
                  </td>
                  <td className="p-3">Memastikan syarat blind judging HSAH dipatuhi.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
              3
            </span>
            <h3 className="text-xl font-bold text-slate-900">
              Spesifikasi Pautan 2: Portal Panel Hakim (Blind Scoring)
            </h3>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-3">Kriteria Penilaian</th>
                  <th className="p-3">Huraian Rubrik (Daripada Borang HSAH 2026)</th>
                  <th className="p-3 text-center">Markah Maks.</th>
                  <th className="p-3">Peranan Penentu Seri</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-bold text-slate-900">1. Kreativiti & Keaslian</td>
                  <td className="p-3">Idea, gaya dan penggunaan warna yang kreatif; hasil kerja menunjukkan pilihan dan usaha peserta sendiri.</td>
                  <td className="p-3 text-center font-bold font-mono">25</td>
                  <td className="p-3">Penentu Langkah 3</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900">2. Kombinasi & Kesesuaian Warna</td>
                  <td className="p-3">Pemilihan dan padanan warna yang sesuai serta penggunaan warna yang menarik.</td>
                  <td className="p-3 text-center font-bold font-mono">25</td>
                  <td className="p-3">Penentu Langkah 4</td>
                </tr>
                <tr className="bg-amber-50/50">
                  <td className="p-3 font-bold text-amber-950">3. Kekemasan & Kawalan Mewarna</td>
                  <td className="p-3 text-amber-900">Kawalan alat mewarna, sapuan/garisan yang kemas dan usaha mewarna dalam ruang gambar.</td>
                  <td className="p-3 text-center font-bold font-mono text-amber-900">30</td>
                  <td className="p-3 font-bold text-amber-800">Keutamaan Utama (Langkah 2)</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900">4. Persembahan Keseluruhan</td>
                  <td className="p-3">Hasil akhir kelihatan lengkap, seimbang dan menunjukkan usaha yang bersungguh-sungguh.</td>
                  <td className="p-3 text-center font-bold font-mono">20</td>
                  <td className="p-3">Langkah 5 (Konsensus)</td>
                </tr>
                <tr className="bg-slate-100 font-bold">
                  <td className="p-3 text-slate-900">JUMLAH KESELURUHAN</td>
                  <td className="p-3">Pengiraan automatik secara dinamik sebaik sahaja hakim menggerakkan slider atau menaip markah.</td>
                  <td className="p-3 text-center font-mono text-emerald-700 text-sm">100</td>
                  <td className="p-3 text-emerald-800">Kriteria Kedudukan Asas</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <strong>Mekanisme Pencegahan Pemarkahan Berganda (Duplicate Lock):</strong>
            <p>
              Setiap penyerahan menyemak gabungan <code>participantId + juryId</code>. Jika juri telah menilai nombor peserta berkenaan, sistem serta-merta mengunci borang kepada mod baca sahaja (Read-Only) dan memaparkan tarikh serta masa markah terdahulu diserahkan. Ini menghalang penindihan tidak sengaja pada tablet.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
              4
            </span>
            <h3 className="text-xl font-bold text-slate-900">
              Spesifikasi Pautan 3: Portal Urus Setia & Keputusan Pemenang
            </h3>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <p>
              Portal Urus Setia menyediakan 4 tab pandangan teras yang memenuhi keperluan pengurusan hari pertandingan:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>Tab Senarai Peserta Mengikut Kategori:</strong> Paparan menyeluruh maklumat peserta, status hadir, dan borang penggantian kertas ganti mengikut Seksyen C PDF.
              </li>
              <li>
                <strong>Tab Senarai Kehadiran Disahkan:</strong> Senarai cetak rasmi peserta yang telah hadir bersama statistik peratusan kehadiran setiap kategori.
              </li>
              <li>
                <strong>Tab Senarai & Pemantauan Juri:</strong> Memantau bilangan karya yang telah selesai dinilai oleh ketiga-tiga orang hakim, serta log audit markah untuk semakan kualiti.
              </li>
              <li>
                <strong>Tab Top 10 Pemenang Per Kategori:</strong> Pemenang Johan, Naib Johan, Tempat Ketiga, dan Saguhati 4-10 dipaparkan berasingan bagi Tadika dan Sekolah Rendah, lengkap dengan catatan penentuan pemutus seri.
              </li>
            </ol>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
              5
            </span>
            <h3 className="text-xl font-bold text-slate-900">
              Skema Pangkalan Data Google Sheets
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-slate-600">
              Pangkalan data Google Sheet terdiri daripada 3 helaian utama yang dihubungkan melalui kekunci rujukan:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="font-bold text-blue-700 mb-1">Tab 1: Peserta</div>
                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <div>• ID Peserta (PK)</div>
                  <div>• Bil</div>
                  <div>• Kategori</div>
                  <div>• Nama Murid</div>
                  <div>• Nama Ibu/Bapa</div>
                  <div>• No Telefon</div>
                  <div>• Sekolah/Tadika</div>
                  <div>• Umur</div>
                  <div>• Hadir (Boolean)</div>
                  <div>• Masa Hadir</div>
                  <div>• Kertas Ganti</div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="font-bold text-amber-700 mb-1">Tab 2: Pemarkahan</div>
                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <div>• ID Skor (PK)</div>
                  <div>• No Peserta (FK)</div>
                  <div>• Kategori</div>
                  <div>• ID Juri (FK)</div>
                  <div>• Nama Juri</div>
                  <div>• Kreativiti (0-25)</div>
                  <div>• Warna (0-25)</div>
                  <div>• Kekemasan (0-30)</div>
                  <div>• Persembahan (0-20)</div>
                  <div>• Jumlah (0-100)</div>
                  <div>• Catatan Juri</div>
                  <div>• Masa Dinilai</div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="font-bold text-emerald-700 mb-1">Tab 3: Juri</div>
                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <div>• ID Juri (PK)</div>
                  <div>• Nama Juri</div>
                  <div>• Jawatan / Agensi</div>
                  <div>• PIN Keselamatan</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
