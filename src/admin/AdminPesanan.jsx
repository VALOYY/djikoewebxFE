import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { getPesanan, updatePesanan, deletePesanan } from '../api';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import NavbarAdmin from '../Components/NavbarAdmin';
import Footer from '../Components/Footer';
import { TrashIcon, EyeIcon } from '@heroicons/react/outline';

const AdminPesanan = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.role !== 'admin') {
              setNotification({
                message: 'Akses ditolak. Hanya admin yang dapat mengakses halaman ini.',
                type: 'error',
              });
              setTimeout(() => navigate('/'), 2000);
              return;
            }
            setUser({ ...currentUser, ...userData });
          } else {
            setNotification({
              message: 'Data pengguna tidak ditemukan.',
              type: 'error',
            });
            setUser(null);
            setTimeout(() => navigate('/login'), 2000);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setNotification({
            message: 'Terjadi kesalahan saat memuat data pengguna.',
            type: 'error',
          });
          setUser(null);
          setTimeout(() => navigate('/login'), 2000);
        }
      } else {
        setUser(null);
        setNotification({
          message: 'Silakan login sebagai admin untuk mengakses halaman ini.',
          type: 'error',
        });
        setTimeout(() => navigate('/login'), 2000);
      }

      try {
        const ordersData = await getPesanan();
        setOrders(ordersData || []);
        setFilteredOrders(ordersData || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setNotification({
          message: error.message || 'Gagal memuat data pesanan.',
          type: 'error',
        });
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

  useEffect(() => {
    if (filterStatus === 'Semua') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((order) => order.status === filterStatus));
    }
  }, [filterStatus, orders]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!user || user.role !== 'admin') return;

    try {
      await updatePesanan(orderId, { status: newStatus });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      setNotification({
        message: `Status pesanan berhasil diperbarui menjadi "${newStatus}".`,
        type: 'success',
      });
    } catch (error) {
      console.error('Error updating order:', error);
      setNotification({
        message: error.message || 'Gagal memperbarui status pesanan.',
        type: 'error',
      });
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!user || user.role !== 'admin') return;

    try {
      await deletePesanan(orderId);
      setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
      setNotification({
        message: 'Pesanan berhasil dihapus.',
        type: 'success',
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      setNotification({
        message: error.message || 'Gagal menghapus pesanan.',
        type: 'error',
      });
    }
  };

  const handleViewImage = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const getStatusClass = (status) => {
    const baseClasses = 'text-xs sm:text-sm p-1 sm:p-2 rounded-lg border shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition';
    if (status === 'Menunggu') {
      return `${baseClasses} bg-yellow-200 text-white border-yellow-300`;
    } else if (status === 'Diproses') {
      return `${baseClasses} bg-blue-600 text-white border-blue-300`;
    } else {
      return `${baseClasses} bg-green-600 text-white border-green-300`;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 w-full overflow-x-hidden">
      <NavbarAdmin user={user} />
      <div className="max-w-full sm:max-w-7xl mx-auto p-4 sm:p-6 flex flex-col flex-grow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-4 sm:space-y-0">
          <h1 className="text-xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">
            Manajemen Pesanan
          </h1>
          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
            <label className="text-gray-700 font-medium text-sm sm:text-base">Filter Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-gray-300 text-gray-700 text-xs sm:text-sm p-1 sm:p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition w-full sm:w-auto"
            >
              <option value="Semua">Semua</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Diproses">Diproses</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
        </div>

        {notification.message && (
          <div
            className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg text-white text-center shadow-lg transform transition-opacity duration-500 ease-in-out ${
              notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            } animate-fade-in text-xs sm:text-sm`}
          >
            {notification.message}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-white rounded-xl shadow-lg p-4 sm:p-6"
              >
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-3 sm:mb-4"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
            {filteredOrders.length === 0 ? (
              <p className="text-gray-600 text-center p-4 sm:p-6 text-sm sm:text-base">
                Belum ada pesanan tersedia.
              </p>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                  <thead className="bg-amber-600">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[120px] sm:min-w-[150px]">
                        Pesanan
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[150px] sm:min-w-[200px]">
                        Alamat
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[100px] sm:min-w-[150px]">
                        No Telepon
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[100px] sm:min-w-[150px]">
                        Produk
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[100px] sm:min-w-[150px]">
                        Total
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[120px] sm:min-w-[200px]">
                        Bukti Pembayaran
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[100px] sm:min-w-[150px]">
                        Status
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[100px] sm:min-w-[150px]">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-amber-50 transition duration-200"
                      >
                        <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm font-medium text-gray-900">
                            {order.namaUser || '—'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.tanggal ? new Date(order.tanggal).toLocaleDateString('id-ID') : '—'}
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm text-gray-700">
                          {order.alamatLengkap || '—'}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                          {order.nomorTelepon || '—'}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                          {order.produk || '—'}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                          Rp {order.total ? Number(order.total).toLocaleString('id-ID') : '0'}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                          {order.buktiPembayaran ? (
                            <button
                              onClick={() => handleViewImage(order.buktiPembayaran)}
                              className="text-amber-600 hover:text-amber-800 transition duration-200 flex items-center space-x-1 text-xs sm:text-sm"
                            >
                              <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                              <span>Lihat</span>
                            </button>
                          ) : (
                            <span className="text-gray-500">Tidak ada</span>
                          )}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">
                          <select
                            value={order.status || 'Menunggu'}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            className={getStatusClass(order.status || 'Menunggu')}
                            disabled={user?.role !== 'admin'}
                          >
                            <option value="Menunggu">Menunggu</option>
                            <option value="Diproses">Diproses</option>
                            <option value="Selesai">Selesai</option>
                          </select>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="text-red-600 hover:text-red-800 transition duration-200 flex items-center space-x-1 text-xs sm:text-sm"
                            disabled={user?.role !== 'admin'}
                          >
                            <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span>Hapus</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal for Image Preview */}
        {selectedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl w-[90vw] sm:max-w-3xl max-h-[90vh] relative">
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-600 hover:text-gray-800 transition duration-200"
              >
                <svg
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <img
                src={selectedImage}
                alt="Bukti Pembayaran"
                className="max-w-full max-h-[70vh] sm:max-h-[80vh] object-contain rounded-lg"
                onError={() => setSelectedImage(null)}
              />
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminPesanan;