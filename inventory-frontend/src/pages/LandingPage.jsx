import { Link } from "react-router-dom";
import "../styles/LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Sistem Managemen Pengadaan</h1>
          <p>
            Streamline your inventory process with our powerful and intuitive
            management system
          </p>
        </div>
      </section>

      <section id="features" className="features">
        <h2>Key Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <h3>Managemen Item</h3>
            <p>Mempermudah Pencatatan Barang Keluar Dan Masuk</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Analisis Secara Real-Time</h3>
            <p>Dapatkan Laporan Analisis Secara Real-Time</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3>Peringatan Stock Yang Rendah</h3>
            <p>Mendapatkan Warna Peringatan Jika Stock Sedang Menipis</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Access Berdasarkan Role</h3>
            <p>Admin Dapat mengatur Role Pengguna</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Siap untuk melakukan optimasisasi Inventaris Anda?</h2>
        <p>Join thousands of businesses that trust our platform</p>
      </section>
    </div>
  );
};

export default LandingPage;
