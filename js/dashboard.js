/* =========================================================
   DASHBOARD
========================================================= */

/**
 * Mengambil ringkasan data dashboard.
 */
function getDashboardSummary() {
  const totalPemasukan = state.kas.reduce(
    (total, item) => total + Number(item.total || 0),
    0
  );

  const totalPengeluaran = state.pengeluaran.reduce(
    (total, item) => total + Number(item.jumlah || 0),
    0
  );

  const saldo = totalPemasukan - totalPengeluaran;

  return {
    saldo,
    pemasukan: totalPemasukan,
    pengeluaran: totalPengeluaran,
    warga: state.warga.length
  };
}


/**
 * Mengambil pembayaran kas terbaru.
 */
function getRecentKas(limit = 5) {
  return [...state.kas]
    .sort((a, b) => {
      const dateA = new Date(a.tanggal || 0);
      const dateB = new Date(b.tanggal || 0);

      return dateB - dateA;
    })
    .slice(0, limit);
}


/**
 * Mengambil pengeluaran terbaru.
 */
function getRecentPengeluaran(limit = 5) {
  return [...state.pengeluaran]
    .sort((a, b) => {
      const dateA = new Date(a.tanggal || 0);
      const dateB = new Date(b.tanggal || 0);

      return dateB - dateA;
    })
    .slice(0, limit);
}


/**
 * Membuat data cash flow per bulan.
 *
 * Output:
 * [
 *   {
 *     bulan: "2026-04",
 *     pemasukan: 100000,
 *     pengeluaran: 50000,
 *     saldo: 50000
 *   }
 * ]
 */
function getMonthlyCashFlow(monthCount = 6) {
  const monthly = {};

  state.kas.forEach((item) => {
    if (!item.tanggal) return;

    const month = String(item.tanggal).slice(0, 7);

    if (!monthly[month]) {
      monthly[month] = {
        bulan: month,
        pemasukan: 0,
        pengeluaran: 0,
        saldo: 0
      };
    }

    monthly[month].pemasukan += Number(item.total || 0);
  });

  state.pengeluaran.forEach((item) => {
    if (!item.tanggal) return;

    const month = String(item.tanggal).slice(0, 7);

    if (!monthly[month]) {
      monthly[month] = {
        bulan: month,
        pemasukan: 0,
        pengeluaran: 0,
        saldo: 0
      };
    }

    monthly[month].pengeluaran += Number(item.jumlah || 0);
  });

  const result = Object.values(monthly)
    .sort((a, b) => a.bulan.localeCompare(b.bulan));

  result.forEach((item) => {
    item.saldo = item.pemasukan - item.pengeluaran;
  });

  return result.slice(-monthCount);
}


/**
 * Render pembayaran kas terbaru.
 */
function renderDashboardRecentKas() {
  const el = document.getElementById("dashboardRecentKas");

  if (!el) return;

  const data = getRecentKas(5);

  if (!data.length) {
    el.innerHTML = `
      <div class="dashboard-empty">
        Belum ada pembayaran kas.
      </div>
    `;
    return;
  }

 el.innerHTML = `
  <div class="dashboard-activity-list">
    ${data
      .map((item) => {
        return `
          <div class="dashboard-activity-item">
            <div>
              <strong>${esc(item.nama || "-")}</strong>
              <span>${formatTanggal(item.tanggal)}</span>
            </div>

            <b>${rp(Number(item.total || 0))}</b>
          </div>
        `;
      })
      .join("")}
  </div>
`;


/**
 * Render pengeluaran terbaru.
 */
function renderDashboardRecentPengeluaran() {
  const el = document.getElementById(
    "dashboardRecentPengeluaran"
  );

  if (!el) return;

  const data = getRecentPengeluaran(5);

  if (!data.length) {
    el.innerHTML = `
      <div class="dashboard-empty">
        Belum ada pengeluaran.
      </div>
    `;
    return;
  }

 el.innerHTML = `
  <div class="dashboard-activity-list">
    ${data
      .map((item) => {
        return `
          <div class="dashboard-activity-item">
            <div>
              <strong>${esc(item.kategori || "-")}</strong>
              <span>${formatTanggal(item.tanggal)}</span>
            </div>

            <b>${rp(Number(item.jumlah || 0))}</b>
          </div>
        `;
      })
      .join("")}
  </div>
`;


/**
 * Render dashboard.
 *
 * Untuk Fase 12B, grafik belum dibuat.
 * Fungsi ini hanya menyiapkan dan menampilkan
 * data dashboard dasar.
 */
function renderDashboard() {
  const summary = getDashboardSummary();
  const recentKas = getRecentKas(5);
  const recentPengeluaran = getRecentPengeluaran(5);
  const monthlyCashFlow = getMonthlyCashFlow(6);

  renderDashboardRecentKas();
  renderDashboardRecentPengeluaran();

  console.log("Dashboard Summary:", summary);
  console.log("Dashboard Recent Kas:", recentKas);
  console.log(
    "Dashboard Recent Pengeluaran:",
    recentPengeluaran
  );
  console.log(
    "Dashboard Monthly Cash Flow:",
    monthlyCashFlow
  );
}
