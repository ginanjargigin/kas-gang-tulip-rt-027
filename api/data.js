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

  const maxAttempts = 3;
  const timeoutMs = 15000;

  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      const r = await fetch(
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

        /*
         * Jangan retry error client/auth.
         * Contoh:
         * 400, 401, 403, 404
         */
        if (
          r.status >= 400 &&
          r.status < 500
        ) {
          throw error;
        }

        /*
         * Error 5xx boleh dicoba ulang.
         */
        lastError = error;

      } else {
        return data;
      }

    } catch (e) {
      lastError = e;

      /*
       * Timeout.
       */
      if (
        e?.name ===
        "AbortError"
      ) {
        lastError =
          new Error(
            `JSONBin timeout pada percobaan ${attempt}/${maxAttempts}.`
          );

        lastError.code =
          "JSONBIN_TIMEOUT";
      }

      /*
       * Jangan retry error 4xx.
       */
      if (
        e?.status &&
        e.status >= 400 &&
        e.status < 500
      ) {
        throw e;
      }
    } finally {
      clearTimeout(timeout);
    }

    /*
     * Masih ada percobaan berikutnya.
     */
    if (
      attempt < maxAttempts
    ) {
      const delay =
        attempt * 1000;

      console.warn(
        `JSONBin gagal. Retry ${attempt + 1}/${maxAttempts} dalam ${delay} ms...`
      );

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            delay
          )
      );
    }
  }

  throw lastError ||
    new Error(
      "JSONBin tidak dapat dihubungi."
    );
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


       if (!isValidData(data)) {
          return res.status(500).json({
            error:
              "Struktur data penyimpanan tidak valid.",
            code:
              "INVALID_DATA_STRUCTURE"
          });
        }
        
        res.setHeader(
          "Cache-Control",
          "no-store"
        );
        
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
