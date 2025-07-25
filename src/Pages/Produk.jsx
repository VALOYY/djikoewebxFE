import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { getProducts } from '../api';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '../Components/Navbar';
import NavbarUser from '../Components/NavbarUser';
import Footer from '../Components/Footer';

const Produk = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUser({ ...currentUser, ...userDoc.data() });
          } else {
            setNotification({
              message: 'Data pengguna tidak ditemukan.',
              type: 'error',
            });
            setUser(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setNotification({
            message: 'Terjadi kesalahan saat memuat data pengguna.',
            type: 'error',
          });
          setUser(null);
        }
      } else {
        setUser(null);
      }

      try {
        const productsData = await getProducts();
        if (productsData.length === 0) {
          setNotification({
            message: 'Tidak ada produk yang tersedia saat ini.',
            type: 'info',
          });
        }
        setProducts(productsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setNotification({
          message: error.message || 'Gagal memuat produk.',
          type: 'error',
        });
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleBuy = async (product) => {
    if (!user) {
      setNotification({
        message: 'Silakan login untuk membeli produk.',
        type: 'error',
      });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    try {
      console.log('Navigating to product detail with ID:', product.id);
      navigate(`/detail-produk-user/${product.id}`);
    } catch (error) {
      console.error('Error navigating to product detail:', error);
      setNotification({
        message: 'Gagal menavigasi ke halaman detail produk.',
        type: 'error',
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-amber-50 w-full overflow-x-hidden">
      {user ? <NavbarUser user={user} /> : <Navbar />}
      <div className="max-w-6xl mx-auto p-6 flex flex-col items-center text-center min-h-[550px]">
        {notification.message && (
          <div
            className={`mb-4 p-4 rounded-lg text-white text-center ${
              notification.type === 'success' ? 'bg-green-600' : 
              notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
            }`}
          >
            {notification.message}
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-bold text-amber-800 text-center mb-8">
          Produk Kopi Premium
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-white rounded-2xl shadow p-4 h-80"
              >
                <div className="bg-amber-200 h-48 w-full rounded-lg mb-4"></div>
                <div className="h-4 bg-amber-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-amber-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.length === 0 ? (
              <p className="text-amber-800 text-center col-span-full">
                Belum ada produk tersedia.
              </p>
            ) : (
              products.map((plant) => (
                <div
                  key={plant.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition p-4 flex flex-col"
                >
                  <img
                    src={plant.gambar || 'https://via.placeholder.com/150x150.png?text=No+Image'}
                    alt={plant.nama}
                    className="rounded-lg h-48 w-full object-cover mb-4"
                  />
                  <h2 className="text-xl font-semibold text-amber-800 mb-2">{plant.nama}</h2>
                  <p className="text-lg text-amber-700 font-medium mb-4">
                    Rp {Number(plant.harga).toLocaleString('id-ID')}
                  </p>
                  <button
                    onClick={() => handleBuy(plant)}
                    className="mt-auto bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg p-3 transition duration-300 cursor-pointer shadow hover:shadow-lg"
                  >
                    {user ? 'Beli' : 'Login untuk Beli'}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Produk;