/* =========================================================
   PEMBAYARAN KAS
========================================================= */


/* =========================================================
   HAPUS PEMBAYARAN KAS
========================================================= */

async function delKas(id) {

  const transaksi =
    state.kas.find(
      item => item.id === id
    );


  if (!transaksi) {

    return alert(
      "Transaksi pembayaran kas tidak ditemukan."
    );
  }


  const yakin =
    confirm(
      "Hapus pembayaran kas ini?\n\n" +
      `${transaksi.nama} — ${rp(transaksi.total)}\n` +
      `Periode: ${transaksi.periode || "-"}\n\n` +
      "Data yang dihapus tidak dapat dikembalikan."
    );


  if (!yakin) {
    return;
  }


  const nextState = {

    ...state,

    kas:
      state.kas.filter(
        item =>
          item.id !== id
      )
  };


  try {

    await save(
      nextState
    );

  } catch (e) {

    alert(
      "Gagal menghapus pembayaran kas: " +
      e.message
    );
  }
}


/* =========================================================
   TAMBAH PEMBAYARAN KAS
   DENGAN PENCEGAHAN DUPLIKAT
========================================================= */

async function addKas() {

  try {

    const kas =
      Number(kKas.value) || 0;

    const denda =
      Number(kDenda.value) || 0;


    if (!kNama.value) {

      return alert(
        "Tambahkan warga dulu."
      );
    }


    if (kas <= 0) {

      return alert(
        "Nominal kas harus lebih dari 0."
      );
    }


    if (!kPeriode.value) {

      return alert(
        "Pilih periode pembayaran."
      );
    }


    const nama =
      String(
        kNama.value
      ).trim();


    const periode =
      String(
        kPeriode.value
      ).trim();


    const sudahAda =
      state.kas.some(
        item => {

          const namaLama =
            String(
              item.nama || ""
            ).trim();

          const periodeLama =
            String(
              item.periode || ""
            ).trim();

          return (
            namaLama === nama &&
            periodeLama === periode
          );
        }
      );


    if (sudahAda) {

      return alert(
        "Pembayaran kas sudah tercatat.\n\n" +
        `Nama: ${nama}\n` +
        `Periode: ${periode}\n\n` +
        "Pembayaran untuk warga dan periode " +
        "tersebut tidak dapat dicatat dua kali."
      );
    }


    const newKas = {

      id:
        uid(),

      tanggal:
        kTanggal.value ||
        new Date()
          .toISOString()
          .slice(0, 10),

      nama:
        nama,

      periode:
        periode,

      kas:
        kas,

      denda:
        denda,

      total:
        kas + denda,

      metode:
        kMetode.value,

      keterangan:
        kKet.value.trim()
    };


    const nextState = {

      ...state,

      kas: [
        ...state.kas,
        newKas
      ]
    };


    await save(
      nextState,
      "kMsg"
    );


    kPeriode.value = "";

    kKet.value = "";

    kDenda.value = "0";


  } catch (e) {

    kMsg.className =
      "err";

    kMsg.textContent =
      " Gagal: " +
      e.message;
  }
}


/* =========================================================
   PERIODE PEMBAYARAN KAS
========================================================= */

function setupPeriodeKas() {

  const periode =
    document.getElementById(
      "kPeriode"
    );


  if (!periode) {
    return;
  }


  const tahun =
    new Date().getFullYear();


  const bulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember"
  ];


  periode.innerHTML = `

    <option value="">
      Pilih periode
    </option>

    ${bulan
      .map(
        (
          namaBulan,
          index
        ) => {

          const nomorBulan =
            String(
              index + 1
            )
              .padStart(
                2,
                "0"
              );


          return `
            <option
              value="${tahun}-${nomorBulan}"
            >
              ${namaBulan} ${tahun}
            </option>
          `;
        }
      )
      .join("")}
  `;
}
