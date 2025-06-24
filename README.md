<p align="center">
  <img src="https://raw.githubusercontent.com/TobeRich-maker/InvetoryBarang/main/assets/invetorydbimage.png" width="600" alt="ERD Inventory Barang" />
</p>

<h1 align="center">Inventory Barang</h1>
<p align="center">A simple inventory management system built with Laravel.</p>

<p align="center">
  <a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
  <a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
  <a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
  <a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

---

## 📦 About the Project

**Inventory Barang** adalah aplikasi manajemen inventaris berbasis web yang dibangun menggunakan Laravel. Aplikasi ini membantu mengelola data barang masuk, keluar, dan stok dengan antarmuka yang sederhana namun fungsional.

### ✨ Fitur Utama

- Manajemen barang (tambah, ubah, hapus)
- Riwayat barang masuk dan keluar
- Perhitungan stok secara otomatis
- Dashboard ringkasan aktivitas
- Laporan historis
- Prediksi kebutuhan stok (forecasting dengan exponential smoothing)

---

## 🚀 Tech Stack

- **Backend**: Laravel
- **Database**: MySQL
- **Forecasting**: Exponential Smoothing
- **Frontend**: Blade / Inertia / React *(disesuaikan jika pakai apa)*

---

## 🗃️ Database Schema (ERD)

```dbml
Table "barangs" {
  "id" bigint [pk, not null, increment]
  "kode_barang" varchar(255) [not null]
  "barcode" varchar(255) [default: NULL]
  "nama_barang" varchar(255) [not null]
  "kategori" varchar(255) [default: NULL]
  "stok" int [not null, default: '0']
  "harga" decimal(15,2) [default: '0.00']
  "satuan" varchar(255) [not null]
  "created_at" timestamp [default: NULL]
  "updated_at" timestamp [default: NULL]

  Indexes {
    kode_barang [unique, name: "barangs_kode_barang_unique"]
    barcode [unique, name: "barangs_barcode_unique"]
  }
}

Table "log_barang" {
  "id" bigint [pk, not null, increment]
  "barang_id" bigint [not null]
  "user_id" bigint [not null]
  "tipe" log_barang_tipe_enum [not null]
  "jumlah" int [not null]
  "keterangan" text
  "tanggal" date [not null]
  "created_at" timestamp [default: NULL]
  "updated_at" timestamp [default: NULL]

  Indexes {
    barang_id [name: "log_barang_barang_id_foreign"]
    user_id [name: "log_barang_user_id_foreign"]
  }
}

Table "users" {
  "id" bigint [pk, not null, increment]
  "name" varchar(255) [not null]
  "email" varchar(255) [not null]
  "email_verified_at" timestamp [default: NULL]
  "password" varchar(255) [not null]
  "role_id" bigint [not null]
  "remember_token" varchar(100) [default: NULL]
  "created_at" timestamp [default: NULL]
  "updated_at" timestamp [default: NULL]
  "token_prefix" varchar(255) [default: NULL]
  "token_series" int [not null, default: '1']

  Indexes {
    email [unique, name: "users_email_unique"]
    role_id [name: "users_role_id_foreign"]
  }
}

Table "roles" {
  "id" bigint [pk, not null, increment]
  "name" varchar(255) [not null]
  "created_at" timestamp [default: NULL]
  "updated_at" timestamp [default: NULL]

  Indexes {
    name [unique, name: "roles_name_unique"]
  }
}

Table "permissions" {
  "id" bigint [pk, not null, increment]
  "name" varchar(255) [not null]
  "display_name" varchar(255) [not null]
  "description" varchar(255) [default: NULL]
  "group" varchar(255) [default: NULL]
  "created_at" timestamp [default: NULL]
  "updated_at" timestamp [default: NULL]

  Indexes {
    name [unique, name: "permissions_name_unique"]
  }
}

Table "role_permission" {
  "id" bigint [pk, not null, increment]
  "role_id" bigint [not null]
  "permission_id" bigint [not null]
  "cr
