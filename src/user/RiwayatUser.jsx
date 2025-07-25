import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { getPesananByUser } from '../api';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { ShoppingCartIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/outline';
import NavbarUser from '../Components/NavbarUser';
import Footer from '../Components/Footer';

const RiwayatUser = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [navbarLoading, setNavbarLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    let unsubscribe;
    const fetchData = async () => {
      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              if (userData.role !== 'user') {
                setNotification({
                  message: 'Akses ditolak! Halaman ini hanya untuk pengguna.',
                  type: 'error',
                });
                setTimeout(() => navigate('/'), 2000);
                setUser(null);
              } else {
                setUser({ ...currentUser, ...userData });
                const userOrders = await getPesananByUser(currentUser.uid);
                setOrders(userOrders || []);
              }
            } else {
              setNotification({
                message: 'Data pengguna tidak ditemukan.',
                type: 'error',
              });
              setTimeout(() => navigate('/login'), 2000);
              setUser(null);
            }
          } catch (error) {
            console.error('Error fetching user data or orders:', error);
            setNotification({
              message: error.message || 'Terjadi kesalahan saat memuat data.',
              type: 'error',
            });
            setTimeout(() => navigate('/login'), 2000);
            setUser(null);
          }
        } else {
          setNotification({
            message: 'Anda harus login terlebih dahulu.',
            type: 'error',
          });
          setTimeout(() => navigate('/login'), 2000);
          setUser(null);
        }
        setLoading(false);
        setNavbarLoading(false);
      });
    };

    fetchData();
    return () => unsubscribe && unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'selesai':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-5 w-5 mr-1" />
            Selesai
          </span>
        );
      case 'menunggu':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-5 w-5 mr-1" />
            Menunggu
          </span>
        );
      case 'batal':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircleIcon className="h-5 w-5 mr-1" />
            Batal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            Tidak Diketahui
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-amber-100 w-full overflow-x-hidden">
      {navbarLoading ? null : <NavbarUser />}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {notification.message && (
          <div className="fixed top-4 right-4 max-w-md w-full p-4 rounded-xl shadow-lg text-white font-medium text-center animate-fade-in z-50">
            <div
              className={`p-4 rounded-lg ${
                notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {notification.message}
            </div>
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-800 mb-8 tracking-tight">
          Riwayat Pemesanan Anda
        </h1>
        {loading ? (
          <div className="grid grid-cols-1 gap-6">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <p className="text-gray-600 text-lg">Belum ada riwayat pemesanan.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-amber-600 to-amber-700 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold flex items-center">
                      <ShoppingCartIcon className="h-5 w-5 mr-2" />
                      Produk
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Tanggal</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Jumlah</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-amber-50`}
                    >
                      <td className="px-6 py-4 text-gray-700">{item.produk || 'Tidak diketahui'}</td>
                      <td className="px-6 py-4 text-gray-700">{item.tanggal || 'Tidak diketahui'}</td>
                      <td className="px-6 py-4 text-gray-700">{item.jumlah || 0}</td>
                      <td className="px-6 py-4 text-gray-700">
                        Rp {item.total ? Number(item.total).toLocaleString('id-ID') : '0'}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default RiwayatUser;