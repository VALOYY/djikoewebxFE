import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { logout, getStatistik } from '../api';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { ShoppingCartIcon, CubeIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/outline';
import Footer from '../Components/Footer';
import NavbarAdmin from '../Components/NavbarAdmin';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [statistik, setStatistik] = useState({
    totalPesanan: 0,
    totalProduk: 0,
    pendapatanBulanIni: 0,
    totalUser: 0,
  });
  const [statistikLoading, setStatistikLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setNotification({
          message: 'Anda harus login sebagai admin terlebih dahulu.',
          type: 'error',
        });
        setTimeout(() => navigate('/login'), 2000);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (!userDoc.exists()) {
          setNotification({
            message: 'Data pengguna tidak ditemukan.',
            type: 'error',
          });
          setTimeout(() => navigate('/login'), 2000);
          setLoading(false);
          return;
        }

        const userData = userDoc.data();
        if (userData.role !== 'admin') {
          setNotification({
            message: 'Halaman ini hanya untuk admin.',
            type: 'error',
          });
          setTimeout(() => navigate('/'), 2000);
          setLoading(false);
          return;
        }

        setUser({ ...currentUser, ...userData });

        try {
          const stats = await getStatistik();
          setStatistik(stats);
          setStatistikLoading(false);
        } catch (error) {
          console.error('Error fetching statistik:', error);
          setNotification({
            message: 'Gagal memuat statistik.',
            type: 'error',
          });
          setStatistikLoading(false);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setNotification({
          message: 'Terjadi kesalahan saat memuat data pengguna.',
          type: 'error',
        });
        setTimeout(() => navigate('/login'), 2000);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleLogout = async () => {
    try {
      await logout();
      setNotification({
        message: 'Logout berhasil, Anda akan diarahkan ke halaman login.',
        type: 'success',
      });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      console.error('Logout error:', error);
      setNotification({
        message: error.message || 'Gagal logout, silakan coba lagi.',
        type: 'error',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-amber-50">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-700 text-lg font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-amber-50">
      <NavbarAdmin />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {notification.message && (
          <div className="fixed top-4 right-4 max-w-md w-full p-4 rounded-lg shadow-lg text-white text-center animate-fade-in z-50">
            <div
              className={`p-4 rounded-lg ${
                notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {notification.message}
            </div>
          </div>
        )}

        <h2 className="text-3xl font-bold text-gray-800 mb-8 tracking-tight">
          Dashboard Admin
        </h2>

        {statistikLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-amber-100 to-amber-200 rounded-xl shadow-lg p-6 transform transition-transform hover:scale-105">
              <div className="flex items-center space-x-3">
                <ShoppingCartIcon className="h-8 w-8 text-amber-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Total Pesanan</h3>
                  <p className="text-2xl font-bold text-gray-800">{statistik.totalPesanan}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-amber-100 to-amber-200 rounded-xl shadow-lg p-6 transform transition-transform hover:scale-105">
              <div className="flex items-center space-x-3">
                <CubeIcon className="h-8 w-8 text-amber-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Total Produk</h3>
                  <p className="text-2xl font-bold text-gray-800">{statistik.totalProduk}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-amber-100 to-amber-200 rounded-xl shadow-lg p-6 transform transition-transform hover:scale-105">
              <div className="flex items-center space-x-3">
                <CurrencyDollarIcon className="h-8 w-8 text-amber-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Pendapatan Bulan Ini</h3>
                  <p className="text-2xl font-bold text-gray-800">
                    Rp {Number(statistik.pendapatanBulanIni).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-amber-100 to-amber-200 rounded-xl shadow-lg p-6 transform transition-transform hover:scale-105">
              <div className="flex items-center space-x-3">
                <UserGroupIcon className="h-8 w-8 text-amber-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Total User</h3>
                  <p className="text-2xl font-bold text-gray-800">{statistik.totalUser}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/admin-produk')}
            className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-6 py-4 rounded-xl font-semibold shadow-lg flex items-center justify-center space-x-2 transform transition-transform hover:scale-105"
          >
            <CubeIcon className="h-6 w-6" />
            <span>Kelola Produk</span>
          </button>
          <button
            onClick={() => navigate('/admin-pesanan')}
            className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-6 py-4 rounded-xl font-semibold shadow-lg flex items-center justify-center space-x-2 transform transition-transform hover:scale-105"
          >
            <ShoppingCartIcon className="h-6 w-6" />
            <span>Kelola Pesanan</span>
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;