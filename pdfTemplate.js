// pdfTemplate.js — Template Laporan Resmi BGN SP-MBG
// Mengacu pada Juknis BGN 2025 & Format Formulir SPPG-MBG-QC

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
}) {
  const tgl = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const jam = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  // Build menu rows for organoleptik table
  const katLabels = { karbo: 'Makanan Pokok', protein: 'Lauk Hewani/Nabati', sayur: 'Sayuran', buah: 'Buah-buahan' };
  let organoRows = '';
  let rowNum = 1;
  selectedItems.forEach(item => {
    const katLabel = katLabels[item.kat] || item.kat;
    const isChecked = (param) => {
      // All items share the global QC checks in this version
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
    <td class="lbl">Revisi</td><td>: 00</td>
    <td class="lbl">Waktu Cetak</td><td>: ${jam} WIB</td>
  </tr>
  <tr>
    <td class="lbl">Status Dokumen</td><td colspan="3">: DOKUMEN TERKENDALI</td>
  </tr>
</table>

<div class="judul">Formulir Pemeriksaan & Kelayakan Konsumsi Harian</div>
<div class="sub-judul">Checklist Uji Organoleptik, Monitoring Keamanan Pangan & Rencana Belanja Bahan</div>

<!-- ═══ INFORMASI UMUM ═══ -->
<div class="section"><span class="num">I</span> Informasi Umum Produksi</div>
<table class="info-grid">
  <tr>
    <td class="lbl">Kelompok Usia Target</td><td>: ${activeAkg.name}</td>
  </tr>
  <tr>
    <td class="lbl">Total Produksi</td><td>: <strong>${totalPorsi} porsi</strong> (${siswaNum} siswa + ${spareNum} cadangan)</td>
  </tr>
  <tr>
    <td class="lbl">Anggaran per Porsi</td><td>: Rp ${budgetNum.toLocaleString('id')} (Bahan Baku: Rp ${budgetBB.toLocaleString('id')} + Overhead ${overhead}%)</td>
  </tr>
  <tr>
    <td class="lbl">Realisasi Biaya Bahan/Porsi</td><td>: <strong>Rp ${totBiaya.toLocaleString('id')}</strong> ${isBudgetOk ? '(✓ Dalam Batas)' : '(⚠ Melebihi Batas)'}</td>
  </tr>
  <tr>
    <td class="lbl">Total Anggaran Harian</td><td>: <strong>Rp ${totalAnggaran.toLocaleString('id')}</strong></td>
  </tr>
</table>

<!-- ═══ MENU & BAHAN BAKU ═══ -->
<div class="section"><span class="num">II</span> Ringkasan Menu & Kebutuhan Bahan Baku</div>
<table class="data">
  <thead>
    <tr>
      <th style="width:5%;">No</th>
      <th>Bahan Baku</th>
      <th style="width:18%;">Takaran/Porsi</th>
      <th style="width:18%;">Total Kebutuhan</th>
      <th style="width:22%;">Catatan</th>
    </tr>
  </thead>
  <tbody>
    ${itemsHtml}
    <tr class="total-row">
      <td colspan="3" style="text-align:right;border:1px solid #333;padding:6px 8px;">Subtotal Bahan Baku per Porsi</td>
      <td colspan="2" style="border:1px solid #333;padding:6px 8px;">Rp ${totBiaya.toLocaleString('id')}</td>
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
      <td style="text-align:center;">≥ 60°C</td>
      <td style="text-align:center;">${qcSuhu ? '≥ 60°C' : 'Belum Diukur'}</td>
      <td style="text-align:center;font-weight:bold;color:${qcSuhu ? '#166534' : '#991b1b'};">${qcSuhu ? '✓ MEMENUHI' : '✗ BELUM'}</td>
    </tr>
    <tr>
      <td style="text-align:center;">3</td>
      <td>Jeda Waktu Masak — Konsumsi (Golden Hour)</td>
      <td style="text-align:center;">< 3 Jam</td>
      <td style="text-align:center;">${qcWaktu ? '< 3 Jam' : 'Belum Diverifikasi'}</td>
      <td style="text-align:center;font-weight:bold;color:${qcWaktu ? '#166534' : '#991b1b'};">${qcWaktu ? '✓ MEMENUHI' : '✗ BELUM'}</td>
    </tr>
  </tbody>
</table>

<!-- ═══ KEPUTUSAN KELAYAKAN ═══ -->
<div class="section"><span class="num">VI</span> Keputusan Kelayakan Distribusi</div>
<div class="${qcStatus === 'layak' ? 'badge-layak' : 'badge-tunda'}">
  ${statusBadge}
</div>

<table class="info-grid" style="margin-top:8px;">
  <tr>
    <td class="lbl">Catatan Lapangan</td>
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
