/* =========================================================
   DATA WARGA
========================================================= */


/* =========================================================
   TAMBAH WARGA
   DENGAN VALIDASI DUPLIKAT
========================================================= */

async function addWarga() {

  try {

    const nama =
      wNama.value.trim();


    if (!nama) {

      return alert(
        "Nama warga wajib diisi."
      );
    }


    const namaNormal =
      nama.toLowerCase();


    const sudahAda =
      state.warga.some(
        item => {

          const namaLama =
            String(
              item.nama || ""
            )
              .trim()
              .toLowerCase();

          return (
            namaLama ===
            namaNormal
          );
        }
      );


    if (sudahAda) {

      return alert(
        "Data warga sudah terdaftar.\n\n" +
        `Nama: ${nama}\n\n` +
        "Gunakan nama warga yang berbeda."
      );
    }


    const newWarga = {

      id:
        uid(),

      nama:
        nama,

      blok:
        wBlok.value.trim(),

      hp:
        wHp.value.trim(),

      status:
        wStatus.value
    };


    const nextState = {

      ...state,

      warga: [
        ...state.warga,
        newWarga
      ]
    };


    await save(
      nextState,
      "wMsg"
    );


    wNama.value = "";

    wBlok.value = "";

    wHp.value = "";


  } catch (e) {

    wMsg.className =
      "err";

    wMsg.textContent =
      " Gagal: " +
      e.message;
  }
}


/* =========================================================
   HAPUS WARGA
========================================================= */

async function delWarga(i) {

  const warga =
    state.warga[i];


  if (!warga) {

    return alert(
      "Data warga tidak ditemukan."
    );
  }


  const namaWarga =
    String(
      warga.nama || ""
    ).trim();


  const memilikiTransaksi =
    state.kas.some(
      item => {

        const namaTransaksi =
          String(
            item.nama || ""
          )
            .trim()
            .toLowerCase();

        return (
          namaTransaksi ===
          namaWarga.toLowerCase()
        );
      }
    );


  if (memilikiTransaksi) {

    return alert(
      "Warga tidak dapat dihapus.\n\n" +
      `Nama: ${namaWarga}\n\n` +
      "Warga ini memiliki riwayat " +
      "pembayaran kas.\n\n" +
      "Jika warga sudah tidak tinggal " +
      "di RT, ubah Status menjadi " +
      "\"Tidak Aktif\"."
    );
  }


  const yakin =
    confirm(
      `Hapus data warga "${namaWarga}"?`
    );


  if (!yakin) {
    return;
  }


  const nextWarga =
    state.warga.filter(
      (_, index) =>
        index !== i
    );


  const nextState = {

    ...state,

    warga:
      nextWarga
  };


  try {

    await save(
      nextState
    );

  } catch (e) {

    alert(
      "Gagal menghapus warga: " +
      e.message
    );
  }
}
