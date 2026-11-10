export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT BACKEND: SISTEM PENDAFTARAN & PEMARKAHAN MEWARNA HSAH 2026
 * Platform: Google Sheets (Database) + Google Sites (Embed Web Interface)
 * Unit Terapi Carakerja, Hospital Sultan Abdul Halim (HSAH)
 * =========================================================================
 * 
 * CARA SETUP:
 * 1. Buka Google Sheet baru, namakan: "Database Pertandingan Mewarna HSAH 2026".
 * 2. Cipta 3 tab sheet:
 *    - Tab 1: "Peserta"
 *    - Tab 2: "Pemarkahan"
 *    - Tab 3: "Juri"
 * 3. Buka Extensions > Apps Script.
 * 4. Salin & tampal keseluruhan kod di bawah ke dalam Code.gs.
 * 5. Jalankan fungsi 'initSetupDatabase()' sekali untuk cipta header & data permulaan.
 * 6. Klik Deploy > New deployment > Select type: Web app.
 *    - Execute as: Me (your Google account)
 *    - Who has access: Anyone
 * 7. Salin URL Web App yang terhasil dan tampal ke dalam Google Sites.
 */

const SHEET_PESERTA = "Peserta";
const SHEET_MARKAH = "Pemarkahan";
const SHEET_JURI = "Juri";

// 1. INITIAL SETUP FUNCTION
function initSetupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Setup Sheet Peserta
  let sheetP = ss.getSheetByName(SHEET_PESERTA) || ss.insertSheet(SHEET_PESERTA);
  if (sheetP.getLastRow() === 0) {
    sheetP.appendRow([
      "ID Peserta", "Bil", "Kategori", "Nama Murid", "Nama Ibu/Bapa", 
      "No Telefon", "Nama Sekolah/Tadika", "Umur", "Hadir", "Masa Hadir", "Kertas Ganti"
    ]);
    sheetP.getRange(1, 1, 1, 11).setBackground("#1e3a8a").setFontColor("#ffffff").setFontWeight("bold");
  }
  
  // Setup Sheet Pemarkahan
  let sheetM = ss.getSheetByName(SHEET_MARKAH) || ss.insertSheet(SHEET_MARKAH);
  if (sheetM.getLastRow() === 0) {
    sheetM.appendRow([
      "ID Skor", "No Peserta", "Kategori", "ID Juri", "Nama Juri", 
      "Kreativiti (25)", "Warna (25)", "Kekemasan (30)", "Persembahan (20)", 
      "Jumlah (100)", "Catatan", "Masa Dinilai"
    ]);
    sheetM.getRange(1, 1, 1, 12).setBackground("#047857").setFontColor("#ffffff").setFontWeight("bold");
  }
  
  // Setup Sheet Juri
  let sheetJ = ss.getSheetByName(SHEET_JURI) || ss.insertSheet(SHEET_JURI);
  if (sheetJ.getLastRow() === 0) {
    sheetJ.appendRow(["ID Juri", "Nama Juri", "Jawatan / Agensi", "PIN"]);
    sheetJ.getRange(1, 1, 1, 4).setBackground("#4b5563").setFontColor("#ffffff").setFontWeight("bold");
    sheetJ.appendRow(["JUR-01", "Pn. Zahartini binti Ibrahim", "Ketua Juri / Jurupulih Carakerja HSAH", "1234"]);
    sheetJ.appendRow(["JUR-02", "En. Ahmad Faiz bin Zainuddin", "Guru Seni Visual SK Bandar Laguna Merbok", "2345"]);
    sheetJ.appendRow(["JUR-03", "Pn. Norazlina binti Ismail", "Pegawai Seni Kreatif PPD Kuala Muda / Yan", "3456"]);
  }
}

// 2. HTTP GET REQUESTS (Querying Data)
function doGet(e) {
  const action = e.parameter.action;
  let result = { success: false, message: "Invalid action" };

  try {
    if (action === "searchParent") {
      result = handleParentSearch(e.parameter.query);
    } else if (action === "getJuries") {
      result = handleGetJuries();
    } else if (action === "checkJurySubmission") {
      result = handleCheckJurySubmission(e.parameter.participantId, e.parameter.juryId);
    } else if (action === "getLeaderboard") {
      result = handleGetLeaderboard(e.parameter.category);
    } else if (action === "getAdminOverview") {
      result = handleGetAdminOverview();
    }
  } catch (error) {
    result = { success: false, error: error.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// 3. HTTP POST REQUESTS (Submitting Data)
function doPost(e) {
  let postData;
  try {
    postData = JSON.parse(e.postData.contents);
  } catch (err) {
    postData = e.parameter;
  }
  
  const action = postData.action;
  let result = { success: false, message: "Invalid POST action" };

  try {
    if (action === "verifyAttendance") {
      result = handleVerifyAttendance(postData.participantId);
    } else if (action === "submitScore") {
      result = handleSubmitScore(postData);
    } else if (action === "recordReplacementPaper") {
      result = handleRecordReplacement(postData.participantId, postData.reason);
    }
  } catch (error) {
    result = { success: false, error: error.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// --- LOGIC: PARENT PARTIAL SEARCH ---
function handleParentSearch(query) {
  if (!query) return { success: true, data: [] };
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_PESERTA);
  const data = sheet.getDataRange().getValues();
  const cleanQ = query.toString().trim().toLowerCase().replace(/\\D/g, "");
  const textQ = query.toString().trim().toLowerCase();
  
  let matches = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const id = String(row[0]);
    const name = String(row[3]).toLowerCase();
    const parentName = String(row[4]).toLowerCase();
    const phone = String(row[5]);
    const cleanPhone = phone.replace(/\\D/g, "");
    
    let isMatch = false;
    if (id.toLowerCase().includes(textQ)) isMatch = true;
    if (name.includes(textQ)) isMatch = true;
    if (parentName.includes(textQ)) isMatch = true;
    if (cleanQ.length >= 3 && cleanPhone.includes(cleanQ)) isMatch = true;
    
    if (isMatch) {
      matches.push({
        id: row[0],
        bil: row[1],
        category: row[2],
        name: row[3],
        parentName: row[4],
        phone: row[5],
        school: row[6],
        age: row[7],
        attended: row[8] === true || String(row[8]).toLowerCase() === "true" || String(row[8]) === "YA",
        attendedAt: row[9] || ""
      });
    }
  }
  return { success: true, data: matches };
}

// --- LOGIC: VERIFY ATTENDANCE ---
function handleVerifyAttendance(participantId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_PESERTA);
  const data = sheet.getDataRange().getValues();
  const now = Utilities.formatDate(new Date(), "Asia/Kuala_Lumpur", "yyyy-MM-dd HH:mm:ss");
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).toUpperCase() === String(participantId).toUpperCase()) {
      sheet.getRange(i + 1, 9).setValue(true); // Column I: Hadir
      sheet.getRange(i + 1, 10).setValue(now); // Column J: Masa Hadir
      return { success: true, participantId: participantId, timestamp: now };
    }
  }
  return { success: false, message: "Peserta tidak ditemui" };
}

// --- LOGIC: PREVENT DUPLICATE JURY SCORING ---
function handleCheckJurySubmission(participantId, juryId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_MARKAH);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const rowPId = String(data[i][1]).toUpperCase();
    const rowJId = String(data[i][3]).toUpperCase();
    if (rowPId === String(participantId).toUpperCase() && rowJId === String(juryId).toUpperCase()) {
      return {
        alreadyScored: true,
        score: {
          scoreId: data[i][0],
          participantId: data[i][1],
          kreativiti: data[i][5],
          warna: data[i][6],
          kekemasan: data[i][7],
          persembahan: data[i][8],
          totalScore: data[i][9],
          notes: data[i][10],
          submittedAt: data[i][11]
        }
      };
    }
  }
  return { alreadyScored: false };
}

// --- LOGIC: SUBMIT JURY MARKS (BLIND SCORING) ---
function handleSubmitScore(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetMarkah = ss.getSheetByName(SHEET_MARKAH);
  const check = handleCheckJurySubmission(payload.participantId, payload.juryId);
  
  if (check.alreadyScored) {
    return { success: false, message: "Juri telah menilai peserta ini sebelum ini. Penilaian pendua dihalang!" };
  }
  
  // Validation bounds
  const k = Math.min(25, Math.max(0, Number(payload.kreativiti) || 0));
  const w = Math.min(25, Math.max(0, Number(payload.warna) || 0));
  const kk = Math.min(30, Math.max(0, Number(payload.kekemasan) || 0));
  const p = Math.min(20, Math.max(0, Number(payload.persembahan) || 0));
  const total = k + w + kk + p;
  
  const scoreId = "SC-" + payload.participantId + "-" + payload.juryId;
  const now = Utilities.formatDate(new Date(), "Asia/Kuala_Lumpur", "yyyy-MM-dd HH:mm:ss");
  
  sheetMarkah.appendRow([
    scoreId,
    payload.participantId,
    payload.category,
    payload.juryId,
    payload.juryName,
    k,
    w,
    kk,
    p,
    total,
    payload.notes || "",
    now
  ]);
  
  return { success: true, scoreId: scoreId, totalScore: total, submittedAt: now };
}
`;
