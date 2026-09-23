/* =========================================================
   PENCARIAN PEMBAYARAN
========================================================= */

function renderSearch() {

  const nama =
    sNama.value.toLowerCase();


  const blok =
    sBlok.value.toLowerCase();


  const metode =
    sMetode.value;


  const tanggal =
    sTanggal.value;


  const min =
    Number(
      sMin.value
    ) || 0;


  const max =
    Number(
      sMax.value
    ) || Infinity;


  const rows =
    state.kas.filter(
      x => {

        const warga =
          state.warga.find(
            y =>
              y.nama ===
              x.nama
          ) || {};


        return (

          x.nama
            .toLowerCase()
            .includes(nama)

          &&

          String(
            warga.blok || ""
          )
            .toLowerCase()
            .includes(blok)

          &&

          (
            !metode ||
            x.metode ===
            metode
          )

          &&

          (
            !tanggal ||
            x.tanggal ===
            tanggal
          )

          &&

          x.total >= min

          &&

          x.total <= max
        );
      }
    );


  sTable.innerHTML =
    rows
      .map(
        x => {

          const warga =
            state.warga.find(
              y =>
                y.nama ===
                x.nama
            ) || {};


          return `
            <tr>

              <td>
                ${formatTanggal(x.tanggal)}
              </td>

              <td>
                ${esc(x.nama)}
              </td>

              <td>
                ${esc(warga.blok)}
              </td>

              <td>
                ${rp(x.kas)}
              </td>

              <td>
                ${rp(x.denda)}
              </td>

              <td>
                ${rp(x.total)}
              </td>

              <td>
                ${esc(x.metode)}
              </td>

              <td>

                <button
                  type="button"
                  class="danger"
                  onclick="delKas('${esc(x.id)}')"
                >
                  Hapus
                </button>

              </td>

            </tr>
          `;
        }
      )
      .join("");
}
