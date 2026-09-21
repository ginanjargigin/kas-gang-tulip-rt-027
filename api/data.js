const { verify } = require("./_auth");

const URL = "https://api.jsonbin.io/v3/b/";
const empty = {
  warga: [],
  kas: [],
  pengeluaran: []
};

async function jb(method, body) {
  const path = method === "GET" ? "/latest" : "";

  const r = await fetch(
    URL + process.env.JSONBIN_BIN_ID + path,
    {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Access-Key": process.env.JSONBIN_ACCESS_KEY
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    }
  );

  const t = await r.text();

  let d = {};
  try {
    d = JSON.parse(t);
  } catch {}

  if (!r.ok) {
    throw Error(d.message || "JSONBin error");
  }

  return d;
}

module.exports = async (req, res) => {
  const h = req.headers.authorization || "";

  if (
    !h.startsWith("Bearer ") ||
    !verify(h.slice(7), process.env.APP_SECRET)
  ) {
    return res.status(401).json({
      error: "Sesi tidak valid."
    });
  }

  try {
    if (req.method === "GET") {
      return res.json(
        (await jb("GET")).record || empty
      );
    }

    if (req.method === "PUT") {
      await jb("PUT", req.body || empty);

      return res.json({
        ok: true
      });
    }

    return res.status(405).json({
      error: "Method not allowed"
    });

  } catch (e) {
    return res.status(500).json({
      error: e.message
    });
  }
};
