// pdfTemplate.js — Template Laporan Resmi BGN SP-MBG
// Mengacu pada Juknis BGN 2025 & Format Formulir SPPG-MBG-QC

// Database Yield & BDD (Bahan Dapat Dimakan) Kemenkes & Juknis BGN
const YIELD_DATABASE = {
  // Karbohidrat
  'beras': { bdd: 1.0, cookingYield: 2.5, category: 'Karbohidrat' }, // Beras jadi Nasi 2.5x
  'singkong': { bdd: 0.85, cookingYield: 0.95, category: 'Karbohidrat' },
  'kentang': { bdd: 0.85, cookingYield: 0.95, category: 'Karbohidrat' },
  'ubi': { bdd: 0.85, cookingYield: 0.95, category: 'Karbohidrat' },
  'talas': { bdd: 0.85, cookingYield: 0.95, category: 'Karbohidrat' },
  'jagung': { bdd: 0.60, cookingYield: 0.95, category: 'Karbohidrat' },
  'roti': { bdd: 1.0, cookingYield: 1.0, category: 'Karbohidrat' },
  'mie': { bdd: 1.0, cookingYield: 1.5, category: 'Karbohidrat' },
  
  // Protein
  'ayam': { bdd: 0.80, cookingYield: 0.75, category: 'Protein Hewani' }, // susut masak 25%
  'daging': { bdd: 1.0, cookingYield: 0.70, category: 'Protein Hewani' }, // susut 30%
  'sapi': { bdd: 1.0, cookingYield: 0.70, category: 'Protein Hewani' },
  'kambing': { bdd: 1.0, cookingYield: 0.70, category: 'Protein Hewani' },
  'ikan': { bdd: 0.70, cookingYield: 0.80, category: 'Protein Hewani' },
  'lele': { bdd: 0.65, cookingYield: 0.80, category: 'Protein Hewani' },
  'kembung': { bdd: 0.70, cookingYield: 0.80, category: 'Protein Hewani' },
  'bandeng': { bdd: 0.70, cookingYield: 0.80, category: 'Protein Hewani' },
  'nila': { bdd: 0.65, cookingYield: 0.80, category: 'Protein Hewani' },
  'patin': { bdd: 0.70, cookingYield: 0.80, category: 'Protein Hewani' },
  'tuna': { bdd: 1.0, cookingYield: 0.80, category: 'Protein Hewani' },
  'salmon': { bdd: 1.0, cookingYield: 0.80, category: 'Protein Hewani' },
  'telur': { bdd: 0.88, cookingYield: 1.0, category: 'Protein Hewani' }, // kulit 12%
  'puyuh': { bdd: 0.88, cookingYield: 1.0, category: 'Protein Hewani' },
  'bebek': { bdd: 0.88, cookingYield: 1.0, category: 'Protein Hewani' },
  'udang': { bdd: 0.70, cookingYield: 0.85, category: 'Protein Hewani' },
  'cumi': { bdd: 0.85, cookingYield: 0.80, category: 'Protein Hewani' },
  'kerang': { bdd: 0.40, cookingYield: 0.85, category: 'Protein Hewani' },
  'tempe': { bdd: 1.0, cookingYield: 0.95, category: 'Protein Nabati' },
  'tahu': { bdd: 1.0, cookingYield: 0.90, category: 'Protein Nabati' },
  'kacang': { bdd: 1.0, cookingYield: 1.0, category: 'Protein Nabati' },
  'oncom': { bdd: 1.0, cookingYield: 0.95, category: 'Protein Nabati' },
  
  // Sayuran
  'bayam': { bdd: 0.65, cookingYield: 0.60, category: 'Sayuran' }, // susut penyiangan 35%, layu 40%
  'kangkung': { bdd: 0.65, cookingYield: 0.60, category: 'Sayuran' },
  'wortel': { bdd: 0.85, cookingYield: 0.90, category: 'Sayuran' },
  'buncis': { bdd: 0.90, cookingYield: 0.90, category: 'Sayuran' },
  'kol': { bdd: 0.85, cookingYield: 0.85, category: 'Sayuran' },
  'brokoli': { bdd: 0.80, cookingYield: 0.85, category: 'Sayuran' },
  'sawi': { bdd: 0.85, cookingYield: 0.70, category: 'Sayuran' },
  'labu': { bdd: 0.80, cookingYield: 0.90, category: 'Sayuran' },
  
  // Buah
  'pisang': { bdd: 0.65, cookingYield: 1.0, category: 'Buah' },
  'jeruk': { bdd: 0.70, cookingYield: 1.0, category: 'Buah' },
  'semangka': { bdd: 0.60, cookingYield: 1.0, category: 'Buah' },
  'pepaya': { bdd: 0.70, cookingYield: 1.0, category: 'Buah' },
  'melon': { bdd: 0.65, cookingYield: 1.0, category: 'Buah' }
};

function getYieldInfo(nama) {
  const lowercaseNama = nama.toLowerCase();
  for (const key in YIELD_DATABASE) {
    if (lowercaseNama.includes(key)) {
      return YIELD_DATABASE[key];
    }
  }
  return { bdd: 1.0, cookingYield: 1.0, category: 'Lainnya' };
}

// Database Alergen Utama
const ALLERGENS = {
  'udang': 'Seafood (Udang) - Risiko Alergi Tinggi',
  'cumi': 'Seafood (Cumi) - Risiko Alergi Tinggi',
  'ikan': 'Seafood (Ikan) - Risiko Alergi Sedang',
  'lele': 'Seafood (Ikan) - Risiko Alergi Sedang',
  'kembung': 'Seafood (Ikan) - Risiko Alergi Sedang',
  'bandeng': 'Seafood (Ikan) - Risiko Alergi Sedang',
  'nila': 'Seafood (Ikan) - Risiko Alergi Sedang',
  'patin': 'Seafood (Ikan) - Risiko Alergi Sedang',
  'tuna': 'Seafood (Ikan) - Risiko Alergi Sedang',
  'salmon': 'Seafood (Ikan) - Risiko Alergi Sedang',
  'telur': 'Telur Unggas - Risiko Alergi Sedang',
  'puyuh': 'Telur Unggas - Risiko Alergi Sedang',
  'bebek': 'Telur Unggas - Risiko Alergi Sedang',
  'roti': 'Gluten (Terigu) - Risiko Alergi Rendah/Sedang',
  'terigu': 'Gluten (Terigu) - Risiko Alergi Rendah/Sedang'
};

const ALTERNATIVES = {
  'Seafood': 'Daging Ayam Fillet Dada / Tempe Kedelai Murni',
  'Telur': 'Tahu Kuning Kediri / Tempe Kedelai Murni / Daging Ayam',
  'Gluten': 'Bahan Karbohidrat Kentang Rebus / Ubi Jalar Merah'
};

export function generateSPPGHtml({
  // Data produksi
  totalPorsi, siswaNum, spareNum, budgetNum, overhead,
  totBiaya, budgetBB, isBudgetOk, totalAnggaran,
  // Nutrisi
  totKal, totProt, totKar, totLem, totSerat,
  activeAkg, usia,
  // Items & ingredients
  selectedItems, itemsHtml, akgRowsHtml,
  // QC data
  qcRasa, qcAroma, qcTekstur, qcPenampilan,
  qcHigienitas, qcSuhu, qcWaktu,
  qcTesterName, qcNotes, qcStatus,
  consolidatedIngredients
}) {
  const tgl = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const jam = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  // 1. Build menu rows for organoleptik table
  const katLabels = { karbo: 'Makanan Pokok', protein: 'Lauk Hewani/Nabati', sayur: 'Sayuran', buah: 'Buah-buahan' };
  let organoRows = '';
  let rowNum = 1;
  selectedItems.forEach(item => {
    const katLabel = katLabels[item.kat] || item.kat;
    const isChecked = (param) => {
      return param ? '<span style="color:#166534;font-weight:bold;">✓ Baik</span>' : '<span style="color:#991b1b;">— Belum</span>';
    };
    organoRows += `
      <tr>
        <td style="border:1px solid #333;padding:6px 8px;text-align:center;">${rowNum}</td>
        <td style="border:1px solid #333;padding:6px 8px;">${katLabel}</td>
        <td style="border:1px solid #333;padding:6px 8px;font-weight:bold;">${item.nama}</td>
        <td style="border:1px solid #333;padding:6px 8px;text-align:center;">${isChecked(qcRasa)}</td>
        <td style="border:1px solid #333;padding:6px 8px;text-align:center;">${isChecked(qcPenampilan)}</td>
        <td style="border:1px solid #333;padding:6px 8px;text-align:center;">${isChecked(qcAroma)}</td>
        <td style="border:1px solid #333;padding:6px 8px;text-align:center;">${isChecked(qcTekstur)}</td>
        <td style="border:1px solid #333;padding:6px 8px;text-align:center;font-weight:bold;color:${qcStatus === 'layak' ? '#166534' : '#991b1b'};">
          ${qcStatus === 'layak' ? 'LAYAK' : 'TIDAK LAYAK'}
        </td>
      </tr>
    `;
    rowNum++;
  });

  const statusBadge = qcStatus === 'layak'
    ? '<span style="background:#166534;color:#fff;padding:4px 14px;border-radius:3px;font-weight:bold;font-size:13px;letter-spacing:0.5px;">✅ LAYAK DISTRIBUSI</span>'
    : '<span style="background:#991b1b;color:#fff;padding:4px 14px;border-radius:3px;font-weight:bold;font-size:13px;letter-spacing:0.5px;">⚠️ TUNDA / RE-COOK</span>';

  // 2. Yield & Waste Factor calculations
  let itemsTableHtml = '';
  let rowIdx = 1;
  
  if (consolidatedIngredients && consolidatedIngredients.length > 0) {
    consolidatedIngredients.forEach(ing => {
      const yieldInfo = getYieldInfo(ing.nama);
      const bddPct = yieldInfo.bdd * 100;
      const cookingYieldPct = yieldInfo.cookingYield * 100;
      
      const qtyPerPorsi = ing.qtyPerPorsi;
      const unit = ing.unit.toLowerCase();
      
      let grossStr = '—';
      let netStr = '—';
      let cookedStr = '—';
      
      if (unit === 'g' || unit.includes('g ')) {
        const totalGrossVal = qtyPerPorsi * totalPorsi;
        const totalNetVal = totalGrossVal * yieldInfo.bdd;
        const cookedValPerPorsi = qtyPerPorsi * yieldInfo.bdd * yieldInfo.cookingYield;
        
        grossStr = totalGrossVal >= 1000 ? `${(totalGrossVal/1000).toFixed(2).replace('.', ',')} kg` : `${Math.round(totalGrossVal)} g`;
        netStr = totalNetVal >= 1000 ? `${(totalNetVal/1000).toFixed(2).replace('.', ',')} kg` : `${Math.round(totalNetVal)} g`;
        cookedStr = `${Math.round(cookedValPerPorsi)} g`;
      } else {
        const totalGrossVal = qtyPerPorsi * totalPorsi;
        grossStr = `${Math.ceil(totalGrossVal)} ${ing.unit}`;
        netStr = `${Math.ceil(totalGrossVal * yieldInfo.bdd)} ${ing.unit}`;
        cookedStr = `${(qtyPerPorsi * yieldInfo.bdd * yieldInfo.cookingYield).toFixed(1)} ${ing.unit}`;
      }
      
      const boldStyle = ing.isUtama ? 'font-weight:bold;' : '';
      const badge = ing.isUtama ? ' <span style="font-size:7px;background:#1e3a8a;color:#93c5fd;padding:1px 4px;border-radius:2px;text-transform:uppercase;font-weight:800;">UTAMA</span>' : '';
      
      itemsTableHtml += `
        <tr style="${boldStyle}">
          <td style="border:1px solid #333;padding:5px 6px;text-align:center;">${rowIdx}</td>
          <td style="border:1px solid #333;padding:5px 6px;">${ing.nama}${badge}</td>
          <td style="border:1px solid #333;padding:5px 6px;text-align:center;">${bddPct}%</td>
          <td style="border:1px solid #333;padding:5px 6px;text-align:center;">${grossStr}</td>
          <td style="border:1px solid #333;padding:5px 6px;text-align:center;">${netStr}</td>
          <td style="border:1px solid #333;padding:5px 6px;text-align:center;">${cookingYieldPct === 100 ? '—' : cookingYieldPct + '%'}</td>
          <td style="border:1px solid #333;padding:5px 6px;text-align:center;font-weight:bold;">${cookedStr}</td>
          <td style="border:1px solid #333;padding:5px 6px;font-size:9.5px;color:#555;">${ing.catatan || '—'}</td>
        </tr>
      `;
      rowIdx++;
    });
  } else {
    itemsTableHtml = itemsHtml; // fallback
  }

  // 3. Allergen Screening
  const allergenNotes = [];
  selectedItems.forEach(item => {
    const lowercaseName = item.nama.toLowerCase();
    for (const key in ALLERGENS) {
      if (lowercaseName.includes(key)) {
        const allergenType = ALLERGENS[key];
        let altSuggest = '';
        if (allergenType.includes('Seafood')) altSuggest = ALTERNATIVES.Seafood;
        else if (allergenType.includes('Telur')) altSuggest = ALTERNATIVES.Telur;
        else if (allergenType.includes('Gluten')) altSuggest = ALTERNATIVES.Gluten;
        
        const note = `<strong>${allergenType}</strong>: Rekomendasi alternatif menu penyeimbang gizi: <strong>${altSuggest}</strong>.`;
        if (!allergenNotes.includes(note)) {
          allergenNotes.push(note);
        }
      }
    }
  });

  const allergenSectionHtml = allergenNotes.length > 0
    ? `
      <div style="background:#fffbeb;border:1.5px solid #d97706;border-radius:4px;padding:8px 12px;margin-bottom:14px;font-size:11px;">
        <span style="font-weight:bold;color:#b45309;font-size:11.5px;">⚠️ PROTOKOL MITIGASI ALERGI SISWA (Deteksi Bahan Baku):</span>
        <ul style="margin:4px 0 0 16px;padding:0;color:#92400e;">
          ${allergenNotes.map(n => `<li style="margin-bottom:3px;">${n}</li>`).join('')}
        </ul>
      </div>
    `
    : `
      <div style="background:#f0fdf4;border:1.5px solid #16a34a;border-radius:4px;padding:8px 12px;margin-bottom:14px;font-size:11px;color:#15803d;font-weight:bold;">
        ✓ Bebas Alergen Utama: Tidak terdeteksi seafood, telur unggas, atau gluten dalam bahan menu terpilih.
      </div>
    `;

  // 4. Food Costing & Waste analysis
  const lossPorsi = (totalPorsi * 0.05).toFixed(1);
  const costActualPortion = totBiaya + Math.round(budgetNum * overhead / 100);
  const costDiff = budgetNum - costActualPortion;
  const isCostOk = costDiff >= 0;

  // 5. Timeline Logistik & Golden Hour
  const timelineHtml = `
    <table class="data" style="margin-bottom:14px;">
      <thead>
        <tr>
          <th style="width:25%;">Tahapan Distribusi</th>
          <th style="width:25%;">Estimasi Jam</th>
          <th style="width:50%;">Prosedur Keamanan & Kualitas Pangan</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-weight:bold;">Selesai Masak & Uji QC</td>
          <td style="text-align:center;">09:30 WIB</td>
          <td>Makanan matang selesai diproduksi, dilakukan pengetesan organoleptik dan pengukuran suhu inti matang (&ge;60&deg;C).</td>
        </tr>
        <tr>
          <td style="font-weight:bold;">Loading & Distribusi</td>
          <td style="text-align:center;">10:15 WIB</td>
          <td>Makanan dipacking dalam wadah mika/steril rapat, dimuat ke armada logistik yang bersih dan tertutup.</td>
        </tr>
        <tr>
          <td style="font-weight:bold;">Tiba & Pembagian</td>
          <td style="text-align:center;">11:00 WIB</td>
          <td>Serah terima di sekolah dengan panitia/relawan, pembagian porsi makan siang ke piring/wadah siswa.</td>
        </tr>
        <tr style="background:#fef2f2;color:#991b1b;font-weight:bold;">
          <td>Batas Konsumsi (Golden Hour)</td>
          <td style="text-align:center;">12:30 WIB</td>
          <td>Maksimal 3 jam setelah selesai masak. Sisa makanan setelah jam ini WAJIB dibuang / dilarang dikonsumsi demi keselamatan siswa.</td>
        </tr>
      </tbody>
    </table>
  `;

  return `
<html>
<head>
  <meta charset="utf-8">
  <title>Formulir QC SPPG-MBG</title>
  <style>
    @page { margin: 18mm 15mm 15mm 15mm; }
    body { font-family: 'Times New Roman', Times, serif; color: #111; padding: 0; margin: 0; line-height: 1.45; font-size: 11.5px; }
    .kop { width: 100%; border-bottom: 3px double #111; margin-bottom: 6px; padding-bottom: 6px; }
    .kop td { vertical-align: middle; padding: 0; }
    .kop .logo { width: 60px; text-align: center; font-size: 32px; }
    .kop .inst { text-align: center; padding: 0 10px; }
    .kop .inst .line1 { font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
    .kop .inst .line2 { font-size: 14px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }
    .kop .inst .line3 { font-size: 9px; color: #444; margin-top: 2px; }
    .doc-ctrl { width: 100%; font-size: 9.5px; margin-bottom: 12px; border-collapse: collapse; }
    .doc-ctrl td { padding: 2px 6px; }
    .doc-ctrl .lbl { font-weight: bold; width: 120px; }
    .judul { text-align: center; font-size: 13px; font-weight: bold; text-decoration: underline; text-transform: uppercase; margin: 14px 0 10px; letter-spacing: 0.8px; }
    .sub-judul { text-align: center; font-size: 10.5px; color: #333; margin-bottom: 16px; }
    .section { font-size: 11.5px; font-weight: bold; text-transform: uppercase; margin: 16px 0 6px; padding: 4px 0; border-bottom: 1.5px solid #111; }
    .section .num { display: inline-block; background: #111; color: #fff; padding: 1px 6px; border-radius: 2px; margin-right: 6px; font-size: 10px; }
    table.data { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11px; }
    table.data th { background: #e5e7eb; border: 1px solid #333; padding: 6px 8px; font-weight: bold; text-align: center; font-size: 10.5px; }
    table.data td { border: 1px solid #333; padding: 5px 8px; }
    .info-grid { width: 100%; margin-bottom: 14px; font-size: 11px; }
    .info-grid td { padding: 3px 8px; vertical-align: top; }
    .info-grid .lbl { font-weight: bold; width: 180px; }
    .ttd-table { width: 100%; margin-top: 30px; font-size: 11px; }
    .ttd-table td { text-align: center; vertical-align: top; padding: 5px 15px; width: 33%; }
    .ttd-line { border-bottom: 1px solid #111; width: 160px; margin: 40px auto 4px; }
    .footer-note { font-size: 8.5px; color: #666; text-align: center; margin-top: 20px; border-top: 1px solid #ccc; padding-top: 6px; }
    .badge-layak { background: #dcfce7; border: 1.5px solid #166534; border-radius: 4px; padding: 8px; text-align: center; margin: 10px 0; }
    .badge-tunda { background: #fef2f2; border: 1.5px solid #991b1b; border-radius: 4px; padding: 8px; text-align: center; margin: 10px 0; }
    .total-row td { font-weight: bold; background: #f3f4f6; }
  </style>
</head>
<body>

<!-- ═══ KOP SURAT RESMI ═══ -->
<table class="kop">
  <tr>
    <td class="logo">🇮🇩</td>
    <td class="inst">
      <div class="line1">Badan Gizi Nasional Republik Indonesia</div>
      <div class="line2">Satuan Pelayanan Pemenuhan Gizi (SPPG)</div>
      <div class="line3">Program Makan Bergizi Gratis — Standardisasi Operasional Dapur</div>
    </td>
    <td class="logo" style="font-size:24px;">🍽️</td>
  </tr>
</table>

<!-- ═══ DOCUMENT CONTROL ═══ -->
<table class="doc-ctrl">
  <tr>
    <td class="lbl">No. Formulir</td><td>: SPPG-MBG/QC/01</td>
    <td class="lbl">Tanggal</td><td>: ${tgl}</td>
  </tr>
  <tr>
    <td class="lbl">Revisi</td><td>: 01 (Ahli Gizi Yield & Alergen)</td>
    <td class="lbl">Waktu Cetak</td><td>: ${jam} WIB</td>
  </tr>
  <tr>
    <td class="lbl">Status Dokumen</td><td colspan="3">: DOKUMEN TERKENDALI</td>
  </tr>
</table>

<div class="judul">Formulir Pemeriksaan & Kelayakan Konsumsi Harian</div>
<div class="sub-judul">Checklist Uji Organoleptik, Monitoring Keamanan Pangan & Rencana Belanja Bahan</div>

<!-- ═══ INFORMASI UMUM ═══ -->
<div class="section"><span class="num">I</span> Informasi Umum & Evaluasi Anggaran</div>
<table class="info-grid">
  <tr>
    <td class="lbl">Kelompok Usia Target</td><td>: ${activeAkg.name}</td>
  </tr>
  <tr>
    <td class="lbl">Total Produksi</td><td>: <strong>${totalPorsi} porsi</strong> (${siswaNum} siswa + ${spareNum} cadangan)</td>
  </tr>
  <tr>
    <td class="lbl">Anggaran Pagu / Porsi</td><td>: Rp ${budgetNum.toLocaleString('id')} (Bahan Baku: Rp ${budgetBB.toLocaleString('id')} + Overhead ${overhead}%)</td>
  </tr>
  <tr>
    <td class="lbl">Realisasi Biaya Aktual</td><td>: Rp ${costActualPortion.toLocaleString('id')} / porsi (Bahan Baku: Rp ${totBiaya.toLocaleString('id')} + Overhead Operasional)</td>
  </tr>
  <tr>
    <td class="lbl">Total Anggaran Harian</td><td>: <strong>Rp ${totalAnggaran.toLocaleString('id')}</strong></td>
  </tr>
</table>

<div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:4px;padding:8px 12px;margin-bottom:14px;font-size:11px;">
  <strong>ANALISIS FOOD COSTING & TOLERANSI SUSUT:</strong><br>
  • Sisa Anggaran Per Porsi: <span style="font-weight:bold;color:${isCostOk ? '#15803d' : '#b91c1c'};">Rp ${costDiff.toLocaleString('id')} (${isCostOk ? '✓ Hemat / Dalam Batas' : '⚠️ Defisit'})</span><br>
  • Toleransi Kehilangan / Waste Dapur (5%): <strong>${lossPorsi} porsi</strong> dari total produksi untuk buffer susut penyimpanan/pembagian.<br>
  • Estimasi Total Biaya Belanja Bahan Baku (dengan 5% Buffer Loss): <strong>Rp ${Math.round(totBiaya * totalPorsi * 1.05).toLocaleString('id')}</strong>
</div>

<!-- ═══ MITIGASI ALERGI ═══ -->
${allergenSectionHtml}

<!-- ═══ MENU & BAHAN BAKU ═══ -->
<div class="section"><span class="num">II</span> Kebutuhan Bahan Baku & Faktor Susut Gizi (Yield Factor)</div>
<table class="data">
  <thead>
    <tr>
      <th style="width:4%;">No</th>
      <th>Bahan Baku</th>
      <th style="width:10%;">BDD %</th>
      <th style="width:18%;">Keb. Kotor (Gross)</th>
      <th style="width:18%;">Keb. Bersih (Net)</th>
      <th style="width:10%;">Yield Matang</th>
      <th style="width:14%;">Est. Berat Matang/p</th>
      <th>Catatan Belanja & Logistik</th>
    </tr>
  </thead>
  <tbody>
    ${itemsTableHtml}
    <tr class="total-row">
      <td colspan="3" style="text-align:right;border:1px solid #333;padding:6px 8px;">Subtotal Biaya Bahan Baku per Porsi</td>
      <td colspan="5" style="border:1px solid #333;padding:6px 8px;font-weight:bold;">Rp ${totBiaya.toLocaleString('id')}</td>
    </tr>
  </tbody>
</table>

<!-- ═══ KESESUAIAN AKG ═══ -->
<div class="section"><span class="num">III</span> Kesesuaian Gizi Terhadap AKG Makan Siang</div>
<table class="data">
  <thead>
    <tr>
      <th>Kelompok Usia</th>
      <th>Kecukupan Energi (30% AKG)</th>
      <th>Kecukupan Protein (30% AKG)</th>
    </tr>
  </thead>
  <tbody>
    ${akgRowsHtml}
  </tbody>
</table>

<!-- ═══ UJI ORGANOLEPTIK ═══ -->
<div class="section"><span class="num">IV</span> Hasil Uji Organoleptik (Sensoris)</div>
<table class="data">
  <thead>
    <tr>
      <th style="width:5%;">No</th>
      <th style="width:14%;">Kelompok</th>
      <th>Jenis Makanan</th>
      <th style="width:10%;">Rasa</th>
      <th style="width:10%;">Warna</th>
      <th style="width:10%;">Aroma</th>
      <th style="width:10%;">Tekstur</th>
      <th style="width:12%;">Kesimpulan</th>
    </tr>
  </thead>
  <tbody>
    ${organoRows}
  </tbody>
</table>

<!-- ═══ MONITORING KEAMANAN PANGAN ═══ -->
<div class="section"><span class="num">V</span> Monitoring Keamanan Pangan & Higienitas</div>
<table class="data">
  <thead>
    <tr>
      <th style="width:5%;">No</th>
      <th>Parameter Pemeriksaan</th>
      <th style="width:15%;">Standar</th>
      <th style="width:15%;">Hasil</th>
      <th style="width:18%;">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:center;">1</td>
      <td>Higienitas Penjamah Makanan (APD lengkap: masker, sarung tangan, penutup kepala)</td>
      <td style="text-align:center;">Wajib APD</td>
      <td style="text-align:center;">${qcHigienitas ? 'Lengkap' : 'Belum Lengkap'}</td>
      <td style="text-align:center;font-weight:bold;color:${qcHigienitas ? '#166534' : '#991b1b'};">${qcHigienitas ? '✓ MEMENUHI' : '✗ BELUM'}</td>
    </tr>
    <tr>
      <td style="text-align:center;">2</td>
      <td>Suhu Inti Makanan Matang (Core Temperature)</td>
      <td style="text-align:center;">&ge; 60&deg;C</td>
      <td style="text-align:center;">${qcSuhu ? '&ge; 60&deg;C' : 'Belum Diukur'}</td>
      <td style="text-align:center;font-weight:bold;color:${qcSuhu ? '#166534' : '#991b1b'};">${qcSuhu ? '✓ MEMENUHI' : '✗ BELUM'}</td>
    </tr>
    <tr>
      <td style="text-align:center;">3</td>
      <td>Jeda Waktu Masak — Konsumsi (Golden Hour)</td>
      <td style="text-align:center;">&lt; 3 Jam</td>
      <td style="text-align:center;">${qcWaktu ? '&lt; 3 Jam' : 'Belum Diverifikasi'}</td>
      <td style="text-align:center;font-weight:bold;color:${qcWaktu ? '#166534' : '#991b1b'};">${qcWaktu ? '✓ MEMENUHI' : '✗ BELUM'}</td>
    </tr>
  </tbody>
</table>

<!-- ═══ TIMELINE LOGISTIK DISTRIBUSI ═══ -->
<div class="section"><span class="num">VI</span> Timeline Logistik Distribusi & Golden Hour</div>
${timelineHtml}

<!-- ═══ KEPUTUSAN KELAYAKAN ═══ -->
<div class="section"><span class="num">VII</span> Keputusan Kelayakan Distribusi</div>
<div class="${qcStatus === 'layak' ? 'badge-layak' : 'badge-tunda'}">
  ${statusBadge}
</div>

<table class="info-grid" style="margin-top:8px;">
  <tr>
    <td class="lbl">Catatan Lapangan Ahli Gizi</td>
    <td>: ${qcNotes || 'Tidak ada catatan tambahan.'}</td>
  </tr>
</table>

<!-- ═══ TANDA TANGAN ═══ -->
<table class="ttd-table">
  <tr>
    <td>
      Mengetahui,<br><strong>Kepala SPPG</strong>
      <div class="ttd-line"></div>
      <div style="font-size:10px;">NIP. _______________</div>
    </td>
    <td>
      Pemeriksa,<br><strong>Ahli Gizi / Verifikator</strong>
      <div class="ttd-line"></div>
      <div style="font-size:10px;">${qcTesterName || '(............................)'}</div>
    </td>
    <td>
      Pelaksana,<br><strong>Kepala Dapur</strong>
      <div class="ttd-line"></div>
      <div style="font-size:10px;">NIP. _______________</div>
    </td>
  </tr>
</table>

<!-- ═══ FOOTER ═══ -->
<div class="footer-note">
  Dokumen ini dicetak secara otomatis oleh Sistem Perencanaan Porsi Gizi (SPPG) berdasarkan data TKPI Kemenkes & PMK No. 28/2019.<br>
  Mengacu pada Juknis Penyelenggaraan Bantuan Pemerintah untuk Program MBG TA 2025 — Badan Gizi Nasional RI.<br>
  Formulir No. SPPG-MBG/QC/01 — Dicetak: ${tgl}, ${jam} WIB
</div>

</body>
</html>
  `;
}
