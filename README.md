## 📦 About the Project

<h1 align="center">Inventory Barang</h1>

**Inventory Barang** adalah aplikasi manajemen inventaris berbasis web yang dibangun menggunakan Laravel. Aplikasi ini membantu mengelola data barang masuk, keluar, dan stok dengan antarmuka, menampilkan Analisa Perkiraan Permintaan, Pengadaan, Anomalies dan Clasifikasi Item

<p align="center">Inventory management system built with Laravel, React, MySql.</p>

Tentu, Cimet! Berikut versi yang lebih rapi, profesional, dan mudah dibaca untuk ditaruh di README.md:

---

### 📦 Cara Menjalankan Project Ini

````markdown
## 📦 Cara Menjalankan Project Ini

### 1. Jalankan Database

Pastikan **Laragon**, **XAMPP**, atau server MySQL kamu sudah aktif.

### 2. Jalankan Backend Laravel

Masuk ke folder Laravel dan jalankan perintah berikut:

```bash
cd inventory-system/inventory-system
php artisan serve
```
````

### 3. Jalankan Frontend React

Buka terminal baru, masuk ke folder frontend dan jalankan:

```bash
cd inventory-system/inventory-system/inventory-frontend
npm install
npm start
```

---

✅ Setelah langkah di atas:

-   Laravel akan berjalan di: `http://127.0.0.1:8000`
-   React akan berjalan di: `http://localhost:3000`

```
---
Kalau kamu pakai Vite di frontend, tinggal ganti `npm start` jadi `npm run dev`.

### ✨ Fitur Utama

1.  Login Page
<p align="center">
  <img src="assets/public/images/loginpage.png" width="600" alt="Login Page" />
</p>
2.  Dashboard Halaman Utama
    <p align="center">
  <img src="https://raw.githubusercontent.com/TobeRich-maker/InvetoryBarang/main/assets/loginpage.png" width="600" alt="Login Page" />
</p>

        <p align="center">
        <img src="https://raw.githubusercontent.com/TobeRich-maker/InvetoryBarang/main/assets/Dashboard2.png" width="600" alt="Dashboard" />
        </p>

3.  Items (tambah, ubah, hapus, Search) Data Barang
<p align="center">
<img src="https://raw.githubusercontent.com/TobeRich-maker/InvetoryBarang/main/assets/Items1.png" width="600" alt="Dashboard" />
</p>
<p align="center">
<img src="https://raw.githubusercontent.com/TobeRich-maker/InvetoryBarang/main/assets/Items2.png" width="600" alt="Dashboard" />
</p>
<p align="center">
<img src="https://raw.githubusercontent.com/TobeRich-maker/InvetoryBarang/main/assets/Items2Search.png" width="600" alt="Dashboard" />
</p>
4.  Add Items, Tambah Barang Berdasarkan (Kode Item, Nama Item, Category, Stock dan Unit)
<p align="center">
<img src="https://raw.githubusercontent.com/TobeRich-maker/InvetoryBarang/main/assets/Additems1.png" width="600" alt="Dashboard" />
</p>
5.  Goods Out / Sales (Proses Transaksi Barang Keluar)
<p align="center">
    <img src="https://raw.githubusercontent.com/TobeRich-maker/InvetoryBarang/main/assets/GoodsOut1.png" width="600" alt="Dashboard" />
    </p>
6.  Analitics Menampilkan Dasboard Analisa Tentang Perkiraan permintaan, Barang yang di Beli kembali, Anomali, Klasifikasi Barang
<p align="center">
    <img src="https://raw.githubusercontent.com/TobeRich-maker/InvetoryBarang/main/assets/AnaliticsDashboard1.png" width="600" alt="Dashboard" />
</p>
<p align="center">
    <img src="https://raw.githubusercontent.com/TobeRich-maker/InvetoryBarang/main/assets/DeskripsiAnaliticsDashboard.png" width="600" alt="Dashboard" />
</p>
<p align="center">
    <img src="https://raw.githubusercontent.com/TobeRich-maker/InvetoryBarang/main/assets/AnaliticsDashboarForceastdemand.png" width="600" alt="Dashboard" />
</p>
<p align="center">
    <img src="https://raw.githubusercontent.com/TobeRich-maker/InvetoryBarang/main/assets/AnaliticsDashboarprocurement.png" width="600" alt="Dashboard" />
</p>
<p align="center">
    <img src="https://raw.githubusercontent.com/TobeRich-maker/InvetoryBarang/main/assets/AnaliticsDashboarAnomalies.png" width="600" alt="Dashboard" />
</p>
    <p align="center">
    <img src="https://raw.githubusercontent.com/TobeRich-maker/InvetoryBarang/main/assets/AnaliticsClasificationItems.png" width="600" alt="Dashboard" />
</p>

7.  Management Role
</p>
    <p align="center">
    <img src="https://raw.githubusercontent.com/TobeRich-maker/InvetoryBarang/main/assets/Rolemanagement1.png" width="600" alt="Dashboard" />
</p>
8.  Manajemen Akses
</p>
        <p align="center">
        <img src="https://raw.githubusercontent.com/TobeRich-maker/InvetoryBarang/main/assets/Permissionmanagement1.png" width="600" alt="Dashboard" />
    </p>
9.  Menu sistem Administration
</p>
        <p align="center">
        <img src="https://raw.githubusercontent.com/TobeRich-maker/InvetoryBarang/main/assets/sistemadministration1.png" width="600" alt="Dashboard" />
    </p>

## 🚀 Tech Stack

-   **Backend**: Laravel
-   **Database**: MySQL
-   **Forecasting**: Exponential Smoothing
-   **Frontend**: React JS

---

## 🗃️ Database Schema (ERD)

<p align="center">
  <img src="https://raw.githubusercontent.com/TobeRich-maker/InvetoryBarang/main/assets/invetorydbimage.png" width="600" alt="ERD Inventory Barang" />
</p>
```
