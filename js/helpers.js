/* =========================================================
   HELPER FUNCTIONS
========================================================= */


/* =========================================================
   FORMAT NOMINAL RUPIAH
========================================================= */

const rupiahNumberFormatter =
  new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0
  });


function formatNominalInput(value) {

  const digits =
    String(value || "")
      .replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return rupiahNumberFormatter.format(
    Number(digits)
  );
}


function getNominalValue(value) {

  const digits =
    String(value || "")
      .replace(/\D/g, "");

  if (!digits) {
    return 0;
  }

  return Number(digits);
}


/* =========================================================
   FORMAT TANGGAL
========================================================= */

function formatTanggal(tanggal) {

  if (!tanggal) {
    return "-";
  }

  const bulan = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des"
  ];

  const bagian =
    String(tanggal).split("-");

  if (bagian.length !== 3) {
    return tanggal;
  }

  const tahun =
    bagian[0];

  const nomorBulan =
    Number(bagian[1]);

  const hari =
    bagian[2];

  if (
    !nomorBulan ||
    nomorBulan < 1 ||
    nomorBulan > 12
  ) {
    return tanggal;
  }

  return (
    `${hari} ${bulan[nomorBulan - 1]} ${tahun}`
  );
}


/* =========================================================
   FORMAT RUPIAH
========================================================= */

const rp = n =>
  new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }
  ).format(Number(n) || 0);


/* =========================================================
   GENERATE UNIQUE ID
========================================================= */

const uid = () =>
  Date.now().toString(36) +
  Math.random()
    .toString(36)
    .slice(2, 7);


/* =========================================================
   ESCAPE HTML
========================================================= */

const esc = s =>
  String(s ?? "").replace(
    /[&<>"']/g,
    c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c])
  );
