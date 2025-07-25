import React from 'react';

 const handleContactClick = () => {
    const phoneNumber = '+6289673374443'; // Ganti dengan nomor WhatsApp asli
    const message = encodeURIComponent('Aduhai Kawan');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

const Footer = () => {
  return (
    <footer id="contact" className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-amber-100">
      <div className="max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">☕</span>
              </div>
              <span className="text-2xl font-bold"> Djikoe "Biji Kopi"</span>
            </div>
            <p className="text-amber-200 mb-4 leading-relaxed">
              Biji kopi pilihan dari Sabang sampai Merauke, menghadirkan citarasa khas Indonesia yang autentik.
            </p>
            <div className="flex space-x-4">
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-amber-700 hover:bg-amber-600 rounded-full flex items-center justify-center transition duration-300 transform hover:scale-110">
                <span className="text-sm">📘</span>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-amber-700 hover:bg-amber-600 rounded-full flex items-center justify-center transition duration-300 transform hover:scale-110">
                <span className="text-sm">📷</span>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-amber-700 hover:bg-amber-600 rounded-full flex items-center justify-center transition duration-300 transform hover:scale-110">
                <span className="text-sm">💬</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-300">Menu Cepat</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-amber-200 hover:text-amber-300 transition duration-300">
                  Beranda
                </a>
              </li>
              <li>
                <a href="/produk" className="text-amber-200 hover:text-amber-300 transition duration-300">
                  Produk Kami
                </a>
              </li>
              <li>
                <a onClick={handleContactClick} className="text-amber-200 hover:text-amber-300 transition duration-300">
                  Hubungi Kami
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-300">Kontak</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-amber-400">📍</span>
                <span className="text-amber-200 break-words">
                  Putra Mandiri Regency No. D5, Jl. Palakali, Beji, Depok, Jawa Barat, Indonesia 16426
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-amber-400">📞</span>
                <span className="text-amber-200">+62 896-7337-4443</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-amber-400">✉️</span>
                <span className="text-amber-200">Djikoecoffee@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-amber-700 mt-8 pt-6 text-center">
          <p className="text-amber-300">
            © {new Date().getFullYear()} Djikoe Coffee. Semua hak dilindungi.
            <span className="mx-2">|</span>
            Djikoe dilahirkan dari cinta ❤️ untuk Indonesia.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
