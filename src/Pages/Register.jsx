import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api'; // Import the register function from api.js

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [notification, setNotification] = useState({ message: '', type: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData.email, formData.password, formData.name);
      setNotification({
        message: 'Registrasi berhasil, silakan login!',
        type: 'success',
      });
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Redirect after 2 seconds to show notification
    } catch (error) {
      setNotification({
        message: error.message || 'Terjadi kesalahan saat register.',
        type: 'error',
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 px-4">
      <div className="w-full max-w-md">
        {/* Notification */}
        {notification.message && (
          <div
            className={`mb-4 p-4 rounded-lg text-white text-center ${
              notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {notification.message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-2xl p-8 space-y-6 animate-fade-in"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-amber-800 text-center">
            Daftar Akun Baru
          </h2>

          <input
            type="text"
            name="name"
            placeholder="Nama Lengkap"
            onChange={handleChange}
            className="w-full border border-amber-300 focus:border-amber-500 focus:ring-amber-500 rounded-lg p-3 text-base outline-none transition"
            autoComplete="name"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full border border-amber-300 focus:border-amber-500 focus:ring-amber-500 rounded-lg p-3 text-base outline-none transition"
            autoComplete="email"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full border border-amber-300 focus:border-amber-500 focus:ring-amber-500 rounded-lg p-3 text-base outline-none transition"
            autoComplete="new-password"
          />

          <button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 hover:scale-105 text-white font-semibold rounded-lg p-3 transition duration-300 shadow-lg hover:shadow-xl"
          >
            Register
          </button>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full sm:w-auto border border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white font-semibold rounded-lg p-3 transition duration-300"
            >
              Ke Beranda
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto border border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold rounded-lg p-3 transition duration-300"
            >
              Sudah Punya Akun? Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;