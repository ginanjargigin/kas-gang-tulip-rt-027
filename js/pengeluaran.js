/* =========================================================
   PENGELUARAN
========================================================= */


/* =========================================================
   HAPUS PENGELUARAN
========================================================= */

async function delPengeluaran(
  id
) {

  const transaksi =
    state.pengeluaran.find(
      item => item.id === id
    );


  if (!transaksi) {

    return alert(
      "Data pengeluaran tidak ditemukan."
    );
  }


  const yakin =
    confirm(
      "Hapus pengeluaran ini?\n\n" +
      `${transaksi.kategori} — ${rp(transaksi.jumlah)}\n` +
      `Tanggal: ${transaksi.tanggal}\n\n` +
      "Data yang dihapus tidak dapat dikembalikan."
    );


  if (!yakin) {
    return;
  }


  const nextState = {

    ...state,

    pengeluaran:
      state.pengeluaran.filter(
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
      "Gagal menghapus pengeluaran: " +
      e.message
    );
  }
}


/* =========================================================
   TAMBAH PENGELUARAN
========================================================= */

async function addPengeluaran() {

  try {

    const jumlah =
      getNominalValue(
        pJumlah.value
      );


    if (jumlah <= 0) {

      return alert(
        "Jumlah pengeluaran harus lebih dari 0."
      );
    }


    const newPengeluaran = {

      id:
        uid(),

      tanggal:
        pTanggal.value ||
        new Date()
          .toISOString()
          .slice(0, 10),

      kategori:
        pKategori.value.trim(),

      jumlah,

      oleh:
        pOleh.value.trim(),

      keterangan:
        pKet.value.trim()
    };


    const nextState = {

      ...state,

      pengeluaran: [
        ...state.pengeluaran,
        newPengeluaran
      ]
    };


    await save(
      nextState,
      "pMsg"
    );


    saveLastInputBy(
      pOleh.value
    );


    pKategori.value = "";

    pJumlah.value = "";

    pKet.value = "";


    pOleh.value =
      loadLastInputBy();


  } catch (e) {

    pMsg.className =
      "err";

    pMsg.textContent =
      " Gagal: " +
      e.message;
  }
}
