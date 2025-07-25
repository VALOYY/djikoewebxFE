import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

const Home = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ message: '', type: '' });

  const coffeeProducts = [
    {
      name: "Arabica Aceh Gayo",
      price: 85000,
      image: "https://via.placeholder.com/300x200.png?text=Arabica+Aceh+Gayo",
      description: "Cita rasa fruity dengan aroma yang khas",
    },
    {
      name: "Robusta Lampung",
      price: 65000,
      image: "https://via.placeholder.com/300x200.png?text=Robusta+Lampung",
      description: "Kopi dengan body yang kuat dan pahit yang pas",
    },
    {
      name: "Kopi Toraja",
      price: 95000,
      image: "https://via.placeholder.com/300x200.png?text=Kopi+Toraja",
      description: "Premium coffee dengan rasa yang kompleks",
    },
  ];

  const handleProtectedClick = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      setNotification({
        message: 'Anda harus login terlebih dahulu.',
        type: 'error',
      });
      setTimeout(() => navigate('/login'), 2000);
    } else {
      navigate('/produk');
    }
  };

  const handleContactClick = () => {
    const phoneNumber = '+6289673374443'; // Ganti dengan nomor WhatsApp asli
    const message = encodeURIComponent('Aduhai Kawan');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-amber-100 w-full overflow-x-hidden">
      <Navbar />
      <main className="flex-grow w-full">
        {/* Notification */}
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

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 px-4 sm:px-6 lg:px-8 py-20 flex items-center justify-center min-h-screen">
          <div className="text-center max-w-4xl">
            <div className="mb-8 animate-pulse">
              <span className="text-9xl md:text-10xl">☕</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight tracking-tight">
              Selamat Datang di
              <span className="block text-amber-700">Djikoe Coffee</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
              Nikmati biji kopi premium berkualitas tinggi langsung dari petani lokal Indonesia. Rasakan cita rasa autentik kopi nusantara yang tak terlupakan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-transform hover:scale-105"
                onClick={handleProtectedClick}
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

        {/* Featured Products */}
        <section className="bg-white px-4 sm:px-6 lg:px-8 py-16">
          <div className="w-full max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-800 text-center mb-12 tracking-tight">
              Produk Unggulan Kami
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {coffeeProducts.map((product, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-transform hover:scale-105 border border-amber-200"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-center mb-4">{product.description}</p>
                  <div className="text-center">
                    <span className="text-2xl font-bold text-amber-800">
                      Rp {Number(product.price).toLocaleString('id-ID')}
                    </span>
                    <p className="text-sm text-gray-500">per 250g</p>
                  </div>
                  <button
                    className="w-full mt-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white py-3 rounded-full font-semibold shadow-lg transition-transform hover:scale-105"
                    onClick={handleProtectedClick}
                  >
                    Tambah ke Keranjang
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-amber-700 to-amber-900 px-4 sm:px-6 lg:px-8 py-16 text-white">
          <div className="w-full max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 tracking-tight">
              Siap Merasakan Kopi Terbaik Indonesia?
            </h2>
            <p className="text-xl mb-8 text-amber-100">
              Bergabunglah dengan ribuan pelanggan yang telah merasakan kenikmatan kopi premium kami
            </p>
            <button
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-10 py-4 rounded-full text-xl font-semibold shadow-lg hover:shadow-xl transition-transform hover:scale-105"
              onClick={handleProtectedClick}
            >
              Pesan Sekarang Juga!
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;