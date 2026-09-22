/* =========================
   API PUBLIC DATA
   READ-ONLY
========================= */

const URL =
  "https://api.jsonbin.io/v3/b/";


const empty = {

  warga: [],

  kas: [],

  pengeluaran: []

};


/* =========================
   JSONBIN REQUEST
   DENGAN TIMEOUT
========================= */

async function jb() {

  const controller =
    new AbortController();

  const timeout =
    setTimeout(() => {
      controller.abort();
    }, 12000);

  try {

    const r =
      await fetch(
        URL +
          process.env.JSONBIN_BIN_ID +
          "/latest",
        {
          method:
            "GET",

          headers: {
            "Content-Type":
              "application/json",

            "X-Access-Key":
              process.env.JSONBIN_ACCESS_KEY
          },

          signal:
            controller.signal
        }
      );


    const text =
      await r.text();


    let data = {};

    try {

      data =
        JSON.parse(text);

    } catch (e) {

      data = {};

    }


    if (!r.ok) {

      const error =
        new Error(
          data.message ||
          `JSONBin error (${r.status})`
        );

      error.status =
        r.status;

      throw error;

    }


    return data;


  } catch (e) {

    if (
      e?.name ===
      "AbortError"
    ) {

      const error =
        new Error(
          "JSONBin terlalu lama merespons."
        );

      error.code =
        "JSONBIN_TIMEOUT";

      throw error;

    }

    throw e;

  } finally {

    clearTimeout(timeout);

  }

}
/* =========================
   VALIDASI DATA
========================= */

function isValidData(data) {

  return (

    data &&

    typeof data ===
      "object" &&

    Array.isArray(
      data.warga
    ) &&

    Array.isArray(
      data.kas
    ) &&

    Array.isArray(
      data.pengeluaran
    )

  );

}


/* =========================
   HANDLER
========================= */

module.exports =
  async (req, res) => {


    /* =========================
       PUBLIC API HANYA GET
    ========================== */

    if (
      req.method !==
      "GET"
    ) {

      return res
        .status(405)
        .json({

          error:
            "Method not allowed"

        });

    }


    try {

      /* =========================
         AMBIL DATA DARI JSONBIN
      ========================== */

      const result =
        await jb();


      const data =
        result.record ||
        empty;


      if (
        !isValidData(data)
      ) {

        return res
          .status(500)
          .json({

            error:
              "Struktur data penyimpanan tidak valid.",

            code:
              "INVALID_DATA_STRUCTURE"

          });

      }


      /* =========================
         HITUNG RINGKASAN
      ========================== */

      const totalPemasukan =
        data.kas.reduce(

          (total, item) =>

            total +
            Number(
              item.total || 0
            ),

          0

        );


      const totalPengeluaran =
        data.pengeluaran.reduce(

          (total, item) =>

            total +
            Number(
              item.jumlah || 0
            ),

          0

        );


      const saldo =
        totalPemasukan -
        totalPengeluaran;


      /* =========================
         FILTER DATA KAS
         
         Jangan kirim:
         - nama warga
         - metode
         - ID internal
      ========================== */

      const kasPublik =
        data.kas.map(
          item => ({

            tanggal:
              item.tanggal ||
              "",

            periode:
              item.periode ||
              "",

            jumlah:
              Number(
                item.total || 0
              )

          })
        );


      /* =========================
         FILTER DATA PENGELUARAN
         
         Jangan kirim:
         - ID internal
         - Input Oleh
      ========================== */

      const pengeluaranPublik =
        data.pengeluaran.map(
          item => ({

            tanggal:
              item.tanggal ||
              "",

            kategori:
              item.kategori ||
              "",

            jumlah:
              Number(
                item.jumlah || 0
              ),

            keterangan:
              item.keterangan ||
              ""

          })
        );


         /* =========================
   CACHE PUBLIC DATA
========================= */

const forceRefresh =
  req.query &&
  req.query.refresh === "1";

if (forceRefresh) {

  res.setHeader(
    "Cache-Control",
    "no-store"
  );

} else {

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=30, stale-while-revalidate=60"
  );

}

 
      return res.json({

        summary: {

          totalPemasukan:
            totalPemasukan,

          totalPengeluaran:
            totalPengeluaran,

          saldo:
            saldo,

          jumlahWarga:
            data.warga.length

        },


        kas:
          kasPublik,


        pengeluaran:
          pengeluaranPublik

      });


    } catch (e) {

      console.error(
        "PUBLIC DATA ERROR:",
        e
      );


      return res
        .status(502)
        .json({

          error:
            "Gagal mengambil data transparansi.",

          code:
            "PUBLIC_DATA_READ_ERROR"

        });

    }

  };
