/* =========================================================
   APPLICATION CONTROLLER
========================================================= */


/* =========================================================
   INPUT OLEH TERAKHIR
========================================================= */

const LAST_INPUT_BY_KEY =
  "kas_rt_last_input_by";


function loadLastInputBy() {

  return (
    localStorage.getItem(
      LAST_INPUT_BY_KEY
    ) || ""
  );
}


function saveLastInputBy(
  value
) {

  const nama =
    String(
      value || ""
    ).trim();


  if (nama) {

    localStorage.setItem(
      LAST_INPUT_BY_KEY,
      nama
    );
  }
}


function setupLastInputBy() {

  const inputOleh =
    document.getElementById(
      "pOleh"
    );


  if (!inputOleh) {
    return;
  }


  const lastInputBy =
    loadLastInputBy();


  if (
    lastInputBy &&
    !inputOleh.value.trim()
  ) {

    inputOleh.value =
      lastInputBy;
  }
}


/* =========================================================
   LOAD DATA
========================================================= */

async function load() {

  if (loadingData) {
    return;
  }


  loadingData = true;


  try {

    const data =
      await api(
        "/api/data"
      );


    state =
      data;


    refresh();

  } finally {

    loadingData = false;
  }
}


/* =========================================================
   REFRESH APPLICATION
========================================================= */

function refresh() {

  const pemasukan =
    state.kas.reduce(
      (total, item) =>
        total +
        Number(
          item.total || 0
        ),
      0
    );


  const pengeluaran =
    state.pengeluaran.reduce(
      (total, item) =>
        total +
        Number(
          item.jumlah || 0
        ),
      0
    );


  saldo.textContent =
    rp(
      pemasukan -
      pengeluaran
    );


  masuk.textContent =
    rp(pemasukan);


  keluar.textContent =
    rp(pengeluaran);


  jmlWarga.textContent =
    state.warga.length;


  /* =========================
     TABEL WARGA
  ========================== */

  wTable.innerHTML =
    state.warga
      .map(
        (x, i) => `

          <tr>

            <td>
              ${esc(x.nama)}
            </td>

            <td>
              ${esc(x.blok)}
            </td>

            <td>
              ${esc(x.hp)}
            </td>

            <td>
              ${esc(x.status)}
            </td>

            <td>

              <button
                class="danger"
                onclick="delWarga(${i})"
              >
                Hapus
              </button>

            </td>

          </tr>

        `
      )
      .join("");


  /* =========================
     PILIHAN WARGA
  ========================== */

  kNama.innerHTML =
    state.warga
      .map(
        x =>
          `<option>${esc(
            x.nama
          )}</option>`
      )
      .join("");


  renderSearch();

  renderRekap();
}


/* =========================================================
   DATA LOADING STATE
========================================================= */

function showDataLoading() {

  let overlay =
    document.getElementById(
      "dataLoadingOverlay"
    );


  if (overlay) {
    return;
  }


  overlay =
    document.createElement(
      "div"
    );


  overlay.id =
    "dataLoadingOverlay";


  overlay.className =
    "data-loading-overlay";


  overlay.innerHTML = `
    <div class="data-loading-box">

      <div class="data-loading-spinner"></div>

      <h3 class="data-loading-title">
        Memuat data...
      </h3>

      <p class="data-loading-text">
        Mengambil data terbaru dari server.<br>
        Mohon tunggu sebentar.
      </p>

    </div>
  `;


  document.body.appendChild(
    overlay
  );
}


function hideDataLoading() {

  const overlay =
    document.getElementById(
      "dataLoadingOverlay"
    );


  if (overlay) {

    overlay.remove();
  }
}


function showDataLoadingError(
  error
) {

  let overlay =
    document.getElementById(
      "dataLoadingOverlay"
    );


  if (!overlay) {

    showDataLoading();

    overlay =
      document.getElementById(
        "dataLoadingOverlay"
      );
  }


  const box =
    overlay.querySelector(
      ".data-loading-box"
    );


  if (!box) {
    return;
  }


  box.innerHTML = `
    <h3 class="data-loading-title">
      Data belum dapat dimuat
    </h3>

    <p class="data-loading-text">
      Data dari server belum berhasil diambil.
      Login tetap dipertahankan.
    </p>

    <div class="data-loading-error">
      ${
        error?.message ||
        "Terjadi gangguan saat mengambil data."
      }
    </div>

    <button
      type="button"
      class="data-loading-retry"
      onclick="retryLoadData()"
    >
      Coba Lagi
    </button>
  `;
}


async function retryLoadData() {

  showDataLoading();


  try {

    await load();

    hideDataLoading();

  } catch (error) {

    console.error(
      "Retry load data gagal:",
      error
    );


    showDataLoadingError(
      error
    );
  }
}


/* =========================================================
   NAVIGASI TAB
========================================================= */

document
  .querySelectorAll(
    "nav button"
  )
  .forEach(
    button => {

      button.onclick = () => {

        document
          .querySelectorAll(
            "nav button"
          )
          .forEach(
            x =>
              x.classList.remove(
                "active"
              )
          );


        button.classList.add(
          "active"
        );


        document
          .querySelectorAll(
            ".section"
          )
          .forEach(
            x =>
              x.classList.remove(
                "active"
              )
          );


        document
          .getElementById(
            button.dataset.tab
          )
          .classList.add(
            "active"
          );
      };

    }
  );


/* =========================================================
   INISIALISASI
========================================================= */

const today =
  new Date()
    .toISOString()
    .slice(
      0,
      10
    );


kTanggal.value =
  today;


pTanggal.value =
  today;


pJumlah.addEventListener(
  "input",
  () => {

    pJumlah.value =
      formatNominalInput(
        pJumlah.value
      );

  }
);


setupLastInputBy();


setupPeriodeKas();


/*
 * Jika token login masih ada,
 * tampilkan aplikasi dan ambil data.
 */

if (token) {

  const lastActivity =
    getLastActivity();


  const inactiveFor =
    Date.now() -
    lastActivity;


  if (
    inactiveFor >=
    AUTO_LOGOUT_MS
  ) {

    logout();

  } else {

    show();

    setupAutoLogout();

    showDataLoading();


    load()
      .then(() => {

        hideDataLoading();

      })
      .catch(
        error => {

          console.error(
            "Gagal memuat data:",
            error
          );


          showDataLoadingError(
            error
          );
        }
      );
  }

} else {

  /*
   * Belum login.
   * Tidak perlu menjalankan timer auto logout.
   */
}
