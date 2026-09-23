/* =========================================================
   APPLICATION CONTROLLER
========================================================= */


/* =========================================================
   LAST INPUT
========================================================= */

const LAST_INPUT_BY_KEY =
  "rt_last_input_by";


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

  localStorage.setItem(
    LAST_INPUT_BY_KEY,
    value || ""
  );
}


function setupLastInputBy() {

  const saved =
    loadLastInputBy();


  if (saved) {

    pOleh.value =
      saved;
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
      (a, b) =>
        a +
        Number(
          b.total || 0
        ),
      0
    );


  const pengeluaran =
    state.pengeluaran.reduce(
      (a, b) =>
        a +
        Number(
          b.jumlah || 0
        ),
      0
    );


  const saldo =
    pemasukan -
    pengeluaran;


  document.getElementById(
    "saldo"
  ).textContent =
    rp(saldo);


  document.getElementById(
    "masuk"
  ).textContent =
    rp(pemasukan);


  document.getElementById(
    "keluar"
  ).textContent =
    rp(pengeluaran);


  document.getElementById(
    "jmlWarga"
  ).textContent =
    state.warga.length;


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

              <button
                type="button"
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


  kNama.innerHTML =
    '<option value="">Pilih warga</option>' +
    state.warga
      .map(
        x =>
          `<option>${esc(x.nama)}</option>`
      )
      .join("");


  renderSearch();

  renderRekap();
}


/* =========================================================
   DATA LOADING OVERLAY
========================================================= */

function showDataLoading() {

  let overlay =
    document.getElementById(
      "dataLoading"
    );


  if (!overlay) {

    overlay =
      document.createElement(
        "div"
      );

    overlay.id =
      "dataLoading";

    overlay.className =
      "data-loading-overlay";

    overlay.innerHTML = `
      <div class="data-loading-card">

        <div class="data-loading-spinner"></div>

        <div class="data-loading-title">
          Memuat data...
        </div>

        <div class="data-loading-text">
          Mengambil data kas warga.
        </div>

      </div>
    `;

    document.body.appendChild(
      overlay
    );
  }


  overlay.style.display =
    "flex";
}


function hideDataLoading() {

  const overlay =
    document.getElementById(
      "dataLoading"
    );


  if (overlay) {

    overlay.style.display =
      "none";
  }
}


function showDataLoadingError(
  message
) {

  let overlay =
    document.getElementById(
      "dataLoading"
    );


  if (!overlay) {

    overlay =
      document.createElement(
        "div"
      );

    overlay.id =
      "dataLoading";

    overlay.className =
      "data-loading-overlay";

    document.body.appendChild(
      overlay
    );
  }


  overlay.innerHTML = `
    <div class="data-loading-card">

      <div class="data-loading-icon">
        ⚠
      </div>

      <div class="data-loading-title">
        Data belum berhasil dimuat
      </div>

      <div class="data-loading-text">
        ${
          esc(
            message ||
            "Terjadi masalah saat mengambil data."
          )
        }
      </div>

      <button
        type="button"
        class="primary"
        onclick="retryLoadData()"
      >
        Coba Lagi
      </button>

    </div>
  `;


  overlay.style.display =
    "flex";
}


async function retryLoadData() {

  showDataLoading();


  try {

    await load();

    hideDataLoading();

  } catch (e) {

    showDataLoadingError(
      e.message
    );
  }
}


/* =========================================================
   NAVIGATION
========================================================= */

document
  .querySelectorAll(
    ".nav button"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(
              ".nav button"
            )
            .forEach(
              item =>
                item.classList.remove(
                  "active"
                )
            );


          button.classList.add(
            "active"
          );


          document
            .querySelectorAll(
              ".view"
            )
            .forEach(
              view =>
                view.classList.remove(
                  "active"
                )
            );


          document
            .getElementById(
              button.dataset.view
            )
            .classList.add(
              "active"
            );

        }
      );

    }
  );


/* =========================================================
   INITIALIZATION
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
      .then(
        () => {

          hideDataLoading();

        }
      )
      .catch(
        e => {

          showDataLoadingError(
            e.message
          );

        }
      );
  }
}
