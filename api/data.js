const { verify } = require("./_auth");

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

async function jb(method, body) {

  const path =
    method === "GET"
      ? "/latest"
      : "";

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
          path,
        {
          method,

          headers: {
            "Content-Type":
              "application/json",

            "X-Access-Key":
              process.env.JSONBIN_ACCESS_KEY
          },

          ...(body
            ? {
                body:
                  JSON.stringify(body)
              }
            : {}),

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
    typeof data === "object" &&
    Array.isArray(data.warga) &&
    Array.isArray(data.kas) &&
    Array.isArray(data.pengeluaran)
  );
}


/* =========================
   API HANDLER
========================= */

module.exports =
  async (req, res) => {

    /* =========================
       AUTHENTICATION
    ========================== */

    const authorization =
      req.headers.authorization ||
      "";


    if (
      !authorization.startsWith(
        "Bearer "
      ) ||
      !verify(
        authorization.slice(7),
        process.env.APP_SECRET
      )
    ) {

      return res.status(401).json({
        error:
          "Sesi tidak valid."
      });
    }


    /* =========================
       GET DATA
    ========================== */

    if (
      req.method === "GET"
    ) {

      try {

        const result =
          await jb("GET");


        const data =
          result.record ||
          empty;


        if (
          !isValidData(data)
        ) {

          return res.status(500).json({
            error:
              "Struktur data penyimpanan tidak valid.",
            code:
              "INVALID_DATA_STRUCTURE"
          });
        }


        return res.json(data);

      } catch (e) {

        console.error(
          "JSONBIN GET ERROR:",
          e
        );


        return res.status(502).json({
          error:
            "Gagal mengambil data dari penyimpanan. Data di server tidak diubah.",
          code:
            "STORAGE_READ_ERROR",
          upstreamStatus:
            e.status || null
        });
      }
    }


    /* =========================
       PUT DATA
    ========================== */

    if (
      req.method === "PUT"
    ) {

      try {

        const body =
          typeof req.body ===
          "string"
            ? JSON.parse(req.body)
            : req.body;


        if (
          !isValidData(body)
        ) {

          return res.status(400).json({
            error:
              "Format data tidak valid.",
            code:
              "INVALID_DATA"
          });
        }


        await jb(
          "PUT",
          body
        );


        return res.json({
          ok: true
        });

      } catch (e) {

        console.error(
          "JSONBIN PUT ERROR:",
          e
        );


        return res.status(502).json({
          error:
            "Data belum tersimpan. Penyimpanan sedang bermasalah.",
          code:
            "STORAGE_WRITE_ERROR",
          upstreamStatus:
            e.status || null
        });
      }
    }


    /* =========================
       METHOD TIDAK DIDUKUNG
    ========================== */

    return res.status(405).json({
      error:
        "Method not allowed"
    });
  };
