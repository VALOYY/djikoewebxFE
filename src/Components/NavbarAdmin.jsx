// src/Components/NavbarAdmin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api';

const NavbarAdmin = ({ user }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Auto-clear notification after 3 seconds
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

  if (notification.message) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-amber-50 p-4">
        <div
          className={`p-4 rounded-lg text-white text-center ${
            notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {notification.message}
        </div>
      </div>
    );
  }

  return (
    <nav className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 shadow-2xl sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-20">
        {/* Logo */}
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => navigate('/admin')}
        >
          <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">☕</span>
          </div>
          <span className="text-2xl font-bold text-amber-100 tracking-wide">
            Admin Djikoe 
          </span>
        </div>

        {/* Hamburger Button for Mobile */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-amber-100 focus:outline-none text-2xl"
          >
            {isOpen ? '✖️' : '☰'}
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
          <button
            onClick={() => navigate('/admin')}
            className="text-amber-100 hover:text-amber-300 font-medium"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/admin-produk')}
            className="text-amber-100 hover:text-amber-300 font-medium"
          >
            Produk
          </button>
          <button
            onClick={() => navigate('/admin-pesanan')}
            className="text-amber-100 hover:text-amber-300 font-medium"
          >
            Pesanan
          </button>
          <button
            onClick={handleLogout}
            className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-full font-medium shadow"
          >
            Logout ({user?.name || 'Admin'})
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-6 pb-4 flex flex-col space-y-3">
          <button
            onClick={() => navigate('/admin')}
            className="text-amber-100 hover:text-amber-300 font-medium text-left"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/admin-produk')}
            className="text-amber-100 hover:text-amber-300 font-medium text-left"
          >
            Produk
          </button>
          <button
            onClick={() => navigate('/admin-pesanan')}
            className="text-amber-100 hover:text-amber-300 font-medium text-left"
          >
            Pesanan
          </button>
          <button
            onClick={handleLogout}
            className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-full font-medium shadow text-left"
          >
            Logout ({user?.name || 'Admin'})
          </button>
        </div>
      )}
    </nav>
  );
};

export default NavbarAdmin;