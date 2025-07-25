import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuIcon, XIcon } from '@heroicons/react/outline';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsDropdownOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="bg-gradient-to-r from-amber-800/90 to-amber-900/90 shadow-lg sticky top-0 z-50 backdrop-blur-md">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Logo */}
        <div
          className="flex items-center space-x-2 cursor-pointer transform hover:scale-105 transition-transform"
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center shadow-sm hover:animate-pulse">
            <span className="text-white font-bold text-2xl">☕</span>
          </div>
          <span className="text-xl font-bold text-amber-100 tracking-tight">
            Djikoe Coffee
          </span>
        </div>

        {/* Hamburger Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-amber-100 focus:outline-none transform transition-transform duration-300 hover:scale-110"
          >
            {isOpen ? (
              <XIcon className="w-7 h-7" />
            ) : (
              <MenuIcon className="w-7 h-7" />
            )}
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <a
            href="/"
            className="text-amber-100 font-semibold relative hover:text-amber-300 after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-amber-300 after:left-0 after:bottom-[-4px] after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100"
          >
            Beranda
          </a>
          <a
            href="/produk"
            className="text-amber-100 font-semibold relative hover:text-amber-300 after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-amber-300 after:left-0 after:bottom-[-4px] after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100"
          >
            Produk
          </a>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-medium">
                  {getInitials(user.displayName || user.email)}
                </div>
                <span className="text-amber-100 font-medium hidden lg:inline">
                  {user.displayName || user.email.split('@')[0]}
                </span>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 animate-slide-in">
                  <a
                    href="/profile"
                    className="block px-4 py-2 text-gray-800 hover:bg-amber-50 hover:text-amber-600"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </a>
                  <a
                    href="/riwayat-user"
                    className="block px-4 py-2 text-gray-800 hover:bg-amber-50 hover:text-amber-600"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Riwayat Pemesanan
                  </a>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-amber-50 hover:text-amber-600"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-5 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-transform hover:scale-105"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-5 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-transform hover:scale-105"
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 sm:px-6 pb-4 flex flex-col gap-4 bg-gradient-to-r from-amber-800 to-amber-900 animate-slide-in">
          <a
            href="/"
            className="text-amber-100 font-semibold relative hover:text-amber-300 after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-amber-300 after:left-0 after:bottom-[-4px] after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100"
            onClick={() => setIsOpen(false)}
          >
            Beranda
          </a>
          <a
            href="/produk"
            className="text-amber-100 font-semibold relative hover:text-amber-300 after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-amber-300 after:left-0 after:bottom-[-4px] after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100"
            onClick={() => setIsOpen(false)}
          >
            Produk
          </a>
          {user ? (
            <>
              <a
                href="/profile"
                className="text-amber-100 font-semibold relative hover:text-amber-300 after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-amber-300 after:left-0 after:bottom-[-4px] after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </a>
              <a
                href="/riwayat-user"
                className="text-amber-100 font-semibold relative hover:text-amber-300 after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-amber-300 after:left-0 after:bottom-[-4px] after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100"
                onClick={() => setIsOpen(false)}
              >
                Riwayat Pemesanan
              </a>
              <button
                onClick={() => { setIsOpen(false); handleLogout(); }}
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-5 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-transform hover:scale-105"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setIsOpen(false); navigate('/login'); }}
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-5 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-transform hover:scale-105"
              >
                Login
              </button>
              <button
                onClick={() => { setIsOpen(false); navigate('/register'); }}
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-5 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-transform hover:scale-105"
              >
                Register
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;