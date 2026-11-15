# Inventory API

RESTful API untuk Sistem Manajemen Inventaris Barang sederhana.

**Stack:** Node.js 22, Express, PostgreSQL, Prisma 6, JWT, Zod, bcryptjs.

## Fitur

- Register & Login (mengembalikan JWT)
- CRUD barang (hanya untuk user yang sudah login)
- Search dan pagination di `GET /items`
- Validasi input dengan Zod, ditambah constraint `CHECK (stock >= 0)` di database
- Endpoint `PATCH /items/:id/stock` untuk menambah/mengurangi stok secara atomik (aman dari race condition)

## Cara Menjalankan

### Opsi A: Docker Compose

```bash
git clone https://github.com/bamaarintoko/inventory-api.git
cd inventory-api
docker compose up --build
```

API berjalan di `http://localhost:3000`. Migrasi database dijalankan otomatis saat container start.

> **Catatan:** Setup Docker belum saya uji langsung karena laptop saya (macOS 11 Big Sur) tidak didukung Docker Desktop versi terbaru. Setup manual (Opsi B) sudah diuji dari clone repo yang bersih.

### Opsi B: Manual

Prasyarat: Node.js 22 dan PostgreSQL.

```bash
# 0. Clone repo
git clone https://github.com/bamaarintoko/inventory-api.git
cd inventory-api

# 1. Install dependency
npm install

# 2. Buat database
psql -c "CREATE DATABASE inventory_db;"

# 3. Salin env, lalu sesuaikan DATABASE_URL dan JWT_SECRET
cp .env.example .env

# 4. Jalankan migrasi
npx prisma migrate deploy

# 5. Jalankan server
npm run dev
```

Contoh isi `.env` untuk PostgreSQL lokal tanpa password (misalnya Postgres.app):

```
DATABASE_URL="postgresql://NAMA_USER@localhost:5432/inventory_db"
```

Buat `JWT_SECRET` acak dengan:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Dokumentasi API

Import file `docs/inventory-api.postman_collection.json` ke Postman. Jalankan request **Login** terlebih dahulu; token otomatis tersimpan ke variabel `{{token}}` dan dipakai oleh semua request di folder Items.

| Method | Endpoint | Auth | Keterangan |
|---|---|---|---|
| POST | `/auth/register` | - | Body: `name`, `email`, `password` (min. 8 karakter) |
| POST | `/auth/login` | - | Body: `email`, `password`. Response berisi `token` |
| GET | `/items` | Bearer | Query: `search`, `page` (default 1), `limit` (default 10, maks. 100) |
| POST | `/items` | Bearer | Body: `name`, `description`, `stock` (int ≥ 0), `price` (≥ 0) |
| PUT | `/items/:id` | Bearer | Body sama dengan POST |
| DELETE | `/items/:id` | Bearer | Hapus barang |
| PATCH | `/items/:id/stock` | Bearer | Body: `quantity` (int, positif = tambah, negatif = kurangi) |

Semua endpoint `/items` membutuhkan header `Authorization: Bearer <token>`.

### Format Response

Sukses:

```json
{ "message": "Barang berhasil ditambahkan", "data": { "id": 1, "name": "Laptop", "stock": 1, "price": "8500000" } }
```

List dengan pagination:

```json
{
  "message": "OK",
  "data": [ { "id": 1, "name": "Laptop" } ],
  "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

Validasi gagal (`400`):

```json
{ "message": "Validasi gagal", "errors": [ { "field": "stock", "message": "Stok tidak boleh negatif" } ] }
```

### Kode Status

| Kode | Arti |
|---|---|
| 200 / 201 | Berhasil |
| 400 | Input tidak valid |
| 401 | Token tidak ada, tidak valid, atau kedaluwarsa; login gagal |
| 404 | Barang tidak ditemukan |
| 409 | Email sudah terdaftar; stok tidak mencukupi |
| 500 | Kesalahan server |

## Struktur Project

```
src/
├── config/        # koneksi Prisma
├── routes/        # definisi endpoint
├── middlewares/   # autentikasi, validasi, error handler
├── controllers/   # menerima request & mengirim response
├── services/      # business logic
├── repositories/  # query ke database
├── validators/    # schema Zod
├── utils/         # AppError
├── app.js
└── server.js
prisma/
├── schema.prisma
└── migrations/
```

## Pertanyaan Pemahaman

### 1. Alur Request

Alurnya: Router → Middleware (cek token dan validasi input) → Controller → Service → Repository → Database. Router menentukan endpoint mana yang dipanggil. Middleware memastikan user sudah login dan datanya valid. Controller menerima request dan mengirim response. Service berisi aturan bisnis, misalnya mengecek apakah barang ada. Repository yang menjalankan query ke database. Saya pisahkan seperti ini supaya setiap bagian punya satu tugas. Kalau ada bug atau database-nya diganti, saya cukup ubah satu bagian tanpa mengganggu yang lain.

### 2. Keamanan & Token

Menurut saya lebih aman disimpan di HttpOnly Cookie. Token di Local Storage bisa dibaca JavaScript, jadi kalau ada serangan XSS, token bisa dicuri. HttpOnly Cookie tidak bisa diakses JavaScript sama sekali. Risikonya adalah serangan CSRF, karena cookie otomatis terkirim oleh browser, tapi ini bisa dicegah dengan atribut `SameSite` dan `Secure`. Di project ini, token masih saya kembalikan lewat response body supaya mudah dites di Postman.

### 3. Penanganan Konkurensi

Pengecekan dan pengurangan stok saya jadikan satu query: `UPDATE items SET stock = stock - 1 WHERE id = ? AND stock >= 1`. PostgreSQL mengunci baris saat update, jadi request kedua harus menunggu. Setelah request pertama selesai, stok sudah 0, sehingga kondisi `stock >= 1` gagal dan request kedua mendapat error "Stok tidak mencukupi". Sebagai pengaman tambahan, saya pasang constraint `CHECK (stock >= 0)` di database, sehingga stok tidak mungkin negatif walaupun ada bug di kode.