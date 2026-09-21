KAS GANG RT 027 — JSONBin + Vercel

Fitur: login admin, dashboard saldo/pemasukan/pengeluaran, data warga, pembayaran kas+denda, pengeluaran, pencarian, dan rekap.

1. JSONBin: buat Private Bin berisi {"warga":[],"kas":[],"pengeluaran":[]}.
2. Buat Access Key dengan permission Bins Read + Update.
3. Catat BIN ID dan Access Key.
4. Upload project ini ke GitHub lalu Import ke Vercel.
5. Tambahkan Environment Variables:
JSONBIN_BIN_ID=ID_BIN
JSONBIN_ACCESS_KEY=ACCESS_KEY
ADMIN_EMAIL=email admin
ADMIN_PASSWORD=password admin
APP_SECRET=string_acak_panjang_minimal_32_karakter
6. Deploy dan buka URL Vercel.

PENTING: jangan taruh Master Key JSONBin di browser. Project ini menyimpan Access Key di server Vercel. Password admin versi ini juga berada di Environment Variable Vercel.
