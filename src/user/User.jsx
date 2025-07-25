import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase'; // Import auth and db from api.js
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '../Components/NavbarUser';
import Footer from '../Components/Footer';

const handleContactClick = () => {
    const phoneNumber = '+6289673374443'; // Ganti dengan nomor WhatsApp asli
    const message = encodeURIComponent('Aduhai Kawan');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };


const User = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setNotification({
          message: 'Anda harus login terlebih dahulu.',
          type: 'error',
        });
        setTimeout(() => navigate('/login'), 2000);
        setLoading(false);
        return;
      }

      try {
        // Fetch user data from Firestore
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
        if (userData.role === 'admin') {
          setNotification({
            message: 'Halaman ini hanya untuk pengguna.',
            type: 'error',
          });
          setTimeout(() => navigate('/admin'), 2000);
          setLoading(false);
          return;
        }

        setUser({ ...currentUser, ...userData });
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

    return () => unsubscribe(); // Cleanup on unmount
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <p className="text-amber-700 text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  if (notification.message) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="bg-red-600 text-white p-4 rounded-lg text-center">
          {notification.message}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-amber-50 w-full overflow-x-hidden">
      <Navbar />
      <main className="flex-grow w-full">
        <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 px-4 md:px-6 py-20 flex items-center justify-center min-h-screen">
          <div className="text-center max-w-3xl">
            <div className="mb-8 animate-bounce inline-block">
              <span className="text-8xl">☕</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-amber-900 mb-6 leading-tight">
              Selamat Datang,
              <span className="block text-amber-700">{user?.name}</span>
            </h1>
            <p className="text-xl md:text-2xl text-amber-800 mb-8 leading-relaxed">
              Nikmati biji kopi premium berkualitas tinggi langsung dari petani lokal Indonesia.
              Rasakan cita rasa autentik kopi nusantara yang tak terlupakan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/produk')}
                className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-4 rounded-full text-lg font-semibold transition duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Jelajahi Produk
              </button>
              <button
                 className="border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white px-8 py-4 rounded-full text-lg font-semibold transition-transform hover:scale-105"
                onClick={handleContactClick}
              >
                Hubungi Kami
              </button>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </div>
  );
};

export default User;