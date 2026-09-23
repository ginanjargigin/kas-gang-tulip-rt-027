/* =========================================================
   API COMMUNICATION
========================================================= */

async function api(
  url,
  opt = {}
) {

  const method =
    (opt.method || "GET")
      .toUpperCase();

  /*
   * PERUBAHAN OPTIMASI:
   *
   * Tidak ada retry otomatis.
   *
   * Sebelumnya GET dapat dicoba sampai
   * 3 kali. Jika JSONBin sedang lambat,
   * hal tersebut justru menghasilkan
   * request tambahan.
   *
   * Sekarang jika GET gagal,
   * aplikasi langsung menampilkan error
   * dan pengguna dapat menggunakan
   * tombol "Coba Lagi".
   */
  const maxRetries = 0;

  const timeoutMs = 15000;


  opt.headers = {

    ...(opt.headers || {}),

    "Content-Type":
      "application/json",

    ...(token
      ? {
          "Authorization":
            "Bearer " + token
        }
      : {})
  };


  for (
    let attempt = 0;
    attempt <= maxRetries;
    attempt++
  ) {

    const controller =
      new AbortController();

    const timeout =
      setTimeout(() => {

        controller.abort();

      }, timeoutMs);


    try {

      const requestOptions = {

        ...opt,

        signal:
          controller.signal,

        cache:
          method === "GET"
            ? "no-store"
            : opt.cache
      };


      const response =
        await fetch(
          url,
          requestOptions
        );


      clearTimeout(timeout);


      const data =
        await response
          .json()
          .catch(() => ({}));


      if (!response.ok) {

        const error =
          new Error(
            data.error ||
            "Gagal menghubungi server."
          );

        error.status =
          response.status;

        error.code =
          data.code ||
          "API_ERROR";

        throw error;
      }


      return data;


    } catch (error) {

      clearTimeout(timeout);


      const isTimeout =
        error?.name ===
        "AbortError";


      const networkError =
        !error?.status &&
        !error?.code;


      if (isTimeout) {

        throw new Error(
          "Server terlalu lama merespons. " +
          "Silakan coba lagi."
        );
      }


      if (networkError) {

        throw new Error(
          "Tidak dapat terhubung ke server. " +
          "Periksa koneksi internet lalu coba lagi."
        );
      }


      throw error;
    }
  }


  throw new Error(
    "Data belum berhasil dimuat."
  );
}

/* =========================================================
   SAVE DATA
========================================================= */

async function save() {

  if (saving) {
    return;
  }

  saving = true;

  try {

    await api(
      "/api/data",
      {
        method: "PUT",

        body: JSON.stringify(
          state
        )
      }
    );

    await refresh();

  } catch (error) {

    console.error(
      "Gagal menyimpan data:",
      error
    );

    alert(
      error.message ||
      "Gagal menyimpan data."
    );

  } finally {

    saving = false;
  }
}
