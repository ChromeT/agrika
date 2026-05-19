// pdfTemplate.js — Template Laporan Premium SPPG-MBG
// Mengutamakan estetika modern, keringkasan, dan visualisasi gizi harian

// Database Yield & BDD (Bahan Dapat Dimakan) Kemenkes & Juknis BGN
const YIELD_DATABASE = {
  'beras': { bdd: 1.0, cookingYield: 2.5, category: 'Karbohidrat' },
  'singkong': { bdd: 0.85, cookingYield: 0.95, category: 'Karbohidrat' },
  'kentang': { bdd: 0.85, cookingYield: 0.95, category: 'Karbohidrat' },
  'ubi': { bdd: 0.85, cookingYield: 0.95, category: 'Karbohidrat' },
  'talas': { bdd: 0.85, cookingYield: 0.95, category: 'Karbohidrat' },
  'jagung': { bdd: 0.60, cookingYield: 0.95, category: 'Karbohidrat' },
  'roti': { bdd: 1.0, cookingYield: 1.0, category: 'Karbohidrat' },
  'mie': { bdd: 1.0, cookingYield: 1.5, category: 'Karbohidrat' },
  'ayam': { bdd: 0.80, cookingYield: 0.75, category: 'Protein Hewani' },
  'daging': { bdd: 1.0, cookingYield: 0.70, category: 'Protein Hewani' },
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
  'telur': { bdd: 0.88, cookingYield: 1.0, category: 'Protein Hewani' },
  'puyuh': { bdd: 0.88, cookingYield: 1.0, category: 'Protein Hewani' },
  'bebek': { bdd: 0.88, cookingYield: 1.0, category: 'Protein Hewani' },
  'udang': { bdd: 0.70, cookingYield: 0.85, category: 'Protein Hewani' },
  'cumi': { bdd: 0.85, cookingYield: 0.80, category: 'Protein Hewani' },
  'kerang': { bdd: 0.40, cookingYield: 0.85, category: 'Protein Hewani' },
  'tempe': { bdd: 1.0, cookingYield: 0.95, category: 'Protein Nabati' },
  'tahu': { bdd: 1.0, cookingYield: 0.90, category: 'Protein Nabati' },
  'kacang': { bdd: 1.0, cookingYield: 1.0, category: 'Protein Nabati' },
  'oncom': { bdd: 1.0, cookingYield: 0.95, category: 'Protein Nabati' },
  'bayam': { bdd: 0.65, cookingYield: 0.60, category: 'Sayuran' },
  'kangkung': { bdd: 0.65, cookingYield: 0.60, category: 'Sayuran' },
  'wortel': { bdd: 0.85, cookingYield: 0.90, category: 'Sayuran' },
  'buncis': { bdd: 0.90, cookingYield: 0.90, category: 'Sayuran' },
  'kol': { bdd: 0.85, cookingYield: 0.85, category: 'Sayuran' },
  'brokoli': { bdd: 0.80, cookingYield: 0.85, category: 'Sayuran' },
  'sawi': { bdd: 0.85, cookingYield: 0.70, category: 'Sayuran' },
  'labu': { bdd: 0.80, cookingYield: 0.90, category: 'Sayuran' },
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
  'udang': 'Seafood (Udang)',
  'cumi': 'Seafood (Cumi)',
  'ikan': 'Seafood (Ikan)',
  'lele': 'Seafood (Ikan)',
  'kembung': 'Seafood (Ikan)',
  'bandeng': 'Seafood (Ikan)',
  'nila': 'Seafood (Ikan)',
  'patin': 'Seafood (Ikan)',
  'tuna': 'Seafood (Ikan)',
  'salmon': 'Seafood (Ikan)',
  'telur': 'Telur Unggas',
  'puyuh': 'Telur Unggas',
  'bebek': 'Telur Unggas',
  'roti': 'Gluten (Terigu)',
  'terigu': 'Gluten (Terigu)'
};

const ALTERNATIVES = {
  'Seafood': 'Ayam Fillet / Tempe Kedelai',
  'Telur': 'Tahu / Tempe / Daging Ayam',
  'Gluten': 'Kentang / Ubi Jalar'
};

export function generateSPPGHtml({
  totalPorsi, siswaNum, spareNum, budgetNum, overhead,
  totBiaya, budgetBB, isBudgetOk, totalAnggaran,
  totKal, totProt, totKar, totLem, totSerat,
  activeAkg, usia,
  selectedItems, itemsHtml, akgRowsHtml,
  qcRasa, qcAroma, qcTekstur, qcPenampilan,
  qcHigienitas, qcSuhu, qcWaktu,
  qcTesterName, qcNotes, qcStatus,
  consolidatedIngredients
}) {
  const tgl = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const jam = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const tglSingkat = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric' }).replace(/\//g, '');
  const refNo = `SPPG-GIZI/${tglSingkat}/${Math.floor(100 + Math.random() * 900)}`;

  // Formatting floating points
  const fKal = Number(totKal).toFixed(0);
  const fProt = Number(totProt).toFixed(1);
  const fKar = Number(totKar).toFixed(1);
  const fLem = Number(totLem).toFixed(1);
  const fSerat = Number(totSerat).toFixed(1);

  // Buffer loss porsi (5%)
  const lossPorsi = Math.ceil(totalPorsi * 0.05);

  // Calculate Macro Calorie contributions for Donut Chart
  const calKarbo = fKar * 4;
  const calProt = fProt * 4;
  const calLem = fLem * 9;
  const totalCal = calKarbo + calProt + calLem || 1;
  const pctKar = Math.round(calKarbo / totalCal * 100);
  const pctProt = Math.round(calProt / totalCal * 100);
  const pctLem = 100 - pctKar - pctProt;

  // Donut SVG offsets
  const protOffset = 100;
  const lemOffset = 100 - pctProt;
  const karOffset = 100 - pctProt - pctLem;

  // 1. Menu Cards list
  const menuCards = selectedItems.map(item => {
    let catLabel = 'Piring Gizi';
    if (item.kat === 'karbo') catLabel = 'Makanan Pokok';
    else if (item.kat === 'protein') catLabel = 'Lauk Gizi';
    else if (item.kat === 'sayur') catLabel = 'Sayuran';
    else if (item.kat === 'buah') catLabel = 'Buah Segar';
    return `
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:8px 12px;flex:1;min-width:110px;text-align:center;">
        <span style="font-size:16px;display:block;margin-bottom:2px;">${item.icon || '🍛'}</span>
        <span style="font-size:8.5px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;display:block;">${catLabel}</span>
        <span style="font-size:11px;font-weight:bold;color:#1e293b;display:block;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.nama}</span>
      </div>
    `;
  }).join('');

  // 2. Ingredients Table builder
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
      
      const isUtamaBadge = ing.isUtama ? ' <span style="font-size:6px;background:#e0f2fe;color:#0369a1;padding:1px 3px;border-radius:2px;font-weight:bold;text-transform:uppercase;">UTAMA</span>' : '';
      
      itemsTableHtml += `
        <tr>
          <td style="padding:4px 6px;text-align:center;color:#64748b;">${rowIdx}</td>
          <td style="padding:4px 6px;font-weight:500;color:#1e293b;">${ing.nama}${isUtamaBadge}</td>
          <td style="padding:4px 6px;text-align:center;color:#475569;">${bddPct}%</td>
          <td style="padding:4px 6px;text-align:center;font-weight:bold;color:#1e293b;">${grossStr}</td>
          <td style="padding:4px 6px;text-align:center;color:#475569;">${netStr}</td>
          <td style="padding:4px 6px;text-align:center;color:#64748b;">${cookingYieldPct === 100 ? '—' : cookingYieldPct + '%'}</td>
          <td style="padding:4px 6px;text-align:center;font-weight:bold;color:#0f766e;">${cookedStr}</td>
        </tr>
      `;
      rowIdx++;
    });
  }

  // 3. Allergen Mitigation alert
  const allergenDetected = [];
  selectedItems.forEach(item => {
    const nameLower = item.nama.toLowerCase();
    for (const key in ALLERGENS) {
      if (nameLower.includes(key)) {
        const allergen = ALLERGENS[key];
        let type = 'Seafood';
        if (allergen.includes('Telur')) type = 'Telur';
        else if (allergen.includes('Gluten')) type = 'Gluten';
        
        if (!allergenDetected.some(x => x.allergen === allergen)) {
          allergenDetected.push({ allergen, alt: ALTERNATIVES[type] });
        }
      }
    }
  });

  const allergenBlockHtml = allergenDetected.length > 0
    ? `
      <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;padding:8px 12px;margin-bottom:12px;font-size:10px;color:#92400e;">
        <span style="font-weight:bold;display:block;margin-bottom:2px;">⚠️ ALERGEN TERDETEKSI:</span>
        ${allergenDetected.map(a => `• <strong>${a.allergen}</strong> (Alternatif: <strong>${a.alt}</strong>)`).join('<br>')}
      </div>
    `
    : `
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:8px 12px;margin-bottom:12px;font-size:10px;color:#166534;font-weight:bold;">
        ✓ Aman Alergen: Menu bersih dari potensi seafood, telur unggas, dan terigu gluten.
      </div>
    `;

  // 4. Budget Efficiency Badge
  const costActual = totBiaya + Math.round(budgetNum * overhead / 100);
  const costDiffVal = budgetNum - costActual;
  const isBudgetSafe = costDiffVal >= 0;
  const budgetBadge = isBudgetSafe
    ? `<span style="background:#dcfce7;color:#15803d;padding:2px 6px;border-radius:10px;font-size:9px;font-weight:bold;">✓ EFISIEN (Sisa Rp ${costDiffVal})</span>`
    : `<span style="background:#fef2f2;color:#b91c1c;padding:2px 6px;border-radius:10px;font-size:9px;font-weight:bold;">⚠️ MELEBIHI (Defisit Rp ${Math.abs(costDiffVal)})</span>`;



  return `
<html>
<head>
  <meta charset="utf-8">
  <title>Laporan Perencanaan Gizi & QC</title>
  <style>
    @page { size: A4; margin: 12mm; }
    body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background: #fff; line-height: 1.35; font-size: 11px; margin: 0; padding: 0; }
    
    /* Header styling */
    .header-container { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 12px; }
    .header-logo { display: flex; align-items: center; gap: 8px; }
    .header-logo-icon { background: linear-gradient(135deg, #f43f5e, #fb7185); color: #fff; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; }
    .header-title-text { font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }
    .header-ref { font-family: monospace; font-size: 9.5px; color: #64748b; text-align: right; }

    /* Dashboard Layout */
    .grid-2 { display: flex; gap: 12px; margin-bottom: 12px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; flex: 1; }
    .card-title { font-size: 10.5px; font-weight: bold; color: #475569; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    
    /* Nutri list */
    .nutri-list { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
    .nutri-box { flex: 1; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px; text-align: center; }
    .nutri-val { font-size: 12px; font-weight: bold; color: #0f172a; display: block; }
    .nutri-lbl { font-size: 8px; color: #64748b; text-transform: uppercase; display: block; margin-top: 1px; }

    /* Donut chart */
    .donut-container { display: flex; align-items: center; gap: 14px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; }
    .donut-legend { font-size: 9.5px; }
    .legend-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 4px; }

    /* Table styling */
    table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 10px; }
    table.data-table th { background: #f1f5f9; color: #475569; font-weight: bold; padding: 6px; border-bottom: 2px solid #cbd5e1; text-align: center; text-transform: uppercase; font-size: 8.5px; letter-spacing: 0.5px; }
    table.data-table td { border-bottom: 1px solid #e2e8f0; padding: 5px 6px; vertical-align: middle; }
    table.data-table tr:hover { background: #f8fafc; }

    /* Timeline horizontal stepper */
    .timeline { display: flex; justify-content: space-between; align-items: center; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; font-size: 9.5px; margin-bottom: 12px; }
    .time-step { text-align: center; flex: 1; position: relative; }
    .time-val { font-weight: bold; color: #0f172a; display: block; font-size: 10px; }
    .time-lbl { color: #64748b; display: block; font-size: 8px; margin-top: 2px; }

    /* Signatures Minimalist */
    .footer-section { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 25px; font-size: 10.5px; border-top: 1px dashed #cbd5e1; padding-top: 12px; }
    .sig-block { text-align: center; width: 220px; }
    .sig-line { border-bottom: 1px solid #475569; margin: 35px auto 4px; width: 160px; }

    .romantic-touch { font-size: 7px; color: #f472b6; font-style: italic; display: inline-block; margin-left: 5px; }
  </style>
</head>
<body>

  <!-- ═══ HEADER BAR ═══ -->
  <div class="header-container">
    <div class="header-logo">
      <div class="header-logo-icon">🌿</div>
      <div>
        <div class="header-title-text">Laporan Perencanaan Gizi & QC Harian</div>
        <div style="font-size:9px;color:#64748b;font-weight:500;">Satuan Pelayanan Pemenuhan Gizi (SPPG) • BGN RI</div>
      </div>
    </div>
    <div class="header-ref">
      <strong>Dokumen No:</strong> ${refNo}<br>
      Tanggal: ${tgl} (${jam} WIB)
    </div>
  </div>

  <!-- ═══ MENU GRID ROW ═══ -->
  <div style="display:flex; gap:10px; margin-bottom:12px;">
    ${menuCards}
  </div>

  <!-- ═══ MAIN DASHBOARD GRID ═══ -->
  <div class="grid-2">
    
    <!-- CARD 1: BUDGET & OPERASIONAL -->
    <div class="card">
      <div class="card-title">💵 Rencana Biaya & Operasional</div>
      <table style="width:100%;font-size:10px;border-collapse:collapse;">
        <tr style="height:20px;">
          <td style="color:#64748b;">Target Porsi Produksi</td>
          <td style="font-weight:bold;text-align:right;">${totalPorsi} porsi <span style="font-weight:normal;color:#64748b;font-size:9px;">(${siswaNum} + ${spareNum} cadangan)</span></td>
        </tr>
        <tr style="height:20px;">
          <td style="color:#64748b;">Pagu Anggaran per Porsi</td>
          <td style="font-weight:bold;text-align:right;">Rp ${budgetNum.toLocaleString('id')}</td>
        </tr>
        <tr style="height:20px;">
          <td style="color:#64748b;">Realisasi Belanja Bahan Baku</td>
          <td style="font-weight:bold;text-align:right;">Rp ${totBiaya.toLocaleString('id')} / porsi</td>
        </tr>
        <tr style="height:20px;border-bottom:1px solid #e2e8f0;">
          <td style="color:#64748b;">Overhead Operasional Dapur</td>
          <td style="font-weight:bold;text-align:right;">Rp ${Math.round(budgetNum * overhead / 100).toLocaleString('id')} (${overhead}%)</td>
        </tr>
        <tr style="height:26px;">
          <td style="font-weight:bold;color:#0f172a;">Evaluasi Biaya per Porsi</td>
          <td style="text-align:right;">${budgetBadge}</td>
        </tr>
        <tr style="height:22px;">
          <td style="color:#64748b;">Total Pagu Harian SPPG</td>
          <td style="font-weight:bold;text-align:right;color:#0f172a;font-size:11px;">Rp ${totalAnggaran.toLocaleString('id')}</td>
        </tr>
      </table>
    </div>

    <!-- CARD 2: KANDUNGAN GIZI & MAKRONUTRISI CHART -->
    <div class="card">
      <div class="card-title">📊 Evaluasi Kandungan Gizi (AKG)</div>
      
      <!-- Nutri box row -->
      <div class="nutri-list">
        <div class="nutri-box">
          <span class="nutri-val">${fKal}</span>
          <span class="nutri-lbl">Energi (kkal)</span>
        </div>
        <div class="nutri-box">
          <span class="nutri-val">${fProt}g</span>
          <span class="nutri-lbl">Protein</span>
        </div>
        <div class="nutri-box">
          <span class="nutri-val">${fKar}g</span>
          <span class="nutri-lbl">Karbohidrat</span>
        </div>
        <div class="nutri-box">
          <span class="nutri-val">${fSerat}g</span>
          <span class="nutri-lbl">Serat</span>
        </div>
      </div>

      <!-- Donut Chart & Legend -->
      <div class="donut-container">
        <!-- SVG Donut Chart -->
        <svg width="60" height="60" viewBox="0 0 42 42" style="transform: rotate(-90deg);">
          <circle cx="21" cy="21" r="15.915" fill="#fff"></circle>
          <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" stroke-width="5.5"></circle>
          
          <!-- Protein Segment -->
          <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10b981" stroke-width="5.5" 
            stroke-dasharray="${pctProt} ${100 - pctProt}" stroke-dashoffset="${protOffset}"></circle>
          
          <!-- Lemak Segment -->
          <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f59e0b" stroke-width="5.5" 
            stroke-dasharray="${pctLem} ${100 - pctLem}" stroke-dashoffset="${lemOffset}"></circle>
          
          <!-- Karbo Segment -->
          <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#3b82f6" stroke-width="5.5" 
            stroke-dasharray="${pctKar} ${100 - pctKar}" stroke-dashoffset="${karOffset}"></circle>
        </svg>

        <!-- Legend text -->
        <div class="donut-legend">
          <span style="font-weight:bold;display:block;margin-bottom:3px;font-size:8.5px;color:#64748b;text-transform:uppercase;">Kontribusi Kalori Makro:</span>
          <div><span class="legend-dot" style="background:#3b82f6;"></span>Karbohidrat: <strong>${pctKar}%</strong></div>
          <div style="margin:2px 0;"><span class="legend-dot" style="background:#10b981;"></span>Protein: <strong>${pctProt}%</strong></div>
          <div><span class="legend-dot" style="background:#f59e0b;"></span>Lemak: <strong>${pctLem}%</strong></div>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══ DETEKSI ALERGEN ═══ -->
  ${allergenBlockHtml}

  <!-- ═══ INGREDIENTS TABLE ═══ -->
  <div style="font-size:9.5px;font-weight:bold;color:#475569;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;">📋 Tabel Detail Bahan Baku & Hasil Konversi Yield</div>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width:5%;">No</th>
        <th style="text-align:left;">Nama Bahan Makanan</th>
        <th style="width:10%;">BDD %</th>
        <th style="width:20%;">Mentah Kotor (Gross)</th>
        <th style="width:20%;">Mentah Bersih (Net)</th>
        <th style="width:12%;">Yield Matang</th>
        <th style="width:18%;">Est. Matang / Porsi</th>
      </tr>
    </thead>
    <tbody>
      ${itemsTableHtml}
    </tbody>
  </table>

  <!-- ═══ TIMELINE LOGISTIK ═══ -->
  <div style="font-size:9.5px;font-weight:bold;color:#475569;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;">🕒 Jadwal Distribusi & Golden Hour Keamanan Pangan</div>
  <div class="timeline">
    <div class="time-step">
      <span class="time-val">09:30 WIB</span>
      <span class="time-lbl">Selesai Masak & QC</span>
    </div>
    <div style="color:#cbd5e1;font-weight:bold;">➔</div>
    <div class="time-step">
      <span class="time-val">10:15 WIB</span>
      <span class="time-lbl">Loading Armada</span>
    </div>
    <div style="color:#cbd5e1;font-weight:bold;">➔</div>
    <div class="time-step">
      <span class="time-val">11:00 WIB</span>
      <span class="time-lbl">Saji di Sekolah</span>
    </div>
    <div style="color:#cbd5e1;font-weight:bold;">➔</div>
    <div class="time-step" style="background:#fef2f2;border-radius:4px;padding:2px 6px;">
      <span class="time-val" style="color:#b91c1c;">12:30 WIB</span>
      <span class="time-lbl" style="color:#991b1b;font-weight:bold;">Batas Aman Konsumsi</span>
    </div>
  </div>

  <!-- ═══ ESTIMASI LOGISTIK & CATATAN PERENCANAAN ═══ -->
  <div style="display:flex;gap:15px;align-items:stretch;margin-top:12px;">
    <div style="flex:1.2;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:8px 12px;font-size:9.5px;">
      <span style="font-weight:bold;color:#475569;text-transform:uppercase;display:block;margin-bottom:4px;letter-spacing:0.5px;">📝 Catatan Perencanaan Gizi:</span>
      Menu makan siang harian ini direncanakan sesuai dengan Juknis Badan Gizi Nasional Republik Indonesia TA 2025. Porsi gizi disesuaikan dengan kebutuhan Angka Kecukupan Gizi (AKG) kelompok usia target utama.
    </div>
    <div style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:8px 12px;font-size:9.5px;">
      <span style="font-weight:bold;color:#475569;text-transform:uppercase;display:block;margin-bottom:4px;letter-spacing:0.5px;">📦 Buffer Logistik & Toleransi:</span>
      • Toleransi Penyusutan Logistik (5%): <strong>${lossPorsi} porsi</strong><br>
      • Estimasi Belanja + Buffer Loss: <strong>Rp ${Math.round(totBiaya * totalPorsi * 1.05).toLocaleString('id')}</strong>
    </div>
  </div>

  <!-- ═══ FOOTER DUAL SIGNATURE ═══ -->
  <div class="footer-section">
    <div class="sig-block">
      Ahli Gizi / Perencana Menu
      <div class="sig-line"></div>
      <strong>( Ahli Gizi SPPG )</strong>
      <div style="font-size:8px;color:#64748b;margin-top:1px;">Registrasi Ahli Gizi (STR)</div>
    </div>
    <div style="font-size:8px;color:#64748b;text-align:center;padding-bottom:10px;">
      Mengacu pada Juknis Penyelenggaraan Bantuan Pemerintah untuk Program Makan Bergizi Gratis (MBG)<br>
      Badan Gizi Nasional Republik Indonesia TA 2025/2026.
      <span class="romantic-touch">Dibuat penuh cinta untuk Rika & Ayip 💕</span>
    </div>
    <div class="sig-block">
      Penanggung Jawab SPPG
      <div class="sig-line"></div>
      <strong>( Kepala Satuan Pelayanan )</strong>
      <div style="font-size:8px;color:#64748b;margin-top:1px;">NIP. ___________________</div>
    </div>
  </div>

</body>
</html>
  `;
}
