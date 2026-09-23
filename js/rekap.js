/* =========================================================
   REKAP TRANSAKSI
========================================================= */

function renderRekap() {

  const totalPemasukan =
    state.kas.reduce(
      (total, item) =>
        total +
        Number(
          item.total || 0
        ),
      0
    );


  const totalPengeluaran =
    state.pengeluaran.reduce(
      (total, item) =>
        total +
        Number(
          item.jumlah || 0
        ),
      0
    );


  const sisaKas =
    totalPemasukan -
    totalPengeluaran;


  const rekapPemasukan =
    document.getElementById(
      "rekapPemasukan"
    );


  const rekapPengeluaran =
    document.getElementById(
      "rekapPengeluaran"
    );


  const rekapSaldo =
    document.getElementById(
      "rekapSaldo"
    );


  if (rekapPemasukan) {

    rekapPemasukan.textContent =
      rp(totalPemasukan);
  }


  if (rekapPengeluaran) {

    rekapPengeluaran.textContent =
      rp(totalPengeluaran);
  }


  if (rekapSaldo) {

    rekapSaldo.textContent =
      rp(sisaKas);
  }


  const rekap = [

    ...state.kas.map(
      x => ({

        id:
          x.id,

        tanggal:
          x.tanggal,

        jenis:
          "Kas",

        nama:
          x.nama,

        jumlah:
          x.total,

        ket:
          x.keterangan
      })
    ),


    ...state.pengeluaran.map(
      x => ({

        id:
          x.id,

        tanggal:
          x.tanggal,

        jenis:
          "Pengeluaran",

        nama:
          x.kategori,

        jumlah:
          x.jumlah,

        ket:
          x.keterangan
      })
    )

  ].sort(
    (a, b) =>
      b.tanggal.localeCompare(
        a.tanggal
      )
  );


  rTable.innerHTML =
    rekap
      .map(
        x => `

          <tr>

            <td>
              ${formatTanggal(x.tanggal)}
            </td>

            <td>
              ${x.jenis}
            </td>

            <td>
              ${esc(x.nama)}
            </td>

            <td>
              ${rp(x.jumlah)}
            </td>

            <td>
              ${esc(x.ket)}
            </td>

            <td>

              <button
                type="button"
                class="danger"
                onclick="${
                  x.jenis === "Kas"
                    ? `delKas('${esc(x.id)}')`
                    : `delPengeluaran('${esc(x.id)}')`
                }"
              >
                Hapus
              </button>

            </td>

          </tr>
        `
      )
      .join("");
}
