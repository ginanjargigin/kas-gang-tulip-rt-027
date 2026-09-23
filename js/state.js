/* =========================================================
   APPLICATION STATE
========================================================= */

let token =
  sessionStorage.getItem("rt_token");

let state = {
  warga: [],
  kas: [],
  pengeluaran: []
};

let saving = false;

/*
 * PENCEGAH REQUEST DATA GANDA
 *
 * Jika load() dipanggil ketika request
 * sebelumnya masih berjalan, request baru
 * tidak akan dibuat.
 */
let loadingData = false;
